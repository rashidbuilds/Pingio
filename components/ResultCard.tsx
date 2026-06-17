"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Share2, ArrowDown, ArrowUp, Activity, Zap } from "lucide-react";
import { useTestStore } from "@/store/testStore";
import { formatSpeed, formatLatency, getSpeedRating, getLatencyRating } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";

export function ResultCard() {
  const { phase, lastResult } = useTestStore();
  const cardRef = useRef<HTMLDivElement>(null);

  if (phase !== "complete" || !lastResult) return null;

  const dlRating = getSpeedRating(lastResult.download);
  const ulRating = getSpeedRating(lastResult.upload);
  const pingRating = getLatencyRating(lastResult.ping);

  const copyResults = async () => {
    const text = `Pingio Results
Download: ${formatSpeed(lastResult.download)}
Upload: ${formatSpeed(lastResult.upload)}
Ping: ${formatLatency(lastResult.ping)}
Jitter: ${formatLatency(lastResult.jitter)}
Tested: ${new Date(lastResult.timestamp).toLocaleString()}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `pingio-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
    }
  };

  const downloadJSON = () => {
    const data = JSON.stringify(lastResult, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `pingio-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareResults = async () => {
    const text = `My network speed: ↓ ${formatSpeed(lastResult.download)} / ↑ ${formatSpeed(lastResult.upload)} | Ping: ${formatLatency(lastResult.ping)} — tested with Pingio`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await copyResults();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-3xl mx-auto"
      >
        {/* Shareable card */}
        <div
          ref={cardRef}
          className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 sm:p-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <ResultStat
              icon={<ArrowDown className="w-3.5 h-3.5" />}
              label="Download"
              value={formatSpeed(lastResult.download)}
              rating={dlRating}
              peak={formatSpeed(lastResult.downloadPeak)}
            />
            <ResultStat
              icon={<ArrowUp className="w-3.5 h-3.5" />}
              label="Upload"
              value={formatSpeed(lastResult.upload)}
              rating={ulRating}
              peak={formatSpeed(lastResult.uploadPeak)}
            />
            <ResultStat
              icon={<Activity className="w-3.5 h-3.5" />}
              label="Ping"
              value={formatLatency(lastResult.ping)}
              rating={pingRating}
            />
            <ResultStat
              icon={<Zap className="w-3.5 h-3.5" />}
              label="Jitter"
              value={formatLatency(lastResult.jitter)}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={copyResults}
            className="gap-1.5 text-xs h-8"
          >
            <Copy className="w-3 h-3" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadImage}
            className="gap-1.5 text-xs h-8"
          >
            <Download className="w-3 h-3" />
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadJSON}
            className="gap-1.5 text-xs h-8"
          >
            <Download className="w-3 h-3" />
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={shareResults}
            className="gap-1.5 text-xs h-8"
          >
            <Share2 className="w-3 h-3" />
            Share
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ResultStat({
  icon,
  label,
  value,
  rating,
  peak,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  rating?: { label: string; color: string };
  peak?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-light tabular-nums text-foreground">
        {value}
      </div>
      {rating && (
        <span className={`text-xs font-medium ${rating.color}`}>{rating.label}</span>
      )}
      {peak && (
        <span className="text-[10px] text-muted-foreground/60">Peak {peak}</span>
      )}
    </div>
  );
}
