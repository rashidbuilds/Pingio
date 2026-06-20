"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useTestStore } from "@/store/testStore";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { SpeedTestEngine } from "@/lib/speedtest";
import { saveResult, getAllResults } from "@/lib/db";
import { TestResult } from "@/types";
import { Header } from "@/components/Header";
import { SpeedDisplay } from "@/components/SpeedDisplay";
import { TestProgress } from "@/components/TestProgress";
import { LiveCharts } from "@/components/LiveCharts";
import { ResultCard } from "@/components/ResultCard";
import { TestHistory } from "@/components/TestHistory";
import { NetworkInsights } from "@/components/NetworkInsights";
import { Footer } from "@/components/Footer";

export default function Home() {
  const {
    startTest,
    updatePing,
    updateDownload,
    updateUpload,
    completeTest,
    resetTest,
    setHistory,
    phase,
  } = useTestStore();

  const { deviceInfo, networkInfo } = useDeviceInfo();
  const [ip, setIp] = useState<string>("Unknown");

  useEffect(() => {
    let active = true;
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => {
        if (active) setIp(data.ip);
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, []);

  const engineRef = useRef<SpeedTestEngine | null>(null);

  useEffect(() => {
    getAllResults().then(setHistory).catch(console.error);
  }, [setHistory]);

  const runTest = useCallback(async () => {
    if (phase !== "idle" && phase !== "complete") return;

    resetTest();
    const engine = new SpeedTestEngine();
    engineRef.current = engine;

    // Short delay to let UI settle
    await new Promise((r) => setTimeout(r, 50));
    startTest();

    await engine.run({
      onPingProgress: (ping, jitter, samples) => {
        updatePing(ping, jitter, samples);
      },
      onDownloadProgress: (speed, samples, progress) => {
        updateDownload(speed, samples, progress);
      },
      onUploadProgress: (speed, samples, progress) => {
        updateUpload(speed, samples, progress);
      },
      onComplete: async ({ ping, jitter, download, upload, downloadPeak, uploadPeak }) => {
        const formattedBrowser = deviceInfo.browserVersion
          ? `${deviceInfo.browser} ${deviceInfo.browserVersion.split(".")[0]}`
          : deviceInfo.browser;

        const formattedConnection = networkInfo.effectiveType
          ? networkInfo.effectiveType.toUpperCase()
          : deviceInfo.connectionType !== "Unknown"
            ? deviceInfo.connectionType
            : "—";

        const result: TestResult = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          download,
          upload,
          ping,
          jitter,
          downloadPeak,
          uploadPeak,
          ip: ip !== "Loading..." ? ip : "Unknown",
          device: deviceInfo.deviceType,
          browser: formattedBrowser,
          os: deviceInfo.os,
          connection: formattedConnection,
        };
        completeTest(result);
        await saveResult(result).catch(console.error);
      },
      onError: (error) => {
        console.error("Speed test error:", error);
        resetTest();
      },
    });
  }, [phase, resetTest, startTest, updatePing, updateDownload, updateUpload, completeTest, ip, deviceInfo, networkInfo]);

  const stopTest = useCallback(() => {
    engineRef.current?.abort();
    resetTest();
  }, [resetTest]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col">
        <section className="flex flex-col items-center pt-14 pb-10 gap-8 max-w-5xl mx-auto w-full">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl text-center font-semibold text-foreground"
          >
            Measure your network performance instantly
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <SpeedDisplay onStart={runTest} onStop={stopTest} />
          </motion.div>

          <TestProgress />

          <div className="w-full px-4 md:px-0">
            <LiveCharts />
          </div>

          <div className="w-full px-4 md:px-0">
            <ResultCard />
          </div>
        </section>

        <section className="px-4 sm:px-6 pb-12 flex flex-col gap-4 max-w-7xl mx-auto w-full">
          <NetworkInsights />
          <TestHistory />
        </section>
      </main>

      <Footer />
    </div>
  );
}
