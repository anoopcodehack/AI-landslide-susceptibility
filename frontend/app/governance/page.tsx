"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { TacticalDock } from "@/components/TacticalDock";
import {
  Shield,
  ArrowLeft,
  Server,
  Database,
  Cpu,
  Layers,
  Globe,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Users,
  Compass,
  Send,
  Building2,
  Route,
  Activity,
} from "lucide-react";

export default function GovernancePage() {
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [selectedSector, setSelectedSector] = useState<string>("chooralmala");

  const archSteps = [
    {
      step: "01",
      title: "Geospatial Ingestion",
      icon: Database,
      items: ["SRTM 30m DEM (Slope)", "Sentinel-2 NDVI Cohesion", "Open-Meteo AWS #04 Telemetry"],
      badge: "Raster / Synoptic",
    },
    {
      step: "02",
      title: "Feature Calibration",
      icon: Layers,
      items: ["1,500 Cell Spatial Matrix", "Pore Saturation Scaling", "Geotechnical Shear Vector"],
      badge: "UTM 43N Reprojected",
    },
    {
      step: "03",
      title: "AI Inference & XAI",
      icon: Cpu,
      items: ["XGBoost Classifier (94.0% AUC)", "0.35 Calibrated Threshold", "SHAP TreeExplainer Attributions"],
      badge: "Sub-15ms Latency",
    },
    {
      step: "04",
      title: "Autonomous Warning",
      icon: Send,
      items: ["@GeoShield_Warning_Bot", "English + ಕನ್ನಡ Directives", "Interactive Tactical Cockpit"],
      badge: "Zero-Click Trigger",
    },
  ];

  const evacuationSectors = [
    {
      id: "chooralmala",
      name: "Chooralmala Sector 04",
      hazard: "CRITICAL RED (91%)",
      hazardColor: "bg-red-50 text-red-700 border-red-200",
      shelter: "Meppadi Higher Secondary School Relief Camp",
      capacity: "1,500 persons",
      corridor: "Route KSDMA-04B via Vellarmala Bypass",
      buffer: "1,200m Evacuation Radius",
      contact: "District Emergency Ops: 1077 / 04936-204151",
    },
    {
      id: "mundakkai",
      name: "Mundakkai Debris Basin",
      hazard: "CRITICAL RED (94%)",
      hazardColor: "bg-red-50 text-red-700 border-red-200",
      shelter: "Vellarmala School Safe Ground & Community Hall",
      capacity: "900 persons",
      corridor: "Route KSDMA-02A via Plantation Ridge",
      buffer: "1,500m Hazard Inundation Buffer",
      contact: "Disaster Control Room: 04936-202234",
    },
    {
      id: "vythiri",
      name: "Vythiri Ghat Pass Corridor",
      hazard: "WATCH ORANGE (74%)",
      hazardColor: "bg-amber-50 text-amber-700 border-amber-200",
      shelter: "Vythiri Taluk Hospital Relief Enclosure",
      capacity: "1,200 persons",
      corridor: "NH-766 Ghat Road Controlled Transit",
      buffer: "600m Precautionary Buffer",
      contact: "Traffic & Highway Patrol: 112",
    },
    {
      id: "meppadi",
      name: "Meppadi Valley Corridor",
      hazard: "HIGH ORANGE (82%)",
      hazardColor: "bg-amber-50 text-amber-700 border-amber-200",
      shelter: "Govt Vocational Higher Secondary Camp",
      capacity: "1,800 persons",
      corridor: "State Highway 59 Relief Corridor",
      buffer: "800m Buffer Zone",
      contact: "Meppadi Fire & Rescue: 101",
    },
    {
      id: "bathery",
      name: "Sulthan Bathery Plateau",
      hazard: "STABLE GREEN (19%)",
      hazardColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      shelter: "Municipal Town Hall Primary Assembly Point",
      capacity: "3,000 persons",
      corridor: "NH-766 Plateau Transit Open",
      buffer: "Baseline Normal Monitoring",
      contact: "Revenue Divisional Office: 04936-220223",
    },
  ];

  const sopProtocols = [
    {
      level: "GREEN (Advisory)",
      threshold: "Susceptibility < 0.25",
      action: "Routine 24h satellite & synoptic telemetry monitoring. Drainage clearways inspected.",
      color: "border-emerald-300 bg-emerald-50/60 text-emerald-800",
    },
    {
      level: "ORANGE (Warning)",
      threshold: "Susceptibility 0.25 – 0.35",
      action: "Pre-position NDRF / SDRF battalions. Evacuation camps opened. Telegram bot issues Stage-2 alert.",
      color: "border-amber-300 bg-amber-50/60 text-amber-800",
    },
    {
      level: "RED (Emergency Evacuation)",
      threshold: "Susceptibility >= 0.35",
      action: "Immediate mandatory evacuation along designated transit corridors. Autonomous bilingual Telegram alerts pushed to all relief officers.",
      color: "border-red-300 bg-red-50/60 text-red-800",
    },
  ];

  const sdgGoals = [
    {
      id: "SDG 11.5",
      title: "Sustainable Cities & Communities",
      target: "Disaster Mortality & Loss Reduction",
      metric: "94.12% Disaster Recall",
      color: "border-amber-200 bg-amber-50 text-amber-800",
    },
    {
      id: "SDG 13.1",
      title: "Climate Action",
      target: "Strengthen Resilience to Orographic Cloudbursts",
      metric: "Live Synoptic Telemetry",
      color: "border-blue-200 bg-blue-50 text-blue-800",
    },
    {
      id: "SDG 15.4",
      title: "Life on Land",
      target: "Mountain Ecosystem & Soil Conservation",
      metric: "NDVI Canopy Tracking",
      color: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between w-full bg-zinc-50/60 text-zinc-900">
      <Navbar backendOnline={backendOnline} />

      <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-12 py-6 flex-1 space-y-8">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
          <Link href="/" className="hover:text-black transition-colors flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <span className="text-zinc-700">Standards: KSDMA Civil Defense / ISO 31000 / UN Sendai Framework</span>
        </div>

        {/* Visual Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono font-semibold text-zinc-800">
              <Shield className="w-3.5 h-3.5 text-black" />
              <span>Civil Defense Governance & Disaster Evacuation Protocol</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight">
              Civil Protection Protocols & UN SDGs
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 font-sans">
              Designated relief camps, transit corridors, and standard operating procedures for Wayanad District.
            </p>
          </div>
        </div>

        {/* 1. VISUAL 4-TIER PIPELINE FLOW */}
        <section className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-2">
            <Server className="w-4 h-4 text-black" />
            <span>End-to-End Early Warning Architecture</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {archSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-black transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-mono font-bold text-xs">
                      {step.step}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 font-semibold">
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="font-mono text-xs font-bold text-black uppercase mb-2">
                    {step.title}
                  </h3>

                  <ul className="space-y-1.5 text-xs font-mono text-zinc-600">
                    {step.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. REGIONAL EVACUATION NETWORK & RELIEF SHELTERS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-2">
              <Building2 className="w-4 h-4 text-black" />
              <span>Designated Relief Shelters & Evacuation Corridors</span>
            </h2>
            <span className="text-xs font-mono text-zinc-500">KSDMA Pre-Configured Grid</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evacuationSectors.map((sec) => (
              <div
                key={sec.id}
                className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-black transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-black">{sec.name}</h3>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${sec.hazardColor}`}>
                      {sec.hazard}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-sans text-zinc-600 mt-3">
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-black block font-semibold">{sec.shelter}</strong>
                        <span className="text-[11px] text-zinc-500">Capacity: {sec.capacity}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Route className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-black font-semibold">Corridor: </span>
                        <span>{sec.corridor}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                      <Compass className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{sec.buffer}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{sec.contact}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. STANDARD OPERATING PROCEDURE (SOP) PROTOCOL CARDS */}
        <section className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-2">
            <Activity className="w-4 h-4 text-black" />
            <span>KSDMA Tri-Color Alert Response SOP</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sopProtocols.map((sop, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between space-y-3 ${sop.color}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-black uppercase font-mono">{sop.level}</strong>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-white/80 rounded border">
                      {sop.threshold}
                    </span>
                  </div>
                  <p className="text-xs font-sans mt-2.5 leading-relaxed">{sop.action}</p>
                </div>
                <div className="text-[11px] font-mono font-bold opacity-80 pt-2 border-t border-black/10">
                  Status: Operational Standard
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. UNITED NATIONS SDGs TARGETS (CLEAN CARDS) */}
        <section className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-2">
            <Globe className="w-4 h-4 text-black" />
            <span>UN Sustainable Development Goals (SDGs) Alignment</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sdgGoals.map((sdg, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-black transition-colors"
              >
                <div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${sdg.color}`}>
                    {sdg.id}
                  </span>
                  <h3 className="font-bold text-sm text-black mt-2">{sdg.title}</h3>
                  <p className="text-xs text-zinc-600 font-sans mt-1">{sdg.target}</p>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Project Metric:</span>
                  <strong className="text-emerald-600 font-bold">{sdg.metric}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <TacticalDock />
    </div>
  );
}
