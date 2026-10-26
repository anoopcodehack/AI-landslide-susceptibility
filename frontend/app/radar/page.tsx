"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { TacticalDock } from "@/components/TacticalDock";
import {
  Map,
  Satellite,
  Layers,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  MapPin,
  Activity,
  Compass,
  Shield,
} from "lucide-react";

interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  baseRadius: number;
  desc: string;
}

export default function RadarPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const layersRef = useRef<{ satellite?: any; osm?: any }>({});
  const circlesRef = useRef<any[]>([]);

  const [activeLayer, setActiveLayer] = useState<"satellite" | "osm">("satellite");
  const [timelineStep, setTimelineStep] = useState<number>(2);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

  const timelineMilestones = [
    { label: "T - 48h", date: "28 Jul 2024", rain: "45 mm", status: "Nominal Monsoon Baseline", severity: "stable" },
    { label: "T - 24h", date: "29 Jul 2024", rain: "185 mm", status: "Sustained Valley Saturation", severity: "watch" },
    { label: "T - 0h", date: "30 Jul 2024 (02:00 IST)", rain: "372 mm", status: "Catastrophic Cloudburst / Failure", severity: "critical" },
    { label: "T + 12h", date: "30 Jul 2024 (14:00 IST)", rain: "92 mm", status: "Search, Rescue & Relief Corridor", severity: "relief" },
  ];

  const hotspots: Hotspot[] = [
    { id: "mundakkai", name: "Mundakkai Debris Flow Zone", lat: 11.5300, lon: 76.1820, baseRadius: 1800, desc: "Mass flow epicenter along Iruvaipuzha river course" },
    { id: "chooralmala", name: "Chooralmala Sector", lat: 11.5381, lon: 76.1772, baseRadius: 1600, desc: "Critical settlement shear incline & bridge destruction zone" },
    { id: "meppadi", name: "Meppadi Escarpment", lat: 11.5518, lon: 76.1265, baseRadius: 1400, desc: "Steep tea plantation slopes with high pore pressure" },
    { id: "vythiri", name: "Vythiri Ghat Pass", lat: 11.5524, lon: 76.0425, baseRadius: 1500, desc: "National Highway corridor prone to rockfall and debris slips" },
    { id: "bathery", name: "Sulthan Bathery Plateau", lat: 11.6628, lon: 76.2570, baseRadius: 1200, desc: "Stable tableland terrain with deep lateritic profile" },
    { id: "kalpetta", name: "Kalpetta District Core", lat: 11.6050, lon: 76.0820, baseRadius: 1100, desc: "Civil administration command hub & emergency shelters" },
  ];

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
    if (step === 0) return { color: "#10b981", risk: "Pre-Monsoon 32%", radiusMultiplier: 0.8 };
    if (step === 1) return { color: "#f59e0b", risk: "Saturated Watch 68%", radiusMultiplier: 1.1 };
    if (step === 2) return { color: "#ef4444", risk: "Critical Failure 96%", radiusMultiplier: 1.5 };
    return { color: "#dc2626", risk: "Disaster Zone 88%", radiusMultiplier: 1.2 };
  };

  useEffect(() => {
    if (!mapRef.current) return;

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
  }, [timelineStep]);

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

  const flyToSector = (lat: number, lon: number, zoom: number = 13) => {
    if (leafletMap.current) {
      leafletMap.current.flyTo([lat, lon], zoom, { duration: 1.2 });
    }
  };

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

  const currentMilestone = timelineMilestones[timelineStep];

  return (
    <div className="min-h-screen flex flex-col justify-between w-full bg-white text-zinc-900">
      {/* Sticky Coder Navbar */}
      <Navbar
        activeTab="radar"
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
            GIS Radar Telemetry
          </span>
        </div>

        {/* Page Header Bar */}
        <div className="flex flex-wrap items-center justify-between pb-8 border-b border-zinc-200 gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-xs font-mono font-semibold text-zinc-800 mb-3">
              <MapPin className="w-3.5 h-3.5 text-black" />
              <span>Spatial Telemetry & Hazard Reconnaissance</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black">
              Wayanad GIS Radar.
              <span className="w-3 h-6 md:h-7 bg-black inline-block ml-1.5 align-middle" />
            </h1>
            <p className="text-base text-zinc-600 max-w-3xl mt-3 font-normal leading-relaxed">
              Real-time interactive geospatial observation engine combining NASA SRTM 30m digital elevation,
              Sentinel-2 surface reflectance, and IMD gridded telemetry across the Western Ghats escarpment.
            </p>
          </div>

          {/* Layer Selector */}
          <div className="flex items-center bg-zinc-100 rounded-lg p-1 border border-zinc-300 text-xs font-mono">
            <button
              onClick={() => switchLayer("satellite")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                activeLayer === "satellite"
                  ? "bg-white text-black font-bold shadow-xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <Satellite className="w-4 h-4" /> Satellite Imagery
            </button>
            <button
              onClick={() => switchLayer("osm")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                activeLayer === "osm"
                  ? "bg-white text-black font-bold shadow-xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <Layers className="w-4 h-4" /> Topographic Contour
            </button>
          </div>
        </div>

        {/* Hotspot Sector Jump Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-4 text-xs font-mono">
          <span className="text-zinc-400 font-semibold uppercase text-[11px] tracking-wider shrink-0">
            Sector Jump:
          </span>
          <button
            onClick={() => flyToSector(11.5381, 76.1772, 14)}
            className="px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 text-zinc-800 transition-colors shrink-0 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-red-500" /> Chooralmala (Fail Point)
          </button>
          <button
            onClick={() => flyToSector(11.5300, 76.1820, 14)}
            className="px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 text-zinc-800 transition-colors shrink-0 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-red-500" /> Mundakkai Epicenter
          </button>
          <button
            onClick={() => flyToSector(11.5518, 76.1265, 13)}
            className="px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 text-zinc-800 transition-colors shrink-0 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Meppadi Escarpment
          </button>
          <button
            onClick={() => flyToSector(11.5524, 76.0425, 13)}
            className="px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 text-zinc-800 transition-colors shrink-0 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Vythiri Ghat (NH 766)
          </button>
          <button
            onClick={() => flyToSector(11.6628, 76.2570, 12)}
            className="px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-300 text-zinc-800 transition-colors shrink-0 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Sulthan Bathery Safe Hub
          </button>
        </div>

        {/* Full-Width Leaflet Map Canvas */}
        <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden border border-zinc-300 shadow-md mb-8">
          <div ref={mapRef} className="w-full h-full bg-zinc-950" />

          {/* Floating Telemetry Box */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-zinc-300 shadow-lg text-xs font-mono max-w-sm pointer-events-none">
            <div className="text-[10px] uppercase font-bold text-zinc-400">Telemetry Feed // Active Window</div>
            <div className="text-zinc-900 font-bold text-sm mt-1">{currentMilestone.status}</div>
            <div className="text-xs text-zinc-600 mt-2 flex justify-between border-t border-zinc-200 pt-2">
              <span>Accumulated Rain:</span>
              <strong className="text-black">{currentMilestone.rain}</strong>
            </div>
            <div className="text-xs text-zinc-600 flex justify-between pt-1">
              <span>Timestamp:</span>
              <span className="text-zinc-800 font-bold">{currentMilestone.date}</span>
            </div>
          </div>
        </div>

        {/* 72-Hour Monsoon Progression Player */}
        <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-200 mb-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-lg bg-black text-white hover:bg-zinc-800 flex items-center justify-center transition-colors shadow-xs"
                title={isPlaying ? "Pause timeline" : "Play disaster event progression"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setTimelineStep(0);
                }}
                className="w-9 h-9 rounded-lg bg-zinc-200 text-zinc-700 hover:bg-zinc-300 flex items-center justify-center transition-colors"
                title="Reset timeline"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div>
                <span className="text-sm font-mono font-bold text-black uppercase tracking-wider block">
                  Monsoon 72-Hour Failure Progression (July 2024 Event)
                </span>
                <span className="text-xs text-zinc-500 font-sans">
                  Scrub timeline to observe dynamic pore-pressure and shear failure propagation
                </span>
              </div>
            </div>

            <div className="text-xs font-mono text-zinc-600 bg-white px-3 py-1.5 rounded-md border border-zinc-300">
              Active Milestone: <strong className="text-black">{currentMilestone.label} ({currentMilestone.date})</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {timelineMilestones.map((m, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsPlaying(false);
                  setTimelineStep(idx);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  timelineStep === idx
                    ? "bg-white border-black ring-2 ring-black shadow-sm"
                    : "bg-white/70 border-zinc-200 hover:bg-white text-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                  <span className={timelineStep === idx ? "text-black text-sm" : "text-zinc-800"}>{m.label}</span>
                  <span className="text-xs text-zinc-500 font-semibold">{m.rain}</span>
                </div>
                <div className="text-xs text-zinc-600 font-sans font-medium line-clamp-1">{m.status}</div>
                <div className="text-[10px] text-zinc-400 font-mono mt-2">{m.date}</div>
              </button>
            ))}
          </div>
        </div>
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
