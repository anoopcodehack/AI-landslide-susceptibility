"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { HeroGaugeCard } from "@/components/HeroGaugeCard";
import { StatsGrid } from "@/components/StatsGrid";
import { TrendChart, TrendData } from "@/components/TrendChart";
import { TacticalDock } from "@/components/TacticalDock";
import { LetterDropLoader } from "@/components/LetterDropLoader";
import { API_BASE_URL } from "@/lib/api";
import {
  ArrowUpRight,
  Shield,
  Satellite,
  Database,
  Activity,
  Layers,
  MapPin,
  Radio,
  Sliders,
  BarChart3,
  CloudRain,
  Send,
  Eye,
  Maximize2,
  CheckCircle2,
  Compass,
} from "lucide-react";

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
  trend_chart: TrendData;
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
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Global Hotkeys for Pro Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        router.push("/radar");
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        router.push("/simulation");
      } else if (e.key === "x" || e.key === "X") {
        e.preventDefault();
        router.push("/diagnostics");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/dashboard`);
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

  const aiVisualCards = [
    {
      title: "Comparative ROC Curves",
      subtitle: "5-Model Stratified Benchmarking",
      badge: "ROC-AUC: 0.9400",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      img: "/docs/roc_curves.png",
      alt: "Comparative ROC Curves",
      desc: "XGBoost & Ensemble performance across all false-alarm thresholds.",
    },
    {
      title: "Global SHAP Feature Attribution",
      subtitle: "TreeExplainer Factor Weighting",
      badge: "Rain: 40.5% | Slope: 25.8%",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      img: "/docs/shap_summary.png",
      alt: "Global SHAP Beeswarm Distribution",
      desc: "Mathematical decomposition of rainfall, slope, and NDVI root cohesion.",
    },
    {
      title: "Cost-Sensitive Threshold Tuning",
      subtitle: "Life-Safety Recall Calibration",
      badge: "0.35 Threshold -> 94.12% Recall",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      img: "/docs/threshold_tuning_plot.png",
      alt: "Decision Threshold Tuning Plot",
      desc: "Calibrated threshold eliminates fatal false negatives during cloudbursts.",
    },
    {
      title: "Held-Out Confusion Matrix",
      subtitle: "N=300 Unseen Wayanad Test Points",
      badge: "Accuracy: 86.0%",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      img: "/docs/confusion_matrix.png",
      alt: "Model Confusion Matrix",
      desc: "Ground-truth classification matrix showing 176 of 187 landslides detected.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between w-full bg-zinc-50/60 relative text-zinc-900">
      <LetterDropLoader />
      <Navbar backendOnline={backendOnline} />

      <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-12 py-6 flex-1 space-y-8">
        
        {/* 1. VISUAL HERO COMMAND BANNER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-zinc-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/40 via-sky-100/20 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Quick Summary & Action Launchers (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono font-semibold text-zinc-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Wayanad Monsoon Early Warning 2026 // AWS Live Feed</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black leading-tight">
                GeoShield AI // Wayanad Landslide Early Warning
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 max-w-xl font-normal leading-relaxed">
                Autonomous 30m terrain intelligence powered by <strong>XGBoost</strong>, <strong>SHAP TreeExplainer</strong>, and real-time synoptic weather telemetry from AWS #04.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/radar"
                  className="px-5 py-3 rounded-xl bg-black text-white text-xs font-mono font-bold flex items-center gap-2 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Launch GIS Tactical Radar</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                </Link>

                <Link
                  href="/simulation"
                  className="px-5 py-3 rounded-xl bg-white border border-zinc-300 text-zinc-800 text-xs font-mono font-bold flex items-center gap-2 hover:bg-zinc-50 hover:border-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xs"
                >
                  <Sliders className="w-4 h-4 text-zinc-600" />
                  <span>What-If Simulator</span>
                </Link>

                <Link
                  href="/diagnostics"
                  className="px-5 py-3 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all"
                >
                  <BarChart3 className="w-4 h-4 text-zinc-600" />
                  <span>AI Benchmarks</span>
                </Link>
              </div>

              {/* Metric Highlights Pill Bar */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-100 max-w-lg text-center">
                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Model AUC</span>
                  <strong className="text-sm sm:text-base font-mono font-black text-black">94.00%</strong>
                </div>
                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Disaster Recall</span>
                  <strong className="text-sm sm:text-base font-mono font-black text-emerald-600">94.12%</strong>
                </div>
                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Spatial Cells</span>
                  <strong className="text-sm sm:text-base font-mono font-black text-blue-600">1,500 30m</strong>
                </div>
              </div>
            </div>

            {/* Right: Interactive Topographic Radar Graphic (5 cols) */}
            <div className="lg:col-span-5">
              <Link
                href="/radar"
                className="bg-[#0b0f19] rounded-2xl p-5 border border-zinc-800 shadow-xl relative overflow-hidden group block hover:border-zinc-500 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono text-[11px] text-zinc-200 font-semibold uppercase">
                      Live Wayanad GIS Map
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold">
                    GPS: 11.55°N, 76.13°E
                  </span>
                </div>

                {/* SVG Visual Graphic with Active Hazard Points */}
                <div className="relative h-48 w-full my-3 rounded-xl overflow-hidden bg-black/70 border border-white/5 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    <defs>
                      <radialGradient id="radarScanHero" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </radialGradient>
                    </defs>

                    {/* Concentric Radar Rings */}
                    <circle cx="200" cy="100" r="35" stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none" />
                    <circle cx="200" cy="100" r="70" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
                    <circle cx="200" cy="100" r="105" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="url(#radarScanHero)" />

                    {/* Topographic Contour Lines */}
                    <path d="M 30,150 Q 120,70 200,110 T 370,80" fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" />
                    <path d="M 20,170 Q 140,100 220,140 T 380,110" fill="none" stroke="rgba(56,189,248,0.2)" strokeWidth="1.5" />
                    <path d="M 40,120 Q 160,40 240,80 T 360,50" fill="none" stroke="rgba(245,158,11,0.35)" strokeWidth="1.5" />

                    {/* Active Hazard Markers */}
                    <circle cx="165" cy="125" r="5" fill="#ef4444" />
                    <circle cx="165" cy="125" r="14" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" />
                    <text x="175" y="129" fill="#f87171" fontSize="10" fontFamily="monospace" fontWeight="bold">Chooralmala (91%)</text>

                    <circle cx="120" cy="80" r="4" fill="#f59e0b" />
                    <text x="130" y="84" fill="#fbbf24" fontSize="10" fontFamily="monospace">Vythiri Ghat (74%)</text>

                    <circle cx="280" cy="65" r="4" fill="#10b981" />
                    <text x="290" y="69" fill="#34d399" fontSize="10" fontFamily="monospace">S. Bathery (19%)</text>
                  </svg>

                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    Click to Open Fullscreen &rarr;
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Terrain Grid: SRTM 30m</span>
                  <span className="text-emerald-400 font-semibold">Live Telemetry: Active</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. REAL AI VISUAL GALLERY // 4 PRODUCED CHARTS & GRAPHS */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-black flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-black" />
                <span>AI Model Visual Performance & Factor Gallery</span>
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Real produced charts generated under 5-Fold Stratified Cross-Validation on 1,500 survey vectors
              </p>
            </div>

            <Link
              href="/diagnostics"
              className="text-xs font-mono font-bold text-zinc-700 hover:text-black flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-zinc-300 shadow-2xs hover:border-black transition-all"
            >
              <span>Open Full Diagnostics &rarr;</span>
            </Link>
          </div>

          {/* 4 Real Visual Image Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {aiVisualCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs overflow-hidden flex flex-col justify-between group hover:border-black hover:shadow-md transition-all duration-200"
              >
                <div className="p-4 pb-2 border-b border-zinc-100 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-xs text-black uppercase font-mono tracking-tight line-clamp-1">
                      {card.title}
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-mono block">
                      {card.subtitle}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${card.badgeColor} shrink-0`}>
                    {card.badge}
                  </span>
                </div>

                {/* Real Image Preview with Hover Zoom */}
                <div
                  onClick={() => setSelectedImage(card.img)}
                  className="relative h-44 w-full bg-zinc-100 cursor-pointer overflow-hidden flex items-center justify-center p-2 group-hover:bg-zinc-50 transition-colors"
                >
                  <img
                    src={card.img}
                    alt={card.alt}
                    className="max-h-full max-w-full object-contain rounded transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-mono text-xs font-bold">
                    <Maximize2 className="w-4 h-4" />
                    <span>Expand</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50/50 border-t border-zinc-100 text-[11px] text-zinc-600 font-sans leading-tight">
                  {card.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. DUAL CIRCULAR GAUGES & REAL-TIME PRECIPITATION WAVEFORM */}
        <section className="coder-dark-block p-6 sm:p-8 rounded-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-zinc-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>Geotechnical Stress Telemetry & July 2024 Precipitation Waveform</span>
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Sub-15ms inference latency • Wayanad West Basin Sensor Mesh
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-zinc-300">Live Synoptic Monitoring</span>
            </div>
          </div>

          {/* Circular Gauges */}
          <div className="pt-6">
            <HeroGaugeCard overview={dashboardData?.overview} />
          </div>

          {/* Stats Grid + Interactive Waveform */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
            <div className="lg:col-span-5">
              <StatsGrid stats={dashboardData?.stats} />
            </div>
            <div className="lg:col-span-7">
              <TrendChart trendData={dashboardData?.trend_chart} />
            </div>
          </div>
        </section>

        {/* 4. AUTONOMOUS TELEGRAM EARLY WARNING BROADCAST BANNER */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 border border-blue-700/50 shadow-lg flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-mono text-blue-300">
              <Send className="w-3.5 h-3.5" />
              <span>Autonomous Telegram Mesh // @GeoShield_Warning_Bot</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Bilingual Civil Defense Alert Broadcast (English + ಕನ್ನಡ)
            </h3>
            <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
              When live AWS sensors or what-if simulation cross the <strong>0.35 calibrated threshold</strong>, the system automatically pushes early warning dispatches to relief officers without manual human action.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://t.me/GeoShield_Warning_Bot"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-white text-blue-900 font-mono text-xs font-black flex items-center gap-2 hover:bg-blue-50 transition-all shadow-md"
            >
              <Send className="w-4 h-4 text-blue-600" />
              <span>Connect Telegram Bot</span>
            </a>
          </div>
        </section>

        {/* 5. SENSOR SOURCE STRIP */}
        <section className="py-4 border-y border-zinc-200">
          <div className="flex flex-wrap items-center justify-around gap-4 text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 hover:text-black transition-colors">
              <Satellite className="w-4 h-4 text-black" /> NASA SRTM 30m DEM
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5 hover:text-black transition-colors">
              <Shield className="w-4 h-4 text-black" /> Sentinel-2 NDVI Surface
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5 hover:text-black transition-colors">
              <CloudRain className="w-4 h-4 text-black" /> Open-Meteo AWS Telemetry
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5 hover:text-black transition-colors">
              <Send className="w-4 h-4 text-black" /> Telegram Emergency Mesh
            </span>
          </div>
        </section>
      </main>

      {/* Lightbox Modal for Expanding Produced Visual Charts */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-4 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <span className="font-mono text-xs font-bold text-black uppercase">
                Produced AI Verification Artifact // High Resolution
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-xs font-mono bg-zinc-100 hover:bg-zinc-200 px-3 py-1 rounded-md text-zinc-700"
              >
                Close (ESC)
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-50 my-2 rounded-xl">
              <img
                src={selectedImage}
                alt="Expanded Visual Chart"
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      <TacticalDock
        sectors={dashboardData?.sectors}
        alerts={dashboardData?.alerts}
      />
    </div>
  );
}
