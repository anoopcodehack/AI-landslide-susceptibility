"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Map, Satellite, Layers, Play, Pause, RotateCcw } from "lucide-react";

interface GisMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  baseRadius: number;
  desc: string;
}

export const GisMapModal: React.FC<GisMapModalProps> = ({ isOpen, onClose }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const layersRef = useRef<{ satellite?: any; osm?: any }>({});
  const circlesRef = useRef<any[]>([]);

  const [activeLayer, setActiveLayer] = useState<"satellite" | "osm">("satellite");
  const [timelineStep, setTimelineStep] = useState<number>(2); // 0: T-48h, 1: T-24h, 2: T-0h (cloudburst), 3: T+12h
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const timelineMilestones = [
    { label: "T - 48h", date: "28 Jul 2024", rain: "45 mm", status: "Nominal Monsoon Baseline", severity: "stable" },
    { label: "T - 24h", date: "29 Jul 2024", rain: "185 mm", status: "Sustained Valley Saturation", severity: "watch" },
    { label: "T - 0h", date: "30 Jul 2024 (02:00 IST)", rain: "372 mm", status: "Catastrophic Cloudburst / Failure", severity: "critical" },
    { label: "T + 12h", date: "30 Jul 2024 (14:00 IST)", rain: "92 mm", status: "Search, Rescue & Corridor Evacuation", severity: "relief" },
  ];

  const hotspots: Hotspot[] = [
    { id: "mundakkai", name: "Mundakkai Debris Flow Zone", lat: 11.5300, lon: 76.1820, baseRadius: 1800, desc: "Mass flow epicenter along Iruvaipuzha river course" },
    { id: "chooralmala", name: "Chooralmala Sector", lat: 11.5381, lon: 76.1772, baseRadius: 1600, desc: "Critical settlement shear incline & bridge destruction zone" },
    { id: "meppadi", name: "Meppadi Escarpment", lat: 11.5518, lon: 76.1265, baseRadius: 1400, desc: "Steep tea plantation slopes with high pore pressure" },
    { id: "vythiri", name: "Vythiri Ghat Pass", lat: 11.5524, lon: 76.0425, baseRadius: 1500, desc: "National Highway corridor prone to rockfall and debris slips" },
    { id: "bathery", name: "Sulthan Bathery Plateau", lat: 11.6628, lon: 76.2570, baseRadius: 1200, desc: "Stable tableland terrain with deep lateritic profile" },
    { id: "kalpetta", name: "Kalpetta District Core", lat: 11.6050, lon: 76.0820, baseRadius: 1100, desc: "Civil administration command hub & emergency shelters" },
  ];

  // Calculate timeline-dependent risk for each hotspot
  const getTimelineProperties = (spotId: string, step: number) => {
    if (spotId === "bathery" || spotId === "kalpetta") {
      return { color: "#10b981", risk: step === 2 ? "Low 24%" : "Safe 18%", radiusMultiplier: 0.8 };
    }
    if (spotId === "vythiri") {
      if (step === 0) return { color: "#10b981", risk: "Safe 28%", radiusMultiplier: 0.7 };
      if (step === 1) return { color: "#f59e0b", risk: "Watch 62%", radiusMultiplier: 1.0 };
      if (step === 2) return { color: "#f97316", risk: "Severe 79%", radiusMultiplier: 1.3 };
      return { color: "#f59e0b", risk: "Monitoring 64%", radiusMultiplier: 1.0 };
    }
    // Chooralmala & Mundakkai & Meppadi
    if (step === 0) return { color: "#10b981", risk: "Pre-Monsoon 32%", radiusMultiplier: 0.8 };
    if (step === 1) return { color: "#f59e0b", risk: "Saturated Watch 68%", radiusMultiplier: 1.1 };
    if (step === 2) return { color: "#ef4444", risk: "Critical Failure 96%", radiusMultiplier: 1.5 };
    return { color: "#dc2626", risk: "Disaster Zone 88%", radiusMultiplier: 1.2 };
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    import("leaflet").then((L) => {
      if (!leafletMap.current && mapRef.current) {
        const map = L.map(mapRef.current, {
          zoomControl: false,
        }).setView([11.55, 76.15], 11);

        const satelliteLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { attribution: "Esri World Imagery", maxZoom: 17 }
        );

        const osmLayer = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          { attribution: "OpenStreetMap Contributors", maxZoom: 18 }
        );

        const labelsLayer = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
          { subdomains: "abcd", maxZoom: 17 }
        );

        satelliteLayer.addTo(map);
        labelsLayer.addTo(map);
        L.control.zoom({ position: "bottomright" }).addTo(map);

        layersRef.current = { satellite: satelliteLayer, osm: osmLayer };
        leafletMap.current = map;
      }

      // Re-draw circles when timeline step changes
      if (leafletMap.current) {
        circlesRef.current.forEach((layer) => layer.remove());
        circlesRef.current = [];

        hotspots.forEach((spot) => {
          const { color, risk, radiusMultiplier } = getTimelineProperties(spot.id, timelineStep);
          const circle = L.circle([spot.lat, spot.lon], {
            radius: spot.baseRadius * radiusMultiplier,
            color: color,
            fillColor: color,
            fillOpacity: 0.38,
            weight: 2,
          })
            .addTo(leafletMap.current)
            .bindPopup(
              `<div style="font-family: monospace; padding: 6px; color: #09090b;">
                <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 800;">${spot.name}</h4>
                <p style="margin: 2px 0; font-size: 11px; font-weight: bold; color: ${color};">
                  Timeline Status: ${risk}
                </p>
                <p style="margin: 4px 0 0; font-size: 10px; color: #52525b; line-height: 1.3;">
                  ${spot.desc}
                </p>
              </div>`
            );

          const dot = L.circleMarker([spot.lat, spot.lon], {
            radius: 5,
            color: "#ffffff",
            fillColor: color,
            fillOpacity: 1.0,
            weight: 2,
          }).addTo(leafletMap.current);

          circlesRef.current.push(circle, dot);
        });
      }
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [isOpen, timelineStep]);

  // Handle Layer Toggle
  const switchLayer = (type: "satellite" | "osm") => {
    if (!leafletMap.current || !layersRef.current.satellite || !layersRef.current.osm) return;
    if (type === "satellite") {
      leafletMap.current.removeLayer(layersRef.current.osm);
      layersRef.current.satellite.addTo(leafletMap.current);
    } else {
      leafletMap.current.removeLayer(layersRef.current.satellite);
      layersRef.current.osm.addTo(leafletMap.current);
    }
    setActiveLayer(type);
  };

  // Fly to sector
  const flyToSector = (lat: number, lon: number, zoom: number = 13) => {
    if (leafletMap.current) {
      leafletMap.current.flyTo([lat, lon], zoom, { duration: 1.2 });
    }
  };

  // Timeline Auto-Player
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineStep((prev) => (prev >= 3 ? 0 : prev + 1));
      }, 2200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  if (!isOpen) return null;

  const currentMilestone = timelineMilestones[timelineStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-6xl rounded-2xl p-5 md:p-7 shadow-2xl border border-zinc-200 flex flex-col h-[92vh] text-zinc-900">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-zinc-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black">
              <Map className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-black font-mono uppercase tracking-tight">
                  Wayanad GIS Telemetry Radar
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-zinc-500 font-mono">
                SRTM 30m Topography // Sentinel-2 Reflectance // Real-time Ingestion
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Map Layer Switcher */}
            <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 border border-zinc-300 text-xs font-mono">
              <button
                onClick={() => switchLayer("satellite")}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                  activeLayer === "satellite"
                    ? "bg-white text-black font-semibold shadow-xs"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                <Satellite className="w-3.5 h-3.5" /> Satellite
              </button>
              <button
                onClick={() => switchLayer("osm")}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                  activeLayer === "osm"
                    ? "bg-white text-black font-semibold shadow-xs"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Topographic
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 flex items-center justify-center text-zinc-700 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hotspot Quick Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-b border-zinc-100 text-xs font-mono">
          <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider shrink-0">
            Sector Jump:
          </span>
          <button
            onClick={() => flyToSector(11.5381, 76.1772, 14)}
            className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Chooralmala (Fail Point)
          </button>
          <button
            onClick={() => flyToSector(11.5300, 76.1820, 14)}
            className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Mundakkai Epicenter
          </button>
          <button
            onClick={() => flyToSector(11.5518, 76.1265, 13)}
            className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Meppadi Escarpment
          </button>
          <button
            onClick={() => flyToSector(11.5524, 76.0425, 13)}
            className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Vythiri Ghat (NH 766)
          </button>
          <button
            onClick={() => flyToSector(11.6628, 76.2570, 12)}
            className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sulthan Bathery Safe Hub
          </button>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="relative flex-1 w-full rounded-xl overflow-hidden border border-zinc-300 my-2 shadow-inner">
          <div ref={mapRef} className="w-full h-full bg-zinc-900" />

          {/* Floating Telemetry Box on Map */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md p-3 rounded-lg border border-zinc-300 shadow-md text-xs font-mono max-w-xs pointer-events-none">
            <div className="text-[10px] uppercase font-bold text-zinc-400">Telemetry Feed</div>
            <div className="text-zinc-900 font-bold mt-0.5">{currentMilestone.status}</div>
            <div className="text-[11px] text-zinc-600 mt-1 flex justify-between">
              <span>Precipitation:</span>
              <strong className="text-black">{currentMilestone.rain}</strong>
            </div>
            <div className="text-[11px] text-zinc-600 flex justify-between">
              <span>Timestamp:</span>
              <span className="text-zinc-800">{currentMilestone.date}</span>
            </div>
          </div>
        </div>

        {/* 72-Hour Monsoon Timeline Player */}
        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 mt-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-7 h-7 rounded-md bg-black text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
                title={isPlaying ? "Pause timeline" : "Play disaster event progression"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setTimelineStep(0);
                }}
                className="w-7 h-7 rounded-md bg-zinc-200 text-zinc-700 hover:bg-zinc-300 flex items-center justify-center transition-colors"
                title="Reset timeline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-bold text-black uppercase tracking-wider ml-1">
                Monsoon 72-Hour Failure Progression (July 2024 Event)
              </span>
            </div>

            <div className="text-xs font-mono text-zinc-500">
              Active Milestone: <strong className="text-black">{currentMilestone.label} ({currentMilestone.date})</strong>
            </div>
          </div>

          {/* Stepped Timeline Progress Line */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {timelineMilestones.map((m, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsPlaying(false);
                  setTimelineStep(idx);
                }}
                className={`p-2 rounded-lg border text-left transition-all ${
                  timelineStep === idx
                    ? "bg-white border-black ring-1 ring-black shadow-xs"
                    : "bg-white/60 border-zinc-200 hover:bg-white text-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className={timelineStep === idx ? "text-black" : "text-zinc-700"}>{m.label}</span>
                  <span className="text-[10px] text-zinc-400">{m.rain}</span>
                </div>
                <div className="text-[10px] text-zinc-500 truncate mt-0.5 font-mono">{m.status}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
