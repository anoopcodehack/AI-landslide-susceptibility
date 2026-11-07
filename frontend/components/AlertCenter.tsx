"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Radio,
  ShieldAlert,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  Sliders,
} from "lucide-react";

export interface CivilAlert {
  id: string;
  level: "GREEN" | "YELLOW" | "ORANGE" | "RED";
  title: string;
  message: string;
  timestamp: string;
  sector?: string;
  actionUrl?: string;
}

interface AlertContextType {
  alerts: CivilAlert[];
  unreadCount: number;
  activeToast: CivilAlert | null;
  audioEnabled: boolean;
  toggleAudio: () => void;
  triggerAlert: (alert: Omit<CivilAlert, "id" | "timestamp">) => void;
  dismissToast: () => void;
  clearAlerts: () => void;
  triggerSimulatedCloudburstAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
};

// Tactical audio synthesizer for civil warning beeps (zero external mp3 assets needed)
const playAlertSound = (level: "GREEN" | "YELLOW" | "ORANGE" | "RED") => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (level === "RED") {
      // Urgent double tone civil defense frequency
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1174, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (level === "ORANGE") {
      // Single attention chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(740, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Tactical telemetry confirmation blip
      osc.type = "sine";
      osc.frequency.setValueAtTime(659, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    }
  } catch {
    // Audio autoplay restrictions before user gesture
  }
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<CivilAlert[]>([
    {
      id: "baseline-01",
      level: "GREEN",
      title: "Atmospheric Telemetry Nominal",
      message: "Open-Meteo AWS #04 synoptic telemetry confirms 2.8mm/24h rainfall. Soil pore-pressure within baseline stability envelope across Wayanad.",
      timestamp: "Today (Live Synoptic)",
      sector: "District-Wide Baseline",
      actionUrl: "/radar",
    },
  ]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeToast, setActiveToast] = useState<CivilAlert | null>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  const toggleAudio = () => setAudioEnabled((prev) => !prev);

  const triggerAlert = (newAlertData: Omit<CivilAlert, "id" | "timestamp">) => {
    const alert: CivilAlert = {
      ...newAlertData,
      id: `alert-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    setAlerts((prev) => [alert, ...prev.slice(0, 19)]); // Keep last 20
    setUnreadCount((prev) => prev + 1);
    setActiveToast(alert);

    if (audioEnabled) {
      playAlertSound(alert.level);
    }

    // Try browser push notification if permitted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(`GeoShield Alert: ${alert.title}`, {
          body: alert.message,
        });
      } catch {
        // Fallback
      }
    }
  };

  const dismissToast = () => setActiveToast(null);

  const clearAlerts = () => {
    setAlerts([]);
    setUnreadCount(0);
    setActiveToast(null);
  };

  const triggerSimulatedCloudburstAlert = () => {
    triggerAlert({
      level: "RED",
      title: "KSDMA CRITICAL HAZARD // EVACUATION ORDER",
      message: "Catastrophic 372mm cloudburst saturation detected. High-momentum debris flow runout active along Iruvaipuzha channel (Chooralmala & Mundakkai).",
      sector: "Chooralmala & Mundakkai (6.1 km Axis)",
      actionUrl: "/radar",
    });
  };

  // Auto-dismiss toast after 8 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        activeToast,
        audioEnabled,
        toggleAudio,
        triggerAlert,
        dismissToast,
        clearAlerts,
        triggerSimulatedCloudburstAlert,
      }}
    >
      {children}

      {/* Global Slide-In Coder Toast Notification */}
      {activeToast && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-auto">
          <div
            className={`p-4 rounded-xl border bg-white shadow-xl text-xs font-mono transition-all ${
              activeToast.level === "RED"
                ? "border-red-500 ring-2 ring-red-500/20"
                : activeToast.level === "ORANGE"
                ? "border-amber-500 ring-2 ring-amber-500/20"
                : "border-zinc-300"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeToast.level === "RED"
                      ? "bg-red-500 animate-ping"
                      : activeToast.level === "ORANGE"
                      ? "bg-amber-500 animate-pulse"
                      : "bg-emerald-500"
                  }`}
                />
                <span className="font-bold text-black uppercase tracking-wider text-[11px]">
                  {activeToast.level === "RED"
                    ? "CIVIL DEFENSE DIRECTIVE"
                    : activeToast.level === "ORANGE"
                    ? "HAZARD ADVISORY WATCH"
                    : "TELEMETRY DISPATCH"}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    activeToast.level === "RED"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : activeToast.level === "ORANGE"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {activeToast.level} ALERT
                </span>
              </div>

              <button
                onClick={dismissToast}
                className="text-zinc-400 hover:text-black transition-colors p-0.5 rounded"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body */}
            <div className="pt-2.5">
              <div className="font-bold text-zinc-900 text-xs">{activeToast.title}</div>
              <p className="text-[11px] text-zinc-600 font-sans mt-1 leading-relaxed">
                {activeToast.message}
              </p>
              {activeToast.sector && (
                <div className="mt-2 text-[10px] text-zinc-500 flex items-center gap-1.5">
                  <span className="text-zinc-400 uppercase">Sector:</span>
                  <strong className="text-zinc-800">{activeToast.sector}</strong>
                  <span className="text-zinc-300">|</span>
                  <span>{activeToast.timestamp}</span>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between">
              <button
                onClick={dismissToast}
                className="text-[10px] text-zinc-500 hover:text-black font-semibold"
              >
                Dismiss [Esc]
              </button>
              {activeToast.actionUrl && (
                <Link
                  href={activeToast.actionUrl}
                  onClick={dismissToast}
                  className="btn-coder-black px-3 py-1 text-[11px] flex items-center gap-1 shadow-2xs"
                >
                  <span>Open Sector Recon</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
