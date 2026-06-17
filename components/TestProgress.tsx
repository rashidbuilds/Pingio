"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTestStore } from "@/store/testStore";

const PHASES = [
  { key: "ping", label: "Ping" },
  { key: "download", label: "Download" },
  { key: "upload", label: "Upload" },
];

export function TestProgress() {
  const { phase, progress } = useTestStore();

  if (phase === "idle" || phase === "complete") return null;

  const phaseIndex = PHASES.findIndex((p) => p.key === phase);
  const overallProgress =
    ((phaseIndex / 3) * 100 + (progress / 100) * (100 / 3));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Phase indicators */}
        <div className="flex items-center justify-center gap-6 mb-3">
          {PHASES.map((p, i) => (
            <div key={p.key} className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i < phaseIndex
                    ? "bg-primary"
                    : i === phaseIndex
                    ? "bg-primary animate-pulse"
                    : "bg-border"
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  i === phaseIndex
                    ? "text-foreground"
                    : i < phaseIndex
                    ? "text-primary/70"
                    : "text-muted-foreground/40"
                }`}
              >
                {p.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-border/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
