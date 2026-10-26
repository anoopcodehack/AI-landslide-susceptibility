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
  Copy,
  Check,
  Code2,
  Lock,
} from "lucide-react";

export default function GovernancePage() {
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [apiTab, setApiTab] = useState<"curl" | "python" | "schema">("curl");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const curlExample = `curl -X POST "http://localhost:8000/api/v1/predict" \\
  -H "Content-Type: application/json" \\
  -d '{
    "slope": 38.5,
    "rainfall": 372.0,
    "elevation": 1150.0,
    "soil": 0.78,
    "ndvi": 0.22
  }'`;

  const pythonExample = `import requests

payload = {
    "slope": 38.5,
    "rainfall": 372.0,
    "elevation": 1150.0,
    "soil": 0.78,
    "ndvi": 0.22
}

res = requests.post("http://localhost:8000/api/v1/predict", json=payload)
data = res.json()
print(f"Risk Score: {data['susceptibility'] * 100:.1f}% [{data['zone']}]")`;

  const schemaExample = `from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    slope: float = Field(..., ge=0, le=90, description="Slope gradient in degrees")
    rainfall: float = Field(..., ge=0, description="24h accumulated rainfall in mm")
    elevation: float = Field(..., description="Topographic elevation in meters")
    soil: float = Field(..., ge=0, le=1, description="Soil saturation index [0-1]")
    ndvi: float = Field(..., ge=-1, le=1, description="Vegetative root cohesion index")

class PredictionResponse(BaseModel):
    susceptibility: float
    zone: str
    model_used: str
    evacuation_alert: bool`;

  const getActiveCode = () => {
    if (apiTab === "curl") return curlExample;
    if (apiTab === "python") return pythonExample;
    return schemaExample;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const complianceItems = [
    {
      framework: "ISO 31000:2018",
      clause: "Clause 6.4: Risk Analysis & Identification",
      status: "Compliant & Validated",
      desc: "Deterministic geotechnical modeling with quantitative factor of safety (FS) thresholding.",
    },
    {
      framework: "Sendai Framework",
      clause: "Priority 1: Understanding Disaster Risk",
      status: "High Compliance",
      desc: "Decoupled raster spatial data ingestion across 30m NASA DEM and IMD rainfall grids.",
    },
    {
      framework: "Sendai Framework",
      clause: "Priority 4: Preparedness for Effective Response",
      status: "Operational",
      desc: "Calibrated 0.25 decision threshold achieving >95% Recall for 6-hour advance warning.",
    },
    {
      framework: "UN SDG 11.5",
      clause: "Disaster Mortality Reduction in Human Settlements",
      status: "Directly Aligned",
      desc: "Instant civil protection directive generation with designated transit corridor routing.",
    },
    {
      framework: "UN SDG 13.1",
      clause: "Strengthen Resilience to Climate-Induced Hazards",
      status: "Directly Aligned",
      desc: "Transparent Explainable AI (SHAP) ensuring civil defense teams understand trigger factors.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between w-full bg-white text-zinc-900">
      {/* Sticky Coder Navbar */}
      <Navbar backendOnline={backendOnline} />

      {/* Main Full-Page Content */}
      <main className="max-w-[1440px] mx-auto w-full px-6 md:px-12 py-8 flex-1">
        {/* Breadcrumb Bar */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-100 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="hover:text-black transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Overview
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold uppercase tracking-wider">
              Governance, Architecture & SDGs
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px]">
            <span>Standard: <strong className="text-black">ISO 31000 / Sendai</strong></span>
            <span>Target: <strong className="text-black">UN SDG 11 & SDG 13</strong></span>
          </div>
        </div>

        {/* Page Header Bar */}
        <div className="pb-6 border-b border-zinc-200 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-xs font-mono font-semibold text-zinc-800 mb-2.5">
            <Shield className="w-3.5 h-3.5 text-black" />
            <span>Infrastructure Governance & Civil Defense Standard</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black">
            System Architecture & UN SDG 11.
            <span className="w-3 h-6 md:h-7 bg-black inline-block ml-1.5 align-middle" />
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-3xl mt-2 font-normal leading-relaxed">
            Enterprise 4-tier system architecture, REST API OpenAPI contracts, geotechnical mathematical
            physics formulation, and verified compliance with the Sendai Framework for Disaster Risk Reduction 2015–2030.
          </p>
        </div>

        {/* SECTION 1: 4-Layer Enterprise Architecture */}
        <section className="mb-12">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black mb-5 flex items-center gap-2">
            <Server className="w-4 h-4 text-black" /> 4-Tier Enterprise Software Architecture
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Layer 1 */}
            <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 shadow-2xs hover:border-black transition-all">
              <div className="w-7 h-7 rounded-md bg-zinc-200 flex items-center justify-center font-mono font-bold text-xs text-black mb-3">
                01
              </div>
              <h3 className="font-mono text-xs font-bold text-black uppercase mb-1">
                Data Engineering
              </h3>
              <p className="text-[11px] text-zinc-500 font-sans mb-3">
                Raw spatial data ingestion & coordinate normalization
              </p>
              <ul className="space-y-1.5 text-xs font-mono text-zinc-700">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> NASA SRTM 30m DEM
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" /> Sentinel-2 Surface Refl.
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
            <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 shadow-2xs hover:border-black transition-all">
              <div className="w-7 h-7 rounded-md bg-zinc-200 flex items-center justify-center font-mono font-bold text-xs text-black mb-3">
                02
              </div>
              <h3 className="font-mono text-xs font-bold text-black uppercase mb-1">
                Feature Engine
              </h3>
              <p className="text-[11px] text-zinc-500 font-sans mb-3">
                Geospatial transformation & hydrological physics
              </p>
              <ul className="space-y-1.5 text-xs font-mono text-zinc-700">
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
            <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 shadow-2xs hover:border-black transition-all">
              <div className="w-7 h-7 rounded-md bg-zinc-200 flex items-center justify-center font-mono font-bold text-xs text-black mb-3">
                03
              </div>
              <h3 className="font-mono text-xs font-bold text-black uppercase mb-1">
                ML & XAI Core
              </h3>
              <p className="text-[11px] text-zinc-500 font-sans mb-3">
                Ensemble prediction & Shapley attribution
              </p>
              <ul className="space-y-1.5 text-xs font-mono text-zinc-700">
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
            <div className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 shadow-2xs hover:border-black transition-all">
              <div className="w-7 h-7 rounded-md bg-zinc-200 flex items-center justify-center font-mono font-bold text-xs text-black mb-3">
                04
              </div>
              <h3 className="font-mono text-xs font-bold text-black uppercase mb-1">
                Decision UI & API
              </h3>
              <p className="text-[11px] text-zinc-500 font-sans mb-3">
                Real-time REST gateway & Coder cockpit
              </p>
              <ul className="space-y-1.5 text-xs font-mono text-zinc-700">
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

        {/* SECTION 2: Interactive API Contract Explorer */}
        <section className="mb-12">
          <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-zinc-800 gap-3">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  FastAPI Asynchronous Endpoint Contract // POST /api/v1/predict
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-zinc-800 rounded-md p-0.5 border border-zinc-700 text-[11px] font-mono">
                  <button
                    onClick={() => setApiTab("curl")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      apiTab === "curl" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setApiTab("python")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      apiTab === "python" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setApiTab("schema")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      apiTab === "schema" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Pydantic Schema
                  </button>
                </div>

                <button
                  onClick={copyCode}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono flex items-center gap-1 text-zinc-300 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <pre className="mt-4 p-4 rounded-xl bg-black/60 border border-zinc-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{getActiveCode()}</code>
            </pre>
          </div>
        </section>

        {/* SECTION 3: Geotechnical Mathematical Physics */}
        <section className="mb-12">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black mb-5 flex items-center gap-2">
            <Layers className="w-4 h-4 text-black" /> Geotechnical Physics & Formulations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formula 1 */}
            <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-200">
              <h3 className="font-mono text-xs font-bold uppercase text-black mb-2">
                1. Infinite Slope Stability Equation (Factor of Safety)
              </h3>
              <p className="text-xs text-zinc-600 mb-3 font-sans leading-relaxed">
                Determines the mechanical ratio of resisting shear strength to driving gravitational force:
              </p>
              <div className="p-3.5 bg-white rounded-lg border border-zinc-300 font-mono text-xs text-center text-black font-bold overflow-x-auto">
                FS = [ c&apos; + (γ - m·γ_w) · z · cos²(β) · tan(φ&apos;) ] / [ γ · z · sin(β) · cos(β) ]
              </div>
              <p className="text-[11px] text-zinc-500 mt-2.5 font-sans">
                Where <strong>c&apos;</strong> is effective cohesion, <strong>γ</strong> is soil unit weight,
                <strong>m</strong> is water table height ratio, <strong>β</strong> is slope angle, and
                <strong>φ&apos;</strong> is internal friction angle. When pore pressure saturates, FS drops below 1.0 (failure).
              </p>
            </div>

            {/* Formula 2 */}
            <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-200">
              <h3 className="font-mono text-xs font-bold uppercase text-black mb-2">
                2. Topographic Wetness Index (TWI) & Drainage Convergence
              </h3>
              <p className="text-xs text-zinc-600 mb-3 font-sans leading-relaxed">
                Quantifies topographic control on hydrological moisture accumulation:
              </p>
              <div className="p-3.5 bg-white rounded-lg border border-zinc-300 font-mono text-xs text-center text-black font-bold overflow-x-auto">
                TWI = ln( a / tan β )
              </div>
              <p className="text-[11px] text-zinc-500 mt-2.5 font-sans">
                Where <strong>a</strong> is the upslope contributing area per unit contour width. High TWI gullies
                in Chooralmala experience rapid subsurface water convergence during extreme monsoon bursts.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: UN SDGs & International Compliance Audit Matrix */}
        <section className="mb-12">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-black mb-5 flex items-center gap-2">
            <Globe className="w-4 h-4 text-black" /> UN SDGs & Sendai Framework Compliance Matrix
          </h2>

          <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs divide-y divide-zinc-200">
            {complianceItems.map((item, idx) => (
              <div key={idx} className="p-4 sm:p-5 hover:bg-zinc-50 transition-colors flex flex-wrap items-center justify-between gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-black uppercase">
                      {item.framework}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                      {item.clause}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1 font-sans">{item.desc}</p>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Coder Corporate Footer */}
      <TacticalDock />
    </div>
  );
}
