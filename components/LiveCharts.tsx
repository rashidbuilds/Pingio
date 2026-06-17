"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTestStore } from "@/store/testStore";
import { SpeedDataPoint, LatencyDataPoint } from "@/types";

// ─── Chart sub-components ───────────────────────────────────────────────────

function MiniChart({
  data,
  dataKey,
  color,
  gradientId,
  label,
  unit,
  currentValue,
}: {
  data: { i: number; val: number }[];
  dataKey: string;
  color: string;
  gradientId: string;
  label: string;
  unit: string;
  currentValue: string;
}) {
  const maxVal = Math.max(...data.map((d) => d.val), 1);
  const yDomain: [number, number] = [0, Math.ceil(maxVal * 1.25)];

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span
            className="w-[6px] h-[6px] rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
        </div>
        <span
          className="text-xs font-semibold tabular-nums"
          style={{ color }}
        >
          {currentValue}
        </span>
      </div>

      {/* Fixed pixel height wrapper — fixes the -1 width bug */}
      <div style={{ width: "100%", height: 80 }}>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={data} margin={{ top: 4, right: 2, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="i" hide axisLine={false} tickLine={false} />
            <YAxis
              domain={yDomain}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "var(--chart-muted)" }}
              width={32}
            />
            <Tooltip
              content={<ChartTooltip unit={unit} />}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3", strokeOpacity: 0.4 }}
            />
            <Area
              type="monotoneX"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, unit }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  if (val == null) return null;
  return (
    <div
      className="px-2 py-1 rounded-md text-[11px] font-semibold shadow-lg"
      style={{
        backgroundColor: "var(--chart-popover-bg)",
        color: "var(--chart-popover-fg)",
        border: "1px solid var(--chart-popover-border)",
      }}
    >
      {typeof val === "number" ? val.toFixed(1) : val} {unit}
    </div>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────

export function LiveCharts() {
  const { phase, downloadSamples, uploadSamples, latencySamples } = useTestStore();
  const [mounted, setMounted] = useState(false);

  // Only render charts after hydration (avoids SSR dimension issues)
  useEffect(() => { setMounted(true); }, []);

  const showCharts =
    mounted &&
    ((phase === "download" && downloadSamples.length > 1) ||
      (phase === "upload" && uploadSamples.length > 1) ||
      phase === "complete");

  if (!showCharts) return null;

  // Build chart-ready data — keep last 80 points max for performance
  const MAX = 80;
  const dlData = downloadSamples
    .slice(-MAX)
    .map((d, i) => ({ i, val: Math.round(d.speed * 10) / 10 }));
  const ulData = uploadSamples
    .slice(-MAX)
    .map((d, i) => ({ i, val: Math.round(d.speed * 10) / 10 }));
  const latData = latencySamples
    .slice(-MAX)
    .map((d, i) => ({ i, val: Math.round(d.ping * 10) / 10 }));

  const lastDl = downloadSamples[downloadSamples.length - 1]?.speed ?? 0;
  const lastUl = uploadSamples[uploadSamples.length - 1]?.speed ?? 0;
  const lastLat = latencySamples[latencySamples.length - 1]?.ping ?? 0;

  const fmtSpeed = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(2)} Gbps` : `${v.toFixed(1)} Mbps`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full"
      >
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
          {/* Section label */}
          <div className="px-5 pt-4 pb-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              Live Performance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border/40 px-2 pb-4 pt-2">
            <div className="px-3 py-3">
              <MiniChart
                data={dlData}
                dataKey="val"
                color="#34d399"
                gradientId="grad-dl"
                label="Download"
                unit="Mbps"
                currentValue={fmtSpeed(lastDl)}
              />
            </div>
            <div className="px-3 py-3">
              <MiniChart
                data={ulData}
                dataKey="val"
                color="#60a5fa"
                gradientId="grad-ul"
                label="Upload"
                unit="Mbps"
                currentValue={fmtSpeed(lastUl)}
              />
            </div>
            <div className="px-3 py-3">
              <MiniChart
                data={latData}
                dataKey="val"
                color="#a78bfa"
                gradientId="grad-lat"
                label="Latency"
                unit="ms"
                currentValue={lastLat > 0 ? `${lastLat.toFixed(1)} ms` : "—"}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}