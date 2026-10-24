"use client";

import React from "react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMap: () => void;
  onOpenShap: () => void;
  onOpenSim: () => void;
  onOpenAbout: () => void;
  backendOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMap,
  onOpenShap,
  onOpenSim,
  onOpenAbout,
  backendOnline,
}) => {
  return (
    <header className="coder-white-header sticky top-0 z-40 px-6 md:px-12 py-4 flex items-center justify-between">
      {/* Brand: GEOSHIELD█ */}
      <div className="flex items-center gap-8">
        <div
          onClick={() => setActiveTab("overview")}
          className="flex items-center gap-1 cursor-pointer select-none"
        >
          <span className="text-xl font-black tracking-tighter text-black uppercase font-mono">
            GEOSHIELD
          </span>
          <span className="w-2.5 h-3.5 bg-black inline-block ml-0.5" />
        </div>

        {/* Center Product Links (No Docs, No Unwanted info) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-zinc-700">
          <button
            onClick={() => setActiveTab("overview")}
            className="hover:text-black transition-colors"
          >
            Overview
          </button>

          <button
            onClick={onOpenMap}
            className="hover:text-black transition-colors"
          >
            GIS Radar
          </button>

          <button
            onClick={onOpenShap}
            className="hover:text-black transition-colors"
          >
            XAI Diagnostics
          </button>

          <button
            onClick={onOpenSim}
            className="hover:text-black transition-colors"
          >
            Simulation Studio
          </button>

          <button
            onClick={onOpenAbout}
            className="hover:text-black transition-colors"
          >
            Governance & SDGs
          </button>
        </nav>
      </div>

      {/* Right Controls (Clean - No Github stars, No external Docs) */}
      <div className="flex items-center gap-3">
        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px]">
            {backendOnline ? "Cluster Online // 12ms" : "Telemetry Active"}
          </span>
        </div>

        {/* Action Button 1: Parametric Sim */}
        <button
          onClick={onOpenSim}
          className="btn-coder-light px-4 py-2 text-xs"
        >
          Parametric Sim
        </button>

        {/* Action Button 2: Launch Radar */}
        <button
          onClick={onOpenMap}
          className="btn-coder-black px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <span className="w-2 h-2 bg-white inline-block" />
          <span>Launch Radar</span>
        </button>
      </div>
    </header>
  );
};
