"use client";

import React, { useState } from "react";
import { X, FileText, ExternalLink } from "lucide-react";

interface ShapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShapModal: React.FC<ShapModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    "beeswarm" | "bar" | "high_risk" | "low_risk" | "roc" | "confusion"
  >("beeswarm");

  if (!isOpen) return null;

  const tabs = [
    { id: "beeswarm", label: "Global Beeswarm Summary", img: "http://localhost:8000/docs/shap_summary.png" },
    { id: "bar", label: "Factor Attribution Bar", img: "http://localhost:8000/docs/shap_importance_bar.png" },
    { id: "high_risk", label: "Local High-Risk Waterfall", img: "http://localhost:8000/docs/shap_local_high_risk.png" },
    { id: "low_risk", label: "Local Safe Scenario Waterfall", img: "http://localhost:8000/docs/shap_local_low_risk.png" },
    { id: "roc", label: "ROC Curves Comparison", img: "http://localhost:8000/docs/roc_curves.png" },
    { id: "confusion", label: "Confusion Matrix", img: "http://localhost:8000/docs/confusion_matrix.png" },
  ] as const;

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl p-6 shadow-2xl border border-zinc-200 flex flex-col max-h-[92vh] overflow-hidden text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black">
                Explainable AI Diagnostics (SHAP) & Model Benchmarking
              </h3>
              <p className="text-xs text-zinc-500">
                TreeExplainer game-theoretic factor attributions for XGBoost (ROC-AUC 0.9422)
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

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto border-b border-zinc-200 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Visual Content */}
        <div className="my-4 flex-1 overflow-y-auto pr-1">
          <div className="rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50 p-4 flex flex-col items-center justify-center min-h-[360px]">
            <img
              src={currentTab.img}
              alt={currentTab.label}
              className="max-h-[460px] w-auto object-contain rounded-lg shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = "none";
              }}
            />
          </div>

          {/* Factor Importance Table */}
          <div className="mt-4 rounded-xl border border-zinc-200 overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 uppercase font-mono font-semibold border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-2.5">Rank</th>
                  <th className="px-4 py-2.5">Conditioning Factor</th>
                  <th className="px-4 py-2.5">Mean |SHAP| Attribution</th>
                  <th className="px-4 py-2.5">Relative Share (%)</th>
                  <th className="px-4 py-2.5">Geotechnical Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-2.5 font-bold font-mono text-black">1</td>
                  <td className="px-4 py-2.5 font-semibold text-black">24h Rainfall Index</td>
                  <td className="px-4 py-2.5 font-mono text-black">2.1409</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-black">36.3%</td>
                  <td className="px-4 py-2.5 text-zinc-600">Pore-water pressure buildup and shear strength loss</td>
                </tr>
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-2.5 font-bold font-mono text-black">2</td>
                  <td className="px-4 py-2.5 font-semibold text-black">DEM Slope Angle</td>
                  <td className="px-4 py-2.5 font-mono text-black">1.4359</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-black">24.3%</td>
                  <td className="px-4 py-2.5 text-zinc-600">Gravitational shear component along steep incline</td>
                </tr>
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-2.5 font-bold font-mono text-black">3</td>
                  <td className="px-4 py-2.5 font-semibold text-black">NDVI (Vegetation Index)</td>
                  <td className="px-4 py-2.5 font-mono text-black">0.8858</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-black">15.0%</td>
                  <td className="px-4 py-2.5 text-zinc-600">Root-cohesion deficit in deforested/barren slopes</td>
                </tr>
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-2.5 font-bold font-mono text-black">4</td>
                  <td className="px-4 py-2.5 font-semibold text-black">DEM Elevation (m)</td>
                  <td className="px-4 py-2.5 font-mono text-black">0.8024</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-black">13.6%</td>
                  <td className="px-4 py-2.5 text-zinc-600">Orographic precipitation trapping in upper catchments</td>
                </tr>
                <tr className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-2.5 font-bold font-mono text-black">5</td>
                  <td className="px-4 py-2.5 font-semibold text-black">Soil Permeability</td>
                  <td className="px-4 py-2.5 font-mono text-black">0.6339</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-black">10.7%</td>
                  <td className="px-4 py-2.5 text-zinc-600">Subsurface drainage infiltration and conductivity</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
