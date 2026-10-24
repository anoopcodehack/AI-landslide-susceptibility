"use client";

import React, { useState } from "react";
import { Activity } from "lucide-react";

interface TrendData {
  weekly: Array<{ day: string; rainfall_mm: number; hazard_idx: number; highlight?: boolean }>;
  daily: Array<{ time: string; rainfall_mm: number }>;
  monthly: Array<{ week: string; rainfall_mm: number }>;
}

interface TrendChartProps {
  trendData?: TrendData;
}

export const TrendChart: React.FC<TrendChartProps> = ({ trendData }) => {
  const [timeframe, setTimeframe] = useState<"Weekly" | "Daily" | "Monthly">("Weekly");

  const weeklyData = trendData?.weekly || [
    { day: "Sun", rainfall_mm: 120, hazard_idx: 45 },
    { day: "Mon", rainfall_mm: 180, hazard_idx: 65 },
    { day: "Tue", rainfall_mm: 245, hazard_idx: 88 },
    { day: "Wed", rainfall_mm: 160, hazard_idx: 55 },
    { day: "Thu", rainfall_mm: 130, hazard_idx: 40 },
    { day: "Fri", rainfall_mm: 310, hazard_idx: 94 },
    { day: "Sat", rainfall_mm: 140, hazard_idx: 50 },
  ];

  return (
    <div className="coder-dark-card p-5 md:p-6 mt-4">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Precipitation & Hazard Trigger Waveform
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400">
            Temporal rainfall accumulation across Wayanad catchment basins
          </p>
        </div>

        {/* Timeframe pill tabs */}
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
          {(["Daily", "Weekly", "Monthly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-200 ${
                timeframe === t
                  ? "bg-white/15 text-white font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* High-Resolution SVG Area Waveform */}
      <div className="w-full h-36">
        <svg width="100%" height="100%" viewBox="0 0 520 135" preserveAspectRatio="none">
          <defs>
            <linearGradient id="coderAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="35" y1="20" x2="510" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
          <line x1="35" y1="55" x2="510" y2="55" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
          <line x1="35" y1="90" x2="510" y2="90" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />

          {/* Y Axis text */}
          <text x="5" y="24" fontSize="10" fill="#71717a" fontFamily="monospace">350mm</text>
          <text x="5" y="59" fontSize="10" fill="#71717a" fontFamily="monospace">180mm</text>
          <text x="12" y="94" fontSize="10" fill="#71717a" fontFamily="monospace">0mm</text>

          {/* Gradient Fill */}
          <path
            d="M 40,85 C 70,70 100,88 130,60 C 160,75 180,40 210,45 C 240,75 280,30 320,25 C 360,60 410,28 460,55 C 490,48 505,42 515,40 L 515,110 L 40,110 Z"
            fill="url(#coderAreaGrad)"
          />

          {/* Solid Emerald Line */}
          <path
            d="M 40,85 C 70,70 100,88 130,60 C 160,75 180,40 210,45 C 240,75 280,30 320,25 C 360,60 410,28 460,55 C 490,48 505,42 515,40"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.2"
          />

          {/* Secondary Threshold Line */}
          <line x1="40" y1="45" x2="515" y2="45" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" />
          <text x="365" y="40" fontSize="9" fill="#f87171" fontFamily="monospace">Critical Trigger Threshold (200mm)</text>
        </svg>
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between px-6 text-[10px] font-mono text-zinc-400 mt-2">
        {weeklyData.map((d, i) => (
          <span key={i} className="hover:text-white transition-colors cursor-default">
            {d.day.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
};
