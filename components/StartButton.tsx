"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, RotateCcw } from "lucide-react";
import { useTestStore } from "@/store/testStore";

interface StartButtonProps {
  onStart: () => void;
  onStop: () => void;
}

export function StartButton({ onStart, onStop }: StartButtonProps) {
  const { phase } = useTestStore();

  const isIdle = phase === "idle";
  const isComplete = phase === "complete";
  const isRunning = !isIdle && !isComplete;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onClick={isRunning ? onStop : isComplete ? onStart : onStart}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          isRunning
            ? "bg-red-500/10 border-2 border-red-500/40 hover:border-red-500/70 hover:bg-red-500/15"
            : "bg-primary/10 border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/15"
        }`}
        aria-label={isRunning ? "Stop test" : isComplete ? "Run again" : "Start test"}
      >
        {/* Pulse ring when running */}
        {isRunning && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-500/30"
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-500/20"
              animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
            />
          </>
        )}

        <AnimatePresence mode="wait">
          {isRunning ? (
            <motion.div
              key="stop"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Square className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-red-500" />
            </motion.div>
          ) : isComplete ? (
            <motion.div
              key="restart"
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary fill-primary ml-0.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence mode="wait">
        <motion.span
          key={phase}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-xs font-medium text-muted-foreground/70 uppercase tracking-widest"
        >
          {isRunning
            ? "Testing…"
            : isComplete
            ? "Run Again"
            : "Start Test"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
