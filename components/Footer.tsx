"use client";

export function Footer() {
  return (
    <footer className="w-full mt-16 pb-8">
      <p className="text-center text-[12px] text-muted-foreground/40 font-medium">
        Built with ❤️ by{" "}
        <a
          href="https://www.rashidbuilds.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-foreground transition-colors duration-150 underline-offset-2 hover:underline"
        >
          Rashid Ali
        </a>
      </p>
    </footer>
  );
}