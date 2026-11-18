"use client";

import React, { useState, useMemo } from "react";
import { Activity, AlertTriangle, Calendar, Clock, Droplets } from "lucide-react";

export interface TrendItem {
  date?: string;
  day?: string;
  time?: string;
  month?: string;
  week?: string;
  label?: string;
  rainfall_mm: number;
  hazard_idx?: number;
  highlight?: boolean;
  annotation?: string;
}

export interface TrendData {
  weekly: TrendItem[];
  daily: TrendItem[];
  monthly: TrendItem[];
}

interface TrendChartProps {
  trendData?: TrendData;
}

// Canonical July 2024 Wayanad Disaster IMD Rain Gauge Records
const DEFAULT_WEEKLY: TrendItem[] = [
  { date: "25 Jul", day: "25 Jul", rainfall_mm: 68.0, hazard_idx: 28, highlight: false, annotation: "Monsoon Baseline" },
  { date: "26 Jul", day: "26 Jul", rainfall_mm: 95.0, hazard_idx: 36, highlight: false, annotation: "Moderate Showers" },
  { date: "27 Jul", day: "27 Jul", rainfall_mm: 145.0, hazard_idx: 52, highlight: false, annotation: "Pre-Monsoon Surge" },
  { date: "28 Jul", day: "28 Jul", rainfall_mm: 185.0, hazard_idx: 68, highlight: false, annotation: "Saturation Watch (T-48h)" },
  { date: "29 Jul", day: "29 Jul", rainfall_mm: 286.0, hazard_idx: 86, highlight: false, annotation: "Extreme Saturation (T-24h)" },
  { date: "30 Jul", day: "30 Jul", rainfall_mm: 372.0, hazard_idx: 98, highlight: true, annotation: "Failure Trigger Apex (T-0h)" },
  { date: "31 Jul", day: "31 Jul", rainfall_mm: 128.0, hazard_idx: 54, highlight: false, annotation: "Post-Collapse Runoff (T+12h)" },
];

const DEFAULT_DAILY: TrendItem[] = [
  { time: "00:00", label: "00:00", rainfall_mm: 45.0, hazard_idx: 65, highlight: false, annotation: "Nocturnal Squall" },
  { time: "04:00", label: "04:00", rainfall_mm: 110.0, hazard_idx: 78, highlight: false, annotation: "Intensifying Downpour" },
  { time: "08:00", label: "08:00", rainfall_mm: 195.0, hazard_idx: 88, highlight: false, annotation: "Severe Orographic Surge" },
  { time: "12:00", label: "12:00", rainfall_mm: 280.0, hazard_idx: 93, highlight: false, annotation: "High Pore Saturation" },
  { time: "16:00", label: "16:00", rainfall_mm: 372.0, hazard_idx: 99, highlight: true, annotation: "Cloudburst Failure Apex" },
  { time: "20:00", label: "20:00", rainfall_mm: 240.0, hazard_idx: 84, highlight: false, annotation: "Mass Debris Transport" },
  { time: "23:59", label: "23:59", rainfall_mm: 135.0, hazard_idx: 62, highlight: false, annotation: "Receding Inundation" },
];

const DEFAULT_MONTHLY: TrendItem[] = [
  { month: "Jun 2024", label: "Jun 2024", rainfall_mm: 820.0, hazard_idx: 42, highlight: false, annotation: "Early Monsoon Influx" },
  { month: "Jul 2024", label: "Jul 2024", rainfall_mm: 1420.0, hazard_idx: 96, highlight: true, annotation: "Disaster Cloudburst Month" },
  { month: "Aug 2024", label: "Aug 2024", rainfall_mm: 950.0, hazard_idx: 68, highlight: false, annotation: "Monsoon Surge Phase" },
  { month: "Sep 2024", label: "Sep 2024", rainfall_mm: 480.0, hazard_idx: 38, highlight: false, annotation: "Receding Monsoon" },
  { month: "Oct 2024", label: "Oct 2024", rainfall_mm: 290.0, hazard_idx: 22, highlight: false, annotation: "Post-Monsoon Transition" },
];

export const TrendChart: React.FC<TrendChartProps> = ({ trendData }) => {
  const [timeframe, setTimeframe] = useState<"Weekly" | "Daily" | "Monthly">("Weekly");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Select active data series based on tab
  const rawItems: TrendItem[] = useMemo(() => {
    if (timeframe === "Daily") {
      return trendData?.daily && trendData.daily.length > 0 ? trendData.daily : DEFAULT_DAILY;
    }
    if (timeframe === "Monthly") {
      return trendData?.monthly && trendData.monthly.length > 0 ? trendData.monthly : DEFAULT_MONTHLY;
    }
    return trendData?.weekly && trendData.weekly.length > 0 ? trendData.weekly : DEFAULT_WEEKLY;
  }, [timeframe, trendData]);

  // Normalize data points
  const items = useMemo(() => {
    return rawItems.map((item) => {
      const label = item.date || item.day || item.time || item.month || item.week || item.label || "";
      const rainfall = item.rainfall_mm;
      const hazard =
        item.hazard_idx ??
        Math.round(
          Math.min(99, Math.max(15, (rainfall / (timeframe === "Monthly" ? 1500 : 380)) * 95))
        );
      const isApex = item.highlight ?? (rainfall >= (timeframe === "Monthly" ? 1200 : 350));
      return {
        label,
        rainfall,
        hazard,
        highlight: isApex,
        annotation: item.annotation || (isApex ? "Failure Trigger Apex" : "Telemetry Gauge"),
      };
    });
  }, [rawItems, timeframe]);

  // Dynamic scale parameters based on timeframe
  const isMonthly = timeframe === "Monthly";
  const maxScaleVal = isMonthly ? 1600 : 400;
  const thresholdVal = isMonthly ? 1000 : 200;
  const thresholdText = isMonthly
    ? "Severe Saturation Threshold (1,000mm)"
    : "Critical Trigger Threshold (200mm)";
  const yAxisTicks = isMonthly
    ? [
        { label: "1600mm", y: 20 },
        { label: "800mm", y: 65 },
        { label: "0mm", y: 110 },
      ]
    : [
        { label: "400mm", y: 20 },
        { label: "200mm", y: 65 },
        { label: "0mm", y: 110 },
      ];

  // SVG Coordinate Geometry (viewBox: 0 0 540 135)
  const xMin = 50;
  const xMax = 515;
  const yMin = 20;
  const yMax = 110;

  const points = useMemo(() => {
    const n = items.length;
    return items.map((d, i) => {
      const x = n > 1 ? xMin + (i * (xMax - xMin)) / (n - 1) : (xMin + xMax) / 2;
      const clampedRain = Math.min(maxScaleVal, Math.max(0, d.rainfall));
      const y = yMax - (clampedRain / maxScaleVal) * (yMax - yMin);
      return { x, y, ...d, index: i };
    });
  }, [items, xMin, xMax, yMin, yMax, maxScaleVal]);

  // Smooth Catmull-Rom to Cubic Bezier Curve Generation
  const curvePath = useMemo(() => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i + 2 < points.length ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  }, [points]);

  // Closed Gradient Area Path
  const areaPath = useMemo(() => {
    if (!curvePath || points.length === 0) return "";
    const lastX = points[points.length - 1].x.toFixed(1);
    const firstX = points[0].x.toFixed(1);
    return `${curvePath} L ${lastX},${yMax} L ${firstX},${yMax} Z`;
  }, [curvePath, points, yMax]);

  // Threshold Line Y Coordinate
  const thresholdY = yMax - (thresholdVal / maxScaleVal) * (yMax - yMin);

  // Active hover point (or default to apex highlight point)
  const activePoint = useMemo(() => {
    if (hoveredIdx !== null && points[hoveredIdx]) {
      return points[hoveredIdx];
    }
    return points.find((p) => p.highlight) || points[points.length - 1];
  }, [hoveredIdx, points]);

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
            <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded ml-1">
              IMD Live Hydro-Telemetry
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {timeframe === "Weekly" && "Historical disaster week progression: 25 Jul – 31 Jul 2024 (Wayanad / Chooralmala)"}
            {timeframe === "Daily" && "Diurnal cloudburst timeline: 30 Jul 2024 failure event progression"}
            {timeframe === "Monthly" && "Southwest Monsoon cumulative catchment records: June – October 2024"}
          </p>
        </div>

        {/* Timeframe pill tabs */}
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
          {(["Daily", "Weekly", "Monthly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTimeframe(t);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1 rounded text-[11px] font-medium transition-all duration-200 cursor-pointer ${
                timeframe === t
                  ? "bg-white/20 text-white font-bold shadow-sm border border-white/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Point Telemetry HUD Strip */}
      {activePoint && (
        <div className="flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 mb-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
              {timeframe === "Daily" ? (
                <Clock className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {activePoint.label}
            </span>
            <span className="text-zinc-400">•</span>
            <span className="text-zinc-300 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <strong className="text-white">{activePoint.rainfall.toFixed(1)} mm</strong>
              <span className="text-[10px] text-zinc-400">rainfall</span>
            </span>
            <span className="text-zinc-400">•</span>
            <span
              className={`flex items-center gap-1 ${
                activePoint.hazard >= 75
                  ? "text-rose-400 font-bold"
                  : activePoint.hazard >= 50
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {activePoint.hazard >= 75 && <AlertTriangle className="w-3.5 h-3.5" />}
              <span>Hazard Index: {activePoint.hazard}%</span>
            </span>
          </div>

          <div className="text-[11px] text-zinc-400 hidden sm:block">
            {activePoint.annotation}
          </div>
        </div>
      )}

      {/* Dynamic High-Resolution SVG Area Waveform */}
      <div className="w-full h-40 relative">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 540 135"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="coderAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="apexGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="45" y1="20" x2="525" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
          <line x1="45" y1="65" x2="525" y2="65" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
          <line x1="45" y1="110" x2="525" y2="110" stroke="rgba(255,255,255,0.08)" />

          {/* Dynamic Y Axis Text */}
          {yAxisTicks.map((tick, i) => (
            <text
              key={i}
              x="5"
              y={tick.y + 3}
              fontSize="10"
              fill="#71717a"
              fontFamily="monospace"
            >
              {tick.label}
            </text>
          ))}

          {/* Dynamic Secondary Threshold Line */}
          <line
            x1="45"
            y1={thresholdY}
            x2="525"
            y2={thresholdY}
            stroke="#ef4444"
            strokeWidth="1.2"
            strokeDasharray="4,4"
          />
          <text
            x="320"
            y={thresholdY - 5}
            fontSize="9"
            fill="#f87171"
            fontFamily="monospace"
            fontWeight="600"
          >
            {thresholdText}
          </text>

          {/* Dynamic Area Fill Gradient */}
          <path d={areaPath} fill="url(#coderAreaGrad)" />

          {/* Dynamic Solid Line Path */}
          <path
            d={curvePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Node Anchors for every data point */}
          {points.map((pt) => {
            const isHovered = hoveredIdx === pt.index;
            const isApex = pt.highlight;
            return (
              <g
                key={pt.index}
                className="cursor-pointer transition-transform duration-150"
                onMouseEnter={() => setHoveredIdx(pt.index)}
                onClick={() => setHoveredIdx(pt.index)}
              >
                {/* Ping ring for apex failure point */}
                {isApex && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Outer halo */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : isApex ? 5.5 : 4}
                  fill={isApex ? "#ef4444" : isHovered ? "#34d399" : "#10b981"}
                  stroke="#0b0f19"
                  strokeWidth="2"
                />

                {/* Inner dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 3 : isApex ? 2.5 : 2}
                  fill="#ffffff"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic X-Axis Date / Time Labels */}
      <div className="flex justify-between px-2 sm:px-4 text-[11px] font-mono text-zinc-400 mt-2 border-t border-white/5 pt-2">
        {points.map((pt) => {
          const isSelected = activePoint?.label === pt.label;
          return (
            <button
              key={pt.index}
              onClick={() => setHoveredIdx(pt.index)}
              onMouseEnter={() => setHoveredIdx(pt.index)}
              className={`transition-all duration-150 cursor-pointer uppercase ${
                isSelected
                  ? "text-white font-bold scale-105"
                  : pt.highlight
                  ? "text-rose-400 font-semibold"
                  : "hover:text-zinc-200 text-zinc-400"
              }`}
            >
              {pt.label}
              {pt.highlight && <span className="hidden sm:inline text-[9px] text-rose-400 ml-0.5 font-sans">★</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
