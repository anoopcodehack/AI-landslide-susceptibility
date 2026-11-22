"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sliders, GitBranch } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

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
  onOpenMap?: () => void;
  onOpenShap?: () => void;
  onOpenSim?: () => void;
  onOpenArchitecture?: () => void;
  sectors?: SectorItem[];
  alerts?: AlertItem[];
}

export const TacticalDock: React.FC<TacticalDockProps> = ({
  onOpenMap,
  onOpenShap,
  onOpenSim,
  onOpenArchitecture,
  sectors,
  alerts,
}) => {
  const { language } = useLanguage();
  const [slopeThreshold, setSlopeThreshold] = useState<number>(32);

  const defaultSectors: SectorItem[] = [
    {
      id: "bathery",
      name: "S. Bathery Plateau",
      score_pct: "97%",
      status_label: "Stable Slope Profile",
      variant: "green",
      last_survey: "14m ago",
    },
    {
      id: "vythiri",
      name: "Vythiri Ghat Pass",
      score_pct: "91%",
      status_label: "Watch Zone Incline",
      variant: "amber",
      last_survey: "13m ago",
    },
    {
      id: "meppadi",
      name: "Meppadi / Chooralmala",
      score_pct: "95%",
      status_label: "Critical Debris Track",
      variant: "blue",
      last_survey: "12m ago",
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
    <footer className="mt-16 bg-black text-zinc-300 border-t border-zinc-800">
      {/* 1. Cinematic GIS Command Console & Telemetry Dock - Medium Balanced Tone */}
      <div className="relative overflow-hidden border-b border-zinc-800 bg-zinc-950 min-h-[480px] md:min-h-[560px] flex flex-col justify-between">
        {/* Background Image: Satellite 3D Terrain Scanning Command Console - Balanced Medium Opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-70"
          style={{
            backgroundImage: "url('/images/tactical_dock_bg.jpg')",
          }}
        />

        {/* Balanced Medium Overlay: Tones down the middle glare while keeping the full satellite, 3D mountain, and screens clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/70 pointer-events-none" />

        {/* Top Floating Telemetry Status Bar */}
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 md:px-12 pt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-xs font-mono font-semibold text-white shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {language === "kn"
                ? "ನಾಸಾ SRTM 30m • ಸೆಂಟಿನೆಲ್ ಉಪಗ್ರಹ ಕಕ್ಷೆ ಸ್ಕ್ಯಾನ್ ಸಕ್ರಿಯ"
                : "NASA SRTM 30m • Sentinel Radar Orbit Scan Active"}
            </span>
          </div>

          <button
            onClick={onOpenMap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-md cursor-pointer hover:bg-black/85"
          >
            <span>{language === "kn" ? "ಪೂರ್ಣ ಪರದೆಯ ಜಿಐಎಸ್ ರೇಡಾರ್" : "View Fullscreen GIS Radar"}</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* Bottom Floating Tactical Control Dock */}
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 md:px-12 pb-8 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            
            {/* Column 1: Live Sectors (5 cols) */}
            <div className="md:col-span-5 space-y-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider block drop-shadow-md">
                {language === "kn" ? "ಪ್ರಸ್ತುತ ವಲಯ ಅಪಾಯಗಳು" : "Live Sector Hazards"}
              </span>

              <div className="grid grid-cols-3 gap-2.5">
                {sectorList.slice(0, 3).map((sec) => (
                  <div
                    key={sec.id}
                    onClick={onOpenMap}
                    className="p-3 rounded-xl border border-white/20 bg-black/75 backdrop-blur-md hover:bg-black/90 hover:border-white/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 text-center group shadow-xl"
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          sec.variant === "green"
                            ? "bg-emerald-500"
                            : sec.variant === "amber"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs font-bold text-white truncate">
                        {language === "kn"
                          ? sec.id === "bathery"
                            ? "ಬತ್ತೇರಿ"
                            : sec.id === "vythiri"
                            ? "ವೈತಿರಿ"
                            : "ಮೇಪ್ಪಾಡಿ"
                          : sec.name.split(" ")[0]}
                      </span>
                    </div>
                    <span className="font-mono text-base font-black text-white">
                      {sec.score_pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Critical Alerts (4 cols) */}
            <div className="md:col-span-4 space-y-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider block drop-shadow-md">
                {language === "kn" ? "ಸಕ್ರಿಯ ಅಪಾಯ ಎಚ್ಚರಿಕೆಗಳು" : "Active Hazard Warnings"}
              </span>

              <div className="space-y-2">
                {alertList.slice(0, 2).map((alert) => (
                  <div
                    key={alert.id}
                    className="px-3.5 py-2.5 rounded-xl border border-white/20 bg-black/75 backdrop-blur-md flex items-center justify-between gap-2 text-xs shadow-xl"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          alert.severity === "danger"
                            ? "bg-red-500 animate-pulse"
                            : alert.severity === "warning"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <span className="font-semibold text-white truncate">
                        {language === "kn" && alert.id === 1
                          ? "ಮುಂಡಕ್ಕೈ ಶಿಲಾಖಂಡಗಳ ಹರಿವಿನ ಎಚ್ಚರಿಕೆ"
                          : language === "kn" && alert.id === 2
                          ? "ಚೂರಲ್‌ಮಾಲಾ ಇಳಿಜಾರು ಕತ್ತರಿ ಎಚ್ಚರಿಕೆ"
                          : alert.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                      {alert.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Quick Operator Actions (3 cols) */}
            <div className="md:col-span-3 flex flex-col justify-end space-y-2.5">
              <button
                onClick={onOpenMap}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition-all active:scale-98 cursor-pointer"
              >
                <span>{language === "kn" ? "ಜಿಐಎಸ್ ರೇಡಾರ್ ಪ್ರಾರಂಭಿಸಿ" : "Launch GIS Tactical Radar"}</span>
                <span>&rarr;</span>
              </button>

              <button
                onClick={onOpenSim}
                className="w-full py-2.5 px-4 rounded-xl bg-black/80 hover:bg-black text-white border border-white/25 font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer backdrop-blur-md"
              >
                <span>{language === "kn" ? "ಸಿಮ್ಯುಲೇಶನ್ ಸ್ಟುಡಿಯೋ" : "What-If Simulation"}</span>
                <span>&rarr;</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Multi-Column Footer with Sliding Hover Links */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-14 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm text-zinc-400">
        {/* Brand Block */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 select-none">
            <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs shadow-xs">
              GS
            </div>
            <span className="text-lg font-black tracking-tight text-white uppercase font-sans">
              GeoShield
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
            Enterprise spatial infrastructure and geotechnical hazard prediction platform.
          </p>
          <div className="flex items-center gap-2 mt-4 font-mono text-[11px] text-zinc-500">
            <GitBranch className="w-3.5 h-3.5" />
            <span>rev: a7bc574</span>
          </div>
        </div>

        {/* Column 1: Solutions */}
        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">
            Solutions
          </h5>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button
                onClick={onOpenMap}
                className="group flex items-center gap-1 hover:text-white transition-all duration-200 cursor-pointer"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                  Wayanad Catchment Radar
                </span>
              </button>
            </li>
            <li>
              <Link
                href="/simulation"
                className="group flex items-center gap-1 hover:text-white transition-all duration-200"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                  Slope Stability Engine
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/simulation"
                className="group flex items-center gap-1 hover:text-white transition-all duration-200"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                  In-Situ Pore Pressure
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/radar"
                className="group flex items-center gap-1 hover:text-white transition-all duration-200"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                  Municipal Hazard Zoning
                </span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Resources */}
        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
            <span>Resources</span>
          </h5>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link
                href="/diagnostics"
                className="group flex items-center gap-1 hover:text-white transition-all duration-200"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                  XAI Attribution Whitepaper
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/governance"
                className="group flex items-center gap-1 hover:text-white transition-all duration-200"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                  System Architecture Plan
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/radar"
                className="group flex items-center gap-1 hover:text-white transition-all duration-200"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                  NASA SRTM 30m Matrix
                </span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Technology */}
        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">
            Technology
          </h5>
          <ul className="space-y-2.5 text-xs">
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-white">
                Gradient Boosted Trees (XGBoost)
              </span>
            </li>
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-white">
                Random Forest Bagging
              </span>
            </li>
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-white">
                SHAP TreeExplainer
              </span>
            </li>
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-white">
                FastAPI Asynchronous Engine
              </span>
            </li>
          </ul>
        </div>

        {/* Column 4: Governance & SDGs */}
        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">
            Governance & SDGs
          </h5>
          <ul className="space-y-2.5 text-xs">
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-white">
                <strong className="text-white">SDG 11</strong>: Resilient Cities
              </span>
            </li>
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-white">
                <strong className="text-white">SDG 13</strong>: Climate Action
              </span>
            </li>
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-white">
                <strong className="text-white">SDG 15</strong>: Mountain Ecosystems
              </span>
            </li>
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-white">
                ISO 31000 Risk Management
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Legal Bar */}
      <div className="border-t border-zinc-800/80">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © 2026 GeoShield Technologies Inc. All rights reserved. Enterprise Spatial Hazard Infrastructure.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
