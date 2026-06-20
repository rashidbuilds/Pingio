"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Share2, Check } from "lucide-react";
import { useTestStore } from "@/store/testStore";
import { formatLatency, getSpeedRating, getLatencyRating } from "@/lib/utils";
import html2canvas from "html2canvas-pro";
import { SpeedCardView } from "@/components/SpeedCardView";

const DL_COLOR = "#34d399";
const UL_COLOR = "#60a5fa";
const PING_COLOR = "#a78bfa";
const JITTER_COLOR = "#fb923c";

function fmtSpeed(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(2)} Gbps`;
  if (v >= 100) return `${v.toFixed(1)} Mbps`;
  return `${v.toFixed(2)} Mbps`;
}

export function ResultCard() {
  const { phase, lastResult } = useTestStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloadingPNG, setDownloadingPNG] = useState(false);
  const [showOffscreen, setShowOffscreen] = useState(false);

  if (phase !== "complete" || !lastResult) return null;

  const dlRating = getSpeedRating(lastResult.download);
  const ulRating = getSpeedRating(lastResult.upload);
  const pingRating = getLatencyRating(lastResult.ping);

  const copyResults = async () => {
    const text = [
      "── Pingio Test Results ──",
      `Download : ${fmtSpeed(lastResult.download)}`,
      `Upload   : ${fmtSpeed(lastResult.upload)}`,
      `Ping     : ${formatLatency(lastResult.ping)}`,
      `Jitter   : ${formatLatency(lastResult.jitter)}`,
      `Tested   : ${new Date(lastResult.timestamp).toLocaleString()}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async () => {
    if (!lastResult) return;
    setDownloadingPNG(true);
    setShowOffscreen(true);
    setTimeout(async () => {
      const element = document.getElementById("resultcard-offscreen-download");
      if (element) {
        try {
          const canvas = await html2canvas(element, {
            backgroundColor: "#070a0e",
            scale: 2,
            useCORS: true,
            logging: false,
            width: 500,
            height: 500,
          });
          const link = document.createElement("a");
          link.download = `pingio-result-${lastResult.id.slice(0, 8)}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        } catch (e) {
          console.error("Export failed:", e);
        }
      }
      setShowOffscreen(false);
      setDownloadingPNG(false);
    }, 150);
  };

  const downloadJSON = () => {
    if (!lastResult) return;
    const jsonOutput = {
      ...lastResult,
      formattedDate: new Date(lastResult.timestamp).toLocaleString(),
    };
    const data = JSON.stringify(jsonOutput, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `pingio-test-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareResults = async () => {
    const text = `⬇ ${fmtSpeed(lastResult.download)}  ⬆ ${fmtSpeed(lastResult.upload)}  ping ${formatLatency(lastResult.ping)} — tested with PulseTest`;
    if (typeof navigator.share === "function") {
      try { await navigator.share({ text }); return; } catch { /* fall through */ }
    }
    await copyResults();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="w-full"
      >
        {/* Shareable card area */}
        <div
          ref={cardRef}
          className="rounded-2xl border border-border/25 bg-card overflow-hidden"
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/25 bg-muted/10">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-primary">
                <path d="M2 12h3.5l3-8 4 16 3-10 2 2H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-semibold text-muted-foreground/70 tracking-wide">
                Result
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground/40">
              {new Date(lastResult.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/20">
            <StatCell
              label="Download"
              value={fmtSpeed(lastResult.download)}
              peak={`Peak ${fmtSpeed(lastResult.downloadPeak)}`}
              rating={dlRating}
              color={DL_COLOR}
              icon="↓"
            />
            <StatCell
              label="Upload"
              value={fmtSpeed(lastResult.upload)}
              peak={`Peak ${fmtSpeed(lastResult.uploadPeak)}`}
              rating={ulRating}
              color={UL_COLOR}
              icon="↑"
            />
            <StatCell
              label="Ping"
              value={formatLatency(lastResult.ping)}
              rating={pingRating}
              color={PING_COLOR}
              icon="◎"
            />
            <StatCell
              label="Jitter"
              value={formatLatency(lastResult.jitter)}
              color={JITTER_COLOR}
              icon="⌇"
            />
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <ActionBtn onClick={copyResults} icon={copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} label={copied ? "Copied!" : "Copy"} />
          <ActionBtn onClick={downloadImage} icon={<Download className="w-3 h-3" />} label={downloadingPNG ? "Saving..." : "PNG"} />
          <ActionBtn onClick={downloadJSON} icon={<Download className="w-3 h-3" />} label="JSON" />
          <ActionBtn onClick={shareResults} icon={<Share2 className="w-3 h-3" />} label="Share" />
        </div>

        {/* Offscreen Download Card Target */}
        {showOffscreen && (
          <div className="absolute left-[-9999px] top-[-9999px] pointer-events-none">
            <div className="w-[500px] h-[500px] overflow-hidden">
              <SpeedCardView result={lastResult} cardId="resultcard-offscreen-download" />
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function StatCell({
  label, value, peak, rating, color, icon,
}: {
  label: string;
  value: string;
  peak?: string;
  rating?: { label: string; color: string };
  color: string;
  icon: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-light" style={{ color, opacity: 0.7 }}>{icon}</span>
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground/50">
          {label}
        </span>
      </div>
      <span
        className="text-[22px] sm:text-[26px] font-[300] tabular-nums leading-none"
        style={{ color }}
      >
        {value}
      </span>
      {rating && (
        <span className={`text-[11px] font-semibold ${rating.color}`}>
          {rating.label}
        </span>
      )}
      {peak && (
        <span className="text-[10px] text-muted-foreground/35 font-medium">{peak}</span>
      )}
    </div>
  );
}

function ActionBtn({ onClick, icon, label }: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground border border-border/50 hover:border-border hover:bg-muted/40 transition-all duration-150"
    >
      {icon}
      {label}
    </button>
  );
}