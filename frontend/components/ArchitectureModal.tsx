"use client";

import React from "react";
import { X, Layers, Users } from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-600" /> System Architecture & Engineering Plan
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Multi-tier full-stack AI architecture (Next.js 14 + FastAPI + XGBoost)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono text-[11px] overflow-x-auto">
            <pre>{`[Spatial Layers: DEM, Rain, Soil, NDVI] ──> src/preprocess.py
                         │
                         ▼
           [Matrix: 1,500 Labeled Points] ──> src/train.py & explain.py
                         │
                         ▼
        [XGBoost Model (ROC-AUC 94.4%)] ──> models/landslide_model.joblib
                         │
                         ▼
           [FastAPI REST API (Port 8000)] ──> backend/main.py
                         │
                         ▼
        [Next.js 14 Dashboard (Port 3000)] ──> frontend/app/page.tsx`}</pre>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-sky-600" /> Engineering Roles & Responsibilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-900">Anoop A</div>
                <div className="text-sky-600 font-semibold">Lead & Machine Learning</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  XGBoost & Random Forest training, evaluation, SHAP XAI pipeline.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-900">Ashith C</div>
                <div className="text-emerald-600 font-semibold">Geospatial Data Engineering</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  NASA SRTM 30m DEM, Sentinel-2 NDVI, IMD Gridded Rainfall alignment.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-900">Dishant Jain</div>
                <div className="text-amber-600 font-semibold">Backend & REST API</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  FastAPI endpoints, CORS, model serialization and inference pipeline.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-bold text-slate-900">Dhruv Shetty</div>
                <div className="text-purple-600 font-semibold">Frontend & GIS Dashboard</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Next.js 14 App Router, Tailwind CSS, Leaflet GIS Radar and Recharts.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
