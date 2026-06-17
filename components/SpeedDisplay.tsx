"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTestStore } from "@/store/testStore";

export function SpeedDisplay() {
  const {
    phase,
    currentDownload,
    currentUpload,
    currentPing,
    currentJitter,
  } = useTestStore();

  const isIdle = phase === "idle";
  const isComplete = phase === "complete";
  const isPing = phase === "ping";

  // What to show as the big number
  let bigValue = "–";
  let bigUnit = "";
  let bigLabel = "";

  if (isPing) {
    bigValue = "…";
    bigUnit = "";
    bigLabel = "Measuring latency";
  } else if (phase === "download") {
    const v = currentDownload;
    bigValue = v >= 1000 ? (v / 1000).toFixed(2) : v >= 100 ? v.toFixed(1) : v.toFixed(2);
    bigUnit = v >= 1000 ? "Gbps" : "Mbps";
    bigLabel = "Download";
  } else if (phase === "upload") {
    const v = currentUpload;
    bigValue = v >= 1000 ? (v / 1000).toFixed(2) : v >= 100 ? v.toFixed(1) : v.toFixed(2);
    bigUnit = v >= 1000 ? "Gbps" : "Mbps";
    bigLabel = "Upload";
  } else if (isComplete) {
    const v = currentDownload;
    bigValue = v >= 1000 ? (v / 1000).toFixed(2) : v >= 100 ? v.toFixed(1) : v.toFixed(2);
    bigUnit = v >= 1000 ? "Gbps" : "Mbps";
    bigLabel = "Download";
  }

  const showStats = !isIdle && !isPing;

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {/* Big number */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-end gap-2.5 leading-none">
          <AnimatePresence mode="wait">
            <motion.span
              key={phase + Math.floor(parseFloat(bigValue) * 10)}
              initial={{ opacity: 0.6, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12 }}
              className="text-[72px] sm:text-[96px] font-[200] tracking-[-4px] text-foreground tabular-nums leading-none"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {bigValue}
            </motion.span>
          </AnimatePresence>
          {bigUnit && (
            <span className="text-xl sm:text-2xl font-light text-muted-foreground/60 mb-3 ml-1">
              {bigUnit}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {bigLabel ? (
            <motion.p
              key={bigLabel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50"
            >
              {bigLabel}
            </motion.p>
          ) : (
            <motion.p
              key="idle-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] font-medium text-muted-foreground/40"
            >
              Ready to measure
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Stat pills */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-3 sm:gap-5"
          >
            <Pill
              label="Ping"
              value={currentPing > 0 ? `${currentPing.toFixed(1)}` : "—"}
              unit="ms"
              active={isPing}
              color="#a78bfa"
            />
            <div className="w-px h-6 bg-border/60" />
            <Pill
              label="Jitter"
              value={currentJitter > 0 ? `${currentJitter.toFixed(1)}` : "—"}
              unit="ms"
              color="#fb923c"
            />
            {isComplete && (
              <>
                <div className="w-px h-6 bg-border/60" />
                <Pill
                  label="Upload"
                  value={
                    currentUpload >= 1000
                      ? (currentUpload / 1000).toFixed(2)
                      : currentUpload >= 100
                        ? currentUpload.toFixed(1)
                        : currentUpload.toFixed(2)
                  }
                  unit={currentUpload >= 1000 ? "Gbps" : "Mbps"}
                  color="#60a5fa"
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pill({
  label,
  value,
  unit,
  active,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  active?: boolean;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-baseline gap-1">
        <span
          className="text-lg sm:text-xl font-light tabular-nums transition-colors duration-200"
          style={{ color: active ? color : undefined }}
        >
          {value}
        </span>
        {value !== "—" && (
          <span className="text-[11px] text-muted-foreground/50 font-medium">{unit}</span>
        )}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        {label}
      </span>
    </div>
  );
}