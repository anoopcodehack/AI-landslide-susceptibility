"use client";

import React, { useState } from "react";

interface SectorItem {
  id: string;
  name: string;
  score_pct: string;
  status_label: string;
  variant: "green" | "amber" | "blue";
  last_survey: string;
}

interface AlertItem {
  id: number;
  title: string;
  timestamp: string;
  severity: "danger" | "warning" | "stable";
}

interface TacticalDockProps {
  onOpenMap: () => void;
  onOpenShap: () => void;
  onOpenSim: () => void;
  sectors?: SectorItem[];
  alerts?: AlertItem[];
}

export const TacticalDock: React.FC<TacticalDockProps> = ({
  onOpenMap,
  onOpenShap,
  onOpenSim,
  sectors,
  alerts,
}) => {
  const [slopeThreshold, setSlopeThreshold] = useState<number>(34);

  const defaultSectors: SectorItem[] = [
    {
      id: "bathery",
      name: "S. Bathery Plateau",
      score_pct: "97%",
      status_label: "Stable / Safe Slope",
      variant: "green",
      last_survey: "14 min last survey",
    },
    {
      id: "vythiri",
      name: "Vythiri Ghat Pass",
      score_pct: "91%",
      status_label: "Watch Zone Incline",
      variant: "amber",
      last_survey: "13 min last survey",
    },
    {
      id: "meppadi",
      name: "Meppadi Corridor",
      score_pct: "95%",
      status_label: "Critical Debris Track",
      variant: "blue",
      last_survey: "12 min last survey",
    },
  ];

  const defaultAlerts: AlertItem[] = [
    {
      id: 1,
      title: "Mundakkai Debris Flow Hazard Alert",
      timestamp: "05m ago",
      severity: "danger",
    },
    {
      id: 2,
      title: "Chooralmala Incline Shear Warning",
      timestamp: "15m ago",
      severity: "warning",
    },
    {
      id: 3,
      title: "Meppadi Precipitation Threshold",
      timestamp: "18m ago",
      severity: "warning",
    },
    {
      id: 4,
      title: "Kalpetta Drainage System Safe",
      timestamp: "35m ago",
      severity: "stable",
    },
  ];

  const sectorList = sectors && sectors.length > 0 ? sectors : defaultSectors;
  const alertList = alerts && alerts.length > 0 ? alerts : defaultAlerts;

  return (
    <footer className="bg-[#0a0d14] rounded-t-4xl px-6 md:px-10 py-7 text-white relative mt-6">
      {/* Dock Handle */}
      <div
        onClick={onOpenMap}
        className="w-9 h-1.5 bg-slate-700 hover:bg-slate-500 rounded-full mx-auto -mt-3 mb-5 cursor-pointer transition-colors"
        title="Expand GIS Radar Map"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Conditioning Factors */}
        <div className="lg:col-span-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            Conditioning Factors // Terrain Drivers
          </h4>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1 rounded-full text-xs font-medium text-slate-200 cursor-pointer">
              Steep Slope &gt; 30° ✕
            </span>
            <span className="bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1 rounded-full text-xs font-medium text-slate-200 cursor-pointer">
              Heavy Rain &gt; 200mm ✕
            </span>
            <span className="bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1 rounded-full text-xs font-medium text-slate-200 cursor-pointer">
              Pore-Water Saturation ✕
            </span>
            <span className="bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1 rounded-full text-xs font-medium text-slate-200 cursor-pointer">
              Sparse Forest (NDVI &lt; 0.3) ✕
            </span>
            <span className="bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1 rounded-full text-xs font-medium text-slate-200 cursor-pointer">
              Colluvial Soil ✕
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
            <span>Critical Slope Threshold: <b className="text-slate-200">Steep Incline</b></span>
            <span className="font-bold text-amber-400 font-mono">{slopeThreshold}.0°</span>
          </div>

          <input
            type="range"
            min="10"
            max="60"
            value={slopeThreshold}
            onChange={(e) => setSlopeThreshold(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-4"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={onOpenSim}
              className="bg-white/10 hover:bg-white text-white hover:text-slate-900 border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm"
            >
              ⚡ Run Full XGBoost Inference
            </button>
            <span
              onClick={onOpenShap}
              className="text-base cursor-pointer hover:scale-110 transition-transform p-1"
              title="View SHAP Explainability Plot"
            >
              🔍
            </span>
          </div>
        </div>

        {/* Column 2: Dynamic Sector Risk Cards */}
        <div className="lg:col-span-5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            Sector Risk // Monitored Corridors
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sectorList.map((sec) => {
              const glowClass =
                sec.variant === "green"
                  ? "from-emerald-500/15 border-emerald-500/80 glow-green"
                  : sec.variant === "amber"
                  ? "from-orange-500/15 border-orange-500/80 glow-amber"
                  : "from-sky-500/15 border-sky-500/80 glow-blue";

              const dotColor =
                sec.variant === "green"
                  ? "🟢"
                  : sec.variant === "amber"
                  ? "🟠"
                  : "🔴";

              return (
                <div
                  key={sec.id}
                  onClick={onOpenMap}
                  className={`rounded-2xl p-3.5 bg-gradient-to-b ${glowClass} to-slate-900/80 border flex flex-col justify-between min-h-[130px] cursor-pointer hover:-translate-y-1 transition-transform`}
                >
                  <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wide truncate">
                    {sec.name}
                  </div>
                  <div className="text-3xl font-extrabold text-white my-1">{sec.score_pct}</div>
                  <div className="text-[10px] font-semibold text-slate-300 flex flex-col">
                    <span>{dotColor} {sec.status_label}</span>
                    <span className="text-slate-400 font-mono mt-0.5">{sec.last_survey}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Dynamic Critical Alerts Feed */}
        <div className="lg:col-span-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            Critical Alerts // Live Stream
          </h4>

          <div className="flex flex-col gap-2">
            {alertList.map((alt) => {
              const borderClass =
                alt.severity === "danger"
                  ? "border-rose-500"
                  : alt.severity === "warning"
                  ? "border-amber-500"
                  : "border-emerald-500";

              return (
                <div
                  key={alt.id}
                  className={`bg-white/5 border-l-4 ${borderClass} rounded-r-xl p-2.5 flex items-center justify-between text-xs`}
                >
                  <span className="font-semibold text-slate-200 truncate pr-2">
                    {alt.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                    {alt.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};
