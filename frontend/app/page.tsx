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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Modal states
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isShapOpen, setIsShapOpen] = useState<boolean>(false);
  const [isSimOpen, setIsSimOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Live Backend Telemetry
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [totalPoints, setTotalPoints] = useState<number>(1500);
  const [activeAlerts, setActiveAlerts] = useState<number>(14);
  const [rocAuc, setRocAuc] = useState<string>("94.4%");
  const [modelName, setModelName] = useState<string>("XGBoost");

  // Fetch live stats on component mount
  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/stats");
        if (res.ok) {
          const data = await res.json();
          setTotalPoints(data.total_survey_points || 1500);
          setRocAuc(((data.model_roc_auc || 0.9439) * 100).toFixed(1) + "%");
          setModelName(data.model_name || "XGBoost");
          setBackendOnline(true);
        }
      } catch (err) {
        setBackendOnline(false);
      }
    };

    fetchLiveStats();
  }, []);

  return (
    <div className="w-full max-w-[1440px] bg-slate-50/90 rounded-4xl shadow-2xl border border-white/80 overflow-hidden flex flex-col">
      {/* 1. Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenShap={() => setIsShapOpen(true)}
        onOpenSim={() => setIsSimOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        backendOnline={backendOnline}
        modelName={modelName}
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

          <HeroGaugeCard rocAuc={rocAuc} modelName={modelName} />
        </div>

        {/* Right Column: 2x2 Stats Grid & Trend Chart (span 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <StatsGrid totalPoints={totalPoints} activeAlerts={activeAlerts} />
          <TrendChart />
        </div>
      </main>

      {/* 3. Bottom Signature Dark Dock */}
      <TacticalDock
        onOpenMap={() => setIsMapOpen(true)}
        onOpenShap={() => setIsShapOpen(true)}
        onOpenSim={() => setIsSimOpen(true)}
      />

      {/* Modals */}
      <GisMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
      <ShapModal isOpen={isShapOpen} onClose={() => setIsShapOpen(false)} />
      <SimulationModal isOpen={isSimOpen} onClose={() => setIsSimOpen(false)} />
      <ArchitectureModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
