"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTestStore } from "@/store/testStore";

const PHASES = [
  { key: "ping", label: "Ping", color: "#a78bfa" },
  { key: "download", label: "Download", color: "#34d399" },
  { key: "upload", label: "Upload", color: "#60a5fa" },
];

export function TestProgress() {
  const { phase, progress } = useTestStore();
  if (phase === "idle" || phase === "complete") return null;

  const phaseIndex = PHASES.findIndex((p) => p.key === phase);
  const overallProgress = (phaseIndex / 3) * 100 + (progress / 100) * (100 / 3);
  const currentPhase = PHASES[phaseIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="w-full max-w-xs mx-auto flex flex-col gap-3"
      >
        {/* Phase dots */}
        <div className="flex items-center justify-center gap-5">
          {PHASES.map((p, i) => (
            <div key={p.key} className="flex items-center gap-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor:
                    i < phaseIndex ? p.color :
                      i === phaseIndex ? p.color :
                        "hsl(var(--border))",
                }}
                animate={{
                  scale: i === phaseIndex ? [1, 1.3, 1] : 1,
                  opacity: i === phaseIndex ? [0.7, 1, 0.7] : i < phaseIndex ? 0.6 : 0.25,
                }}
                transition={
                  i === phaseIndex
                    ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3 }
                }
              />
              <span
                className="text-[11px] font-semibold uppercase tracking-widest transition-colors duration-300"
                style={{
                  color:
                    i === phaseIndex ? p.color :
                      i < phaseIndex ? "hsl(var(--muted-foreground))" :
                        "hsl(var(--border))",
                  opacity: i === phaseIndex ? 1 : i < phaseIndex ? 0.5 : 0.3,
                }}
              >
                {p.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-[2px] w-full bg-border/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ backgroundColor: currentPhase?.color ?? "hsl(var(--primary))" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}