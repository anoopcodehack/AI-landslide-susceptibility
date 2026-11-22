"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { Navbar } from "@/components/Navbar";
import { TacticalDock } from "@/components/TacticalDock";
import { API_BASE_URL } from "@/lib/api";
import { useAlerts } from "@/components/AlertCenter";
import { useLanguage } from "@/lib/LanguageContext";
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
  ExternalLink,
  Route,
  CheckCircle2,
} from "lucide-react";

interface ReliefCorridorWaypoint {
  name: string;
  coords: [number, number];
  note: string;
}

interface ReliefCorridorData {
  sectorId: string;
  name: string;
  originName: string;
  destinationName: string;
  distanceKm: number;
  estMinutes: number;
  roadType: string;
  status: "OPEN" | "NDRF_ESCORTED" | "CONVOY_ONLY" | "HIGHWAY_OPEN";
  statusBadge: string;
  protocol: string;
  reliefCamp: string;
  campCapacity: string;
  campCoordinates: [number, number];
  emergencyFreq: string;
  leadAgency: string;
  routeCoordinates: [number, number][];
  waypoints: ReliefCorridorWaypoint[];
}

const RELIEF_CORRIDORS: Record<string, ReliefCorridorData> = {
  chooralmala: {
    sectorId: "chooralmala",
    name: "Bailey Bridge Emergency Span -> Kalpetta HQ",
    originName: "Chooralmala Sector Ground Zero",
    destinationName: "District Emergency Operations Centre (DEOC), Kalpetta",
    distanceKm: 14.2,
    estMinutes: 28,
    roadType: "State Highway 54 / Emergency Bailey Span",
    status: "NDRF_ESCORTED",
    statusBadge: "NDRF ESCORTED • 24-TON SPAN",
    protocol: "Single-lane 24-ton Bailey Bridge priority transit; Indian Army & NDRF convoy coordination.",
    reliefCamp: "St. Joseph's HSS Relief Shelter & Kalpetta Town Hall Camp",
    campCapacity: "1,600 Beds / 2,400 Meals Daily",
    campCoordinates: [11.6050, 76.0820],
    emergencyFreq: "VHF 156.800 MHz (KSDMA Ch 4)",
    leadAgency: "NDRF 04Bn & Kerala Police",
    routeCoordinates: [
      [11.5381, 76.1772], // Chooralmala Origin
      [11.5398, 76.1685], // Bailey Bridge Rapid Deployment Span
      [11.5432, 76.1550], // Vellarmala Junction
      [11.5475, 76.1410], // Kalladi Checkpost
      [11.5518, 76.1265], // Meppadi Police Transit Checkpost
      [11.5645, 76.1130], // Nedumbala High Ridge Route
      [11.5810, 76.0980], // Kottapadi Ring Road
      [11.5950, 76.0890], // Kainatty Junction
      [11.6050, 76.0820], // Kalpetta DEOC HQ
    ],
    waypoints: [
      { name: "Bailey Bridge Anchor", coords: [11.5398, 76.1685], note: "Army 24-ton span across Iruvaipuzha" },
      { name: "Meppadi Transit Post", coords: [11.5518, 76.1265], note: "Triage checkpost & ambulance staging" },
      { name: "Nedumbala Ridge Spur", coords: [11.5645, 76.1130], note: "High ground bypass free of debris hazard" },
      { name: "Kainatty Junction", coords: [11.5950, 76.0890], note: "Direct dual-lane connection to Kalpetta" },
    ],
  },
  mundakkai: {
    sectorId: "mundakkai",
    name: "Route 1 -> Meppadi Relief Transit Hub",
    originName: "Mundakkai Debris Flow Epicenter",
    destinationName: "Meppadi Relief Transit Hub",
    distanceKm: 6.4,
    estMinutes: 18,
    roadType: "Upper Valley Evacuation Track",
    status: "CONVOY_ONLY",
    statusBadge: "TACTICAL 4x4 & AMBULANCE SPUR",
    protocol: "Tactical 4x4 ambulance & high-axle vehicle evacuation along elevated drainage ridge.",
    reliefCamp: "Government Higher Secondary School Shelter, Meppadi",
    campCapacity: "950 Beds / Mobile Triage Base",
    campCoordinates: [11.5518, 76.1265],
    emergencyFreq: "VHF 154.250 MHz (NDRF Tac 2)",
    leadAgency: "NDRF & Fire Rescue Services",
    routeCoordinates: [
      [11.5300, 76.1820], // Mundakkai Origin
      [11.5350, 76.1680], // Upper Plantation Spur
      [11.5410, 76.1510], // Attamala Ridge Crossing
      [11.5470, 76.1380], // Kalladi Approach
      [11.5518, 76.1265], // Meppadi Transit Hub
    ],
    waypoints: [
      { name: "Upper Plantation Ridge", coords: [11.5350, 76.1680], note: "Stabilized rocky ground clear of mudflows" },
      { name: "Attamala Crossing", coords: [11.5410, 76.1510], note: "Emergency medical transport staging post" },
    ],
  },
  meppadi: {
    sectorId: "meppadi",
    name: "Meppadi-Kalpetta Arterial Highway (Open)",
    originName: "Meppadi Escarpment",
    destinationName: "Kalpetta Civil Station Relief Base",
    distanceKm: 11.5,
    estMinutes: 16,
    roadType: "Dual-Lane Asphalt Highway",
    status: "HIGHWAY_OPEN",
    statusBadge: "100% CLEAR • PRIORITY GREEN CORRIDOR",
    protocol: "Paved dual-lane highway; continuous green corridor for emergency convoys.",
    reliefCamp: "SKMJ Higher Secondary School Grounds, Kalpetta",
    campCapacity: "1,200 Beds / Medical Logistics Center",
    campCoordinates: [11.6050, 76.0820],
    emergencyFreq: "VHF 162.400 MHz (Police Net)",
    leadAgency: "Motor Vehicles Dept & Kerala Police",
    routeCoordinates: [
      [11.5518, 76.1265], // Meppadi Center
      [11.5630, 76.1150], // Meppadi North
      [11.5750, 76.1040], // Kottapadi Bypass
      [11.5910, 76.0920], // Chuzhali Link
      [11.6050, 76.0820], // Kalpetta Civil Station
    ],
    waypoints: [
      { name: "Kottapadi Junction", coords: [11.5750, 76.1040], note: "Wide bypass lane for high-capacity flow" },
      { name: "Chuzhali Access", coords: [11.5910, 76.0920], note: "Traffic police active signal override" },
    ],
  },
  vythiri: {
    sectorId: "vythiri",
    name: "NH-766 Interstate Freight Corridor",
    originName: "Vythiri Ghat Pass (NH-766)",
    destinationName: "Adivaram Base Camp (NH-766)",
    distanceKm: 18.2,
    estMinutes: 35,
    roadType: "National Highway Ghat Section",
    status: "OPEN",
    statusBadge: "CONTINUOUS RADAR SLOPE SURVEILLANCE",
    protocol: "Interstate arterial monitored by automated rockfall acoustic sensors and heavy wreckers.",
    reliefCamp: "Vythiri Community Hall & Lakkidi Evacuation Center",
    campCapacity: "1,100 Beds / Medical Supply Staging",
    campCoordinates: [11.4720, 75.9980],
    emergencyFreq: "VHF 151.625 MHz (NHAI Highway Patrol)",
    leadAgency: "NHAI Disaster Response & Highway Patrol",
    routeCoordinates: [
      [11.5524, 76.0425], // Vythiri Ghat Checkpoint
      [11.5380, 76.0350], // Pookode Junction
      [11.5240, 76.0290], // Old Vythiri Stretch
      [11.5180, 76.0260], // Lakkidi Gateway Peak
      [11.4980, 76.0150], // Hairpin Turn 9 Spur
      [11.4820, 76.0060], // Hairpin Turn 4 Cut
      [11.4720, 75.9980], // Adivaram Coastal Descent Base
    ],
    waypoints: [
      { name: "Lakkidi Pass Summit", coords: [11.5180, 76.0260], note: "Highest elevation point; high fog surveillance" },
      { name: "Hairpin Bend 9", coords: [11.4980, 76.0150], note: "Reinforced retaining wall; monitored slope sensors" },
    ],
  },
  bathery: {
    sectorId: "bathery",
    name: "Primary Civil Evacuation Camp Base",
    originName: "Sulthan Bathery Tableland",
    destinationName: "Sulthan Bathery Mega Logistics Camp Base",
    distanceKm: 24.5,
    estMinutes: 40,
    roadType: "Plateau Arterial Highway",
    status: "OPEN",
    statusBadge: "PRIMARY SECURE STRONGHOLD",
    protocol: "Central safe haven with deep soil stability and gentle tableland topography.",
    reliefCamp: "St. Mary's College Mega Relief Shelter & Food Processing Base",
    campCapacity: "2,800 Beds / District Central Stockpile",
    campCoordinates: [11.6628, 76.2570],
    emergencyFreq: "VHF 155.000 MHz (Red Cross Net)",
    leadAgency: "Kerala Civil Supplies & Indian Red Cross",
    routeCoordinates: [
      [11.6628, 76.2570], // Sulthan Bathery Tableland
      [11.6510, 76.2280], // Kuppadi Road
      [11.6390, 76.1980], // Kolagappara Ring
      [11.6280, 76.1620], // Meenangadi Central Junction
      [11.6210, 76.1320], // Muttil Civil Corridor
      [11.6050, 76.0820], // Kalpetta EOC Link
    ],
    waypoints: [
      { name: "Kolagappara Ring", coords: [11.6390, 76.1980], note: "Low-hazard junction connecting North Wayanad" },
      { name: "Meenangadi Central", coords: [11.6280, 76.1620], note: "Emergency fuel and rations supply depot" },
    ],
  },
  kalpetta: {
    sectorId: "kalpetta",
    name: "Emergency Operations Centre (EOC)",
    originName: "Kalpetta District Core",
    destinationName: "District Disaster Management Command Core",
    distanceKm: 2.1,
    estMinutes: 5,
    roadType: "Administrative District Arterial",
    status: "OPEN",
    statusBadge: "CENTRAL DISASTER NERVE CENTER",
    protocol: "Central unified disaster governance bunker; active satellite communication and helipad.",
    reliefCamp: "District Collectorate Command Bunker & Cricket Stadium Helipad",
    campCapacity: "Strategic Command Core (All Agencies)",
    campCoordinates: [11.6050, 76.0820],
    emergencyFreq: "VHF 156.025 MHz (DDMA Command Direct)",
    leadAgency: "District Collector & DDMA",
    routeCoordinates: [
      [11.6050, 76.0820], // Kalpetta Collectorate
      [11.6075, 76.0815], // DDMA Operations Bunker
      [11.6110, 76.0790], // Wayanad Stadium Helipad
    ],
    waypoints: [
      { name: "DDMA Bunker", coords: [11.6075, 76.0815], note: "Hardened disaster communications nerve center" },
      { name: "Stadium Helipad", coords: [11.6110, 76.0790], note: "Indian Air Force helicopter extraction point" },
    ],
  },
};

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
  const corridorLayerRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<"satellite" | "osm">("satellite");
  const [timelineStep, setTimelineStep] = useState<number>(2);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [activeCorridor, setActiveCorridor] = useState<string | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [hoveredWaypoint, setHoveredWaypoint] = useState<any | null>(null);

  const { triggerAlert } = useAlerts();
  const { language } = useLanguage();

  // Live real-time AWS weather telemetry (Section 3 Future Flow of Research Poster)
  const [liveWeather, setLiveWeather] = useState<LiveWeatherTelemetry>({
    station_name: "Meppadi-Chooralmala AWS #04 (11.55°N, 76.13°E)",
    latitude: 11.5518,
    longitude: 76.1265,
    timestamp: new Date().toISOString(),
    current_precipitation_mm: 0.0,
    past_24h_rainfall_mm: 0.0,
    temperature_c: 20.0,
    relative_humidity_pct: 70,
    wind_speed_kmh: 5.0,
    cloud_cover_pct: 10,
    weather_condition: "Clear Sky / Calm Highland Conditions",
    source: "LIVE_OPEN_METEO_API",
    live_susceptibility_score: 0.082,
    live_risk_category: "LOW",
    evacuation_alert: false,
    kerala_alert_color: "GREEN",
  });
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Streaming");

  const syncLiveWeather = async (silent: boolean = false) => {
    if (!silent) setWeatherLoading(true);

    // 1. First attempt: Query backend REST API
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/weather/live`, { cache: "no-store" });
      if (res.ok) {
        const data: LiveWeatherTelemetry = await res.json();
        if (data.source === "LIVE_OPEN_METEO_API") {
          setLiveWeather(data);
          setBackendOnline(true);
          setLastSyncedTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
          if (!silent) {
            triggerAlert({
              level: data.past_24h_rainfall_mm >= 200 ? "RED" : data.past_24h_rainfall_mm >= 80 ? "ORANGE" : "GREEN",
              title: "📡 Live AWS Telemetry Synced",
              message: `Chooralmala AWS #04: ${data.temperature_c}°C, ${data.past_24h_rainfall_mm.toFixed(1)}mm rain, ${data.weather_condition}`,
              sector: "Chooralmala",
            });
          }
          setWeatherLoading(false);
          return;
        }
      }
    } catch (err) {
      // Backend not running on local port; proceed to direct browser Open-Meteo sync
    }

    // 2. Direct Browser-to-Open-Meteo Client-Side Sync
    // Allows 100% genuine live weather even without Python backend running!
    try {
      const lat = 11.5518;
      const lon = 76.1265;
      const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,cloud_cover,wind_speed_10m&hourly=precipitation&past_days=1&forecast_days=1`;
      const omRes = await fetch(omUrl);
      if (omRes.ok) {
        const payload = await omRes.json();
        const current = payload.current || {};
        const hourly = payload.hourly || {};
        const hourlyRain: number[] = (hourly.precipitation as number[]) || [];
        const past24hSum = Math.round((hourlyRain.slice(0, 24).reduce((a, b) => a + b, 0)) * 10) / 10;
        const currPrecip = Math.round((current.precipitation || 0) * 10) / 10;
        const tempC = Math.round((current.temperature_2m || 20.0) * 10) / 10;
        const humidity = Math.round(current.relative_humidity_2m || 70);
        const wind = Math.round((current.wind_speed_10m || 5.0) * 10) / 10;
        const cloud = Math.round(current.cloud_cover || 10);
        const wcode = Number(current.weather_code || 0);

        let condition = "Clear Sky / Calm Highland Conditions";
        if (wcode >= 95) condition = "Severe Thunderstorm Activity";
        else if (wcode >= 65 || currPrecip >= 15) condition = "Torrential Downpour & Cloudburst Alert";
        else if (wcode >= 61 || currPrecip >= 5) condition = "Heavy Orographic Rain Showers";
        else if (wcode >= 51 || currPrecip > 0.5) condition = "Light Mountain Drizzle";
        else if (wcode === 45 || wcode === 48) condition = "Highland Fog & Ridge Mist";
        else if (cloud >= 75) condition = "Overcast Monsoon Skies";
        else if (cloud >= 30) condition = "Scattered Clouds / Partly Cloudy";

        // Dynamic XGBoost model response approximation for live rainfall
        const liveScore = Math.min(0.99, Math.max(0.06, 0.08 + Math.pow(past24hSum / 250, 1.8) * 0.88));
        const riskCategory = liveScore >= 0.75 ? "CRITICAL" : liveScore >= 0.35 ? "HIGH" : liveScore >= 0.20 ? "MODERATE" : "LOW";

        const liveData: LiveWeatherTelemetry = {
          station_name: "Meppadi-Chooralmala AWS #04 (11.55°N, 76.13°E)",
          latitude: lat,
          longitude: lon,
          timestamp: new Date().toISOString(),
          current_precipitation_mm: currPrecip,
          past_24h_rainfall_mm: past24hSum,
          temperature_c: tempC,
          relative_humidity_pct: humidity,
          wind_speed_kmh: wind,
          cloud_cover_pct: cloud,
          weather_condition: condition,
          source: "LIVE_OPEN_METEO_API",
          live_susceptibility_score: Math.round(liveScore * 1000) / 1000,
          live_risk_category: riskCategory,
          evacuation_alert: liveScore >= 0.75,
          kerala_alert_color: liveScore >= 0.75 ? "RED" : liveScore >= 0.35 ? "ORANGE" : "GREEN",
        };

        setLiveWeather(liveData);
        setLastSyncedTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        if (!silent) {
          triggerAlert({
            level: past24hSum >= 200 ? "RED" : past24hSum >= 80 ? "ORANGE" : "GREEN",
            title: "📡 Live AWS Telemetry Synced",
            message: `Chooralmala AWS #04: ${tempC}°C, ${past24hSum.toFixed(1)}mm rain, ${condition}`,
            sector: "Chooralmala",
          });
        }
      }
    } catch (clientErr) {
      console.warn("Direct Open-Meteo client sync error:", clientErr);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    syncLiveWeather(true);
    // Real-time telemetry streaming: auto-refresh every 30 seconds
    const interval = setInterval(() => {
      syncLiveWeather(true);
    }, 30000);
    return () => clearInterval(interval);
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
      status: "Real-Time AWS #04 (Chooralmala / Meppadi)",
      severity: "live",
      badge: "REAL-TIME AWS",
      summary: `Atmosphere: ${liveWeather.weather_condition}, ${liveWeather.temperature_c}°C, ${liveWeather.relative_humidity_pct}% RH, ${liveWeather.wind_speed_kmh} km/h wind. Dynamic ML slope safety index: ${(liveWeather.live_susceptibility_score * 100).toFixed(1)}%.`,
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
        return {
          color: "#10b981",
          risk: `Nominal ${Math.max(2, liveScorePct - 5)}% (Live Safe // ${liveRain.toFixed(1)}mm rain)`,
          radiusMultiplier: 0.65,
        };
      }
      if (spotId === "vythiri") {
        const vythiriScore = liveRain >= 100 ? liveScorePct : Math.max(5, liveScorePct - 2);
        const vythiriColor = vythiriScore >= 75 ? "#ef4444" : vythiriScore >= 40 ? "#f59e0b" : "#10b981";
        return {
          color: vythiriColor,
          risk: `${vythiriScore >= 40 ? "Watch" : "Safe"} ${vythiriScore}% (Live Pass // ${liveWeather.weather_condition})`,
          radiusMultiplier: vythiriScore >= 40 ? 1.0 : 0.75,
        };
      }
      // Meppadi, Mundakkai, Chooralmala live response
      if (liveRain >= 200) {
        return { color: "#ef4444", risk: `Critical ${liveScorePct}% (Cloudburst Failure Trigger // ${liveRain.toFixed(1)}mm rain)`, radiusMultiplier: 1.4 };
      } else if (liveRain >= 80) {
        return { color: "#f97316", risk: `Watch ${liveScorePct}% (High Precipitation // ${liveRain.toFixed(1)}mm rain)`, radiusMultiplier: 1.1 };
      } else if (liveRain >= 25) {
        return { color: "#f59e0b", risk: `Moderate ${liveScorePct}% (Active Showers // ${liveRain.toFixed(1)}mm rain)`, radiusMultiplier: 0.9 };
      } else {
        return {
          color: "#10b981",
          risk: `Safe ${liveScorePct}% (Baseline Stable // ${liveRain.toFixed(1)}mm rain, ${liveWeather.temperature_c}°C)`,
          radiusMultiplier: 0.75,
        };
      }
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
      if (corridorLayerRef.current && leafletMap.current) {
        leafletMap.current.removeLayer(corridorLayerRef.current);
        corridorLayerRef.current = null;
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

  const showCorridorOnMap = async (sectorId: string) => {
    const corridor = RELIEF_CORRIDORS[sectorId];
    if (!corridor || !leafletMap.current) return;

    const L = await import("leaflet");
    const map = leafletMap.current;
    if (!map) return;

    // Clear previous corridor layer if exists
    if (corridorLayerRef.current) {
      map.removeLayer(corridorLayerRef.current);
      corridorLayerRef.current = null;
    }

    const layerGroup = L.layerGroup();

    // 1. Wide emerald glow line underneath for contrast against satellite imagery
    const glowPolyline = L.polyline(corridor.routeCoordinates, {
      color: "#059669",
      weight: 10,
      opacity: 0.45,
      lineCap: "round",
      lineJoin: "round",
    });
    layerGroup.addLayer(glowPolyline);

    // 2. High-contrast crisp dashed tactical corridor polyline
    const mainPolyline = L.polyline(corridor.routeCoordinates, {
      color: "#10b981",
      weight: 4.5,
      opacity: 1.0,
      dashArray: "10, 8",
      lineCap: "round",
    });
    layerGroup.addLayer(mainPolyline);

    // 3. Start Point Icon (Sector Origin)
    const startIcon = L.divIcon({
      className: "corridor-marker-icon",
      html: `<div style="background: #09090b; color: #10b981; border: 2px solid #10b981; border-radius: 9999px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 14px rgba(0,0,0,0.65);">🚩</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
    const startMarker = L.marker(corridor.routeCoordinates[0], { icon: startIcon });
    startMarker.bindTooltip(
      `<div style="font-family: monospace; font-size: 11px; padding: 4px; line-height: 1.4;">
        <strong style="color: #10b981;">🚩 EVACUATION ORIGIN</strong><br/>
        <span style="color: #ffffff; font-weight: bold;">${corridor.originName}</span>
      </div>`,
      { direction: "top", opacity: 0.98, className: "coder-map-tooltip" }
    );
    layerGroup.addLayer(startMarker);

    // 4. Waypoints along the evacuation route
    corridor.waypoints.forEach((wp, idx) => {
      const wpMarker = L.circleMarker(wp.coords, {
        radius: 5,
        color: "#10b981",
        fillColor: "#ffffff",
        fillOpacity: 1.0,
        weight: 2,
      });
      wpMarker.bindTooltip(
        `<div style="font-family: monospace; font-size: 10px; line-height: 1.4;">
          <strong style="color: #10b981;">Waypoint ${idx + 1}: ${wp.name}</strong><br/>
          <span style="color: #cbd5e1;">${wp.note}</span>
        </div>`,
        { direction: "top", opacity: 0.98, className: "coder-map-tooltip" }
      );
      layerGroup.addLayer(wpMarker);
    });

    // 5. Safe Destination Marker (Relief Shelter / HQ)
    const destIcon = L.divIcon({
      className: "corridor-dest-icon",
      html: `<div style="background: #059669; color: #ffffff; border: 2px solid #ffffff; border-radius: 9999px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 16px rgba(5,150,105,0.7);">🏥</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });
    const destMarker = L.marker(corridor.routeCoordinates[corridor.routeCoordinates.length - 1], { icon: destIcon });
    destMarker.bindTooltip(
      `<div style="font-family: monospace; font-size: 11px; padding: 4px; line-height: 1.45;">
        <strong style="color: #10b981;">🏥 SAFE EVACUATION HAVEN</strong><br/>
        <span style="color: #ffffff; font-weight: bold;">${corridor.destinationName}</span><br/>
        <span style="color: #94a3b8;">Shelter: ${corridor.reliefCamp}</span><br/>
        <span style="color: #38bdf8;">Capacity: ${corridor.campCapacity}</span>
      </div>`,
      { direction: "top", opacity: 0.98, className: "coder-map-tooltip" }
    );
    layerGroup.addLayer(destMarker);

    layerGroup.addTo(map);
    corridorLayerRef.current = layerGroup;

    // Zoom map smoothly to display the complete corridor path
    map.fitBounds(mainPolyline.getBounds(), {
      padding: [70, 70],
      maxZoom: 13,
    });

    setActiveCorridor(sectorId);

    triggerAlert({
      level: "GREEN",
      title: "🟢 Safe Relief Corridor Active",
      message: `${corridor.name} (${corridor.distanceKm} km, ~${corridor.estMinutes}m). Destination: ${corridor.reliefCamp}`,
      sector: corridor.originName,
    });
  };

  const clearCorridorFromMap = () => {
    if (corridorLayerRef.current && leafletMap.current) {
      leafletMap.current.removeLayer(corridorLayerRef.current);
      corridorLayerRef.current = null;
    }
    setActiveCorridor(null);
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
  const currentCorridorData = selectedHotspot ? RELIEF_CORRIDORS[selectedHotspot.id] : null;
  const activeCorridorData = activeCorridor ? RELIEF_CORRIDORS[activeCorridor] : null;

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
              Wayanad GIS Radar
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

            {/* Floating Top Right Active Corridor HUD */}
            {activeCorridor && activeCorridorData && (
              <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md border border-emerald-500/80 rounded-xl p-3.5 shadow-xl max-w-xs sm:max-w-sm text-xs font-mono animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-2 mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{language === "kn" ? "ಸುರಕ್ಷಿತ ಪರಿಹಾರ ಕಾರಿಡಾರ್" : "SAFE RELIEF CORRIDOR"}</span>
                  </span>
                  <button
                    onClick={clearCorridorFromMap}
                    className="text-zinc-400 hover:text-black font-bold text-base px-1 leading-none cursor-pointer"
                    title="Clear corridor route"
                  >
                    &times;
                  </button>
                </div>
                <div className="font-bold text-zinc-900 text-xs">
                  {activeCorridorData.name}
                </div>
                <div className="text-[10px] text-zinc-600 mt-1 flex flex-wrap items-center gap-2.5">
                  <span>📏 <strong className="text-zinc-900">{activeCorridorData.distanceKm} km</strong></span>
                  <span>⏱️ <strong className="text-zinc-900">~{activeCorridorData.estMinutes} mins</strong></span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                    {activeCorridorData.statusBadge}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-zinc-200/80 text-[10px] space-y-1">
                  <div className="text-zinc-700">
                    <span className="text-zinc-400 font-semibold uppercase block text-[9px]">Safe Haven Relief Base:</span>
                    <strong className="text-zinc-900">{activeCorridorData.reliefCamp}</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-zinc-500 text-[9px]">Cap: {activeCorridorData.campCapacity}</span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${activeCorridorData.routeCoordinates[0][0]},${activeCorridorData.routeCoordinates[0][1]}&destination=${activeCorridorData.campCoordinates[0]},${activeCorridorData.campCoordinates[1]}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <span>Open GPS</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Live Cursor Coordinate HUD Badge */}
            <div className="absolute bottom-3 left-3 bg-white/90 text-zinc-800 border border-zinc-200/90 px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-2.5 backdrop-blur-md pointer-events-none shadow-xs z-[400]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-zinc-900">
                {cursorCoords
                  ? `LAT: ${cursorCoords.lat.toFixed(4)}° N • LON: ${cursorCoords.lon.toFixed(4)}° E`
                  : "11.5500° N • 76.1500° E"}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-emerald-700 font-bold">UTM Zone 43N</span>
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

                {/* Interactive Designated Relief Corridor Card */}
                <div
                  onClick={() => showCorridorOnMap(selectedHotspot.id)}
                  className={`p-3.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer ${
                    activeCorridor === selectedHotspot.id
                      ? "bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-400 shadow-2xs"
                  }`}
                  role="button"
                  tabIndex={0}
                  title="Click to trace safe evacuation route on Radar Map"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Navigation className={`w-3.5 h-3.5 ${activeCorridor === selectedHotspot.id ? "text-emerald-600 animate-pulse" : "text-black"}`} />
                      <span>{language === "kn" ? "ನಿಯೋಜಿತ ಪರಿಹಾರ ಕಾರಿಡಾರ್" : "DESIGNATED RELIEF CORRIDOR"}</span>
                    </span>
                    {activeCorridor === selectedHotspot.id ? (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-600 text-white font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        {language === "kn" ? "ಸಕ್ರಿಯ ಮಾರ್ಗ" : "ACTIVE ON RADAR"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1 group-hover:text-black">
                        <span>{language === "kn" ? "ಮಾರ್ಗ ವೀಕ್ಷಿಸಿ" : "Trace on Map"}</span>
                        <span>&rarr;</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-bold text-zinc-900 mt-2 flex items-start gap-1.5">
                    <span>{selectedHotspot.corridor}</span>
                  </div>

                  {/* Expanded Tactical Telemetry Details when active */}
                  {activeCorridor === selectedHotspot.id && currentCorridorData && (
                    <div className="mt-3 pt-3 border-t border-emerald-200/80 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-white/90 p-2 rounded-lg border border-emerald-200">
                          <span className="text-zinc-500 block uppercase font-medium">TOTAL DISTANCE</span>
                          <strong className="text-emerald-800 text-xs font-bold">{currentCorridorData.distanceKm} km</strong>
                        </div>
                        <div className="bg-white/90 p-2 rounded-lg border border-emerald-200">
                          <span className="text-zinc-500 block uppercase font-medium">EST. TRANSIT</span>
                          <strong className="text-emerald-800 text-xs font-bold">~{currentCorridorData.estMinutes} mins</strong>
                        </div>
                      </div>

                      <div className="text-[10px] text-zinc-700 bg-white/90 p-2.5 rounded-lg border border-emerald-200 leading-tight space-y-1">
                        <div className="font-bold text-zinc-900 flex items-center gap-1">
                          <span>🏥 {language === "kn" ? "ಪರಿಹಾರ ಕೇಂದ್ರ:" : "Safe Haven Shelter:"}</span>
                          <span className="text-emerald-800">{currentCorridorData.reliefCamp}</span>
                        </div>
                        <div className="text-zinc-600 text-[10px]">
                          Capacity: <strong className="text-zinc-800">{currentCorridorData.campCapacity}</strong> • Agency: <strong className="text-zinc-800">{currentCorridorData.leadAgency}</strong>
                        </div>
                        <div className="text-zinc-500 text-[9px] pt-0.5 border-t border-zinc-100">
                          Radio: <span className="font-mono text-zinc-700 font-semibold">{currentCorridorData.emergencyFreq}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-0.5">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${currentCorridorData.routeCoordinates[0][0]},${currentCorridorData.routeCoordinates[0][1]}&destination=${currentCorridorData.campCoordinates[0]},${currentCorridorData.campCoordinates[1]}&travelmode=driving`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 py-1.5 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                          title="Open real-time driving navigation in Google Maps"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{language === "kn" ? "ಜಿಪಿಎಸ್ ನ್ಯಾವಿಗೇಷನ್" : "Open GPS Navigation"}</span>
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearCorridorFromMap();
                          }}
                          className="py-1.5 px-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg text-[10px] font-bold transition-colors"
                          title="Clear relief corridor overlay"
                        >
                          {language === "kn" ? "ತೆರವು" : "Clear"}
                        </button>
                      </div>
                    </div>
                  )}
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
        <div className="p-5 md:p-6 bg-white rounded-2xl border border-zinc-200/90 mb-8 shadow-xs text-zinc-900">
          {/* Header row with playback controls, title, and active badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-lg bg-zinc-900 text-white hover:bg-black flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                title={isPlaying ? "Pause timeline playback" : "Play disaster event progression"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                onClick={() => handleStepChange(Math.max(0, timelineStep - 1))}
                disabled={timelineStep === 0}
                className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Previous milestone"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStepChange(Math.min(4, timelineStep + 1))}
                disabled={timelineStep === 4}
                className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Next milestone"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStepChange(0)}
                className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Reset timeline to T - 48h baseline"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="ml-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900 tracking-tight">
                    Temporal Failure Progression & Live Telemetry
                  </span>
                  {timelineStep === 4 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                      LIVE STREAM ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-semibold">
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
              <div className="text-xs text-zinc-700 bg-zinc-50 px-3.5 py-2 rounded-lg border border-zinc-200 shadow-2xs flex items-center gap-2">
                <span className="text-zinc-500 uppercase text-[10px] font-semibold">Active Window:</span>
                <strong className={timelineStep === 4 ? "text-purple-700 font-bold" : "text-zinc-900 font-bold"}>
                  {currentMilestone.label}
                </strong>
                <span className="text-zinc-300">|</span>
                <span className="text-zinc-600 text-[11px] font-medium">{currentMilestone.date}</span>
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
                  className="h-full bg-gradient-to-r from-zinc-700 via-zinc-900 to-purple-600 rounded-full transition-all duration-300 ease-out"
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
                              ? "bg-purple-600 border-white ring-4 ring-purple-200 shadow-md scale-125"
                              : "bg-black border-white ring-4 ring-zinc-200 shadow-md scale-125"
                            : isPassed
                            ? "bg-zinc-700 border-white shadow-2xs"
                            : "bg-white border-zinc-300 hover:border-zinc-500"
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
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? isLive
                        ? "bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/30 shadow-md text-zinc-900"
                        : "bg-white border-black ring-2 ring-black/10 shadow-md text-zinc-900"
                      : isLive
                      ? "bg-purple-50/30 border-purple-200 hover:bg-purple-50/60 text-zinc-700"
                      : "bg-zinc-50/60 border-zinc-200 hover:bg-zinc-100 text-zinc-700"
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
                              ? "text-purple-700 text-sm font-black"
                              : "text-black text-sm font-black"
                            : "text-zinc-700"
                        }
                      >
                        {m.label}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold ${
                          isLive
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : idx === 2
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : idx === 1
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                        }`}
                      >
                        {m.rain}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-900 font-semibold line-clamp-1 mt-1">
                      {m.status}
                    </div>

                    <div className="text-[11px] text-zinc-500 line-clamp-2 mt-1 leading-snug">
                      {m.summary}
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-400 font-mono mt-3 pt-2 border-t border-zinc-200/80 flex items-center justify-between">
                    <span>{m.date}</span>
                    <span className="font-semibold text-zinc-600">{m.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Telemetry Status Callout Bar when Step === 4 */}
          {timelineStep === 4 && (
            <div className="mt-4 p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono animate-fadeIn">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="text-purple-950 font-bold uppercase">
                  LIVE AWS STREAM:
                </span>
                <span className="text-purple-900 font-semibold">
                  {liveWeather.station_name}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  {liveWeather.source === "LIVE_OPEN_METEO_API" ? "LIVE OPEN-METEO" : "OFFLINE FALLBACK"}
                </span>
                <span className="text-zinc-500 text-[10px]">
                  (Synced: {lastSyncedTime})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px]">
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
                <div className="hidden lg:flex items-center gap-1 text-zinc-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                  <span>Sky: <strong className="text-purple-900">{liveWeather.weather_condition}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => syncLiveWeather(false)}
                  disabled={weatherLoading}
                  className="ml-2 px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 text-[11px] font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  title="Refresh live telemetry feed right now"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${weatherLoading ? "animate-spin" : ""}`} />
                  <span>{weatherLoading ? "Syncing..." : "Sync AWS"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Topographic Elevation Profile & Kinetic Energy Corridor Card */}
        <section className="relative mb-8 p-6 md:p-8 rounded-2xl border border-zinc-200/90 shadow-md overflow-hidden bg-slate-900 text-zinc-900">
          {/* Authentic Landslide Debris Flow Terrain Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none transition-transform duration-700 scale-105"
            style={{
              backgroundImage: "url('/images/landslide_hero_bg.jpg')",
            }}
          />

          {/* Balanced Gradient Overlay: Subtle white wash on the left, more transparent on the right so the mountain slope failure and valley debris are clearly visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/88 to-white/60 pointer-events-none" />

          {/* Interactive Card Content Container */}
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-200/80">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                    Topographic Elevation Cross-Section & Hydraulic Momentum Profile
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
                    Vellarimala &rarr; Chooralmala Corridor
                  </span>
                </div>
                <p className="text-xs text-zinc-600 font-sans max-w-2xl font-medium">
                  Hydraulic momentum trace of the 30 July 2024 cloudburst channel. Shows how 1.85M m³ of boulder slurry accelerated down an 800m vertical drop, inundating the 9° valley floor settlements.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-zinc-200/90 text-center shadow-2xs">
                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">TOTAL DROP (H)</span>
                  <strong className="text-red-600 text-sm font-bold">800 m</strong>
                </div>
                <div className="bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-zinc-200/90 text-center shadow-2xs">
                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">RUNOUT REACH (L)</span>
                  <strong className="text-zinc-900 text-sm font-bold">6.1 km</strong>
                </div>
                <div className="bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-zinc-200/90 text-center shadow-2xs">
                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">LEAD TIME</span>
                  <strong className="text-amber-600 text-sm font-bold">14.2 min</strong>
                </div>
              </div>
            </div>

            {/* SVG Elevation Profile Waveform */}
            <div className="pt-6 pb-4">
              <div className="w-full h-36 relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-xl border border-zinc-200/90 p-2 shadow-2xs">
                <svg className="w-full h-full" viewBox="0 0 1000 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="elevationGradClean" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fecaca" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#fed7aa" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>
                  {/* Cross section fill */}
                  <path
                    d="M 50 15 Q 200 35 380 62 T 680 92 L 950 105 L 950 120 L 50 120 Z"
                    fill="url(#elevationGradClean)"
                  />
                  {/* Terrain surface contour line */}
                  <path
                    d="M 50 15 Q 200 35 380 62 T 680 92 L 950 105"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2.5"
                  />
                  {/* Waypoint nodes on curve */}
                  <circle cx="50" cy="15" r="5" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="250" cy="45" r="5" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="450" cy="72" r="5" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="700" cy="94" r="5" fill="#ca8a04" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="950" cy="105" r="5" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* Station elevation callouts */}
                <div className="absolute top-2 left-4 font-mono text-[11px] text-red-700 font-bold bg-white/95 px-2 py-0.5 rounded border border-red-200 shadow-2xs">
                  Apex: 1480m (42°)
                </div>
                <div className="absolute top-9 left-[23%] font-mono text-[10px] text-red-700 font-semibold bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">
                  Punchirimattam: 1220m
                </div>
                <div className="absolute top-16 left-[43%] font-mono text-[10px] text-amber-700 font-semibold bg-white/90 px-1.5 py-0.5 rounded shadow-2xs">
                  Mundakkai: 980m
                </div>
                <div className="absolute bottom-6 left-[68%] font-mono text-[11px] text-yellow-800 font-bold bg-white/95 px-2 py-0.5 rounded border border-yellow-200 shadow-2xs">
                  Chooralmala: 790m (9° Valley)
                </div>
                <div className="absolute bottom-3 right-4 font-mono text-[11px] text-emerald-700 font-bold bg-white/95 px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                  Attamala: 680m
                </div>
              </div>
            </div>

            {/* 5-Station Kinematics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 border-t border-zinc-200/80 text-xs font-mono">
              {channelWaypoints.map((wp, idx) => (
                <div
                  key={idx}
                  className="bg-white/85 backdrop-blur-xs p-3.5 rounded-xl border border-zinc-200/90 hover:border-zinc-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-zinc-500">WP #{idx + 1}</span>
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: `${wp.statusColor}18`, color: wp.statusColor }}
                    >
                      {wp.status.split(" ")[0]}
                    </span>
                  </div>
                  <div className="font-bold text-zinc-900 text-xs truncate mb-2" title={wp.name}>
                    {wp.name.split(". ")[1]}
                  </div>
                  <div className="text-[11px] text-zinc-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Elevation:</span>
                      <strong className="text-zinc-800">{wp.elevation} m</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Arrival ETA:</span>
                      <strong className="text-zinc-900">{wp.etaMinutes === 0 ? "T = 0" : `+${wp.etaMinutes}m`}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Flow Velocity:</span>
                      <strong className="text-red-600 font-bold">{wp.velocityMs} m/s</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Impact Press:</span>
                      <strong className="text-zinc-800">{wp.pressureKPa} kPa</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3.5 bg-blue-50/90 backdrop-blur-xs rounded-xl border border-blue-200/90 text-xs text-blue-950 font-sans leading-relaxed shadow-2xs">
              <strong className="text-blue-900 font-semibold">Scientific Finding: </strong>
              Chooralmala settlement sits on a gentle 9° valley floor. Conventional susceptibility mapping classifies it as &quot;Low Slope / Moderate Risk&quot;. GeoShield integrates upstream momentum routing to detect long-runout hydraulic debris flows across the Western Ghats.
            </div>
          </div>
        </section>
      </main>

      {/* Coder Corporate Footer */}
      <TacticalDock />
    </div>
  );
}
