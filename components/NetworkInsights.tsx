"use client";

import { motion } from "framer-motion";
import { Monitor, Wifi, Globe, Cpu } from "lucide-react";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";

export function NetworkInsights() {
  const { deviceInfo, networkInfo } = useDeviceInfo();

  const insights = [
    {
      icon: <Monitor className="w-3.5 h-3.5" />,
      label: "Device",
      value: deviceInfo.deviceType,
    },
    {
      icon: <Globe className="w-3.5 h-3.5" />,
      label: "Browser",
      value: deviceInfo.browserVersion
        ? `${deviceInfo.browser} ${deviceInfo.browserVersion.split(".")[0]}`
        : deviceInfo.browser,
    },
    {
      icon: <Cpu className="w-3.5 h-3.5" />,
      label: "OS",
      value: deviceInfo.os,
    },
    {
      icon: <Wifi className="w-3.5 h-3.5" />,
      label: "Connection",
      value: networkInfo.effectiveType
        ? networkInfo.effectiveType.toUpperCase()
        : deviceInfo.connectionType !== "Unknown"
          ? deviceInfo.connectionType
          : "—",
    },
  ];

  if (networkInfo.downlink) {
    insights.push({
      icon: <Wifi className="w-3.5 h-3.5" />,
      label: "Est. Downlink",
      value: `${networkInfo.downlink} Mbps`,
    });
  }

  if (networkInfo.rtt) {
    insights.push({
      icon: <Wifi className="w-3.5 h-3.5" />,
      label: "Est. RTT",
      value: `${networkInfo.rtt} ms`,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-5xl mx-auto"
    >
      <div className="rounded-xl border border-border/40 bg-card/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Connection Insights
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border/30">
          {insights.slice(0, 4).map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex flex-col gap-1.5 p-4"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground/50">
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-foreground/80">
                {item.value}
              </span>
            </motion.div>
          ))}
        </div>
        {insights.length > 4 && (
          <div className="px-4 pb-3 flex gap-4">
            {insights.slice(4).map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground/50">{item.label}:</span>
                <span className="text-xs font-medium text-foreground/70">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
