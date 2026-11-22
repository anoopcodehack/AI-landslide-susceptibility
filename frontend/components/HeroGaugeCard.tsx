"use client";

import React from "react";
import { ShieldCheck, Mountain, CloudRain, Trees } from "lucide-react";

interface HeroGaugeCardProps {
  terrainStability?: number;
  porePressure?: number;
  rocAuc?: string;
  modelName?: string;
  slopeStress?: string;
  rainfallSaturation?: string;
  ndviCohesion?: string;
  overview?: {
    terrain_stability_index: number;
    pore_pressure_index: number;
    model_confidence: string;
    model_name: string;
    dem_resolution: string;
    slope_stress_pct: string;
    rainfall_saturation_pct: string;
    ndvi_cohesion_pct: string;
  };
}

export const HeroGaugeCard: React.FC<HeroGaugeCardProps> = ({
  terrainStability,
  porePressure,
  rocAuc,
  modelName,
  slopeStress,
  rainfallSaturation,
  ndviCohesion,
  overview,
}) => {
  const stability = terrainStability ?? overview?.terrain_stability_index ?? 74.8;
  const pore = porePressure ?? overview?.pore_pressure_index ?? 68.2;
  const model = modelName ?? overview?.model_name ?? "XGBoost Classifier";
  const auc = rocAuc ?? overview?.model_confidence ?? "0.9400";
  const slope = slopeStress ?? overview?.slope_stress_pct ?? "78.4%";
  const rain = rainfallSaturation ?? overview?.rainfall_saturation_pct ?? "82.1%";
  const ndvi = ndviCohesion ?? overview?.ndvi_cohesion_pct ?? "64.5%";

  const stabilityPct = Math.min(100, Math.max(0, stability));
  const porePressurePct = Math.min(100, Math.max(0, pore));

  const stabilityStatus =
    stability >= 75
      ? { text: "Nominal Stable Incline", color: "text-emerald-700 font-semibold" }
      : stability >= 50
      ? { text: "Marginal Incline Watch", color: "text-amber-700 font-semibold" }
      : { text: "Critical Incline Shear", color: "text-red-700 font-semibold" };

  const poreStatus =
    pore >= 75
      ? { text: "Elevated Shear Saturation", color: "text-amber-700 font-semibold" }
      : pore >= 50
      ? { text: "Moderate Pore Saturation", color: "text-amber-700 font-semibold" }
      : { text: "Nominal Hydrostatic Baseline", color: "text-emerald-700 font-semibold" };

  return (
    <div className="bg-zinc-50/70 p-6 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between space-y-5">
      {/* Top Telemetry Header */}
      <div className="border-b border-zinc-200/80 pb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-black tracking-tight">
            Geotechnical Stability & Pore Saturation Gauges
          </h3>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Real-time mechanical factor of safety analysis for Wayanad District
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
          Sector: Wayanad Ridge 01
        </span>
      </div>

      {/* Dual Circular Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gauge 1: Stability Index */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs flex items-center gap-4 hover:border-black transition-colors">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e4e4e7"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * stabilityPct) / 100}
                strokeLinecap="round"
                stroke="#10b981"
                fill="transparent"
              />
            </svg>
            <div className="absolute font-mono text-xs font-black text-black">
              {stabilityPct.toFixed(0)}%
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
              Slope Stability Index
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-black mt-0.5">
              {stability.toFixed(1)}<span className="text-xs text-zinc-400 font-sans ml-1">/100</span>
            </div>
            <span className={`text-[11px] block mt-0.5 ${stabilityStatus.color}`}>
              {stabilityStatus.text}
            </span>
          </div>
        </div>

        {/* Gauge 2: Pore-Water Pressure */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs flex items-center gap-4 hover:border-black transition-colors">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e4e4e7"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * porePressurePct) / 100}
                strokeLinecap="round"
                stroke="#f59e0b"
                fill="transparent"
              />
            </svg>
            <div className="absolute font-mono text-xs font-black text-black">
              {porePressurePct.toFixed(0)}%
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
              Pore-Water Saturation
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-black mt-0.5">
              {pore.toFixed(1)}<span className="text-xs text-zinc-400 font-sans ml-1">/100</span>
            </div>
            <span className={`text-[11px] block mt-0.5 ${poreStatus.color}`}>
              {poreStatus.text}
            </span>
          </div>
        </div>
      </div>

      {/* Conditioning Factors Telemetry Breakdown */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="bg-white p-3 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium">
            <Mountain className="w-3.5 h-3.5 text-zinc-700" />
            <span>Slope Angle</span>
          </div>
          <div className="font-mono text-sm font-black text-black mt-1">
            {slope}
          </div>
          <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: slope }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium">
            <CloudRain className="w-3.5 h-3.5 text-zinc-700" />
            <span>24h Rainfall</span>
          </div>
          <div className="font-mono text-sm font-black text-black mt-1">
            {rain}
          </div>
          <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: rain }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-medium">
            <Trees className="w-3.5 h-3.5 text-zinc-700" />
            <span>NDVI Canopy</span>
          </div>
          <div className="font-mono text-sm font-black text-black mt-1">
            {ndvi}
          </div>
          <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: ndvi }} />
          </div>
        </div>
      </div>
    </div>
  );
};
