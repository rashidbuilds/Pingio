"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Clock, X, Eye, Download, Copy, Check, Share2 } from "lucide-react";
import { useTestStore } from "@/store/testStore";
import { formatSpeed, formatLatency, formatDate } from "@/lib/utils";
import { deleteResult, clearAllResults } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { TestResult } from "@/types";
import html2canvas from "html2canvas-pro";
import { SpeedCardView } from "@/components/SpeedCardView";

function HistoryRow({
  result,
  onDelete,
  onView,
  onDownload,
  index,
}: {
  result: TestResult;
  onDelete: (id: string) => void;
  onView: (result: TestResult) => void;
  onDownload: (result: TestResult) => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex flex-col gap-3.5 p-4 rounded-xl border border-border/30 bg-card/10 relative sm:flex-row sm:items-center sm:gap-4 sm:py-3 sm:px-4 sm:rounded-lg sm:border-0 sm:bg-transparent hover:bg-muted/30 transition-all duration-150"
    >
      {/* Time and Clock */}
      <div className="flex items-center gap-1.5 text-muted-foreground/60 sm:min-w-[90px]">
        <Clock className="w-3.5 h-3.5 sm:w-3 sm:h-3 flex-shrink-0" />
        <span className="text-xs font-medium sm:font-normal">{formatDate(result.timestamp)}</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2 sm:flex-1 text-sm">
        <div className="flex flex-col bg-muted/10 sm:bg-transparent p-2.5 sm:p-0 rounded-lg">
          <span className="text-[10px] sm:text-xs text-muted-foreground/50 mb-0.5 uppercase sm:normal-case tracking-wider sm:tracking-normal font-semibold sm:font-normal">↓ Download</span>
          <span className="text-base sm:text-sm font-semibold sm:font-medium tabular-nums text-emerald-500">
            {formatSpeed(result.download)}
          </span>
        </div>
        <div className="flex flex-col bg-muted/10 sm:bg-transparent p-2.5 sm:p-0 rounded-lg">
          <span className="text-[10px] sm:text-xs text-muted-foreground/50 mb-0.5 uppercase sm:normal-case tracking-wider sm:tracking-normal font-semibold sm:font-normal">↑ Upload</span>
          <span className="text-base sm:text-sm font-semibold sm:font-medium tabular-nums text-blue-500">
            {formatSpeed(result.upload)}
          </span>
        </div>
        <div className="flex flex-col bg-muted/10 sm:bg-transparent p-2.5 sm:p-0 rounded-lg">
          <span className="text-[10px] sm:text-xs text-muted-foreground/50 mb-0.5 uppercase sm:normal-case tracking-wider sm:tracking-normal font-semibold sm:font-normal">Ping</span>
          <span className="text-base sm:text-sm font-semibold sm:font-medium tabular-nums text-foreground/80">
            {formatLatency(result.ping)}
          </span>
        </div>
        <div className="flex flex-col bg-muted/10 sm:bg-transparent p-2.5 sm:p-0 rounded-lg">
          <span className="text-[10px] sm:text-xs text-muted-foreground/50 mb-0.5 uppercase sm:normal-case tracking-wider sm:tracking-normal font-semibold sm:font-normal">Jitter</span>
          <span className="text-base sm:text-sm font-semibold sm:font-medium tabular-nums text-foreground/80">
            {formatLatency(result.jitter)}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 absolute top-3.5 right-3.5 sm:relative sm:top-auto sm:right-auto">
        <button
          onClick={() => onView(result)}
          className="cursor-pointer p-1.5 rounded-md hover:bg-primary/10 text-primary/70 hover:text-primary transition-all duration-150"
          title="View details"
          aria-label="View details"
        >
          <Eye className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        </button>
        <button
          onClick={() => onDownload(result)}
          className="cursor-pointer p-1.5 rounded-md hover:bg-emerald-500/10 text-emerald-500/70 hover:text-emerald-500 transition-all duration-150"
          title="Download PNG"
          aria-label="Download PNG"
        >
          <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        </button>
        <button
          onClick={() => onDelete(result.id)}
          className="cursor-pointer p-1.5 rounded-md hover:bg-red-500/10 text-red-500/70 hover:text-red-500 transition-all duration-150"
          title="Delete record"
          aria-label="Delete record"
        >
          <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function TestHistory() {
  const { history, removeFromHistory, clearHistory } = useTestStore();
  const [activeViewResult, setActiveViewResult] = useState<TestResult | null>(null);
  const [downloadTarget, setDownloadTarget] = useState<TestResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = async (id: string) => {
    removeFromHistory(id);
    await deleteResult(id);
  };

  const handleClearAll = async () => {
    clearHistory();
    await clearAllResults();
  };

  const handleCopyResults = (result: TestResult) => {
    const text = `⬇ Download: ${formatSpeed(result.download)} | ⬆ Upload: ${formatSpeed(result.upload)} | Ping: ${formatLatency(result.ping)} | Jitter: ${formatLatency(result.jitter)} — tested with Pingio`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareResults = async (result: TestResult) => {
    const text = `⬇ Download: ${formatSpeed(result.download)} | ⬆ Upload: ${formatSpeed(result.upload)} | Ping: ${formatLatency(result.ping)} | Jitter: ${formatLatency(result.jitter)} — tested with Pingio`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
        return;
      } catch {
        /* fall through */
      }
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = (result: TestResult) => {
    const jsonOutput = {
      ...result,
      formattedDate: new Date(result.timestamp).toLocaleString(),
    };
    const data = JSON.stringify(jsonOutput, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `pingio-result-${result.id.slice(0, 8)}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = async (result: TestResult, elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    setIsDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const canvas = await html2canvas(element, {
        backgroundColor: "#070a0e",
        scale: 2,
        useCORS: true,
        logging: false,
        width: 500,
        height: 500,
      });
      const link = document.createElement("a");
      link.download = `pingio-result-${result.id.slice(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Export image failed:", e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDirect = (result: TestResult) => {
    setDownloadTarget(result);
    setTimeout(async () => {
      await handleDownloadImage(result, "offscreen-download-card");
      setDownloadTarget(null);
    }, 150);
  };

  if (history.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="rounded-xl border border-border/25 bg-card p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground/60 font-medium">No test history</p>
          <p className="text-xs text-muted-foreground/40 mt-1">
            Run a speed test to see your results here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="rounded-xl border border-border/25 bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/25 bg-muted/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground tracking-wide">
              History
            </span>
            <span className="text-xs text-muted-foreground/50 bg-muted/40 rounded-full px-2 py-0.5">
              {history.length}
            </span>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 cursor-pointer text-xs text-muted-foreground/60 hover:text-destructive gap-1.5"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </Button>
          )}
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-3 p-3 sm:p-0 sm:divide-y sm:divide-border/30 sm:gap-0">
          <AnimatePresence mode="popLayout">
            {history.map((result, i) => (
              <HistoryRow
                key={result.id}
                result={result}
                onDelete={handleDelete}
                onView={(res) => setActiveViewResult(res)}
                onDownload={handleDownloadDirect}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Offscreen Download Card Target */}
      {downloadTarget && (
        <div className="absolute left-[-9999px] top-[-9999px] pointer-events-none">
          <div className="w-[500px] h-[500px] overflow-hidden">
            <SpeedCardView result={downloadTarget} cardId="offscreen-download-card" />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {activeViewResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="flex flex-col w-full max-w-[520px] bg-[#070a0e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Responsive Speed Card Container (Only this is captured in download) */}
              <div className="w-full aspect-square overflow-hidden">
                <SpeedCardView result={activeViewResult} cardId="modal-card-inner" />
              </div>

              {/* Separator line inside modal body */}
              <div className="border-t border-white/10" />

              {/* Action Buttons (inside the modal body at the bottom) */}
              <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-[#090e15]/80">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyResults(activeViewResult)}
                  className="h-9 cursor-pointer text-xs border-white/10 bg-transparent text-white/70 hover:text-white hover:bg-white/5 gap-1.5 rounded-lg flex-1 min-w-[70px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadDirect(activeViewResult)}
                  disabled={isDownloading}
                  className="h-9 cursor-pointer text-xs border-[#10B981]/25 bg-emerald-950/15 text-[#10B981] hover:bg-emerald-950/30 gap-1.5 rounded-lg flex-1 min-w-[70px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadJSON(activeViewResult)}
                  className="h-9 cursor-pointer text-xs border-white/10 bg-transparent text-white/70 hover:text-white hover:bg-white/5 gap-1.5 rounded-lg flex-1 min-w-[70px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  JSON
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareResults(activeViewResult)}
                  className="h-9 cursor-pointer text-xs border-white/10 bg-transparent text-white/70 hover:text-white hover:bg-white/5 gap-1.5 rounded-lg flex-1 min-w-[70px]"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </Button>

                <Button
                  onClick={() => setActiveViewResult(null)}
                  variant="outline"
                  size="sm"
                  className="h-9 cursor-pointer text-xs border-red-500/20 bg-red-950/10 text-red-400 hover:bg-red-950/20 gap-1.5 rounded-lg px-4"
                >
                  <X className="w-3.5 h-3.5" />
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
