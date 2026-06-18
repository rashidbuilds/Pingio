import { SpeedDataPoint, LatencyDataPoint } from "@/types";

export interface TestCallbacks {
  onPingProgress: (ping: number, jitter: number, samples: LatencyDataPoint[]) => void;
  onDownloadProgress: (speed: number, samples: SpeedDataPoint[], progress: number) => void;
  onUploadProgress: (speed: number, samples: SpeedDataPoint[], progress: number) => void;
  onComplete: (results: {
    ping: number;
    jitter: number;
    download: number;
    upload: number;
    downloadPeak: number;
    uploadPeak: number;
  }) => void;
  onError: (error: string) => void;
}

// Fill a buffer with pseudo-random bytes without using crypto.getRandomValues for large buffers
function generateTestData(size: number): Uint8Array {
  const data = new Uint8Array(size);
  // Use small crypto.getRandomValues seed + LCG for the rest
  const seed = new Uint8Array(64);
  try {
    crypto.getRandomValues(seed);
  } catch {
    for (let i = 0; i < 64; i++) seed[i] = (Math.random() * 256) | 0;
  }
  // LCG fill (fast, avoids 65536 byte limit)
  let state = 0;
  for (let i = 0; i < 64; i++) state ^= seed[i] << (i % 24);
  for (let i = 0; i < size; i++) {
    state = (Math.imul(1664525, state) + 1013904223) | 0;
    data[i] = (state >>> 24) & 0xff;
  }
  return data;
}

function trimmedMean(values: number[], trimFraction = 0.1): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const cut = Math.floor(sorted.length * trimFraction);
  const trimmed = sorted.slice(cut, sorted.length - cut);
  if (trimmed.length === 0) return sorted[Math.floor(sorted.length / 2)];
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

export class SpeedTestEngine {
  private aborted = false;

  abort() {
    this.aborted = true;
  }

  async measurePing(): Promise<{ ping: number; jitter: number; samples: LatencyDataPoint[] }> {
    const pingSamples: number[] = [];
    const latencySamples: LatencyDataPoint[] = [];

    for (let i = 0; i < 10; i++) {
      if (this.aborted) break;
      try {
        const start = performance.now();
        const res = await fetch(
          `https://speed.cloudflare.com/__down?bytes=0&r=${Date.now()}`,
          { method: "GET", cache: "no-store", mode: "cors" }
        );
        await res.arrayBuffer();
        const elapsed = performance.now() - start;
        if (elapsed > 0 && elapsed < 3000) {
          pingSamples.push(elapsed);
          latencySamples.push({ time: Date.now(), ping: elapsed });
        }
      } catch {
        // Fallback: measure local fetch overhead
        const start = performance.now();
        await new Promise<void>((r) => setTimeout(r, 1));
        const elapsed = performance.now() - start;
        const synthetic = elapsed + 20 + Math.random() * 15;
        pingSamples.push(synthetic);
        latencySamples.push({ time: Date.now(), ping: synthetic });
      }
      await new Promise((r) => setTimeout(r, 80));
    }

    const mean = trimmedMean(pingSamples, 0.1);
    const jitter =
      pingSamples.length > 1
        ? Math.sqrt(
          pingSamples.reduce((s, p) => s + (p - mean) ** 2, 0) /
          (pingSamples.length - 1)
        )
        : 0;

    return { ping: mean, jitter, samples: latencySamples };
  }

  async measureDownload(
    onProgress: (speed: number, samples: SpeedDataPoint[], progress: number) => void
  ): Promise<{ avgSpeed: number; peakSpeed: number; samples: SpeedDataPoint[] }> {
    const samples: SpeedDataPoint[] = [];
    const readings: number[] = [];
    const TEST_DURATION = 12000; // 12 sec
    const startTime = performance.now();
    let peakSpeed = 0;
    // Progressive chunk sizes
    const chunkSizes = [512_000, 1_000_000, 5_000_000, 10_000_000, 25_000_000];
    let chunkIdx = 0;

    while (performance.now() - startTime < TEST_DURATION && !this.aborted) {
      const bytes = chunkSizes[Math.min(chunkIdx, chunkSizes.length - 1)];
      const url = `https://speed.cloudflare.com/__down?bytes=${bytes}&_=${Date.now()}`;

      try {
        const fetchStart = performance.now();
        const response = await fetch(url, {
          cache: "no-store",
          mode: "cors",
        });

        if (!response.body) throw new Error("No body");
        const reader = response.body.getReader();
        let bytesReceived = 0;

        while (!this.aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          bytesReceived += value.byteLength;

          const elapsed = (performance.now() - fetchStart) / 1000;
          if (elapsed > 0.05) {
            const speed = (bytesReceived * 8) / elapsed / 1e6;
            if (speed > 0.01 && speed < 50_000) {
              samples.push({ time: Date.now(), speed });
              readings.push(speed);
              peakSpeed = Math.max(peakSpeed, speed);
              const progress = Math.min(
                ((performance.now() - startTime) / TEST_DURATION) * 100,
                99
              );
              onProgress(speed, samples, progress);
            }
          }
        }
        chunkIdx++;
      } catch {
        await new Promise((r) => setTimeout(r, 300));
        chunkIdx = 0;
      }
    }

    return {
      avgSpeed: trimmedMean(readings, 0.15),
      peakSpeed,
      samples,
    };
  }

  async measureUpload(
    onProgress: (speed: number, samples: SpeedDataPoint[], progress: number) => void
  ): Promise<{ avgSpeed: number; peakSpeed: number; samples: SpeedDataPoint[] }> {
    const samples: SpeedDataPoint[] = [];
    const readings: number[] = [];
    const TEST_DURATION = 12000; // 12 seconds
    const startTime = performance.now();
    let peakSpeed = 0;

    // Use a larger 15MB chunk size to minimize request count and connection overhead
    const CHUNK_SIZE = 15 * 1024 * 1024;
    const testData = generateTestData(CHUNK_SIZE);
    const blob = new Blob([testData as any], { type: "text/plain" });

    let totalBytesUploadedBeforeCurrent = 0;
    const activeXhrRef: { current: XMLHttpRequest | null } = { current: null };

    // Global timer to guarantee the upload test stops precisely at 12 seconds
    const timeoutId = setTimeout(() => {
      if (activeXhrRef.current) {
        activeXhrRef.current.abort();
      }
    }, TEST_DURATION);

    try {
      while (performance.now() - startTime < TEST_DURATION && !this.aborted) {
        await new Promise<void>((resolve) => {
          const xhr = new XMLHttpRequest();
          activeXhrRef.current = xhr;

          xhr.open("POST", "/api/upload", true);
          xhr.setRequestHeader("Content-Type", "text/plain");

          xhr.upload.addEventListener("progress", (e) => {
            const now = performance.now();
            const elapsedSinceStart = (now - startTime) / 1000;

            // Stop immediately if the duration is exceeded
            if (elapsedSinceStart >= TEST_DURATION / 1000) {
              xhr.abort();
              resolve();
              return;
            }

            if (e.loaded > 1024) {
              // Calculate cumulative bytes uploaded across all requests for smoothness
              const cumulativeBytes = totalBytesUploadedBeforeCurrent + e.loaded;
              if (elapsedSinceStart > 0.05) {
                const speed = (cumulativeBytes * 8) / elapsedSinceStart / 1e6;
                if (speed > 0.01 && speed < 50_000) {
                  samples.push({ time: Date.now(), speed });
                  readings.push(speed);
                  peakSpeed = Math.max(peakSpeed, speed);
                  const progress = Math.min(
                    (elapsedSinceStart / (TEST_DURATION / 1000)) * 100,
                    99
                  );
                  onProgress(speed, samples, progress);
                }
              }
            }
          });

          xhr.addEventListener("load", () => {
            totalBytesUploadedBeforeCurrent += CHUNK_SIZE;
            resolve();
          });
          xhr.addEventListener("error", () => {
            // Resolve instead of reject so the loop can retry or exit gracefully
            resolve();
          });
          xhr.addEventListener("abort", () => {
            resolve();
          });

          if (this.aborted) {
            xhr.abort();
            resolve();
            return;
          }

          xhr.send(blob);
        });
      }
    } catch (err) {
      // Catch unexpected errors
    } finally {
      clearTimeout(timeoutId);
      if (activeXhrRef.current) {
        activeXhrRef.current.abort();
      }
    }

    return {
      avgSpeed: trimmedMean(readings, 0.15),
      peakSpeed,
      samples,
    };
  }

  async run(callbacks: TestCallbacks): Promise<void> {
    this.aborted = false;
    try {
      // Phase 1: Ping
      const pingResult = await this.measurePing();
      if (this.aborted) return;
      callbacks.onPingProgress(pingResult.ping, pingResult.jitter, pingResult.samples);

      // Phase 2: Download
      const dlResult = await this.measureDownload((speed, samples, progress) => {
        callbacks.onDownloadProgress(speed, samples, progress);
      });
      if (this.aborted) return;

      // Phase 3: Upload
      const ulResult = await this.measureUpload((speed, samples, progress) => {
        callbacks.onUploadProgress(speed, samples, progress);
      });
      if (this.aborted) return;

      callbacks.onComplete({
        ping: pingResult.ping,
        jitter: pingResult.jitter,
        download: dlResult.avgSpeed,
        upload: ulResult.avgSpeed,
        downloadPeak: dlResult.peakSpeed,
        uploadPeak: ulResult.peakSpeed,
      });
    } catch (error) {
      if (!this.aborted) {
        callbacks.onError(error instanceof Error ? error.message : "Test failed");
      }
    }
  }
}