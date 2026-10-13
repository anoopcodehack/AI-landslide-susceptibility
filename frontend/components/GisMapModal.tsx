"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface GisMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GisMapModal: React.FC<GisMapModalProps> = ({ isOpen, onClose }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    // Dynamically import Leaflet only on the client side
    import("leaflet").then((L) => {
      if (!leafletInstance.current && mapRef.current) {
        const map = L.map(mapRef.current).setView([11.605, 76.132], 11);

        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Esri Satellite Imagery",
          }
        ).addTo(map);

        const hotspots = [
          { name: "Mundakkai Debris Zone", lat: 11.53, lon: 76.182, color: "#ef4444", risk: "Critical 94%" },
          { name: "Chooralmala Sector", lat: 11.5381, lon: 76.1772, color: "#ef4444", risk: "Critical 91%" },
          { name: "Meppadi Range", lat: 11.5518, lon: 76.1265, color: "#f97316", risk: "High 82%" },
          { name: "Vythiri Ghat Pass", lat: 11.5524, lon: 76.0425, color: "#f59e0b", risk: "Watch 74%" },
          { name: "Sulthan Bathery Plateau", lat: 11.6628, lon: 76.257, color: "#10b981", risk: "Stable 19%" },
        ];

        hotspots.forEach((spot) => {
          L.circle([spot.lat, spot.lon], {
            radius: 1400,
            color: spot.color,
            fillColor: spot.color,
            fillOpacity: 0.35,
            weight: 2,
          })
            .addTo(map)
            .bindPopup(`<b>${spot.name}</b><br>Hazard Level: ${spot.risk}`);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>🗺️</span> Wayanad District GIS Hazard Radar Map
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Satellite imagery overlaid with ground-truth slope failure disaster zones
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 flex-1 min-h-[460px] rounded-2xl overflow-hidden border border-slate-200 relative">
          <div ref={mapRef} className="w-full h-[460px]" />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical Hazard (&gt;80%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Watch Zone (50-80%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Stable Plateau (&lt;50%)
            </span>
          </div>
          <span className="font-mono">Coordinates: 11.605°N, 76.132°E</span>
        </div>
      </div>
    </div>
  );
};
