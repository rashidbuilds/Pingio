"use client";

import { useState, useEffect } from "react";
import { DeviceInfo, NetworkInfo } from "@/types";

export function useDeviceInfo(): { deviceInfo: DeviceInfo; networkInfo: NetworkInfo } {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    browser: "Unknown",
    browserVersion: "",
    os: "Unknown",
    deviceType: "Desktop",
    connectionType: "Unknown",
  });

  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({});

  useEffect(() => {
    const ua = navigator.userAgent;

    // Browser detection
    let browser = "Unknown";
    let browserVersion = "";

    if (ua.includes("Edg/")) {
      browser = "Microsoft Edge";
      browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("Chrome/") && !ua.includes("Chromium")) {
      browser = "Chrome";
      browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("Firefox/")) {
      browser = "Firefox";
      browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
      browser = "Safari";
      browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || "";
    } else if (ua.includes("OPR/") || ua.includes("Opera/")) {
      browser = "Opera";
      browserVersion = ua.match(/OPR\/([\d.]+)/)?.[1] || "";
    }

    // OS detection
    let os = "Unknown";
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    // Device type
    let deviceType = "Desktop";
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
      deviceType = /iPad/i.test(ua) ? "Tablet" : "Mobile";
    }

    // Connection type from Network Information API
    let connectionType = "Unknown";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connectionType = connection.effectiveType || connection.type || "Unknown";
    }

    setDeviceInfo({ browser, browserVersion, os, deviceType, connectionType });

    if (connection) {
      setNetworkInfo({
        type: connection.type,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      });

      const handleChange = () => {
        setNetworkInfo({
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        });
      };

      connection.addEventListener("change", handleChange);
      return () => connection.removeEventListener("change", handleChange);
    }
  }, []);

  return { deviceInfo, networkInfo };
}
