"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroGaugeCard } from "@/components/HeroGaugeCard";
import { StatsGrid } from "@/components/StatsGrid";
import { TrendChart } from "@/components/TrendChart";
import { TacticalDock } from "@/components/TacticalDock";
import { GisMapModal } from "@/components/GisMapModal";
import { ShapModal } from "@/components/ShapModal";
import { SimulationModal } from "@/components/SimulationModal";
import { ArchitectureModal } from "@/components/ArchitectureModal";
import { LetterDropLoader } from "@/components/LetterDropLoader";
import { ArrowUpRight, Shield, Satellite, Database, Activity, Layers, MapPin, Radio } from "lucide-react";

interface DashboardData {
  status: string;
  overview: {
    terrain_stability_index: number;
    pore_pressure_index: number;
    model_confidence: string;
    model_name: string;
    dem_resolution: string;
    slope_stress_pct: string;
    rainfall_saturation_pct: string;
    ndvi_cohesion_pct: string;
  };
  stats: {
    total_survey_points: number;
    monitored_basins: number;
    sensor_nodes: number;
    active_hotspot_alerts: number;
    monitored_area_km2: number;
  };
  trend_chart: {
    weekly: Array<{ day: string; rainfall_mm: number; hazard_idx: number; highlight?: boolean }>;
    daily: Array<{ time: string; rainfall_mm: number }>;
    monthly: Array<{ week: string; rainfall_mm: number }>;
  };
  sectors: Array<{
    id: string;
    name: string;
    score_pct: string;
    status_label: string;
    variant: "green" | "amber" | "blue";
    last_survey: string;
    lat: number;
    lon: number;
  }>;
  alerts: Array<{
    id: number;
    title: string;
    timestamp: string;
    severity: "danger" | "warning" | "stable";
  }>;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Modal states
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isShapOpen, setIsShapOpen] = useState<boolean>(false);
  const [isSimOpen, setIsSimOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Dynamic Dashboard Data State from Backend
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/dashboard");
        if (res.ok) {
          const data: DashboardData = await res.json();
          setDashboardData(data);
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch (err) {
        setBackendOnline(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between w-full bg-white relative">
      {/* 0. Cinematic Letter Drop & Bounce Loader */}
      <LetterDropLoader />

      {/* 1. Coder White Top Header (No Docs, No Github stars) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenShap={() => setIsShapOpen(true)}
        onOpenSim={() => setIsSimOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        backendOnline={backendOnline}
      />

      {/* 2. Main Content Container */}
      <main className="max-w-[1440px] mx-auto w-full px-6 md:px-12 py-8 flex-1">
        {/* HERO SECTION: Fluid Iridescent Silk with Visual Satellite Radar Graphics */}
        <div className="coder-iridescent-hero p-8 sm:p-12 md:p-16 mb-12 border border-zinc-200/80 shadow-sm relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Column: Bold Typography & CTAs (span 7) */}
            <div className="lg:col-span-7">
              {/* Top Pill Announcement */}
              <div
                onClick={() => setIsMapOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-zinc-200 shadow-xs text-xs font-semibold text-zinc-800 mb-8 hover:bg-white hover:border-black transition-all duration-200 cursor-pointer"
              >
                <span>Wayanad Monsoon Early Warning 2026. Live updates</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600" />
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.08]">
                Your terrain has vulnerabilities. <br />
                Your infrastructure needs precision.
                <span className="w-3 h-6 md:h-8 bg-black inline-block ml-1.5 align-middle" />
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-zinc-700 max-w-xl mt-6 leading-relaxed font-normal">
                Safely predict landslide hazards, pore-pressure triggers, and slope shear on high-resolution 30m geospatial terrain.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mt-8">
                <button
                  onClick={() => setIsMapOpen(true)}
                  className="btn-coder-black px-6 py-3.5 text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <span className="w-2.5 h-2.5 bg-white inline-block" />
                  <span>Launch GIS Radar</span>
                </button>

                <button
                  onClick={() => setIsSimOpen(true)}
                  className="btn-coder-light px-6 py-3.5 text-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Parametric Simulation
                </button>
              </div>
            </div>

            {/* Right Column: Visual Satellite Radar Terrain Card (span 5) */}
            <div className="lg:col-span-5">
              <div
                onClick={() => setIsMapOpen(true)}
                className="bg-[#0b0f19] rounded-2xl p-5 border border-zinc-800 shadow-2xl relative overflow-hidden group cursor-pointer hover:border-zinc-500 hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Top Radar HUD Bar */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono text-[11px] text-zinc-200 font-semibold uppercase">
                      Live Telemetry Stream
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400">
                    Coords: 11.605°N, 76.132°E
                  </span>
                </div>

                {/* SVG Topographical Terrain Elevation Graphic */}
                <div className="relative h-56 w-full my-3 rounded-xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 400 220">
                    <defs>
                      <radialGradient id="radarScan" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </radialGradient>
                    </defs>

                    {/* Concentric Radar Rings */}
                    <circle cx="200" cy="110" r="40" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
                    <circle cx="200" cy="110" r="75" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
                    <circle cx="200" cy="110" r="110" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="url(#radarScan)" />

                    {/* Topographical Contour Curves */}
                    <path d="M 40,160 Q 120,80 200,120 T 360,90" fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" />
                    <path d="M 30,180 Q 140,110 220,150 T 370,120" fill="none" stroke="rgba(56,189,248,0.25)" strokeWidth="1.5" />
                    <path d="M 50,130 Q 160,50 240,90 T 350,60" fill="none" stroke="rgba(245,158,11,0.35)" strokeWidth="1.5" />

                    {/* Wayanad Active Beacon Markers */}
                    {/* Chooralmala / Mundakkai (High Risk) */}
                    <circle cx="170" cy="135" r="5" fill="#ef4444" />
                    <circle cx="170" cy="135" r="12" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" />
                    <text x="180" y="139" fill="#f87171" fontSize="10" fontFamily="monospace" fontWeight="bold">Chooralmala (91%)</text>

                    {/* Vythiri (Watch) */}
                    <circle cx="120" cy="90" r="4" fill="#f59e0b" />
                    <text x="130" y="94" fill="#fbbf24" fontSize="10" fontFamily="monospace">Vythiri Ghat (74%)</text>

                    {/* S. Bathery (Safe) */}
                    <circle cx="280" cy="70" r="4" fill="#10b981" />
                    <text x="290" y="74" fill="#34d399" fontSize="10" fontFamily="monospace">S. Bathery (19%)</text>
                  </svg>

                  {/* Floating Click Pill */}
                  <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-mono text-zinc-300 group-hover:text-white group-hover:border-white/30 transition-colors">
                    Click to Open Fullscreen GIS &rarr;
                  </div>
                </div>

                {/* Sub-card footer */}
                <div className="flex items-center justify-between text-[11px] pt-2 text-zinc-400 font-mono">
                  <span>Elevation Model: SRTM 30m</span>
                  <span className="text-emerald-400">Accuracy: 86.7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIGNATURE INSET DARK BLOCK */}
        <section className="coder-dark-block p-6 sm:p-10 mb-14">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-zinc-800">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Learn how governed AI models power landslide disaster prevention
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Real-time gradient-boosted decision trees deployed for Western Ghats (Wayanad Sector)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsShapOpen(true)}
                className="btn-coder-light px-4 py-2 text-xs font-semibold hover:scale-105 transition-all duration-200"
              >
                Inspect SHAP Diagnostics
              </button>
            </div>
          </div>

          {/* 2-Column Telemetry Grid inside Dark Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
            {/* Left Column: Gauges (span 5) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <HeroGaugeCard
                terrainStability={dashboardData?.overview?.terrain_stability_index ?? 86.4}
                porePressure={dashboardData?.overview?.pore_pressure_index ?? 86.0}
                rocAuc={dashboardData?.overview?.model_confidence ?? "94.2%"}
                modelName={dashboardData?.overview?.model_name ?? "XGBoost Classifier"}
                slopeStress={dashboardData?.overview?.slope_stress_pct ?? "24.3%"}
                rainfallSaturation={dashboardData?.overview?.rainfall_saturation_pct ?? "36.3%"}
                ndviCohesion={dashboardData?.overview?.ndvi_cohesion_pct ?? "15.0%"}
              />
            </div>

            {/* Right Column: 2x2 Stats Grid & Waveform (span 7) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <StatsGrid
                totalPoints={dashboardData?.stats?.total_survey_points ?? 1500}
                monitoredBasins={dashboardData?.stats?.monitored_basins ?? 128}
                sensorNodes={dashboardData?.stats?.sensor_nodes ?? 74}
                activeAlerts={dashboardData?.stats?.active_hotspot_alerts ?? 14}
              />
              <TrendChart trendData={dashboardData?.trend_chart} />
            </div>
          </div>
        </section>

        {/* 4. PARTNER / SENSOR FRAMEWORK BADGES */}
        <section className="py-6 border-y border-zinc-200 my-8">
          <div className="flex flex-wrap items-center justify-around gap-6 text-xs font-mono font-semibold text-zinc-500 uppercase tracking-widest">
            <span className="flex items-center gap-2 hover:text-black transition-colors cursor-default">
              <Satellite className="w-4 h-4 text-black" /> NASA SRTM 30m DEM
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-2 hover:text-black transition-colors cursor-default">
              <Shield className="w-4 h-4 text-black" /> Sentinel-2 Surface Reflectance
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-2 hover:text-black transition-colors cursor-default">
              <Activity className="w-4 h-4 text-black" /> IMD Gridded Telemetry
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-2 hover:text-black transition-colors cursor-default">
              <Database className="w-4 h-4 text-black" /> Geological Survey of India Framework
            </span>
          </div>
        </section>
      </main>

      {/* 5. Coder Corporate White Footer (Exact Screenshot 2 Replica) */}
      <TacticalDock
        onOpenMap={() => setIsMapOpen(true)}
        onOpenShap={() => setIsShapOpen(true)}
        onOpenSim={() => setIsSimOpen(true)}
        onOpenArchitecture={() => setIsAboutOpen(true)}
        sectors={dashboardData?.sectors}
        alerts={dashboardData?.alerts}
      />

      {/* Modals */}
      <GisMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
      <ShapModal isOpen={isShapOpen} onClose={() => setIsShapOpen(false)} />
      <SimulationModal isOpen={isSimOpen} onClose={() => setIsSimOpen(false)} />
      <ArchitectureModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
