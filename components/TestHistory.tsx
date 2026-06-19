"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Clock, X } from "lucide-react";
import { useTestStore } from "@/store/testStore";
import { formatSpeed, formatLatency, formatDate } from "@/lib/utils";
import { deleteResult, clearAllResults } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { TestResult } from "@/types";

function HistoryRow({
  result,
  onDelete,
  index,
}: {
  result: TestResult;
  onDelete: (id: string) => void;
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

      {/* Delete button */}
      <button
        onClick={() => onDelete(result.id)}
        className="cursor-pointer p-1.5 rounded-md hover:bg-red-500/10 text-red-500/70 hover:text-red-500 transition-all duration-150 absolute top-3.5 right-3.5 sm:relative sm:top-auto sm:right-auto"
        aria-label="Delete result"
      >
        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
      </button>
    </motion.div>
  );
}

export function TestHistory() {
  const { history, removeFromHistory, clearHistory } = useTestStore();

  const handleDelete = async (id: string) => {
    removeFromHistory(id);
    await deleteResult(id);
  };

  const handleClearAll = async () => {
    clearHistory();
    await clearAllResults();
  };

  if (history.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="rounded-xl border border-border/40 bg-card/20 p-8 text-center">
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
      <div className="rounded-xl border border-border/40 bg-card/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
