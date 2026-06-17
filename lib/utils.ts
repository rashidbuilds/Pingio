import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSpeed(mbps: number): string {
  if (mbps >= 1000) {
    return `${(mbps / 1000).toFixed(2)} Gbps`;
  }
  if (mbps >= 100) {
    return `${mbps.toFixed(1)} Mbps`;
  }
  return `${mbps.toFixed(2)} Mbps`;
}

export function formatLatency(ms: number): string {
  return `${ms.toFixed(1)} ms`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getSpeedRating(mbps: number): { label: string; color: string } {
  if (mbps >= 500) return { label: "Exceptional", color: "text-emerald-400" };
  if (mbps >= 200) return { label: "Excellent", color: "text-emerald-500" };
  if (mbps >= 100) return { label: "Very Good", color: "text-green-500" };
  if (mbps >= 50) return { label: "Good", color: "text-yellow-500" };
  if (mbps >= 25) return { label: "Fair", color: "text-orange-500" };
  return { label: "Slow", color: "text-red-500" };
}

export function getLatencyRating(ms: number): { label: string; color: string } {
  if (ms < 10) return { label: "Exceptional", color: "text-emerald-400" };
  if (ms < 20) return { label: "Excellent", color: "text-emerald-500" };
  if (ms < 50) return { label: "Good", color: "text-green-500" };
  if (ms < 100) return { label: "Fair", color: "text-yellow-500" };
  if (ms < 150) return { label: "Poor", color: "text-orange-500" };
  return { label: "Very Poor", color: "text-red-500" };
}
