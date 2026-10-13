"use client";

import React from "react";

interface HeroGaugeCardProps {
  rocAuc: string;
  modelName: string;
}

export const HeroGaugeCard: React.FC<HeroGaugeCardProps> = ({ rocAuc, modelName }) => {
  return (
    <div className="relative rounded-3xl p-6 bg-gradient-to-br from-white/95 to-slate-100/80 border border-white/90 shadow-lg shadow-slate-900/5 overflow-hidden flex flex-col justify-between min-h-[380px]">
      {/* Ambient Watercolor Glow */}
      <div className="absolute -top-10 -left-10 w-[120%] h-[120%] ambient-glow pointer-events-none filter blur-2xl opacity-70" />

      {/* Content */}
      <div className="relative z-10">
        {/* Dual Arc Row */}
        <div className="flex items-center justify-between gap-4 mt-2 mb-6">
          {/* Left Arc Gauge: Terrain Stability */}
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-700 tracking-wide mb-1">
              Terrain Stability Index
            </h4>
            <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              86.4<span className="text-base font-bold text-slate-500">/100%</span>
            </div>
            {/* Curved Arc SVG */}
            <svg className="w-full h-6 mt-1 overflow-visible" viewBox="0 0 100 24">
              <path
                d="M 5,20 A 45,45 0 0,1 95,20"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 5,20 A 45,45 0 0,1 82,10"
                fill="none"
                stroke="#22c55e"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Right Arc Gauge: Pore-Pressure Trigger */}
          <div className="flex-1 text-right">
            <h4 className="text-xs font-bold text-slate-700 tracking-wide mb-1">
              Pore-Pressure Trigger
            </h4>
            <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              86.0<span className="text-base font-bold text-slate-500">/100%</span>
            </div>
            {/* Linear Track SVG with orange marker */}
            <svg className="w-full h-6 mt-1 overflow-visible" viewBox="0 0 100 24">
              <path
                d="M 5,16 L 95,16"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 5,16 L 86,16"
                fill="none"
                stroke="#f97316"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <polygon points="86,8 90,16 82,16" fill="#f97316" />
            </svg>
          </div>
        </div>

        {/* Floating Central Efficiency Pill */}
        <div className="flex justify-center my-4">
          <div className="bg-white/90 backdrop-blur-md rounded-full px-5 py-2.5 border border-white shadow-md flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-emerald-500 flex flex-col items-center justify-center font-extrabold text-slate-900 text-xs shadow-sm">
              <span>{rocAuc}</span>
              <span className="text-[9px] font-bold text-slate-500 -mt-0.5">ROC-AUC</span>
            </div>
            <div className="text-left">
              <h5 className="text-sm font-extrabold text-slate-900 leading-tight">
                Model Benchmark
              </h5>
              <p className="text-xs font-semibold text-slate-500">
                {modelName} Spatial Matrix
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Frosted Pill with Micro Equalizers */}
      <div className="relative z-10 bg-white/75 backdrop-blur-md rounded-2xl p-3.5 border border-white/90 shadow-sm flex items-center justify-between gap-3 text-center">
        <div className="flex-1">
          <div className="text-[11px] font-bold text-slate-500">Slope Stress ::</div>
          <div className="text-sm font-extrabold text-slate-900">28.4%</div>
          <div className="flex justify-center items-end gap-0.5 h-3 mt-1">
            <div className="w-0.5 h-1.5 bg-slate-300 rounded" />
            <div className="w-0.5 h-2.5 bg-amber-500 rounded" />
            <div className="w-0.5 h-3.5 bg-amber-500 rounded" />
            <div className="w-0.5 h-2 bg-slate-300 rounded" />
          </div>
        </div>

        <div className="w-px h-8 bg-slate-200" />

        <div className="flex-1">
          <div className="text-[11px] font-bold text-slate-500">Rainfall Saturation:</div>
          <div className="text-sm font-extrabold text-slate-900">34.2%</div>
          <div className="flex justify-center items-end gap-0.5 h-3 mt-1">
            <div className="w-0.5 h-2 bg-slate-300 rounded" />
            <div className="w-0.5 h-3.5 bg-rose-500 rounded" />
            <div className="w-0.5 h-3 bg-rose-500 rounded" />
            <div className="w-0.5 h-1.5 bg-slate-300 rounded" />
          </div>
        </div>

        <div className="w-px h-8 bg-slate-200" />

        <div className="flex-1">
          <div className="text-[11px] font-bold text-slate-500">NDVI Cohesion:</div>
          <div className="text-sm font-extrabold text-slate-900">30.1%</div>
          <div className="flex justify-center items-end gap-0.5 h-3 mt-1">
            <div className="w-0.5 h-3 bg-emerald-500 rounded" />
            <div className="w-0.5 h-2 bg-slate-300 rounded" />
            <div className="w-0.5 h-3.5 bg-emerald-500 rounded" />
            <div className="w-0.5 h-1.5 bg-slate-300 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
