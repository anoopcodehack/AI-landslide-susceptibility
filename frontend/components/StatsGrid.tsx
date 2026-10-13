"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";

interface StatsGridProps {
  totalPoints: number;
  activeAlerts: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ totalPoints, activeAlerts }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Card 1: Total Survey Points */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[115px]">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Total Survey Points</span>
          <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>
        <div className="flex items-baseline justify-between mt-3">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalPoints.toLocaleString()}
          </div>
          <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            ▲ 30m Grid
          </span>
        </div>
      </div>

      {/* Card 2: Monitored Basins */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[115px]">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Monitored Basins</span>
          <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>
        <div className="flex items-end justify-between mt-3">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">128</div>
          {/* Green Sine Sparkline */}
          <svg className="w-24 h-7 overflow-visible" viewBox="0 0 100 30">
            <path
              d="M 0,15 Q 25,2 50,15 T 100,15"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
            />
            <circle cx="50" cy="15" r="3" fill="#22c55e" />
          </svg>
        </div>
      </div>

      {/* Card 3: Rainfall Sensor Nodes */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[115px]">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Rainfall Sensor Nodes</span>
          <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>
        <div className="flex items-end justify-between mt-3">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">74</div>
          {/* Amber Arc Sparkline */}
          <svg className="w-24 h-7 overflow-visible" viewBox="0 0 100 30">
            <path
              d="M 20,25 Q 50,5 80,25"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            <circle cx="50" cy="10" r="3" fill="#f59e0b" />
          </svg>
        </div>
      </div>

      {/* Card 4: Active Hotspot Alerts */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[115px]">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Active Hotspot Alerts</span>
          <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>
        <div className="flex items-end justify-between mt-3">
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight text-rose-600">
            {activeAlerts}
          </div>
          {/* Blue Arc Sparkline */}
          <svg className="w-24 h-7 overflow-visible" viewBox="0 0 100 30">
            <path
              d="M 20,25 Q 60,5 90,25"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
            />
            <circle cx="70" cy="12" r="3" fill="#0ea5e9" />
          </svg>
        </div>
      </div>
    </div>
  );
};
