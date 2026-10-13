"use client";

import React from "react";
import { X } from "lucide-react";

interface ShapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShapModal: React.FC<ShapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>🔍</span> Explainable AI (SHAP) Factor Attribution
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              TreeExplainer analysis for the best-performing XGBoost model (ROC-AUC 94.4%)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 text-center">
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-50 p-2">
            <img
              src="http://localhost:8000/docs/shap_summary.png"
              alt="SHAP Factor Attribution Summary"
              className="w-full h-auto rounded-xl object-contain"
              onError={(e) => {
                // Fallback indicator if backend isn't mounted
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        </div>

        {/* Factor Ranking Table */}
        <div className="mt-5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Global Factor Importance Ranking
          </h4>
          <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="px-4 py-2.5">Rank</th>
                  <th className="px-4 py-2.5">Conditioning Factor</th>
                  <th className="px-4 py-2.5">Mean |SHAP| Value</th>
                  <th className="px-4 py-2.5">Geotechnical Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-900">1</td>
                  <td className="px-4 py-2.5 font-bold text-rose-600">24h Rainfall Index</td>
                  <td className="px-4 py-2.5 font-mono font-bold">2.2870</td>
                  <td className="px-4 py-2.5">Pore-water pressure trigger & saturation</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-900">2</td>
                  <td className="px-4 py-2.5 font-bold text-amber-600">Slope Angle (DEM)</td>
                  <td className="px-4 py-2.5 font-mono font-bold">1.5487</td>
                  <td className="px-4 py-2.5">Gravitational shear stress along steep incline</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-900">3</td>
                  <td className="px-4 py-2.5 font-bold text-emerald-600">NDVI (Vegetation Index)</td>
                  <td className="px-4 py-2.5 font-mono font-bold">0.9744</td>
                  <td className="px-4 py-2.5">Root-cohesion deficit in deforested slopes</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-900">4</td>
                  <td className="px-4 py-2.5 font-bold text-sky-600">Elevation (SRTM)</td>
                  <td className="px-4 py-2.5 font-mono font-bold">0.8648</td>
                  <td className="px-4 py-2.5">Orographic precipitation & exposure</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-900">5</td>
                  <td className="px-4 py-2.5 font-bold text-purple-600">Soil Permeability</td>
                  <td className="px-4 py-2.5 font-mono font-bold">0.6933</td>
                  <td className="px-4 py-2.5">Subsurface drainage and shear strength</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
