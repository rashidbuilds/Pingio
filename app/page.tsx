"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useTestStore } from "@/store/testStore";
import { SpeedTestEngine } from "@/lib/speedtest";
import { saveResult, getAllResults } from "@/lib/db";
import { TestResult } from "@/types";
import { Header } from "@/components/Header";
import { SpeedDisplay } from "@/components/SpeedDisplay";
import { StartButton } from "@/components/StartButton";
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
        const result: TestResult = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          download,
          upload,
          ping,
          jitter,
          downloadPeak,
          uploadPeak,
        };
        completeTest(result);
        await saveResult(result).catch(console.error);
      },
      onError: (error) => {
        console.error("Speed test error:", error);
        resetTest();
      },
    });
  }, [phase, resetTest, startTest, updatePing, updateDownload, updateUpload, completeTest]);

  const stopTest = useCallback(() => {
    engineRef.current?.abort();
    resetTest();
  }, [resetTest]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col">
        <section className="flex flex-col items-center px-4 sm:px-6 pt-14 pb-10 gap-8 max-w-5xl mx-auto w-full">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-semibold text-muted-foreground"
          >
            Measure your network performance instantly
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <SpeedDisplay />
          </motion.div>

          <TestProgress />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StartButton onStart={runTest} onStop={stopTest} />
          </motion.div>

          <div className="w-full">
            <LiveCharts />
          </div>

          <div className="w-full">
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
