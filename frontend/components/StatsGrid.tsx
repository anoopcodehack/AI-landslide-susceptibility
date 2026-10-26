"use client";

import React from "react";
import { Mountain, Droplets, Radio, AlertCircle } from "lucide-react";

interface StatsGridProps {
  totalPoints?: number;
  monitoredBasins?: number;
  sensorNodes?: number;
  activeAlerts?: number;
  stats?: {
    total_survey_points: number;
    monitored_basins: number;
    sensor_nodes: number;
    active_hotspot_alerts: number;
    monitored_area_km2: number;
  };
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  totalPoints,
  monitoredBasins,
  sensorNodes,
  activeAlerts,
  stats,
}) => {
  const points = totalPoints ?? stats?.total_survey_points ?? 1250;
  const basins = monitoredBasins ?? stats?.monitored_basins ?? 6;
  const nodes = sensorNodes ?? stats?.sensor_nodes ?? 142;
  const alerts = activeAlerts ?? stats?.active_hotspot_alerts ?? 3;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Metric 1 */}
      <div className="coder-dark-card p-5 flex flex-col justify-between min-h-[115px] group">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5 group-hover:text-zinc-200 transition-colors">
            <Mountain className="w-3.5 h-3.5 text-sky-400 group-hover:text-white transition-colors" /> Total Survey Grid Cells
          </span>
          <span className="font-mono text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            30m SRTM
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-3">
          <div className="font-mono text-3xl font-bold text-white tracking-tight">
            {points.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            2,131 km² Bounded
          </span>
        </div>
      </div>

      {/* Metric 2 */}
      <div className="coder-dark-card p-5 flex flex-col justify-between min-h-[115px] group">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5 group-hover:text-zinc-200 transition-colors">
            <Droplets className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white transition-colors" /> Monitored Catchment Basins
          </span>
          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
            Active Runoff
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-3">
          <div className="font-mono text-3xl font-bold text-white tracking-tight">
            {basins}
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            48 Hydrological Nodes
          </span>
        </div>
      </div>

      {/* Metric 3 */}
      <div className="coder-dark-card p-5 flex flex-col justify-between min-h-[115px] group">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5 group-hover:text-zinc-200 transition-colors">
            <Radio className="w-3.5 h-3.5 text-amber-400 group-hover:text-white transition-colors" /> Wireless Telemetry Nodes
          </span>
          <span className="font-mono text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            10-min Sync
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-3">
          <div className="font-mono text-3xl font-bold text-white tracking-tight">
            {nodes}
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            LoRaWAN Telemetry
          </span>
        </div>
      </div>

      {/* Metric 4 */}
      <div className="coder-dark-card p-5 border-rose-500/30 bg-rose-950/20 flex flex-col justify-between min-h-[115px] group">
        <div className="flex items-center justify-between text-xs text-rose-300 font-medium">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Active Hotspot Warnings
          </span>
          <span className="font-mono text-[10px] text-rose-400 bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded font-semibold">
            Elevated
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-3">
          <div className="font-mono text-3xl font-bold text-rose-400 tracking-tight">
            {alerts}
          </div>
          <span className="text-[11px] text-rose-300/80 font-mono">
            Vythiri & Meppadi
          </span>
        </div>
      </div>
    </div>
  );
};
