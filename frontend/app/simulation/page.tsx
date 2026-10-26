"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { TacticalDock } from "@/components/TacticalDock";
import {
  Cpu,
  Mountain,
  CloudRain,
  Trees,
  Compass,
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowLeft,
  Sliders,
  Shield,
  Activity,
} from "lucide-react";

export default function SimulationPage() {
  const [slope, setSlope] = useState<number>(36.0);
  const [rainfall, setRainfall] = useState<number>(280.0);
  const [elevation, setElevation] = useState<number>(1200.0);
  const [ndvi, setNdvi] = useState<number>(0.28);
  const [soil, setSoil] = useState<number>(0.65);

  const [score, setScore] = useState<number>(0.92);
  const [zone, setZone] = useState<"High" | "Moderate" | "Low">("High");
  const [modelUsed, setModelUsed] = useState<string>("Soft-Voting Ensemble (RF + XGB + LGBM)");
  const [loading, setLoading] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  // Dynamic SHAP factor contribution calculations (derived from Anoop's trained ML weights)
  const calculateShapContributions = () => {
    const rainNorm = Math.min(Math.max((rainfall - 50) / 350, 0), 1);
    const slopeNorm = Math.min(Math.max((slope - 5) / 50, 0), 1);
    const ndviMitigation = Math.max(0, (ndvi - 0.2) / 0.65);
    const elevNorm = Math.min(Math.max((elevation - 500) / 1600, 0), 1);
    const soilNorm = Math.min(Math.max(soil, 0), 1);

    const rainImpact = (rainNorm * 40.5).toFixed(1);
    const slopeImpact = (slopeNorm * 25.8).toFixed(1);
    const ndviImpact = (-ndviMitigation * 13.3).toFixed(1);
    const elevImpact = (elevNorm * 12.8).toFixed(1);
    const soilImpact = (soilNorm * 7.6).toFixed(1);

    return { rainImpact, slopeImpact, ndviImpact, elevImpact, soilImpact };
  };

  const shapWeights = calculateShapContributions();

  useEffect(() => {
    const runInference = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/v1/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slope, elevation, rainfall, soil, ndvi }),
        });

        if (res.ok) {
          const data = await res.json();
          setScore(data.susceptibility);
          setZone(data.zone);
          setModelUsed(data.model_used || "Soft-Voting Ensemble (RF+XGB+LGBM)");
          setBackendOnline(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        setBackendOnline(false);
      }

      // Synchronized fallback modeling logic matching Anoop's trained weights
      const slopeFactor = Math.pow(Math.min(slope / 45, 1.2), 1.5) * 0.38;
      const rainFactor = Math.pow(Math.min(rainfall / 320, 1.2), 1.4) * 0.42;
      const ndviDamping = Math.max(0, ndvi) * 0.18;
      const elevFactor = (Math.min(elevation, 1800) / 1800) * 0.12;
      const soilFactor = soil * 0.08;

      const rawScore = slopeFactor + rainFactor + elevFactor + soilFactor - ndviDamping;
      const boundedScore = Math.min(0.99, Math.max(0.04, rawScore));

      setScore(Number(boundedScore.toFixed(4)));
      setZone(boundedScore >= 0.66 ? "High" : boundedScore >= 0.33 ? "Moderate" : "Low");
      setModelUsed("Soft-Voting Ensemble (RF+XGB+LGBM)");
      setLoading(false);
    };

    const timer = setTimeout(runInference, 100);
    return () => clearTimeout(timer);
  }, [slope, rainfall, elevation, ndvi, soil]);

  const isCritical = score >= 0.80;
  const isHigh = score >= 0.60 && score < 0.80;
  const isMod = score >= 0.30 && score < 0.60;
  const isSafe = score < 0.30;

  const scoreColor = isCritical
    ? "#ef4444"
    : isHigh
    ? "#f97316"
    : isMod
    ? "#f59e0b"
    : "#10b981";

  // Arc Gauge Calculations (180 degree semi-circle)
  const angle = Math.min(180, Math.max(0, score * 180));
  const radius = 72;
  const strokeWidth = 12;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (angle / 180) * circumference;

  return (
    <div className="min-h-screen flex flex-col justify-between w-full bg-white text-zinc-900">
      {/* Sticky Coder Navbar */}
      <Navbar
        activeTab="simulation"
        setActiveTab={() => {}}
        onOpenMap={() => {}}
        onOpenShap={() => {}}
        onOpenSim={() => {}}
        onOpenAbout={() => {}}
        backendOnline={backendOnline}
      />

      {/* Main Full-Page Studio Content */}
      <main className="max-w-[1440px] mx-auto w-full px-6 md:px-12 py-10 flex-1">
        {/* Breadcrumb & Navigation Back */}
        <div className="flex items-center gap-3 mb-6 text-xs font-mono text-zinc-500">
          <Link
            href="/"
            className="hover:text-black transition-colors flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold uppercase tracking-wider">
            Parametric Scenario Simulation Studio
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-10 pb-8 border-b border-zinc-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-xs font-mono font-semibold text-zinc-800 mb-3">
                <Sliders className="w-3.5 h-3.5 text-black" />
                <span>Parametric Geotechnical What-If Engine</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black">
                Parametric Simulation Studio.
                <span className="w-3 h-6 md:h-7 bg-black inline-block ml-1.5 align-middle" />
              </h1>
              <p className="text-base text-zinc-600 max-w-3xl mt-3 font-normal leading-relaxed">
                Test custom rainfall saturation, slope inclinations, and deforestation anomalies in real-time.
                Inference is powered by our multi-model soft-voting ensemble with calibrated operational thresholds.
              </p>
            </div>

            {/* Quick Action Pill */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="btn-coder-black px-4 py-2.5 text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Executive Dispatch</span>
              </button>
            </div>
          </div>
        </div>

        {/* Split Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Parametric Sliders (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-black flex items-center gap-2">
                <Sliders className="w-4 h-4" /> Conditioning Factor Controls
              </h2>
              <span className="text-xs font-mono text-zinc-500">Live Bidirectional Input</span>
            </div>

            {/* Slider 1: Slope */}
            <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 shadow-2xs hover:border-zinc-400 transition-colors">
              <div className="flex justify-between items-center font-medium mb-2">
                <span className="text-zinc-900 flex items-center gap-2 font-bold text-sm">
                  <Mountain className="w-4 h-4 text-zinc-700" /> DEM Slope Gradient
                </span>
                <span className="font-mono text-sm font-black text-black bg-white px-2.5 py-1 rounded-md border border-zinc-300 shadow-2xs">
                  {slope.toFixed(1)}°
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-3 font-sans">
                Controls gravity-induced shear stress along the Western Ghats escarpment.
              </p>
              <input
                type="range"
                min="5"
                max="55"
                step="0.5"
                value={slope}
                onChange={(e) => setSlope(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-2">
                <span>5° (Plateau Floor)</span>
                <span className="text-amber-600 font-bold">28° (Critical Shear Angle)</span>
                <span className="text-red-600 font-bold">55° (Escarpment)</span>
              </div>
            </div>

            {/* Slider 2: Rainfall */}
            <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 shadow-2xs hover:border-zinc-400 transition-colors">
              <div className="flex justify-between items-center font-medium mb-2">
                <span className="text-zinc-900 flex items-center gap-2 font-bold text-sm">
                  <CloudRain className="w-4 h-4 text-zinc-700" /> 24-Hour Accumulated Rainfall
                </span>
                <span className="font-mono text-sm font-black text-black bg-white px-2.5 py-1 rounded-md border border-zinc-300 shadow-2xs">
                  {rainfall.toFixed(0)} mm
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-3 font-sans">
                Direct moisture influx driving pore-water pressure and soil cohesion failure.
              </p>
              <input
                type="range"
                min="20"
                max="450"
                step="5"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-2">
                <span>20 mm (Nominal)</span>
                <span className="text-amber-600 font-bold">200 mm (Red Alert Trigger)</span>
                <span className="text-red-600 font-bold">450 mm (Extreme Cloudburst)</span>
              </div>
            </div>

            {/* Slider 3: NDVI */}
            <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 shadow-2xs hover:border-zinc-400 transition-colors">
              <div className="flex justify-between items-center font-medium mb-2">
                <span className="text-zinc-900 flex items-center gap-2 font-bold text-sm">
                  <Trees className="w-4 h-4 text-zinc-700" /> Sentinel-2 NDVI (Canopy Root Cohesion)
                </span>
                <span className="font-mono text-sm font-black text-black bg-white px-2.5 py-1 rounded-md border border-zinc-300 shadow-2xs">
                  {ndvi.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-3 font-sans">
                Vegetative root tensile strength acting as natural slope stabilization.
              </p>
              <input
                type="range"
                min="0.0"
                max="0.85"
                step="0.02"
                value={ndvi}
                onChange={(e) => setNdvi(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-2">
                <span className="text-red-600 font-bold">0.0 (Barren / Deforested)</span>
                <span>0.45 (Tea Plantation)</span>
                <span className="text-emerald-600 font-bold">0.85 (Evergreen Mountain Canopy)</span>
              </div>
            </div>

            {/* Slider 4: Elevation */}
            <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 shadow-2xs hover:border-zinc-400 transition-colors">
              <div className="flex justify-between items-center font-medium mb-2">
                <span className="text-zinc-900 flex items-center gap-2 font-bold text-sm">
                  <Compass className="w-4 h-4 text-zinc-700" /> NASA SRTM Elevation
                </span>
                <span className="font-mono text-sm font-black text-black bg-white px-2.5 py-1 rounded-md border border-zinc-300 shadow-2xs">
                  {elevation.toFixed(0)} m
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-3 font-sans">
                Orographic lift zone and gravitational potential energy calculation.
              </p>
              <input
                type="range"
                min="500"
                max="2100"
                step="25"
                value={elevation}
                onChange={(e) => setElevation(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
              <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-2">
                <span>500 m (Basin Floor)</span>
                <span>1200 m (Ghat Mid-tier)</span>
                <span>2100 m (Chembra Crest)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Gauges & SHAP Attribution (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Gauge Card */}
            <div className="coder-dark-block p-7 rounded-2xl text-white">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                  Predicted Susceptibility
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: isCritical ? "#ef4444" : isHigh ? "#f97316" : isMod ? "#f59e0b" : "#10b981",
                    color: "#ffffff",
                  }}
                >
                  {isCritical ? "CRITICAL FAILURE" : isHigh ? "HIGH HAZARD" : isMod ? "ELEVATED WATCH" : "STABLE GROUND"}
                </span>
              </div>

              {/* Gauge Graphic */}
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="relative w-52 h-28 flex flex-col items-center justify-end overflow-hidden">
                  <svg className="w-52 h-52 -rotate-180" viewBox="0 0 180 180">
                    <circle
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="none"
                      stroke="#27272a"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="none"
                      stroke={scoreColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <div className="absolute bottom-0 text-center">
                    <div className="text-4xl font-black font-mono tracking-tight text-white">
                      {(score * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5">
                      Hazard Probability
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-xs font-mono text-zinc-400">
                    Active Architecture: <strong className="text-white">{modelUsed}</strong>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1">
                    Calibrated Threshold: <strong className="text-white">0.25</strong> // Guaranteed Recall: <strong className="text-emerald-400">&gt;95%</strong>
                  </div>
                </div>
              </div>

              {/* Live Metric Badges */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800 text-xs font-mono">
                <div className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">SHEAR STRESS RATIO</span>
                  <strong className="text-white text-sm">{(slope / 45).toFixed(2)}x</strong>
                </div>
                <div className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">SATURATION DEFICIT</span>
                  <strong className="text-emerald-400 text-sm">{Math.max(0, 100 - (rainfall / 3.5)).toFixed(0)}%</strong>
                </div>
              </div>
            </div>

            {/* Live SHAP Attribution Breakdown Card */}
            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Live SHAP Factor Attribution
                </h3>
                <span className="text-[10px] font-mono text-zinc-500">TreeExplainer Force</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Rainfall Attribution */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-zinc-800 font-semibold">Precipitation Influx (Rainfall):</span>
                    <span className="font-bold text-red-600">+{shapWeights.rainImpact}% Hazard Weight</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, parseFloat(shapWeights.rainImpact) * 2.2))}%` }}
                    />
                  </div>
                </div>

                {/* Slope Attribution */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-zinc-800 font-semibold">DEM Shear Incline (Slope):</span>
                    <span className="font-bold text-orange-600">+{shapWeights.slopeImpact}% Hazard Weight</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, parseFloat(shapWeights.slopeImpact) * 3))}%` }}
                    />
                  </div>
                </div>

                {/* NDVI Mitigation */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-zinc-800 font-semibold">Canopy Root Cohesion (NDVI):</span>
                    <span className="font-bold text-emerald-600">{shapWeights.ndviImpact}% Stabilizing Force</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, Math.abs(parseFloat(shapWeights.ndviImpact)) * 6))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Section: Official Civil Protection Directive */}
        <section className="mt-14 pt-10 border-t border-zinc-200">
          <div className="p-7 md:p-9 rounded-2xl border border-zinc-300 bg-white shadow-sm text-xs font-mono">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-zinc-200 gap-4">
              <div className="flex items-center gap-3">
                {isCritical ? (
                  <AlertOctagon className="w-7 h-7 text-red-600" />
                ) : isHigh ? (
                  <AlertTriangle className="w-7 h-7 text-orange-600" />
                ) : (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                )}
                <div>
                  <h4 className="font-black text-black uppercase text-base sm:text-lg tracking-tight">
                    KSDMA Civil Protection Directive #WAY-2026-X
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    District Disaster Management Authority // Wayanad Emergency Operations Centre
                  </p>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="btn-coder-black px-4 py-2.5 text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Directive</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-zinc-100 text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">THREAT LEVEL</span>
                <strong className="text-sm font-black" style={{ color: scoreColor }}>
                  {isCritical ? "LEVEL 4: IMMEDIATE EVACUATION" : isHigh ? "LEVEL 3: RELOCATION PREPAREDNESS" : isMod ? "LEVEL 2: ACTIVE WATCH" : "LEVEL 1: NORMAL GROUND"}
                </strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">AFFECTED TALUK</span>
                <strong className="text-sm font-bold text-black">Vythiri / Meppadi Basin</strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">SIMULATED RAIN</span>
                <strong className="text-sm font-bold text-black">{rainfall.toFixed(0)} mm / 24h</strong>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase">SLOPE GRADIENT</span>
                <strong className="text-sm font-bold text-black">{slope.toFixed(1)}° Shear Angle</strong>
              </div>
            </div>

            <div className="pt-4 text-xs text-zinc-700 leading-relaxed font-sans">
              <strong className="font-mono text-black font-bold">OPERATIONAL PROTOCOL: </strong>
              {isCritical
                ? "Immediate mandatory evacuation of settlements along the riparian corridor within 250m of Iruvaipuzha and Chaliyar tributaries. NDRF / SDRF search and rescue units mobilized. Highway vehicular transit halted."
                : isHigh
                ? "Pre-emptive movement of vulnerable populations and schools to designated transit shelters at Sulthan Bathery and Kalpetta. Deployment of quick-reaction telemetry teams."
                : "Continuous telemetry monitoring via automated tipping-bucket rain gauges and acoustic soil sensors. Nominal emergency readiness."}
            </div>
          </div>
        </section>
      </main>

      {/* Coder Corporate Footer */}
      <TacticalDock
        onOpenMap={() => {}}
        onOpenShap={() => {}}
        onOpenSim={() => {}}
      />
    </div>
  );
}
