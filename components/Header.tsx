"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

export function Header() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-[52px] flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          {/* Pulse icon — SVG pulse wave */}
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M2 12h3l3-7 4 14 3-9 2 2h5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              />
            </svg>
          </div>
          <span className="font-semibold text-[14px] tracking-[-0.01em] text-foreground">
            Pingio
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150"
        >
          {theme === "dark" ? (
            <Sun className="w-[15px] h-[15px]" />
          ) : (
            <Moon className="w-[15px] h-[15px]" />
          )}
        </button>
      </div>
    </motion.header>
  );
}