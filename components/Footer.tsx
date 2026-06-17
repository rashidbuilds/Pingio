"use client";

import { ExternalLink, GitBranch } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/30 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        <p className="text-xs text-muted-foreground/50">
          Built and Designed by{" "}
          <a
            href="https://www.rashidbuilds.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            Rashid Ali
          </a>
        </p>
        <div className="flex items-center gap-3">
          <a
            href="https://www.rashidbuilds.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-foreground/70 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Portfolio
          </a>
          <a
            href="https://github.com/rashidbuilds"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-foreground/70 transition-colors"
          >
            <GitBranch className="w-3 h-3" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
