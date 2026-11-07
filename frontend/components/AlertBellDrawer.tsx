"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAlerts } from "./AlertCenter";
import {
  Bell,
  Volume2,
  VolumeX,
  X,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
} from "lucide-react";

export const AlertBellDrawer: React.FC = () => {
  const {
    alerts,
    unreadCount,
    audioEnabled,
    toggleAudio,
    clearAlerts,
    triggerSimulatedCloudburstAlert,
  } = useAlerts();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const hasCriticalAlert = alerts.some((a) => a.level === "RED");
  const hasOrangeAlert = alerts.some((a) => a.level === "ORANGE");

  const requestDesktopPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        new Notification("GeoShield Early Warning System", {
          body: "Desktop emergency hazard push notifications enabled.",
        });
      }
    }
  };

  return (
    <div className="relative" ref={drawerRef}>
      {/* Alert Trigger Button in Navbar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all shadow-2xs ${
          hasCriticalAlert
            ? "bg-red-50 text-red-900 border-red-300 hover:bg-red-100"
            : hasOrangeAlert
            ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
            : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
        }`}
        title="Toggle Civil Defense Early Warning Notifications"
      >
        <div className="relative">
          <Bell className="w-3.5 h-3.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </div>

        <span className="text-[11px] font-bold">
          {hasCriticalAlert ? (
            <span className="text-red-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              RED ALERT
            </span>
          ) : hasOrangeAlert ? (
            <span className="text-amber-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              WATCH
            </span>
          ) : (
            <span className="text-zinc-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              NOMINAL
            </span>
          )}
        </span>
      </button>

      {/* Dropdown Tactical Drawer Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] bg-white rounded-2xl border border-zinc-300 shadow-2xl p-5 text-zinc-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-black" />
              <span className="font-bold uppercase tracking-wider text-black">
                Civil Defense Alerts
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAudio}
                className="p-1 rounded hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors"
                title={audioEnabled ? "Radar audio chime active (Click to mute)" : "Radar audio chime muted"}
              >
                {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-black" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-400" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-black transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Civil Defense Posture Card */}
          <div className="mt-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">KSDMA THREAT LEVEL</span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                  hasCriticalAlert
                    ? "bg-red-600 text-white"
                    : hasOrangeAlert
                    ? "bg-amber-600 text-white"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {hasCriticalAlert ? "RED DIRECTIVE" : hasOrangeAlert ? "ORANGE WATCH" : "GREEN NOMINAL"}
              </span>
            </div>
            <div className="text-[11px] text-zinc-700 font-sans leading-snug">
              {hasCriticalAlert
                ? "Immediate valley-floor evacuation order active. Relocate civilian clusters to Meppadi."
                : hasOrangeAlert
                ? "Sustained rainfall saturation watch. Transport corridors on NH-766 monitored."
                : "Continuous synoptic telemetry mesh active. All slope moisture levels below failure envelope."}
            </div>
          </div>

          {/* Quick Viva Demonstration Button */}
          <div className="mt-3 flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                triggerSimulatedCloudburstAlert();
              }}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Simulate 372mm Disaster Alert</span>
            </button>
            <button
              type="button"
              onClick={clearAlerts}
              className="py-1.5 px-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition-colors text-[10px] font-semibold"
              title="Clear notification feed"
            >
              Clear
            </button>
          </div>

          {/* Notification Feed List */}
          <div className="mt-4 max-h-[260px] overflow-y-auto space-y-2.5 pr-1">
            <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
              Telemetry Dispatch Log ({alerts.length})
            </div>

            {alerts.length === 0 ? (
              <div className="py-6 text-center text-zinc-400 text-xs font-mono">
                No active notifications.
              </div>
            ) : (
              alerts.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs font-mono transition-colors ${
                    item.level === "RED"
                      ? "bg-red-50/60 border-red-200"
                      : item.level === "ORANGE"
                      ? "bg-amber-50/60 border-amber-200"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-black text-[11px] truncate max-w-[220px]">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 shrink-0">{item.timestamp}</span>
                  </div>

                  <p className="text-[11px] text-zinc-600 font-sans leading-relaxed">
                    {item.message}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-semibold">{item.sector}</span>
                    {item.actionUrl && (
                      <Link
                        href={item.actionUrl}
                        onClick={() => setIsOpen(false)}
                        className="text-black font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Inspect &rarr;</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Desktop Notifications Permission */}
          <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Browser Desktop Push:</span>
            <button
              type="button"
              onClick={requestDesktopPermission}
              className="text-black font-bold hover:underline"
            >
              Request Permission
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
