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
  GitBranch,
  Terminal,
} from "lucide-react";

export default function GovernancePage() {
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

  return (
    <div className="min-h-screen flex flex-col justify-between w-full bg-white text-zinc-900">
      {/* Sticky Coder Navbar */}
      <Navbar
        activeTab="governance"
        setActiveTab={() => {}}
        onOpenMap={() => {}}
        onOpenShap={() => {}}
        onOpenSim={() => {}}
        onOpenAbout={() => {}}
        backendOnline={backendOnline}
      />

      {/* Main Full-Page Content */}
      <main className="max-w-[1440px] mx-auto w-full px-6 md:px-12 py-10 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-6 text-xs font-mono text-zinc-500">
          <Link
            href="/"
            className="hover:text-black transition-colors flex items-center gap-1.5 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Overview
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold uppercase tracking-wider">
            Governance & SDGs
          </span>
        </div>

        {/* Page Header */}
        <div className="pb-8 border-b border-zinc-200 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-xs font-mono font-semibold text-zinc-800 mb-3">
            <Shield className="w-3.5 h-3.5 text-black" />
            <span>Infrastructure Governance & Civil Defense Standard</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black">
            System Architecture & UN SDG 11.
            <span className="w-3 h-6 md:h-7 bg-black inline-block ml-1.5 align-middle" />
          </h1>
          <p className="text-base text-zinc-600 max-w-3xl mt-3 font-normal leading-relaxed">
            Enterprise four-tier system architecture, mathematical geotechnical physics formulation,
            and compliance with the Sendai Framework for Disaster Risk Reduction 2015–2030.
          </p>
        </div>

        {/* SECTION 1: 4-Layer Enterprise System Architecture */}
        <section className="mb-14">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-black mb-6 flex items-center gap-2">
            <Server className="w-4 h-4 text-black" /> 4-Tier Enterprise Software Architecture
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Layer 1 */}
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-2xs hover:border-black transition-all">
              <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center font-mono font-bold text-xs text-black mb-4">
                01
              </div>
              <h3 className="font-mono text-sm font-bold text-black uppercase mb-1">
                Data Engineering
              </h3>
              <p className="text-xs text-zinc-500 font-sans mb-4">
                Raw spatial data acquisition & coordinate normalization
              </p>
              <ul className="space-y-2 text-xs font-mono text-zinc-700">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> NASA SRTM 30m DEM
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> Sentinel-2 Reflectance
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> IMD Gridded Rainfall
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> GSI Failure Inventory
                </li>
              </ul>
            </div>

            {/* Layer 2 */}
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-2xs hover:border-black transition-all">
              <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center font-mono font-bold text-xs text-black mb-4">
                02
              </div>
              <h3 className="font-mono text-sm font-bold text-black uppercase mb-1">
                Feature Engine
              </h3>
              <p className="text-xs text-zinc-500 font-sans mb-4">
                Geospatial transformation & hydrological modeling
              </p>
              <ul className="space-y-2 text-xs font-mono text-zinc-700">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> Topographic Wetness (TWI)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> Slope Gradient & Aspect
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> Root Tensile NDVI
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> Riparian Distance Buffers
                </li>
              </ul>
            </div>

            {/* Layer 3 */}
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-2xs hover:border-black transition-all">
              <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center font-mono font-bold text-xs text-black mb-4">
                03
              </div>
              <h3 className="font-mono text-sm font-bold text-black uppercase mb-1">
                ML & XAI Core
              </h3>
              <p className="text-xs text-zinc-500 font-sans mb-4">
                Ensemble prediction & Shapley value decomposition
              </p>
              <ul className="space-y-2 text-xs font-mono text-zinc-700">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> Soft-Voting Ensemble
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> XGBoost / LightGBM
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> Threshold Tuner (0.25)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> SHAP TreeExplainer
                </li>
              </ul>
            </div>

            {/* Layer 4 */}
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-2xs hover:border-black transition-all">
              <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center font-mono font-bold text-xs text-black mb-4">
                04
              </div>
              <h3 className="font-mono text-sm font-bold text-black uppercase mb-1">
                Decision UI & API
              </h3>
              <p className="text-xs text-zinc-500 font-sans mb-4">
                Real-time REST gateway & Coder-styled cockpit
              </p>
              <ul className="space-y-2 text-xs font-mono text-zinc-700">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> FastAPI Asynchronous REST
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> Next.js 14 App Router
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> 72-Hour Timeline Replay
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> Printable KSDMA Directive
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 2: Geotechnical Mathematical Physics */}
        <section className="mb-14">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-black mb-6 flex items-center gap-2">
            <Layers className="w-4 h-4 text-black" /> Geotechnical Physics & Mathematical Formulations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Formula 1 */}
            <div className="p-7 bg-zinc-50 rounded-2xl border border-zinc-200">
              <h3 className="font-mono text-xs font-bold uppercase text-black mb-2">
                1. Infinite Slope Stability Equation (Factor of Safety)
              </h3>
              <p className="text-xs text-zinc-600 mb-4 font-sans leading-relaxed">
                Determines the mechanical ratio of shear resistance to driving gravitational force:
              </p>
              <div className="p-4 bg-white rounded-xl border border-zinc-300 font-mono text-xs text-center text-black font-bold overflow-x-auto">
                FS = [ c&apos; + (γ - m·γ_w) · z · cos²(β) · tan(φ&apos;) ] / [ γ · z · sin(β) · cos(β) ]
              </div>
              <p className="text-[11px] text-zinc-500 mt-3 font-sans">
                Where <strong>c&apos;</strong> is effective soil cohesion, <strong>γ</strong> is unit soil weight,
                <strong>m</strong> is fractional water table height, <strong>β</strong> is slope angle, and
                <strong>φ&apos;</strong> is internal friction angle. When pore pressure saturates, FS drops below 1.0 (failure).
              </p>
            </div>

            {/* Formula 2 */}
            <div className="p-7 bg-zinc-50 rounded-2xl border border-zinc-200">
              <h3 className="font-mono text-xs font-bold uppercase text-black mb-2">
                2. Topographic Wetness Index (TWI) & Cost-Loss Function
              </h3>
              <p className="text-xs text-zinc-600 mb-4 font-sans leading-relaxed">
                Quantifies topographic control on hydrological accumulation and early evacuation utility:
              </p>
              <div className="p-4 bg-white rounded-xl border border-zinc-300 font-mono text-xs text-center text-black font-bold overflow-x-auto">
                TWI = ln( a / tan β )
              </div>
              <p className="text-[11px] text-zinc-500 mt-3 font-sans">
                Where <strong>a</strong> is the upslope contributing area per unit contour width. High TWI gullies
                in Chooralmala experience rapid subsurface water convergence during extreme monsoon bursts.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: UN Sustainable Development Goals (SDG 11) */}
        <section className="mb-14">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-black mb-6 flex items-center gap-2">
            <Globe className="w-4 h-4 text-black" /> UN Sustainable Development Goals (SDG 11 & SDG 13)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200">
              <div className="text-xl font-black font-mono text-black mb-2">SDG 11.5</div>
              <h3 className="font-bold text-sm text-black mb-2">
                Disaster Mortality Reduction
              </h3>
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                Substantially reduce the number of deaths and people affected by water-related disasters
                by providing 6-hour advance warning before valley-scale debris flows occur.
              </p>
            </div>

            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200">
              <div className="text-xl font-black font-mono text-black mb-2">SDG 11.B</div>
              <h3 className="font-bold text-sm text-black mb-2">
                Holistic Risk Mitigation Plans
              </h3>
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                Implement integrated civil defense directives aligning municipal taluks with the
                Sendai Framework for Disaster Risk Reduction 2015–2030.
              </p>
            </div>

            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200">
              <div className="text-xl font-black font-mono text-black mb-2">SDG 13.1</div>
              <h3 className="font-bold text-sm text-black mb-2">
                Climate Resilience Infrastructure
              </h3>
              <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                Strengthen adaptive capacity to extreme climate-induced orographic cloudbursts
                through transparent, explainable machine learning models.
              </p>
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
