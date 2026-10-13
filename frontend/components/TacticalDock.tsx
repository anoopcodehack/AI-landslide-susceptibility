"use client";

import React, { useState } from "react";

interface TacticalDockProps {
  onOpenMap: () => void;
  onOpenShap: () => void;
  onOpenSim: () => void;
}

export const TacticalDock: React.FC<TacticalDockProps> = ({
  onOpenMap,
  onOpenShap,
  onOpenSim,
}) => {
  const [slopeThreshold, setSlopeThreshold] = useState<number>(34);

  return (
    <footer className="bg-[#0a0d14] rounded-t-4xl px-6 md:px-10 py-7 text-white relative mt-6">
      {/* Dock Handle */}
      <div
        onClick={onOpenMap}
        className="w-9 h-1.5 bg-slate-700 hover:bg-slate-500 rounded-full mx-auto -mt-3 mb-5 cursor-pointer transition-colors"
        title="Expand GIS Radar Map"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Conditioning Factors (span 4) */}
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

        {/* Column 2: Sector Risk (span 5) */}
        <div className="lg:col-span-5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            Sector Risk // Monitored Corridors
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Green Neon Card */}
            <div
              onClick={onOpenMap}
              className="rounded-2xl p-3.5 bg-gradient-to-b from-emerald-500/15 to-slate-900/80 border border-emerald-500/80 glow-green flex flex-col justify-between min-h-[130px] cursor-pointer hover:-translate-y-1 transition-transform"
            >
              <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">
                S. Bathery
              </div>
              <div className="text-3xl font-extrabold text-white my-1">97%</div>
              <div className="text-[10px] font-semibold text-slate-300 flex flex-col">
                <span>🟢 Stable / Safe Slope</span>
                <span className="text-slate-400">⏱️ 14 min last survey</span>
              </div>
            </div>

            {/* Amber Neon Card */}
            <div
              onClick={onOpenMap}
              className="rounded-2xl p-3.5 bg-gradient-to-b from-orange-500/15 to-slate-900/80 border border-orange-500/80 glow-amber flex flex-col justify-between min-h-[130px] cursor-pointer hover:-translate-y-1 transition-transform"
            >
              <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">
                Vythiri Ghat
              </div>
              <div className="text-3xl font-extrabold text-white my-1">91%</div>
              <div className="text-[10px] font-semibold text-slate-300 flex flex-col">
                <span>🟠 Watch Zone Incline</span>
                <span className="text-slate-400">⏱️ 13 min last survey</span>
              </div>
            </div>

            {/* Blue Neon Card */}
            <div
              onClick={onOpenMap}
              className="rounded-2xl p-3.5 bg-gradient-to-b from-sky-500/15 to-slate-900/80 border border-sky-500/80 glow-blue flex flex-col justify-between min-h-[130px] cursor-pointer hover:-translate-y-1 transition-transform"
            >
              <div className="text-[11px] font-bold text-slate-200 uppercase tracking-wide">
                Meppadi Track
              </div>
              <div className="text-3xl font-extrabold text-white my-1">95%</div>
              <div className="text-[10px] font-semibold text-slate-300 flex flex-col">
                <span>🔴 Critical Debris Zone</span>
                <span className="text-slate-400">⏱️ 12 min last survey</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Critical Alerts (span 3) */}
        <div className="lg:col-span-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            Critical Alerts // Live Stream
          </h4>

          <div className="flex flex-col gap-2">
            <div className="bg-white/5 border-l-4 border-rose-500 rounded-r-xl p-2.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Mundakkai Debris Flow Alert</span>
              <span className="text-[10px] font-mono text-slate-400">05m ago</span>
            </div>

            <div className="bg-white/5 border-l-4 border-amber-500 rounded-r-xl p-2.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Chooralmala Incline Shear Warning</span>
              <span className="text-[10px] font-mono text-slate-400">15m ago</span>
            </div>

            <div className="bg-white/5 border-l-4 border-amber-500 rounded-r-xl p-2.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Meppadi Precipitation Threshold</span>
              <span className="text-[10px] font-mono text-slate-400">18m ago</span>
            </div>

            <div className="bg-white/5 border-l-4 border-emerald-500 rounded-r-xl p-2.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Kalpetta Drainage System Safe</span>
              <span className="text-[10px] font-mono text-slate-400">35m ago</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
