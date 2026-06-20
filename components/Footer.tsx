"use client";

export function Footer() {
  return (
    <footer className="w-full mt-20 py-8 border-t border-border/25 bg-muted/5">
      <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/80">
        <p>© {new Date().getFullYear()} Pingio. All rights reserved.</p>
        <p className="flex items-center gap-1">
          <span>Crafted with precision by</span>
          <a
            href="https://www.rashidbuilds.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:text-primary transition-colors duration-150 underline-offset-4 hover:underline"
          >
            Rashid Ali
          </a>
        </p>
      </div>
    </footer>
  );
}