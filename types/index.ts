export type TestPhase = "idle" | "ping" | "download" | "upload" | "complete";

export interface SpeedDataPoint {
  time: number;
  speed: number;
}

export interface LatencyDataPoint {
  time: number;
  ping: number;
}

export interface TestResult {
  id: string;
  timestamp: number;
  download: number;
  upload: number;
  ping: number;
  jitter: number;
  downloadPeak: number;
  uploadPeak: number;
  serverLocation?: string;
  isp?: string;
  ip?: string;
  device?: string;
  browser?: string;
  os?: string;
  connection?: string;
}

export interface LiveTestData {
  phase: TestPhase;
  downloadSamples: SpeedDataPoint[];
  uploadSamples: SpeedDataPoint[];
  latencySamples: LatencyDataPoint[];
  currentDownload: number;
  currentUpload: number;
  currentPing: number;
  currentJitter: number;
  progress: number;
}

export interface NetworkInfo {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  deviceType: string;
  connectionType: string;
}
