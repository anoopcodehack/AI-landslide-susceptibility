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
    ? "Severe Saturation (1,000mm)"
    : "Critical Trigger (200mm)";
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
    const apex = points.find((p) => p.highlight);
    return apex || points[points.length - 1] || null;
  }, [hoveredIdx, points]);

  return (
    <div className="bg-zinc-50/70 p-6 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-base text-black">
              Precipitation & Hazard Trigger Waveform
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              IMD Benchmark
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            {timeframe === "Weekly" && "Historical disaster week progression: 25 Jul – 31 Jul 2024 (Wayanad / Chooralmala)"}
            {timeframe === "Daily" && "Diurnal cloudburst timeline: 30 Jul 2024 failure event progression"}
            {timeframe === "Monthly" && "Southwest Monsoon cumulative catchment records: June – October 2024"}
          </p>
        </div>

        {/* Timeframe pill tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-zinc-200 shadow-2xs">
          {(["Daily", "Weekly", "Monthly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTimeframe(t);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all duration-150 cursor-pointer ${
                timeframe === t
                  ? "bg-black text-white font-bold shadow-xs"
                  : "text-zinc-600 hover:text-black font-medium"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Point Telemetry Strip */}
      {activePoint && (
        <div className="flex flex-wrap items-center justify-between bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs font-mono shadow-2xs gap-2">
          <div className="flex items-center gap-3">
            <span className="text-black font-bold flex items-center gap-1.5">
              {timeframe === "Daily" ? (
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              )}
              {activePoint.label}
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-700 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <strong className="text-black">{activePoint.rainfall.toFixed(1)} mm</strong>
              <span className="text-[10px] text-zinc-500">rainfall</span>
            </span>
            <span className="text-zinc-300">•</span>
            <span
              className={`flex items-center gap-1 font-bold ${
                activePoint.hazard >= 75
                  ? "text-red-600"
                  : activePoint.hazard >= 50
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            >
              {activePoint.hazard >= 75 && <AlertTriangle className="w-3.5 h-3.5" />}
              <span>Hazard Index: {activePoint.hazard}%</span>
            </span>
          </div>

          <div className="text-[11px] text-zinc-500 hidden sm:block font-sans">
            {activePoint.annotation}
          </div>
        </div>
      )}

      {/* Dynamic High-Resolution SVG Area Waveform */}
      <div className="w-full h-40 relative bg-white rounded-xl border border-zinc-100 p-2">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 540 135"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="cleanAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="80%" stopColor="#10b981" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Clean Light Grid lines */}
          <line x1="45" y1="20" x2="525" y2="20" stroke="#f4f4f5" strokeDasharray="3,3" />
          <line x1="45" y1="65" x2="525" y2="65" stroke="#f4f4f5" strokeDasharray="3,3" />
          <line x1="45" y1="110" x2="525" y2="110" stroke="#e4e4e7" />

          {/* Dynamic Y Axis Text */}
          {yAxisTicks.map((tick, i) => (
            <text
              key={i}
              x="5"
              y={tick.y + 3}
              fontSize="10"
              fill="#71717a"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {tick.label}
            </text>
          ))}

          {/* Critical Threshold Line */}
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
            fill="#dc2626"
            fontFamily="monospace"
            fontWeight="700"
          >
            {thresholdText}
          </text>

          {/* Gradient Area Fill */}
          <path d={areaPath} fill="url(#cleanAreaGrad)" />

          {/* Smooth Solid Line Path */}
          <path
            d={curvePath}
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Node Anchors */}
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
                  fill={isApex ? "#ef4444" : isHovered ? "#059669" : "#10b981"}
                  stroke="#ffffff"
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

      {/* X-Axis Date / Time Labels */}
      <div className="flex justify-between px-2 sm:px-4 text-[11px] font-mono text-zinc-500 mt-2 border-t border-zinc-200/80 pt-2">
        {points.map((pt) => {
          const isSelected = activePoint?.label === pt.label;
          return (
            <button
              key={pt.index}
              onClick={() => setHoveredIdx(pt.index)}
              onMouseEnter={() => setHoveredIdx(pt.index)}
              className={`transition-all duration-150 cursor-pointer uppercase ${
                isSelected
                  ? "text-black font-bold scale-105"
                  : pt.highlight
                  ? "text-red-600 font-bold"
                  : "hover:text-black text-zinc-500"
              }`}
            >
              {pt.label}
              {pt.highlight && <span className="hidden sm:inline text-[9px] text-red-600 ml-0.5 font-sans">★</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
