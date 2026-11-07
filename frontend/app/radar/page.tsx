"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { Navbar } from "@/components/Navbar";
import { TacticalDock } from "@/components/TacticalDock";
import { API_BASE_URL } from "@/lib/api";
import { useAlerts } from "@/components/AlertCenter";
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
  Radio,
  Crosshair,
  Maximize2,
  Navigation,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Thermometer,
  Wind,
  RefreshCw,
} from "lucide-react";

interface LiveWeatherTelemetry {
  station_name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  current_precipitation_mm: number;
  past_24h_rainfall_mm: number;
  temperature_c: number;
  relative_humidity_pct: number;
  wind_speed_kmh: number;
  cloud_cover_pct: number;
  weather_condition: string;
  source: string;
  live_susceptibility_score: number;
  live_risk_category: string;
  evacuation_alert: boolean;
  kerala_alert_color?: string;
}

interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number;
  slope: number;
  baseRadius: number;
  desc: string;
  corridor: string;
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
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [hoveredWaypoint, setHoveredWaypoint] = useState<any | null>(null);

  const { triggerAlert } = useAlerts();

  // Live real-time AWS weather telemetry (Section 3 Future Flow of Research Poster)
  const [liveWeather, setLiveWeather] = useState<LiveWeatherTelemetry>({
    station_name: "Wayanad AWS #04 (Kalpetta / Meppadi)",
    latitude: 11.605,
    longitude: 76.082,
    timestamp: new Date().toISOString(),
    current_precipitation_mm: 0.1,
    past_24h_rainfall_mm: 2.8,
    temperature_c: 24.6,
    relative_humidity_pct: 74,
    wind_speed_kmh: 8.2,
    cloud_cover_pct: 35,
    weather_condition: "Scattered Cloud / Mild Breeze",
    source: "Open-Meteo Synoptic API & AWS Mesh",
    live_susceptibility_score: 0.084,
    live_risk_category: "Low / Baseline Stable",
    evacuation_alert: false,
    kerala_alert_color: "GREEN",
  });
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);

  const syncLiveWeather = async () => {
    setWeatherLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/weather/live`);
      if (res.ok) {
        const data: LiveWeatherTelemetry = await res.json();
        setLiveWeather(data);
        setBackendOnline(true);
      }
    } catch (err) {
      console.warn("Backend live weather endpoint unavailable, using cached telemetry fallback");
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    syncLiveWeather();
  }, []);

  const timelineMilestones = [
    {
      label: "T - 48h",
      date: "28 Jul 2024",
      rain: "45 mm",
      status: "Nominal Monsoon Baseline",
      severity: "stable",
      badge: "BASELINE",
      summary: "Pre-monsoon soil pore pressure at baseline capacity. Subterranean drainage operational.",
    },
    {
      label: "T - 24h",
      date: "29 Jul 2024",
      rain: "185 mm",
      status: "Sustained Valley Saturation",
      severity: "watch",
      badge: "SATURATION WATCH",
      summary: "Lateritic cap reaches 92% pore water saturation. Shear strength along bedrock degrades.",
    },
    {
      label: "T - 0h",
      date: "30 Jul 2024 (02:00 IST)",
      rain: "372 mm",
      status: "Catastrophic Cloudburst / Failure",
      severity: "critical",
      badge: "CRITICAL FAILURE",
      summary: "Vellarimala scarp hydro-mechanical collapse. 1.85M m³ boulder slurry surges down valley.",
    },
    {
      label: "T + 12h",
      date: "30 Jul 2024 (14:00 IST)",
      rain: "92 mm",
      status: "Search, Rescue & Relief Corridor",
      severity: "relief",
      badge: "RELIEF PHASE",
      summary: "NDRF/Army Bailey bridge mobilization across Chooralmala river gap. Relief transit to Kalpetta.",
    },
    {
      label: "LIVE TODAY",
      date: liveWeather
        ? new Date(liveWeather.timestamp).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) + " (Live AWS)"
        : "Today (Live AWS)",
      rain: `${liveWeather.past_24h_rainfall_mm.toFixed(1)} mm`,
      status: `Real-Time AWS #${liveWeather.station_name.split(" ")[2] || "04"}`,
      severity: "live",
      badge: "REAL-TIME AWS",
      summary: `Atmosphere: ${liveWeather.weather_condition}, ${liveWeather.temperature_c}°C, ${liveWeather.relative_humidity_pct}% RH. Dynamic ML slope safety index: ${(liveWeather.live_susceptibility_score * 100).toFixed(1)}%.`,
    },
  ];

  const hotspots: Hotspot[] = [
    {
      id: "mundakkai",
      name: "Mundakkai Debris Flow Epicenter",
      lat: 11.5300,
      lon: 76.1820,
      elevation: 1180,
      slope: 39.5,
      baseRadius: 1800,
      desc: "Mass flow initiation point along Iruvaipuzha headwaters; weathered lateritic cap collapse.",
      corridor: "Route 1 -> Meppadi Relief Transit Hub (6.4 km)",
    },
    {
      id: "chooralmala",
      name: "Chooralmala Sector",
      lat: 11.5381,
      lon: 76.1772,
      elevation: 940,
      slope: 38.0,
      baseRadius: 1600,
      desc: "Settlement shear zone; high pore pressure collapse with bridge severance.",
      corridor: "Bailey Bridge Emergency Span -> Kalpetta HQ (14 km)",
    },
    {
      id: "meppadi",
      name: "Meppadi Escarpment",
      lat: 11.5518,
      lon: 76.1265,
      elevation: 1050,
      slope: 28.5,
      baseRadius: 1400,
      desc: "Steep tea plantation slopes with shallow translational shear risk.",
      corridor: "Meppadi-Kalpetta Arterial Highway (Open)",
    },
    {
      id: "vythiri",
      name: "Vythiri Ghat Pass (NH-766)",
      lat: 11.5524,
      lon: 76.0425,
      elevation: 1220,
      slope: 41.2,
      baseRadius: 1500,
      desc: "National Highway transportation spine prone to wedge failure and rockfalls.",
      corridor: "NH-766 Interstate Freight Corridor",
    },
    {
      id: "bathery",
      name: "Sulthan Bathery Tableland",
      lat: 11.6628,
      lon: 76.2570,
      elevation: 840,
      slope: 11.4,
      baseRadius: 1200,
      desc: "Stable tableland terrain with deep lateritic soil and gentle plateau profile.",
      corridor: "Primary Civil Evacuation Camp Base",
    },
    {
      id: "kalpetta",
      name: "Kalpetta District Core",
      lat: 11.6050,
      lon: 76.0820,
      elevation: 780,
      slope: 14.2,
      baseRadius: 1100,
      desc: "District Emergency Operations Centre & administrative coordination hub.",
      corridor: "Emergency Operations Centre (EOC)",
    },
  ];

  const channelWaypoints = [
    {
      name: "1. Vellarimala Failure Apex",
      subtitle: "Scar Initiation // 42° Escarpment",
      lat: 11.528,
      lon: 76.142,
      elevation: 1480,
      distKm: 0.0,
      etaMinutes: 0.0,
      velocityMs: 24.5,
      pressureKPa: 142,
      status: "IMMEDIATE DEVASTATION",
      statusColor: "#ef4444",
    },
    {
      name: "2. Upper Punchirimattam Estate",
      subtitle: "Tea Worker Settlement Axis",
      lat: 11.534,
      lon: 76.138,
      elevation: 1220,
      distKm: 1.2,
      etaMinutes: 3.4,
      velocityMs: 19.2,
      pressureKPa: 118,
      status: "IMMEDIATE DEVASTATION",
      statusColor: "#ef4444",
    },
    {
      name: "3. Mundakkai Village & Market",
      subtitle: "Primary Commercial Cluster & Bridge",
      lat: 11.542,
      lon: 76.131,
      elevation: 980,
      distKm: 2.3,
      etaMinutes: 7.1,
      velocityMs: 16.8,
      pressureKPa: 89,
      status: "CRITICAL RUNOUT",
      statusColor: "#f97316",
    },
    {
      name: "4. Chooralmala Town & River Bridge",
      subtitle: "Valley Floor Inundation Center (9° Slope)",
      lat: 11.552,
      lon: 76.126,
      elevation: 790,
      distKm: 4.2,
      etaMinutes: 14.2,
      velocityMs: 13.4,
      pressureKPa: 68,
      status: "ACTIVE INUNDATION",
      statusColor: "#eab308",
    },
    {
      name: "5. Attamala Valley Confluence",
      subtitle: "Downstream Dissipation & Sedimentation",
      lat: 11.565,
      lon: 76.115,
      elevation: 680,
      distKm: 6.1,
      etaMinutes: 22.5,
      velocityMs: 8.5,
      pressureKPa: 31,
      status: "MONITORED MARGIN",
      statusColor: "#10b981",
    },
  ];

  const getTimelineProperties = (spotId: string, step: number) => {
    // Step 4: LIVE TODAY (Dynamic assessment using live Open-Meteo AWS weather telemetry)
    if (step === 4) {
      const liveRain = liveWeather.past_24h_rainfall_mm;
      const liveScorePct = Math.round(liveWeather.live_susceptibility_score * 100);
      if (spotId === "bathery" || spotId === "kalpetta") {
        return { color: "#10b981", risk: `Nominal ${Math.max(2, liveScorePct - 5)}% (Live Safe)`, radiusMultiplier: 0.65 };
      }
      if (spotId === "vythiri") {
        return { color: "#10b981", risk: `Stable ${Math.max(5, liveScorePct + 2)}% (Live Pass)`, radiusMultiplier: 0.75 };
      }
      if (spotId === "meppadi") {
        return { color: "#10b981", risk: `Safe ${Math.max(4, liveScorePct)}% (Live)`, radiusMultiplier: 0.7 };
      }
      // Mundakkai & Chooralmala: low rainfall today means drained pore pressure!
      return {
        color: "#10b981",
        risk: `Low ${Math.max(8, liveScorePct + 6)}% (Post-Monsoon Drained // ${liveRain.toFixed(1)}mm rain)`,
        radiusMultiplier: 0.8,
      };
    }

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

  // 1. Initialize Leaflet Map ONCE on mount
  useEffect(() => {
    if (!mapRef.current) return;
    let resizeObserver: ResizeObserver | null = null;

    import("leaflet").then((L) => {
      if (!mapRef.current || leafletMap.current) return;

      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([11.55, 76.15], 11);

      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Esri World Imagery",
          maxZoom: 18,
          keepBuffer: 6,
          updateWhenIdle: false,
        }
      );

      const osmLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "OpenStreetMap Contributors",
          maxZoom: 18,
          keepBuffer: 6,
          updateWhenIdle: false,
        }
      );

      const labelsLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 18, keepBuffer: 6 }
      );

      satelliteLayer.addTo(map);
      labelsLayer.addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      layersRef.current = { satellite: satelliteLayer, osm: osmLayer };
      leafletMap.current = map;

      // Track cursor coordinates dynamically across satellite map
      map.on("mousemove", (e: any) => {
        setCursorCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
      });
      map.on("mouseout", () => {
        setCursorCoords(null);
      });

      // Default selected hotspot
      setSelectedHotspot(hotspots[1]); // Chooralmala

      // Robust multiple invalidateSize calls to eliminate initial black tiles
      [50, 150, 300, 600, 1200].forEach((ms) => {
        setTimeout(() => {
          if (leafletMap.current) {
            leafletMap.current.invalidateSize();
          }
        }, ms);
      });

      // Add Iruvaipuzha Debris Runout Polyline (Idea 2)
      const debrisAxis: [number, number][] = [
        [11.528, 76.142], // Vellarimala Apex
        [11.534, 76.138], // Punchirimattam
        [11.542, 76.131], // Mundakkai
        [11.552, 76.126], // Chooralmala
        [11.565, 76.115], // Attamala
      ];

      L.polyline(debrisAxis, {
        color: "#ef4444",
        weight: 5,
        opacity: 0.9,
        dashArray: "6, 6",
      })
        .addTo(map)
        .bindTooltip(
          "<div style='font-family: monospace; font-size: 11px; font-weight: bold; color: #ef4444;'>🌊 Iruvaipuzha High-Momentum Debris Channel (6.1 km Runout Corridor)</div>",
          { direction: "top", opacity: 0.95, className: "coder-map-tooltip" }
        );

      // Add interactive waypoint markers along the debris corridor
      channelWaypoints.forEach((wp) => {
        const wpMarker = L.circleMarker([wp.lat, wp.lon], {
          radius: 6,
          color: "#ffffff",
          fillColor: wp.statusColor,
          fillOpacity: 1.0,
          weight: 2,
        }).addTo(map);

        const wpHtml = `
          <div style="font-family: monospace; font-size: 11px; line-height: 1.45; min-width: 220px;">
            <div style="font-weight: 800; font-size: 12px; color: ${wp.statusColor}; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 3px; margin-bottom: 4px;">
              🌊 ${wp.name}
            </div>
            <div style="color: #cbd5e1; font-size: 10px; margin-bottom: 3px;">${wp.subtitle}</div>
            <div style="display: flex; justify-content: space-between; color: #ffffff; font-weight: bold; margin-bottom: 3px;">
              <span>ETA: ${wp.etaMinutes === 0 ? "T = 0 (Trigger)" : `T + ${wp.etaMinutes} min`}</span>
              <span style="color: #fca5a5;">${wp.velocityMs} m/s</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: #a1a1aa; font-size: 10px; margin-bottom: 4px;">
              <span>Elevation: <strong style="color: #fff;">${wp.elevation} m</strong></span>
              <span>Distance: <strong style="color: #fff;">+${wp.distKm} km</strong></span>
            </div>
            <div style="background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 4px; padding: 3px 6px; font-size: 9px; color: #fca5a5; font-weight: bold; text-align: center;">
              Impact: ${wp.pressureKPa} kPa • ${wp.status}
            </div>
          </div>
        `;

        wpMarker.bindTooltip(wpHtml, {
          direction: "top",
          offset: [0, -10],
          opacity: 0.98,
          className: "coder-map-tooltip",
        });

        wpMarker.on("mouseover", () => {
          setHoveredWaypoint(wp);
        });
        wpMarker.on("mouseout", () => {
          setHoveredWaypoint(null);
        });
      });

      // Auto-refresh tiles whenever container changes dimensions (e.g. flexbox layout expansion)
      resizeObserver = new ResizeObserver(() => {
        if (map) {
          map.invalidateSize();
        }
      });
      if (mapRef.current) {
        resizeObserver.observe(mapRef.current);
      }
    });

    const handleResize = () => {
      if (leafletMap.current) {
        leafletMap.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("focus", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("focus", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // 2. Update Hotspot Circles whenever timelineStep changes without destroying or reloading the map
  useEffect(() => {
    if (!leafletMap.current) return;

    import("leaflet").then((L) => {
      if (!leafletMap.current) return;

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
        }).addTo(leafletMap.current);

        const dot = L.circleMarker([spot.lat, spot.lon], {
          radius: 6,
          color: "#ffffff",
          fillColor: color,
          fillOpacity: 1.0,
          weight: 2.5,
        }).addTo(leafletMap.current);

        // Rich Tactical Hover Tooltip
        const tooltipHtml = `
          <div style="font-family: monospace; font-size: 11px; line-height: 1.45; min-width: 220px;">
            <div style="font-weight: 800; font-size: 12px; color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 3px; margin-bottom: 4px;">
              📍 ${spot.name}
            </div>
            <div style="color: ${color}; font-weight: bold; font-size: 11px; margin-bottom: 3px;">
              ● Timeline Status: ${risk}
            </div>
            <div style="display: flex; justify-content: space-between; color: #a1a1aa; font-size: 10px; margin-bottom: 3px;">
              <span>Elevation: <strong style="color: #fff;">${spot.elevation} m</strong></span>
              <span>Slope: <strong style="color: #fff;">${spot.slope}° Shear</strong></span>
            </div>
            <div style="color: #71717a; font-size: 9px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 3px; margin-top: 2px;">
              Corridor: ${spot.corridor}
            </div>
          </div>
        `;

        circle.bindTooltip(tooltipHtml, {
          direction: "top",
          offset: [0, -10],
          opacity: 0.98,
          className: "coder-map-tooltip",
        });

        dot.bindTooltip(tooltipHtml, {
          direction: "top",
          offset: [0, -10],
          opacity: 0.98,
          className: "coder-map-tooltip",
        });

        // Instant mouse hover activates sector inspection
        circle.on("mouseover", () => {
          setSelectedHotspot(spot);
        });
        dot.on("mouseover", () => {
          setSelectedHotspot(spot);
        });

        circle.on("click", () => {
          setSelectedHotspot(spot);
        });
        dot.on("click", () => {
          setSelectedHotspot(spot);
        });

        circlesRef.current.push(circle, dot);
      });

      leafletMap.current.invalidateSize();
    });
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

  const flyToSector = (spot: Hotspot, zoom: number = 13) => {
    setSelectedHotspot(spot);
    if (leafletMap.current) {
      leafletMap.current.flyTo([spot.lat, spot.lon], zoom, { duration: 1.2 });
    }
  };

  const handleStepChange = (newStep: number) => {
    setIsPlaying(false);
    setTimelineStep(newStep);
    if (leafletMap.current) {
      leafletMap.current.invalidateSize();
    }

    if (newStep === 2) {
      triggerAlert({
        level: "RED",
        title: "KSDMA PEAK HAZARD // EVACUATION DIRECTIVE",
        message: "372mm cloudburst saturation detected. High-momentum debris surge active down Iruvaipuzha channel (Chooralmala & Mundakkai).",
        sector: "Chooralmala & Mundakkai (6.1 km Axis)",
        actionUrl: "/radar",
      });
    } else if (newStep === 1) {
      triggerAlert({
        level: "ORANGE",
        title: "Civil Defense Watch // Valley Saturation",
        message: "185mm sustained valley rainfall. Soil pore-pressure reaches 92% of critical shear capacity.",
        sector: "Wayanad Escarpments",
        actionUrl: "/radar",
      });
    } else if (newStep === 4) {
      triggerAlert({
        level: "GREEN",
        title: "Live Synoptic Telemetry // Nominal Envelope",
        message: `Real-time AWS #04 feed active (${liveWeather.past_24h_rainfall_mm.toFixed(1)}mm rain). Pore pressure stable across all 6 sectors.`,
        sector: "Live AWS Mesh #04",
        actionUrl: "/radar",
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineStep((prev) => (prev >= 4 ? 0 : prev + 1));
      }, 2400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const currentMilestone = timelineMilestones[timelineStep];

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
              Wayanad GIS Telemetry Radar
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px]">
            <span>CRS: <strong className="text-black">EPSG:32643 (UTM 43N)</strong></span>
            <span>Resolution: <strong className="text-black">NASA SRTM 30m</strong></span>
          </div>
        </div>

        {/* Page Header Bar */}
        <div className="flex flex-wrap items-center justify-between pb-6 border-b border-zinc-200 gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-xs font-mono font-semibold text-zinc-800 mb-2.5">
              <Crosshair className="w-3.5 h-3.5 text-black" />
              <span>Spatial Telemetry & Hazard Reconnaissance</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-black">
              Wayanad GIS Radar.
              <span className="w-3 h-6 md:h-7 bg-black inline-block ml-1.5 align-middle" />
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 max-w-3xl mt-2 font-normal leading-relaxed">
              Tactical geospatial observation platform integrating NASA SRTM digital elevation with Sentinel-2
              spectral reflectance to identify vulnerable shear corridors across Wayanad District.
            </p>
          </div>

          {/* Layer Selector */}
          <div className="flex items-center bg-zinc-100 rounded-lg p-1 border border-zinc-300 text-xs font-mono">
            <button
              onClick={() => switchLayer("satellite")}
              className={`px-3.5 py-1.5 rounded-md flex items-center gap-2 transition-all ${
                activeLayer === "satellite"
                  ? "bg-white text-black font-bold shadow-xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <Satellite className="w-3.5 h-3.5" /> Satellite Imagery
            </button>
            <button
              onClick={() => switchLayer("osm")}
              className={`px-3.5 py-1.5 rounded-md flex items-center gap-2 transition-all ${
                activeLayer === "osm"
                  ? "bg-white text-black font-bold shadow-xs"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Topographic Contour
            </button>
          </div>
        </div>

        {/* Hotspot Sector Jump Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 text-xs font-mono">
          <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider shrink-0">
            Sector Focus:
          </span>
          {hotspots.map((spot) => {
            const isCurrent = selectedHotspot?.id === spot.id;
            return (
              <button
                key={spot.id}
                onClick={() => flyToSector(spot, 14)}
                className={`px-3 py-1.5 rounded-lg border text-zinc-800 transition-all shrink-0 flex items-center gap-2 ${
                  isCurrent
                    ? "bg-black text-white border-black font-bold shadow-2xs"
                    : "bg-zinc-50 hover:bg-zinc-100 border-zinc-300"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    spot.id === "mundakkai" || spot.id === "chooralmala"
                      ? "bg-red-500"
                      : spot.id === "vythiri" || spot.id === "meppadi"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
                <span className={isCurrent ? "text-white" : "text-zinc-800"}>{spot.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Map + Side Telemetry Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
          {/* Map Container (Span 8) */}
          <div className="lg:col-span-8 relative w-full h-[62vh] min-h-[480px] rounded-2xl overflow-hidden border border-zinc-300 shadow-md">
            <div ref={mapRef} className="w-full h-full min-h-[480px] bg-zinc-950" />

            {/* Corner Crosshairs */}
            <div className="absolute top-2 left-2 text-white/40 pointer-events-none font-mono text-[10px] select-none">
              + 11.90°N / 75.80°E
            </div>
            <div className="absolute top-2 right-2 text-white/40 pointer-events-none font-mono text-[10px] select-none">
              + 11.90°N / 76.30°E
            </div>
            <div className="absolute bottom-2 left-2 text-white/40 pointer-events-none font-mono text-[10px] select-none">
              + 11.50°N / 75.80°E
            </div>

            {/* Floating Top Left Telemetry Tag */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-zinc-300 shadow-md text-xs font-mono max-w-xs pointer-events-none z-[400]">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400 mb-0.5">
                <span>Telemetry Feed // {timelineStep === 4 ? "Live Telemetry" : "Active Window"}</span>
                {timelineStep === 4 && (
                  <span className="flex items-center gap-1 text-purple-700 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="text-zinc-900 font-bold text-xs sm:text-sm mt-0.5">{currentMilestone.status}</div>
              <div className="text-xs text-zinc-600 mt-1.5 flex justify-between border-t border-zinc-200 pt-1.5">
                <span>Rainfall Influx:</span>
                <strong className="text-black">{currentMilestone.rain}</strong>
              </div>
              <div className="text-xs text-zinc-600 flex justify-between pt-0.5">
                <span>Timestamp:</span>
                <span className="text-zinc-800 font-bold">{currentMilestone.date}</span>
              </div>
              {timelineStep === 4 && (
                <div className="text-xs text-zinc-600 flex justify-between border-t border-zinc-100 pt-1 mt-1 text-[11px]">
                  <span>Live Atmospheric:</span>
                  <span className="text-emerald-700 font-bold">{liveWeather.temperature_c}°C • {liveWeather.relative_humidity_pct}% RH</span>
                </div>
              )}
            </div>

            {/* Live Cursor Coordinate HUD Badge */}
            <div className="absolute bottom-3 left-3 bg-zinc-950/85 text-white border border-zinc-700/80 px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-2.5 backdrop-blur-md pointer-events-none shadow-md z-[400]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {cursorCoords
                  ? `LAT: ${cursorCoords.lat.toFixed(4)}° N • LON: ${cursorCoords.lon.toFixed(4)}° E`
                  : "+ 11.5500° N • 76.1500° E"}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-emerald-400 font-semibold">UTM Zone 43N</span>
            </div>
          </div>

          {/* Right Side Telemetry HUD Drawer (Span 4) */}
          <div className="lg:col-span-4 bg-zinc-50 rounded-2xl border border-zinc-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <span className="text-xs font-mono font-bold uppercase text-black flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-black" />
                <span>Sector Telemetry Inspector</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                Live Hover Active
              </span>
            </div>

            {selectedHotspot ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-base font-black text-black font-mono">
                    {selectedHotspot.name}
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 font-sans leading-relaxed">
                    {selectedHotspot.desc}
                  </p>
                </div>

                {/* Technical Coordinates Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                  <div className="p-3 bg-white rounded-lg border border-zinc-200">
                    <span className="text-[10px] text-zinc-400 block uppercase">LATITUDE</span>
                    <strong className="text-black">{selectedHotspot.lat.toFixed(4)}° N</strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-zinc-200">
                    <span className="text-[10px] text-zinc-400 block uppercase">LONGITUDE</span>
                    <strong className="text-black">{selectedHotspot.lon.toFixed(4)}° E</strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-zinc-200">
                    <span className="text-[10px] text-zinc-400 block uppercase">ELEVATION</span>
                    <strong className="text-black">{selectedHotspot.elevation} m</strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-zinc-200">
                    <span className="text-[10px] text-zinc-400 block uppercase">SLOPE ANGLE</span>
                    <strong className="text-black">{selectedHotspot.slope}° Shear</strong>
                  </div>
                </div>

                {/* Evacuation Route Pill */}
                <div className="p-3 bg-white rounded-lg border border-zinc-200 text-xs font-mono">
                  <span className="text-[10px] text-zinc-400 block uppercase">DESIGNATED RELIEF CORRIDOR</span>
                  <div className="flex items-center gap-1.5 text-zinc-800 font-bold mt-1">
                    <Navigation className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>{selectedHotspot.corridor}</span>
                  </div>
                </div>

                {/* Action Link to Simulation */}
                <Link
                  href={`/simulation?sector=${selectedHotspot.id}&slope=${selectedHotspot.slope}&elevation=${selectedHotspot.elevation}`}
                  className="btn-coder-black w-full py-2.5 text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:bg-zinc-800"
                >
                  <span>Simulate {selectedHotspot.name.split(" ")[0]} in Studio</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            ) : (
              <p className="text-xs text-zinc-400 mt-4 font-mono">
                Click any sector pin on the radar map to view geotechnical telemetry.
              </p>
            )}
          </div>
        </div>

        {/* 72-Hour Monsoon Progression & Live AWS Telemetry Player */}
        <div className="p-5 md:p-6 bg-zinc-50 rounded-2xl border border-zinc-200 mb-8 shadow-2xs">
          {/* Header row with playback controls, title, and active badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-lg bg-black text-white hover:bg-zinc-800 flex items-center justify-center transition-colors shadow-xs"
                title={isPlaying ? "Pause timeline playback" : "Play disaster event progression"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                onClick={() => handleStepChange(Math.max(0, timelineStep - 1))}
                disabled={timelineStep === 0}
                className="w-9 h-9 rounded-lg bg-zinc-200 text-zinc-700 hover:bg-zinc-300 disabled:opacity-40 disabled:hover:bg-zinc-200 flex items-center justify-center transition-colors"
                title="Previous milestone"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStepChange(Math.min(4, timelineStep + 1))}
                disabled={timelineStep === 4}
                className="w-9 h-9 rounded-lg bg-zinc-200 text-zinc-700 hover:bg-zinc-300 disabled:opacity-40 disabled:hover:bg-zinc-200 flex items-center justify-center transition-colors"
                title="Next milestone"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStepChange(0)}
                className="w-9 h-9 rounded-lg bg-zinc-200 text-zinc-700 hover:bg-zinc-300 flex items-center justify-center transition-colors"
                title="Reset timeline to T - 48h baseline"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="ml-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-black uppercase tracking-wider">
                    Temporal Failure Progression & Live Telemetry
                  </span>
                  {timelineStep === 4 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 border border-purple-300 text-purple-900 text-[10px] font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                      LIVE STREAM ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800 text-[10px] font-mono font-bold">
                      HISTORICAL RECON
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-500 font-sans block mt-0.5">
                  Scrub the slider below or click any milestone to observe dynamic pore-pressure, shear failure & real-time telemetry
                </span>
              </div>
            </div>

            {/* Active Milestone Status Box */}
            <div className="flex items-center gap-2">
              <div className="text-xs font-mono text-zinc-700 bg-white px-3.5 py-2 rounded-lg border border-zinc-300 shadow-2xs flex items-center gap-2">
                <span className="text-zinc-400 uppercase text-[10px] font-bold">Active Window:</span>
                <strong className={timelineStep === 4 ? "text-purple-700 font-black" : "text-black"}>
                  {currentMilestone.label}
                </strong>
                <span className="text-zinc-300">|</span>
                <span className="text-zinc-600 text-[11px]">{currentMilestone.date}</span>
              </div>
            </div>
          </div>

          {/* Smooth Scrub Range Slider Bar with Track, Progress Fill, and Milestone Stops */}
          <div className="px-4 pt-3 pb-7 mb-4">
            <div className="relative w-full">
              {/* Background Track */}
              <div className="w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden">
                {/* Dynamic Progress Fill Bar */}
                <div
                  className="h-full bg-gradient-to-r from-zinc-800 via-zinc-950 to-purple-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${(timelineStep / 4) * 100}%` }}
                />
              </div>

              {/* 5 Milestone Stop Nodes on Track */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-0.5">
                {timelineMilestones.map((m, idx) => {
                  const isActive = timelineStep === idx;
                  const isPassed = timelineStep >= idx;
                  const isLive = idx === 4;
                  return (
                    <div
                      key={idx}
                      className="relative flex flex-col items-center"
                    >
                      <button
                        type="button"
                        onClick={() => handleStepChange(idx)}
                        className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center pointer-events-auto cursor-pointer focus:outline-none ${
                          isActive
                            ? isLive
                              ? "bg-purple-600 border-white ring-4 ring-purple-300 shadow-md scale-125"
                              : "bg-black border-white ring-4 ring-zinc-300 shadow-md scale-125"
                            : isPassed
                            ? "bg-zinc-800 border-white shadow-2xs"
                            : "bg-white border-zinc-400 hover:border-zinc-700"
                        }`}
                        title={`Jump to ${m.label}`}
                      >
                        {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </button>

                      {/* Milestone Label Under Node */}
                      <button
                        type="button"
                        onClick={() => handleStepChange(idx)}
                        className={`mt-2 font-mono text-[11px] whitespace-nowrap cursor-pointer transition-colors pointer-events-auto focus:outline-none ${
                          isActive
                            ? isLive
                              ? "font-black text-purple-700 underline underline-offset-4"
                              : "font-black text-black underline underline-offset-4"
                            : "text-zinc-500 hover:text-black font-semibold"
                        }`}
                      >
                        {isLive ? "🔴 LIVE TODAY" : m.label}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Hidden Native Range Slider overlay for smooth dragging and accessibility */}
              <input
                type="range"
                min={0}
                max={4}
                step={1}
                value={timelineStep}
                onChange={(e) => handleStepChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-8 -top-3 opacity-0 cursor-pointer z-10"
                aria-label="Monsoon progression timeline slider"
              />
            </div>
          </div>

          {/* 5 Milestone Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-zinc-200">
            {timelineMilestones.map((m, idx) => {
              const isSelected = timelineStep === idx;
              const isLive = idx === 4;
              return (
                <button
                  key={idx}
                  onClick={() => handleStepChange(idx)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? isLive
                        ? "bg-purple-50/70 border-purple-500 ring-2 ring-purple-500 shadow-md"
                        : "bg-white border-black ring-2 ring-black shadow-md"
                      : isLive
                      ? "bg-purple-50/30 border-purple-200 hover:bg-purple-50/60 text-zinc-700"
                      : "bg-white/70 border-zinc-200 hover:bg-white text-zinc-600"
                  }`}
                >
                  {isLive && (
                    <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-mono font-bold flex items-center gap-1 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE AWS
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                      <span
                        className={
                          isSelected
                            ? isLive
                              ? "text-purple-900 text-sm font-black"
                              : "text-black text-sm font-black"
                            : "text-zinc-800"
                        }
                      >
                        {m.label}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold ${
                          isLive
                            ? "bg-purple-100 text-purple-800"
                            : idx === 2
                            ? "bg-red-100 text-red-800"
                            : idx === 1
                            ? "bg-amber-100 text-amber-800"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {m.rain}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-800 font-sans font-semibold line-clamp-1 mt-1">
                      {m.status}
                    </div>

                    <div className="text-[10px] text-zinc-500 font-sans line-clamp-2 mt-1.5 leading-snug">
                      {m.summary}
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-400 font-mono mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <span>{m.date}</span>
                    <span className="font-semibold text-zinc-500">{m.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Telemetry Status Callout Bar when Step === 4 */}
          {timelineStep === 4 && (
            <div className="mt-4 p-3.5 bg-gradient-to-r from-purple-50 via-white to-purple-50 border border-purple-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping shrink-0" />
                <span className="text-purple-950 font-bold">
                  LIVE AWS TELEMETRY FEED:
                </span>
                <span className="text-purple-800">
                  {liveWeather.station_name}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1 text-zinc-700">
                  <Thermometer className="w-3.5 h-3.5 text-purple-600" />
                  <span>Temp: <strong className="text-black">{liveWeather.temperature_c}°C</strong></span>
                </div>
                <div className="flex items-center gap-1 text-zinc-700">
                  <CloudRain className="w-3.5 h-3.5 text-purple-600" />
                  <span>24h Rain: <strong className="text-black">{liveWeather.past_24h_rainfall_mm.toFixed(1)} mm</strong></span>
                </div>
                <div className="flex items-center gap-1 text-zinc-700">
                  <Wind className="w-3.5 h-3.5 text-purple-600" />
                  <span>Wind: <strong className="text-black">{liveWeather.wind_speed_kmh} km/h</strong></span>
                </div>
                <button
                  type="button"
                  onClick={syncLiveWeather}
                  disabled={weatherLoading}
                  className="ml-2 px-2.5 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                  title="Refresh live telemetry feed"
                >
                  <RefreshCw className={`w-3 h-3 ${weatherLoading ? "animate-spin" : ""}`} />
                  <span>{weatherLoading ? "Syncing..." : "Sync AWS"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Topographic Elevation Profile & Kinetic Energy Corridor Card */}
        <section className="mb-8 p-6 md:p-8 bg-zinc-950 text-white rounded-2xl border border-zinc-800 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-base font-black font-mono uppercase tracking-wider text-white">
                  Topographic Elevation Cross-Section & Hydraulic Momentum Profile
                </h3>
                <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-mono font-bold">
                  Vellarimala &rarr; Chooralmala Corridor
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans max-w-2xl">
                Hydraulic momentum trace of the 30 July 2024 cloudburst channel. Shows how 1.85M m³ of boulder slurry accelerated down an 800m vertical drop, inundating the 9° valley floor settlements.
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 block uppercase">TOTAL DROP (H)</span>
                <strong className="text-red-400 text-sm">800 m</strong>
              </div>
              <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 block uppercase">RUNOUT REACH (L)</span>
                <strong className="text-white text-sm">6.1 km</strong>
              </div>
              <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 block uppercase">LEAD TIME</span>
                <strong className="text-amber-400 text-sm">14.2 min</strong>
              </div>
            </div>
          </div>

          {/* SVG Elevation Profile Waveform */}
          <div className="pt-6 pb-4">
            <div className="w-full h-32 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 1000 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="elevationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#f97316" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                {/* Cross section fill */}
                <path
                  d="M 50 15 Q 200 35 380 62 T 680 92 L 950 105 L 950 120 L 50 120 Z"
                  fill="url(#elevationGrad)"
                />
                {/* Terrain surface contour line */}
                <path
                  d="M 50 15 Q 200 35 380 62 T 680 92 L 950 105"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                />
                {/* Waypoint nodes on curve */}
                <circle cx="50" cy="15" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <circle cx="250" cy="45" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <circle cx="450" cy="72" r="5" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
                <circle cx="700" cy="94" r="5" fill="#eab308" stroke="#ffffff" strokeWidth="2" />
                <circle cx="950" cy="105" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              </svg>

              {/* Station elevation callouts */}
              <div className="absolute top-1 left-2 font-mono text-[10px] text-red-400 font-bold">
                Apex: 1480m (42°)
              </div>
              <div className="absolute top-8 left-[23%] font-mono text-[10px] text-red-400 font-semibold">
                Punchirimattam: 1220m
              </div>
              <div className="absolute top-16 left-[43%] font-mono text-[10px] text-orange-400 font-semibold">
                Mundakkai: 980m
              </div>
              <div className="absolute bottom-6 left-[68%] font-mono text-[10px] text-yellow-400 font-bold">
                Chooralmala: 790m (9° Valley)
              </div>
              <div className="absolute bottom-2 right-2 font-mono text-[10px] text-emerald-400 font-bold">
                Attamala: 680m
              </div>
            </div>
          </div>

          {/* 5-Station Kinematics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 border-t border-zinc-800 text-xs font-mono">
            {channelWaypoints.map((wp, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/90 p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-400">WP #{idx + 1}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.2 rounded font-bold"
                    style={{ backgroundColor: `${wp.statusColor}22`, color: wp.statusColor }}
                  >
                    {wp.status.split(" ")[0]}
                  </span>
                </div>
                <div className="font-bold text-white text-xs truncate mb-1" title={wp.name}>
                  {wp.name.split(". ")[1]}
                </div>
                <div className="text-[10px] text-zinc-400 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Elevation:</span>
                    <strong className="text-zinc-200">{wp.elevation} m</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Arrival ETA:</span>
                    <strong className="text-white">{wp.etaMinutes === 0 ? "T = 0" : `+${wp.etaMinutes}m`}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Flow Velocity:</span>
                    <strong className="text-red-400">{wp.velocityMs} m/s</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Impact Press:</span>
                    <strong className="text-zinc-200">{wp.pressureKPa} kPa</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-zinc-400 font-sans leading-relaxed">
            <strong className="text-white font-mono font-bold">Scientific Finding: </strong>
            Chooralmala settlement sits on a gentle 9° valley floor. Conventional susceptibility mapping classifies it as &quot;Low Slope / Moderate Risk&quot;. GeoShield integrates upstream momentum routing to detect long-runout hydraulic debris flows across the Western Ghats.
          </div>
        </section>
      </main>

      {/* Coder Corporate Footer */}
      <TacticalDock />
    </div>
  );
}
