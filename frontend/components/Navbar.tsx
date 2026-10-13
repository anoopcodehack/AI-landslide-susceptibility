"use client";

import React from "react";
import { Shield, Bell, Settings } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMap: () => void;
  onOpenShap: () => void;
  onOpenSim: () => void;
  onOpenAbout: () => void;
  backendOnline: boolean;
  modelName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMap,
  onOpenShap,
  onOpenSim,
  onOpenAbout,
  backendOnline,
  modelName,
}) => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-9 py-5 bg-white/90 backdrop-blur-md rounded-t-4xl border-b border-slate-100">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-md">
          <Shield className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
            GeoShield AI <span className="text-sm font-semibold text-slate-500">// Wayanad Command</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Enterprise Spatial Susceptibility & Risk Intelligence
          </p>
        </div>
      </div>

      {/* Floating Center Nav Pills */}
      <nav className="flex items-center bg-slate-50 p-1.5 rounded-full border border-slate-200 shadow-sm gap-1">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${
            activeTab === "dashboard"
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={onOpenMap}
          className="px-5 py-2 rounded-full text-xs md:text-sm font-bold text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-200/50"
        >
          GIS Radar Map
        </button>
        <button
          onClick={onOpenShap}
          className="px-5 py-2 rounded-full text-xs md:text-sm font-bold text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-200/50"
        >
          Explainable AI (SHAP)
        </button>
        <button
          onClick={onOpenSim}
          className="px-5 py-2 rounded-full text-xs md:text-sm font-bold text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-200/50"
        >
          XGBoost Simulation
        </button>
        <button
          onClick={onOpenAbout}
          className="px-5 py-2 rounded-full text-xs md:text-sm font-bold text-slate-600 hover:text-slate-900 transition-all hover:bg-slate-200/50"
        >
          Architecture
        </button>
      </nav>

      {/* Right Telemetry Badge & Avatar */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono border ${
            backendOnline
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              backendOnline ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-amber-500"
            }`}
          />
          <span>{modelName} Live (Port 8000)</span>
        </div>

        <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
          <Settings className="w-4 h-4" />
        </button>

        <div
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 border-2 border-white text-white font-bold text-xs flex items-center justify-center shadow-md shadow-sky-600/30"
          title="Disaster Management Cell"
        >
          WD
        </div>
      </div>
    </header>
  );
};
