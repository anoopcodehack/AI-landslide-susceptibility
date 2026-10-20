"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroGaugeCard } from "@/components/HeroGaugeCard";
import { StatsGrid } from "@/components/StatsGrid";
import { TrendChart } from "@/components/TrendChart";
import { TacticalDock } from "@/components/TacticalDock";
import { GisMapModal } from "@/components/GisMapModal";
import { ShapModal } from "@/components/ShapModal";
import { SimulationModal } from "@/components/SimulationModal";
import { ArchitectureModal } from "@/components/ArchitectureModal";

interface DashboardData {
  status: string;
  overview: {
    terrain_stability_index: number;
    pore_pressure_index: number;
    model_confidence: string;
    model_name: string;
    dem_resolution: string;
    slope_stress_pct: string;
    rainfall_saturation_pct: string;
    ndvi_cohesion_pct: string;
  };
  stats: {
    total_survey_points: number;
    monitored_basins: number;
    sensor_nodes: number;
    active_hotspot_alerts: number;
    monitored_area_km2: number;
  };
  trend_chart: {
    weekly: Array<{ day: string; rainfall_mm: number; hazard_idx: number; highlight?: boolean }>;
    daily: Array<{ time: string; rainfall_mm: number }>;
    monthly: Array<{ week: string; rainfall_mm: number }>;
  };
  sectors: Array<{
    id: string;
    name: string;
    score_pct: string;
    status_label: string;
    variant: "green" | "amber" | "blue";
    last_survey: string;
    lat: number;
    lon: number;
  }>;
  alerts: Array<{
    id: number;
    title: string;
    timestamp: string;
    severity: "danger" | "warning" | "stable";
  }>;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Modal states
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isShapOpen, setIsShapOpen] = useState<boolean>(false);
  const [isSimOpen, setIsSimOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Dynamic Dashboard Data State from Backend
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  // Fetch unified live telemetry from FastAPI backend on mount
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/dashboard");
        if (res.ok) {
          const data: DashboardData = await res.json();
          setDashboardData(data);
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch (err) {
        setBackendOnline(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="w-full max-w-[1440px] bg-slate-50/90 rounded-4xl shadow-2xl border border-white/80 overflow-hidden flex flex-col">
      {/* 1. Top Navigation Bar (Clean Enterprise - No Ports) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenShap={() => setIsShapOpen(true)}
        onOpenSim={() => setIsSimOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        backendOnline={backendOnline}
      />

      {/* 2. Upper Light SaaS Body */}
      <main className="p-6 md:p-9 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Greeting & Hero Gauge Card (span 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Disaster Response Cell
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Real-time spatial susceptibility & hazard assessment for Wayanad District
            </p>
          </div>

          <HeroGaugeCard
            terrainStability={dashboardData?.overview?.terrain_stability_index ?? 86.4}
            porePressure={dashboardData?.overview?.pore_pressure_index ?? 86.0}
            rocAuc={dashboardData?.overview?.model_confidence ?? "94.4%"}
            modelName={dashboardData?.overview?.model_name ?? "XGBoost Classifier"}
            slopeStress={dashboardData?.overview?.slope_stress_pct ?? "28.4%"}
            rainfallSaturation={dashboardData?.overview?.rainfall_saturation_pct ?? "34.2%"}
            ndviCohesion={dashboardData?.overview?.ndvi_cohesion_pct ?? "30.1%"}
          />
        </div>

        {/* Right Column: 2x2 Stats Grid & Trend Chart (span 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <StatsGrid
            totalPoints={dashboardData?.stats?.total_survey_points ?? 1500}
            monitoredBasins={dashboardData?.stats?.monitored_basins ?? 128}
            sensorNodes={dashboardData?.stats?.sensor_nodes ?? 74}
            activeAlerts={dashboardData?.stats?.active_hotspot_alerts ?? 14}
          />
          <TrendChart trendData={dashboardData?.trend_chart} />
        </div>
      </main>

      {/* 3. Bottom Signature Dark Dock */}
      <TacticalDock
        onOpenMap={() => setIsMapOpen(true)}
        onOpenShap={() => setIsShapOpen(true)}
        onOpenSim={() => setIsSimOpen(true)}
        sectors={dashboardData?.sectors}
        alerts={dashboardData?.alerts}
      />

      {/* Modals */}
      <GisMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
      <ShapModal isOpen={isShapOpen} onClose={() => setIsShapOpen(false)} />
      <SimulationModal isOpen={isSimOpen} onClose={() => setIsSimOpen(false)} />
      <ArchitectureModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
