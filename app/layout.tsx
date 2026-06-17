import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "PulseTest — Network Speed Test",
  description:
    "Measure your network performance instantly. Real-time download, upload, ping, and jitter testing.",
  keywords: ["speed test", "internet speed", "network test", "bandwidth", "ping", "latency"],
  openGraph: {
    title: "PulseTest — Network Speed Test",
    description: "Measure your network performance instantly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        style={{ fontFamily: "'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif" }}
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
