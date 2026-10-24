"use client";

import React, { useEffect, useRef } from "react";
import { X, Map, Satellite } from "lucide-react";

interface GisMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GisMapModal: React.FC<GisMapModalProps> = ({ isOpen, onClose }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    import("leaflet").then((L) => {
      if (!leafletInstance.current && mapRef.current) {
        const map = L.map(mapRef.current, {
          zoomControl: false,
        }).setView([11.58, 76.15], 11);

        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Esri Satellite Imagery // Wayanad Catchment",
            maxZoom: 17,
          }
        ).addTo(map);

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
          {
            subdomains: "abcd",
            maxZoom: 17,
          }
        ).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        const hotspots = [
          { name: "Mundakkai Debris Flow Zone", lat: 11.5300, lon: 76.1820, color: "#ef4444", risk: "Critical 94%", radius: 1800, desc: "July 2024 mass flow corridor" },
          { name: "Chooralmala Sector", lat: 11.5381, lon: 76.1772, color: "#ef4444", risk: "Critical 91%", radius: 1600, desc: "High pore-pressure shear incline" },
          { name: "Meppadi Range", lat: 11.5518, lon: 76.1265, color: "#f97316", risk: "High 82%", radius: 1400, desc: "Steep plantation escarpment" },
          { name: "Vythiri Ghat Pass", lat: 11.5524, lon: 76.0425, color: "#f59e0b", risk: "Watch 74%", radius: 1500, desc: "Active highway landslide corridor" },
          { name: "Sulthan Bathery Plateau", lat: 11.6628, lon: 76.2570, color: "#10b981", risk: "Stable 19%", radius: 1200, desc: "Gentle plateau topography" },
          { name: "Kalpetta Town Basin", lat: 11.6050, lon: 76.0820, color: "#10b981", risk: "Stable 24%", radius: 1100, desc: "District headquarters safe zone" },
        ];

        hotspots.forEach((spot) => {
          L.circle([spot.lat, spot.lon], {
            radius: spot.radius,
            color: spot.color,
            fillColor: spot.color,
            fillOpacity: 0.35,
            weight: 2,
          })
            .addTo(map)
            .bindPopup(
              `<div style="font-family:sans-serif; padding:4px;">
                <h4 style="margin:0; font-weight:800; color:#0f172a;">${spot.name}</h4>
                <p style="margin:2px 0 0; font-size:11px; font-weight:700; color:${spot.color};">Hazard Level: ${spot.risk}</p>
                <p style="margin:2px 0 0; font-size:10px; color:#64748b;">${spot.desc}</p>
              </div>`
            );

          L.circleMarker([spot.lat, spot.lon], {
            radius: 5,
            color: "#ffffff",
            fillColor: spot.color,
            fillOpacity: 1.0,
            weight: 2,
          }).addTo(map);
        });

        leafletInstance.current = map;
      }
    });

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl p-6 shadow-2xl border border-zinc-200 flex flex-col max-h-[92vh] text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
              <Map className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black">
                Wayanad Catchment GIS Hazard Radar
              </h3>
              <p className="text-xs text-zinc-500">
                Satellite topography overlaid with model-predicted susceptibility zones
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

        {/* Map Viewport */}
        <div className="mt-4 flex-1 min-h-[480px] rounded-xl overflow-hidden border border-zinc-200 relative">
          <div ref={mapRef} className="w-full h-[480px]" />

          {/* Floating Legend */}
          <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-zinc-300 shadow-md text-xs space-y-1.5">
            <span className="text-[10px] font-mono uppercase font-bold text-zinc-600 block">
              Hazard Stratification
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-zinc-800 font-medium">Critical (&gt;80%) // Mundakkai & Chooralmala</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-zinc-800 font-medium">Watch Zone (50-80%) // Vythiri Ghat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-zinc-800 font-medium">Stable (&lt;50%) // S. Bathery Plateau</span>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-zinc-500 border-t border-zinc-200 pt-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Satellite className="w-3.5 h-3.5 text-zinc-600" /> Esri World Imagery
            </span>
            <span>&bull;</span>
            <span className="font-mono">Coordinates: 11.6050°N, 76.1320°E</span>
          </div>
          <div>
            Click on any circle to view corridor telemetry
          </div>
        </div>
      </div>
    </div>
  );
};
