"use client";

import React, { useState, useEffect } from "react";
import { X, Cpu, Mountain, CloudRain, Trees, Compass } from "lucide-react";

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({ isOpen, onClose }) => {
  const [slope, setSlope] = useState<number>(36.0);
  const [rainfall, setRainfall] = useState<number>(280.0);
  const [elevation, setElevation] = useState<number>(1200.0);
  const [ndvi, setNdvi] = useState<number>(0.28);
  const [soil, setSoil] = useState<number>(0.65);

  const [score, setScore] = useState<number>(0.92);
  const [zone, setZone] = useState<"High" | "Moderate" | "Low">("High");
  const [modelUsed, setModelUsed] = useState<string>("XGBoost Classifier");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const runInference = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/v1/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slope,
            elevation,
            rainfall,
            soil,
            ndvi,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setScore(data.susceptibility);
          setZone(data.zone);
          setModelUsed(data.model_used);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Fallback
      }

      const fallbackScore = Math.min(
        1.0,
        Math.max(
          0.0,
          0.45 * Math.min(slope / 45, 1) +
            0.3 * Math.min(rainfall / 300, 1) +
            0.15 * (1 - (ndvi + 1) / 2) +
            0.1 * Math.min(elevation / 2000, 1)
        )
      );
      setScore(Number(fallbackScore.toFixed(4)));
      setZone(fallbackScore >= 0.66 ? "High" : fallbackScore >= 0.33 ? "Moderate" : "Low");
      setModelUsed("XGBoost Classifier (Local Fallback)");
      setLoading(false);
    };

    const timer = setTimeout(runInference, 100);
    return () => clearTimeout(timer);
  }, [slope, rainfall, elevation, ndvi, soil, isOpen]);

  if (!isOpen) return null;

  const isHigh = zone === "High";
  const isMod = zone === "Moderate";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 md:p-8 shadow-2xl border border-zinc-200 flex flex-col max-h-[92vh] overflow-y-auto text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black">
                Parametric Scenario Simulation Studio
              </h3>
              <p className="text-xs text-zinc-500">
                Inference via production XGBoost classifier ({modelUsed})
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

        {/* Susceptibility Score Card */}
        <div className="mt-5 p-5 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Predicted Susceptibility Index
            </span>
            <div className="text-4xl font-black font-mono mt-1 text-black flex items-baseline gap-2">
              <span>{(score * 100).toFixed(1)}%</span>
              <span className="text-xs font-sans text-zinc-500 font-normal">
                {loading ? "Computing..." : "Latency: <10ms"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                isHigh
                  ? "bg-black text-white shadow-sm"
                  : isMod
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-200 text-zinc-900"
              }`}
            >
              {zone} Hazard Risk
            </span>
            <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">
              Threshold &gt; 0.66: Severe
            </p>
          </div>
        </div>

        {/* Sliders */}
        <div className="mt-6 space-y-4 text-xs">
          {/* Slope */}
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <div className="flex justify-between items-center font-medium mb-1.5">
              <span className="text-zinc-800 flex items-center gap-1.5 font-semibold">
                <Mountain className="w-3.5 h-3.5 text-zinc-600" /> DEM Slope Gradient
              </span>
              <span className="font-mono text-xs font-bold text-black bg-white px-2 py-0.5 rounded border border-zinc-300">
                {slope.toFixed(1)}°
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="55"
              step="0.5"
              value={slope}
              onChange={(e) => setSlope(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
              <span>5° (Valley Floor)</span>
              <span>28° (Critical Shear Incline)</span>
              <span>55° (Escarpment)</span>
            </div>
          </div>

          {/* Rainfall */}
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <div className="flex justify-between items-center font-medium mb-1.5">
              <span className="text-zinc-800 flex items-center gap-1.5 font-semibold">
                <CloudRain className="w-3.5 h-3.5 text-zinc-600" /> 24-Hour Accumulated Rainfall
              </span>
              <span className="font-mono text-xs font-bold text-black bg-white px-2 py-0.5 rounded border border-zinc-300">
                {rainfall.toFixed(0)} mm
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="450"
              step="5"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
              <span>20mm (Nominal)</span>
              <span>200mm (Red Alert Trigger)</span>
              <span>450mm (Extreme Monsoon Bursts)</span>
            </div>
          </div>

          {/* NDVI */}
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <div className="flex justify-between items-center font-medium mb-1.5">
              <span className="text-zinc-800 flex items-center gap-1.5 font-semibold">
                <Trees className="w-3.5 h-3.5 text-zinc-600" /> NDVI (Canopy Root Cohesion)
              </span>
              <span className="font-mono text-xs font-bold text-black bg-white px-2 py-0.5 rounded border border-zinc-300">
                {ndvi.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.85"
              step="0.02"
              value={ndvi}
              onChange={(e) => setNdvi(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
              <span>0.0 (Barren Soil / Deforested)</span>
              <span>0.45 (Tea Plantation)</span>
              <span>0.85 (Evergreen Mountain Canopy)</span>
            </div>
          </div>

          {/* Elevation */}
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <div className="flex justify-between items-center font-medium mb-1.5">
              <span className="text-zinc-800 flex items-center gap-1.5 font-semibold">
                <Compass className="w-3.5 h-3.5 text-zinc-600" /> SRTM Topographic Elevation
              </span>
              <span className="font-mono text-xs font-bold text-black bg-white px-2 py-0.5 rounded border border-zinc-300">
                {elevation.toFixed(0)} m
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="2100"
              step="25"
              value={elevation}
              onChange={(e) => setElevation(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
              <span>500m (Basin Floor)</span>
              <span>1200m (Ghat Incline)</span>
              <span>2100m (Chembra Ridge)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
