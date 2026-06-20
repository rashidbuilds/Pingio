import { Monitor, Globe, Cpu, Wifi } from "lucide-react";
import { TestResult } from "@/types";
import { formatSpeed, formatLatency, formatDate } from "@/lib/utils";

const SCALE_STEPS = [0, 10, 20, 50, 100, 250, 500, 750, 1000];

function speedToRatio(s: number): number {
  if (s <= 0) return 0;
  if (s >= 1000) return 1;
  for (let i = 0; i < SCALE_STEPS.length - 1; i++) {
    const v1 = SCALE_STEPS[i];
    const v2 = SCALE_STEPS[i + 1];
    if (s >= v1 && s <= v2) {
      const f = (s - v1) / (v2 - v1);
      return (i + f) / (SCALE_STEPS.length - 1);
    }
  }
  return 0;
}

export const getSpeedRating = (speed: number, isUpload = false) => {
  if (isUpload) {
    if (speed < 5) return { text: "Slow", color: "text-red-400" };
    if (speed < 20) return { text: "Fair", color: "text-amber-400" };
    if (speed < 75) return { text: "Good", color: "text-emerald-400" };
    return { text: "Exceptional", color: "text-teal-400" };
  } else {
    if (speed < 10) return { text: "Slow", color: "text-red-400" };
    if (speed < 50) return { text: "Fair", color: "text-amber-400" };
    if (speed < 150) return { text: "Good", color: "text-emerald-400" };
    return { text: "Exceptional", color: "text-teal-400" };
  }
};

export function SpeedCardView({ result, cardId }: { result: TestResult; cardId: string }) {
  // Speed rating descriptions
  const dlRating = getSpeedRating(result.download, false);
  const ulRating = getSpeedRating(result.upload, true);

  // Exact 288 degrees (80% circle) tracks to match main dial speedometer
  const dlDashoffset = 276.46 - (speedToRatio(result.download) * 276.46);
  const ulDashoffset = 226.19 - (speedToRatio(result.upload) * 226.19);

  return (
    <div
      id={cardId}
      className="w-full h-full bg-[#070a0e] text-white px-6 py-5 flex flex-col justify-between relative overflow-hidden rounded-2xl select-none"
    >
      {/* Subtle Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#10B981]/08 rounded-full blur-[60px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#3B82F6]/08 rounded-full blur-[60px]" />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 sm:w-7 sm:h-7">
            <defs>
              <linearGradient id={`${cardId}-logoGrad`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <path
              d="M2 12h3.5l3-8 4 16 3-10 2 2H22"
              stroke={`url(#${cardId}-logoGrad)`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-semibold text-lg sm:text-xl tracking-tight text-white">
            Pingio
          </span>
        </div>
        <div className="text-right">
          <div className="text-[8px] sm:text-[9px] text-white/40 uppercase tracking-widest font-medium">Speed Test Report</div>
          <div className="text-[10px] sm:text-xs text-white/70 font-normal mt-0.5">{formatDate(result.timestamp)}</div>
        </div>
      </div>

      {/* Top Row: Mini Dial + Device/IP details (50/50 Layout) */}
      <div className="flex items-center gap-0 z-10 my-2">
        {/* Left: Mini Dial (Half width, 50%) */}
        <div className="w-1/2 flex flex-col items-center justify-center">
          <div className="relative w-[130px] h-[130px]">
            <svg viewBox="0 0 140 140" className="w-full h-full absolute inset-0">
              {/* Download track bg */}
              <circle cx="70" cy="70" r="55" fill="none" stroke="#10B981" strokeOpacity="0.06" strokeWidth="3.5" strokeDasharray="276.46 345.57" transform="rotate(126, 70, 70)" strokeLinecap="round" />
              {/* Download track active */}
              <circle cx="70" cy="70" r="55" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="276.46 345.57" strokeDashoffset={dlDashoffset} transform="rotate(126, 70, 70)" strokeLinecap="round" />

              {/* Upload track bg */}
              <circle cx="70" cy="70" r="45" fill="none" stroke="#3B82F6" strokeOpacity="0.06" strokeWidth="3.5" strokeDasharray="226.19 282.74" transform="rotate(126, 70, 70)" strokeLinecap="round" />
              {/* Upload track active */}
              <circle cx="70" cy="70" r="45" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="226.19 282.74" strokeDashoffset={ulDashoffset} transform="rotate(126, 70, 70)" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[8px] text-white/30 font-medium uppercase tracking-wider">Speed</span>
              <span className="text-base font-semibold text-white mt-0.5 tabular-nums">
                {result.download.toFixed(1)}
              </span>
              <span className="text-[8px] text-[#10B981]/90 font-medium uppercase">Mbps</span>
            </div>
          </div>
          {/* Ping / Jitter details */}
          <div className="flex items-center gap-1.5 mt-2 bg-white/[0.02] border border-white/[0.06] px-2.5 py-0.5 rounded-full text-[8px] whitespace-nowrap text-white/40">
            <span>Ping: <strong className="text-white/70 font-medium tabular-nums">{result.ping.toFixed(0)} ms</strong></span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>Jitter: <strong className="text-white/70 font-medium tabular-nums">{result.jitter.toFixed(0)} ms</strong></span>
          </div>
        </div>

        {/* Divider vertical line */}
        <div className="w-px h-[120px] bg-white/10" />

        {/* Right: Device / Browser / Connection Details (Half width, 50%) */}
        <div className="w-1/2 flex flex-col justify-center gap-2.5 text-[10px] sm:text-xs pl-5 pr-4 py-1">
          <div className="flex items-center gap-2">
            <Monitor className="w-3.5 h-3.5 text-white/30" />
            <div>
              <div className="text-[8px] text-white/40 font-medium uppercase">Device</div>
              <div className="text-white/80 font-normal">{result.device || "Desktop"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-white/30" />
            <div>
              <div className="text-[8px] text-white/40 font-medium uppercase">Browser</div>
              <div className="text-white/80 font-normal truncate max-w-[90px] sm:max-w-[110px]">{result.browser || "Chrome"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-white/30" />
            <div>
              <div className="text-[8px] text-white/40 font-medium uppercase">OS</div>
              <div className="text-white/80 font-normal">{result.os || "Windows"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-white/30" />
            <div>
              <div className="text-[8px] text-white/40 font-medium uppercase">Connection</div>
              <div className="text-white/80 font-normal">{result.connection || "—"}</div>
            </div>
          </div>

          <div className="mt-1 pt-1.5 border-t border-white/[0.08] flex justify-between items-center text-[10px] text-white/40">
            <span>IP: <span className="font-mono text-[#3B82F6] font-medium">{result.ip || "Unknown"}</span></span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Download / Upload speed metrics (Clean, borderless, separated by vertical line) */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 z-10 my-2">
        {/* Download Column */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[9px] text-white/40 font-medium uppercase tracking-wider block mb-1">
            ↓ Download Speed
          </span>
          <span className="text-xl sm:text-2xl font-semibold text-[#10B981] tracking-tight tabular-nums block">
            {formatSpeed(result.download)}
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-[9px] text-white/30">
            <span>Peak: {formatSpeed(result.downloadPeak || result.download)}</span>
            <span>•</span>
            <span className={dlRating.color}>{dlRating.text}</span>
          </div>
        </div>

        {/* Center Vertical Divider Line */}
        <div className="w-px h-12 bg-white/10" />

        {/* Upload Column */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[9px] text-white/40 font-medium uppercase tracking-wider block mb-1">
            ↑ Upload Speed
          </span>
          <span className="text-xl sm:text-2xl font-semibold text-[#3B82F6] tracking-tight tabular-nums block">
            {formatSpeed(result.upload)}
          </span>
          <div className="flex items-center gap-1.5 mt-1 text-[9px] text-white/30">
            <span>Peak: {formatSpeed(result.uploadPeak || result.upload)}</span>
            <span>•</span>
            <span className={ulRating.color}>{ulRating.text}</span>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="border-t border-white/[0.08] pt-3 z-10 flex justify-between items-center text-[9px] text-white/45">
        <span>Tested with <span className="font-normal text-white/60">Pingio Engine</span></span>
        <span className="font-semibold tracking-wider text-[#10B981]">PASSED</span>
      </div>
    </div>
  );
}
