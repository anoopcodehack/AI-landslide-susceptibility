"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sliders, GitBranch } from "lucide-react";

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
    <footer className="coder-white-footer mt-16 bg-white text-zinc-900 border-t border-zinc-200">
      {/* 1. Monitored Corridors & Real-Time Alert Grid */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 border-b border-zinc-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Corridors Column (span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                    Monitored Corridors // Wayanad Sector
                  </h4>
                  <p className="text-base font-bold text-black mt-0.5">
                    Spatial Susceptibility Index
                  </p>
                </div>
                <button
                  onClick={onOpenMap}
                  className="group flex items-center gap-1 text-xs font-semibold text-black hover:text-zinc-600 transition-all duration-200"
                >
                  <span>View GIS Radar</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                    &rarr;
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sectorList.map((sec) => (
                  <div
                    key={sec.id}
                    onClick={onOpenMap}
                    className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-white hover:border-black cursor-pointer transition-all duration-200 hover:-translate-y-1.5 hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 line-clamp-1 group-hover:translate-x-0.5 transition-transform duration-200">
                          {sec.name}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full transition-transform group-hover:scale-125 duration-200 ${
                            sec.variant === "green"
                              ? "bg-emerald-500"
                              : sec.variant === "amber"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        {sec.status_label}
                      </p>
                    </div>

                    <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-zinc-200">
                      <span className="font-mono text-base font-bold text-black">
                        {sec.score_pct}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {sec.last_survey}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="mt-5 pt-4 border-t border-zinc-200">
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="text-zinc-600 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-zinc-500" /> Incline Shear Threshold
                </span>
                <span className="font-mono text-xs font-bold text-black bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded transition-transform duration-200 hover:scale-105">
                  {slopeThreshold}°
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                value={slopeThreshold}
                onChange={(e) => setSlopeThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black transition-all hover:h-2"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                <span>15° (Valley Floor)</span>
                <span>30° (Nominal)</span>
                <span>&gt;45° (Critical Shear)</span>
              </div>
            </div>
          </div>

          {/* Real-Time Alerts Stream (span 4) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">
                Event Telemetry // Live Stream
              </h4>
              <p className="text-base font-bold text-black mb-3">
                Hazard Alerts & Sensor Displacements
              </p>

              <div className="space-y-2">
                {alertList.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-400 hover:translate-x-1 transition-all duration-200 flex items-center justify-between gap-3 text-xs shadow-xs cursor-default"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          alert.severity === "danger"
                            ? "bg-rose-500 animate-pulse"
                            : alert.severity === "warning"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <span className="font-medium text-zinc-900 line-clamp-1">{alert.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500 flex-shrink-0">
                      {alert.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Module Launchers (span 3) */}
          <div className="lg:col-span-3 flex flex-col justify-between bg-zinc-50 p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                Spatial Decision-Support Tools
              </span>
              <p className="text-sm font-bold text-black mb-3">
                Operator Controls
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={onOpenMap}
                  className="group w-full bg-white hover:bg-zinc-100 text-black border border-zinc-300 font-semibold py-2.5 px-4 rounded-full text-xs flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform duration-200">Launch GIS Radar</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </button>

                <button
                  onClick={onOpenShap}
                  className="group w-full bg-white hover:bg-zinc-100 text-black border border-zinc-300 font-semibold py-2.5 px-4 rounded-full text-xs flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform duration-200">SHAP Factor Attribution</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </button>

                <button
                  onClick={onOpenSim}
                  className="group btn-coder-black w-full py-2.5 px-4 text-xs flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform duration-200">Parametric Simulation</span>
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
              <span>XGBoost 1.7.6</span>
              <span>Sub-10ms Latency</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Coder Multi-Column Footer with Sliding Hover Links */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-14 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm text-zinc-600">
        {/* Brand Block */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-1 select-none">
            <span className="text-2xl font-black tracking-tighter text-black uppercase font-mono">
              C
            </span>
            <span className="w-3 h-4 bg-black inline-block ml-0.5" />
          </div>
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
            Enterprise spatial infrastructure and geotechnical hazard prediction platform.
          </p>
          <div className="flex items-center gap-2 mt-4 font-mono text-[11px] text-zinc-500">
            <GitBranch className="w-3.5 h-3.5" />
            <span>rev: a7bc574</span>
          </div>
        </div>

        {/* Column 1: Solutions */}
        <div>
          <h5 className="font-semibold text-black text-xs uppercase tracking-wider mb-4">
            Solutions
          </h5>
          <ul className="space-y-2.5 text-xs">
            <li>
              <button
                onClick={onOpenMap}
                className="group flex items-center gap-1 hover:text-black transition-all duration-200"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                  Wayanad Catchment Radar
                </span>
              </button>
            </li>
            <li>
              <Link
                href="/simulation"
                className="group flex items-center gap-1 hover:text-black transition-all duration-200"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                  Slope Stability Engine
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/simulation"
                className="group flex items-center gap-1 hover:text-black transition-all duration-200"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                  In-Situ Pore Pressure
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/radar"
                className="group flex items-center gap-1 hover:text-black transition-all duration-200"
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
          <h5 className="font-semibold text-black text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-black inline-block" />
            <span>Resources</span>
          </h5>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link
                href="/diagnostics"
                className="group flex items-center gap-1 hover:text-black transition-all duration-200"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                  XAI Attribution Whitepaper
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/governance"
                className="group flex items-center gap-1 hover:text-black transition-all duration-200"
              >
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5">
                  System Architecture Plan
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/radar"
                className="group flex items-center gap-1 hover:text-black transition-all duration-200"
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
          <h5 className="font-semibold text-black text-xs uppercase tracking-wider mb-4">
            Technology
          </h5>
          <ul className="space-y-2.5 text-xs">
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-black">
                Gradient Boosted Trees
              </span>
            </li>
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-black">
                Random Forest Bagging
              </span>
            </li>
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-black">
                SHAP TreeExplainer
              </span>
            </li>
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-black">
                FastAPI Asynchronous Engine
              </span>
            </li>
          </ul>
        </div>

        {/* Column 4: Governance & SDGs */}
        <div>
          <h5 className="font-semibold text-black text-xs uppercase tracking-wider mb-4">
            Governance & SDGs
          </h5>
          <ul className="space-y-2.5 text-xs">
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-black">
                <strong className="text-black">SDG 11</strong>: Resilient Cities
              </span>
            </li>
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-black">
                <strong className="text-black">SDG 13</strong>: Climate Resilience
              </span>
            </li>
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-black">
                <strong className="text-black">SDG 15</strong>: Mountain Soil Cohesion
              </span>
            </li>
            <li className="group cursor-default">
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-black">
                ISO 31000 Risk Standards
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Bottom Legal Bar */}
      <div className="border-t border-zinc-200">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © 2026 GeoShield Technologies Inc. All rights reserved. Enterprise Spatial Hazard Infrastructure.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-zinc-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
