"use client";

import React from "react";
import { X, Layers, Globe2, ShieldCheck, Terminal, Cpu, Database } from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl p-6 md:p-8 shadow-2xl border border-zinc-200 flex flex-col max-h-[92vh] overflow-y-auto text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
              <Layers className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black">
                System Architecture & UN Sustainable Development Goals (SDGs)
              </h3>
              <p className="text-xs text-zinc-500">
                Full-stack spatial decision-support platform (Next.js 14 + FastAPI + XGBoost 1.7.6)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-Tier Architecture Pipeline */}
        <div className="mt-5 space-y-4 text-xs leading-relaxed">
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 font-mono text-[11px] overflow-x-auto text-zinc-300 shadow-inner">
            <pre>{`[Spatial Conditioning Layers: DEM, Rain, Soil, NDVI] ──> src/preprocess.py
                         │
                         ▼
          [Matrix: 1,500 Calibrated Wayanad Points] ──> src/train.py & explain.py
                         │
                         ▼
        [XGBoost Model Artifact (ROC-AUC 0.9422)] ──> models/landslide_model.joblib
                         │
                         ▼
           [FastAPI High-Performance REST API] ──> backend/main.py
                         │
                         ▼
        [Next.js 14 Enterprise SaaS Dashboard] ──> frontend/app/page.tsx`}</pre>
          </div>

          {/* UN Sustainable Development Goals */}
          <div className="mt-5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-600 font-bold flex items-center gap-2 mb-3">
              <Globe2 className="w-4 h-4 text-black" /> United Nations Sustainable Development Goals Alignment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 shadow-xs hover:border-black transition-colors duration-200">
                <span className="text-[10px] font-mono font-bold text-black bg-zinc-200 px-2 py-0.5 rounded">
                  SDG 11
                </span>
                <div className="font-bold text-black text-xs mt-2">Sustainable Cities & Communities</div>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Enforces data-backed zoning regulations to keep civil infrastructure outside high-hazard slope debris corridors.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 shadow-xs hover:border-black transition-colors duration-200">
                <span className="text-[10px] font-mono font-bold text-black bg-zinc-200 px-2 py-0.5 rounded">
                  SDG 13
                </span>
                <div className="font-bold text-black text-xs mt-2">Climate Action</div>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Strengthens regional adaptive resilience against climate-induced extreme precipitation bursts and debris runs.
                </p>
              </div>

              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 shadow-xs hover:border-black transition-colors duration-200">
                <span className="text-[10px] font-mono font-bold text-black bg-zinc-200 px-2 py-0.5 rounded">
                  SDG 15
                </span>
                <div className="font-bold text-black text-xs mt-2">Life on Land</div>
                <p className="text-[11px] text-zinc-600 mt-1">
                  Quantifies root-cohesion loss caused by deforestation and agricultural monoculture using Sentinel-2 NDVI telemetry.
                </p>
              </div>
            </div>
          </div>

          {/* Enterprise Platform Architecture Pillars */}
          <div className="mt-5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-600 font-bold flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-black" /> Platform Pillars & Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-black text-xs">Machine Learning & Explainability</div>
                <div className="text-[11px] text-zinc-600 mt-1">
                  XGBoost regularized tree ensemble, 5-Fold Stratified Cross-Validation (AUC: 0.9408), and SHAP TreeExplainer game-theoretic factor rankings.
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-black text-xs">Geospatial Processing Engine</div>
                <div className="text-[11px] text-zinc-600 mt-1">
                  NASA SRTM 30m Digital Elevation Model, Sentinel-2 Surface Reflectance (NDVI), and IMD Gridded Rainfall telemetry alignment.
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-black text-xs">Real-Time Telemetry API</div>
                <div className="text-[11px] text-zinc-600 mt-1">
                  FastAPI asynchronous ASGI framework, Pydantic data validation, OpenAPI v3 documentation, sub-10ms model inference latency.
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="font-bold text-black text-xs">Spatial GIS Decision Command</div>
                <div className="text-[11px] text-zinc-600 mt-1">
                  Next.js 14 App Router, Tailwind CSS, Leaflet GIS Radar Map, and parametric scenario simulation engine.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
