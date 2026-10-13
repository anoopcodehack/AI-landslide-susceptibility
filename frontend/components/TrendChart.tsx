"use client";

import React, { useState } from "react";

export const TrendChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");

  return (
    <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Precipitation & Hazard Trigger Trend
        </h3>
        <div className="flex bg-slate-100 p-1 rounded-full gap-1">
          {(["Daily", "Weekly", "Monthly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                timeframe === t
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Beautiful High-Resolution SVG Area Chart */}
      <div className="w-full h-36">
        <svg width="100%" height="100%" viewBox="0 0 520 135" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartBlueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="30" y1="20" x2="510" y2="20" stroke="#f1f5f9" strokeDasharray="3,3" />
          <line x1="30" y1="55" x2="510" y2="55" stroke="#f1f5f9" strokeDasharray="3,3" />
          <line x1="30" y1="90" x2="510" y2="90" stroke="#f1f5f9" strokeDasharray="3,3" />

          {/* Y Labels */}
          <text x="5" y="24" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
            400mm
          </text>
          <text x="5" y="59" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
            200mm
          </text>
          <text x="12" y="94" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
            0mm
          </text>

          {/* Area Fill */}
          <path
            d="M 35,85 C 65,70 95,88 125,60 C 155,75 175,40 205,45 C 235,75 275,30 315,25 C 355,60 405,28 455,55 C 485,48 505,42 515,40 L 515,110 L 35,110 Z"
            fill="url(#chartBlueGrad)"
          />

          {/* Main Solid Line */}
          <path
            d="M 35,85 C 65,70 95,88 125,60 C 155,75 175,40 205,45 C 235,75 275,30 315,25 C 355,60 405,28 455,55 C 485,48 505,42 515,40"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.8"
          />

          {/* Secondary Dotted Line */}
          <path
            d="M 35,95 C 75,80 125,95 185,75 C 245,88 305,60 365,65 C 425,72 475,58 515,50"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="1.8"
            strokeDasharray="4,4"
          />

          {/* Highlight Marker on Tuesday (245mm) */}
          <line
            x1="205"
            y1="45"
            x2="205"
            y2="110"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="2,2"
          />
          <circle cx="205" cy="45" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
          <rect x="186" y="24" width="38" height="16" rx="8" fill="#0f172a" />
          <text
            x="205"
            y="35"
            fontSize="8.5"
            fontWeight="700"
            fill="#ffffff"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            245mm
          </text>

          {/* X Axis Labels */}
          <text x="35" y="126" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
            Sun
          </text>
          <text x="115" y="126" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
            Mon
          </text>
          <text x="200" y="126" fontSize="10.5" fontWeight="800" fill="#0f172a" fontFamily="sans-serif">
            Tue
          </text>
          <text x="280" y="126" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
            Wed
          </text>
          <text x="360" y="126" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
            Thu
          </text>
          <text x="440" y="126" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
            Fri
          </text>
          <text x="500" y="126" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">
            Sat
          </text>
        </svg>
      </div>
    </div>
  );
};
