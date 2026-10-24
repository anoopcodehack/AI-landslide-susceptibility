"use client";

import React from "react";
import { ShieldCheck, Mountain, CloudRain, Trees } from "lucide-react";

interface HeroGaugeCardProps {
  terrainStability: number;
  porePressure: number;
  rocAuc: string;
  modelName: string;
  slopeStress: string;
  rainfallSaturation: string;
  ndviCohesion: string;
}

export const HeroGaugeCard: React.FC<HeroGaugeCardProps> = ({
  terrainStability,
  porePressure,
  rocAuc,
  modelName,
  slopeStress,
  rainfallSaturation,
  ndviCohesion,
}) => {
  const stabilityPct = Math.min(100, Math.max(0, terrainStability));
  const porePressurePct = Math.min(100, Math.max(0, porePressure));

  return (
    <div className="coder-dark-card p-6 flex flex-col justify-between min-h-[420px]">
      {/* Top Telemetry Header */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            Sensor Cluster: Western Ghats Sector 01
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            Node Sync: Active
          </span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight mt-2">
          Terrain Stability & Pore-Pressure Telemetry
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Dynamic geotechnical assessment for Wayanad District (Vythiri, Meppadi, Chooralmala)
        </p>
      </div>

      {/* Dual Circular Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
        {/* Gauge 1: Stability Index */}
        <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10 flex items-center gap-4 group hover:border-white/20 transition-all duration-200">
          <div className="relative w-18 h-18 flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
            <svg className="w-18 h-18 -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-zinc-800"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                strokeWidth="7"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * stabilityPct) / 100}
                strokeLinecap="round"
                stroke="#10b981"
                fill="transparent"
              />
            </svg>
            <div className="absolute font-mono text-xs font-bold text-white">
              {stabilityPct.toFixed(0)}%
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Stability Index
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              {terrainStability.toFixed(1)}<span className="text-xs text-zinc-500 font-sans ml-1">/100</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">
              Nominal Incline Factor
            </span>
          </div>
        </div>

        {/* Gauge 2: Pore-Water Pressure */}
        <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10 flex items-center gap-4 group hover:border-white/20 transition-all duration-200">
          <div className="relative w-18 h-18 flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
            <svg className="w-18 h-18 -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-zinc-800"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                strokeWidth="7"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * porePressurePct) / 100}
                strokeLinecap="round"
                stroke="#f59e0b"
                fill="transparent"
              />
            </svg>
            <div className="absolute font-mono text-xs font-bold text-white">
              {porePressurePct.toFixed(0)}%
            </div>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Pore-Water Pressure
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              {porePressure.toFixed(1)}<span className="text-xs text-zinc-500 font-sans ml-1">/100</span>
            </div>
            <span className="text-[11px] text-amber-400 font-medium">
              Elevated Shear Saturation
            </span>
          </div>
        </div>
      </div>

      {/* Model Benchmark Meta Card */}
      <div className="bg-white/[0.03] p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              {modelName}
            </div>
            <p className="text-[11px] text-zinc-400">
              Gradient Boosted Decision Trees // 30m SRTM DEM Resolution
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            ROC-AUC: {rocAuc}
          </span>
        </div>
      </div>

      {/* Conditioning Factors Telemetry Breakdown */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10 mt-2">
        <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/10">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <Mountain className="w-3.5 h-3.5 text-zinc-400" />
            <span>Slope Angle</span>
          </div>
          <div className="font-mono text-sm font-bold text-white mt-1">
            {slopeStress}
          </div>
          <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full transition-all duration-300" style={{ width: slopeStress }} />
          </div>
        </div>

        <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/10">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <CloudRain className="w-3.5 h-3.5 text-zinc-400" />
            <span>24h Rainfall</span>
          </div>
          <div className="font-mono text-sm font-bold text-white mt-1">
            {rainfallSaturation}
          </div>
          <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-sky-400 h-full rounded-full transition-all duration-300" style={{ width: rainfallSaturation }} />
          </div>
        </div>

        <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/10">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <Trees className="w-3.5 h-3.5 text-zinc-400" />
            <span>NDVI Canopy</span>
          </div>
          <div className="font-mono text-sm font-bold text-white mt-1">
            {ndviCohesion}
          </div>
          <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: ndviCohesion }} />
          </div>
        </div>
      </div>
    </div>
  );
};
