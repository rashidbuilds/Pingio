"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTestStore } from "@/store/testStore";

// Download = emerald green, Upload = blue
const DL_COLOR = "#34d399"; // emerald-400
const UL_COLOR = "#60a5fa"; // blue-400

function fmtSpeed(v: number) {
  if (v >= 1000) return { num: (v / 1000).toFixed(2), unit: "Gbps" };
  if (v >= 100) return { num: v.toFixed(1), unit: "Mbps" };
  return { num: v.toFixed(2), unit: "Mbps" };
}

export function SpeedDisplay() {
  const {
    phase,
    currentDownload,
    currentUpload,
    currentPing,
    currentJitter,
  } = useTestStore();

  const isIdle = phase === "idle";
  const isPing = phase === "ping";
  const isDl = phase === "download";
  const isUl = phase === "upload";
  const isComplete = phase === "complete";
  const isActive = !isIdle && !isComplete;

  // ── Complete state — show BOTH speeds side by side ──
  if (isComplete) {
    const dl = fmtSpeed(currentDownload);
    const ul = fmtSpeed(currentUpload);
    return (
      <div className="flex flex-col items-center gap-6 select-none">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12"
        >
          {/* Download */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-end gap-1.5 leading-none">
              <span
                className="text-[64px] sm:text-[80px] font-[200] tracking-[-3px] tabular-nums leading-none"
                style={{ color: DL_COLOR }}
              >
                {dl.num}
              </span>
              <span className="text-lg font-light mb-2.5" style={{ color: DL_COLOR, opacity: 0.7 }}>
                {dl.unit}
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: DL_COLOR, opacity: 0.7 }}>
              Download
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-16 bg-border/50" />
          <div className="sm:hidden h-px w-20 bg-border/50" />

          {/* Upload */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-end gap-1.5 leading-none">
              <span
                className="text-[64px] sm:text-[80px] font-[200] tracking-[-3px] tabular-nums leading-none"
                style={{ color: UL_COLOR }}
              >
                {ul.num}
              </span>
              <span className="text-lg font-light mb-2.5" style={{ color: UL_COLOR, opacity: 0.7 }}>
                {ul.unit}
              </span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: UL_COLOR, opacity: 0.7 }}>
              Upload
            </span>
          </div>
        </motion.div>

        {/* Ping + Jitter row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-6"
        >
          <Pill label="Ping" value={currentPing > 0 ? `${currentPing.toFixed(1)}` : "—"} unit="ms" color="#a78bfa" />
          <div className="w-px h-5 bg-border/50" />
          <Pill label="Jitter" value={currentJitter > 0 ? `${currentJitter.toFixed(1)}` : "—"} unit="ms" color="#fb923c" />
        </motion.div>
      </div>
    );
  }

  // ── Active / Idle — single large number ──
  let bigNum = "–";
  let bigUnit = "";
  let bigLabel = "";
  let activeColor = "hsl(var(--foreground))";

  if (isPing) {
    bigNum = "…";
    bigLabel = "Measuring latency";
    activeColor = "#a78bfa";
  } else if (isDl && currentDownload > 0) {
    const f = fmtSpeed(currentDownload);
    bigNum = f.num;
    bigUnit = f.unit;
    bigLabel = "Download";
    activeColor = DL_COLOR;
  } else if (isUl && currentUpload > 0) {
    const f = fmtSpeed(currentUpload);
    bigNum = f.num;
    bigUnit = f.unit;
    bigLabel = "Upload";
    activeColor = UL_COLOR;
  } else if (isDl || isUl) {
    bigNum = "0.00";
    bigUnit = "Mbps";
    bigLabel = isDl ? "Download" : "Upload";
    activeColor = isDl ? DL_COLOR : UL_COLOR;
  }

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {/* Big number */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-end gap-2 leading-none">
          <AnimatePresence mode="wait">
            <motion.span
              key={bigNum.slice(0, 4)}
              initial={{ opacity: 0.5, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              className="text-[80px] sm:text-[104px] font-[200] tracking-[-4px] tabular-nums leading-none"
              style={{
                color: isActive ? activeColor : "hsl(var(--foreground))",
                opacity: isIdle ? 0.18 : 1,
                transition: "color 0.3s ease",
              }}
            >
              {bigNum}
            </motion.span>
          </AnimatePresence>
          {bigUnit && (
            <span
              className="text-2xl font-light mb-3 ml-0.5"
              style={{ color: activeColor, opacity: 0.65 }}
            >
              {bigUnit}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={bigLabel || "idle"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{
              color: isActive ? activeColor : "hsl(var(--muted-foreground))",
              opacity: isIdle ? 0.5 : 0.75,
            }}
          >
            {bigLabel || "Ready to measure"}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Ping + Jitter pills — visible during test */}
      <AnimatePresence>
        {isActive && (currentPing > 0 || isPing) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-6"
          >
            <Pill
              label="Ping"
              value={currentPing > 0 ? `${currentPing.toFixed(1)}` : "…"}
              unit="ms"
              color="#a78bfa"
            />
            {currentJitter > 0 && (
              <>
                <div className="w-px h-5 bg-border/50" />
                <Pill label="Jitter" value={`${currentJitter.toFixed(1)}`} unit="ms" color="#fb923c" />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pill({ label, value, unit, color }: {
  label: string; value: string; unit: string; color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-baseline gap-1">
        <span className="text-lg sm:text-xl font-light tabular-nums" style={{ color }}>
          {value}
        </span>
        {value !== "—" && value !== "…" && (
          <span className="text-[11px] font-medium" style={{ color, opacity: 0.55 }}>{unit}</span>
        )}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        {label}
      </span>
    </div>
  );
}