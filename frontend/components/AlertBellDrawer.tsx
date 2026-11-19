"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAlerts } from "./AlertCenter";
import {
  Bell,
  Volume2,
  VolumeX,
  X,
  ShieldAlert,
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

  // Close when pressing Escape key and lock body scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
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
    <>
      {/* Alert Trigger Button in Navbar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
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

      {/* Slide-Over Drawer with Dimmed Overlay (Never overlaps or obscures page heading) */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          {/* Dimmed Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Right Pinned Slide-Over Drawer */}
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Civil Defense Early Warning Alerts"
            className="relative z-[1001] w-full max-w-[420px] bg-white border-l border-zinc-200 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200 text-zinc-900"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xs uppercase tracking-wider text-black font-mono">
                    Civil Defense Alerts
                  </h2>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    KSDMA Early Warning Mesh
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-black transition-colors cursor-pointer"
                  title={audioEnabled ? "Radar audio chime active (Click to mute)" : "Radar audio chime muted"}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4 text-black" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-500 hover:text-black transition-colors cursor-pointer"
                  title="Close alerts drawer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-mono text-xs">
              {/* Civil Defense Posture Card */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">KSDMA THREAT LEVEL</span>
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
                <p className="text-[11px] text-zinc-700 font-sans leading-relaxed">
                  {hasCriticalAlert
                    ? "Immediate valley-floor evacuation order active. Relocate civilian clusters to Meppadi."
                    : hasOrangeAlert
                    ? "Sustained rainfall saturation watch. Transport corridors on NH-766 monitored."
                    : "Continuous synoptic telemetry mesh active. All slope moisture levels below failure envelope."}
                </p>
              </div>

              {/* Quick Viva Demonstration Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerSimulatedCloudburstAlert()}
                  className="flex-1 py-2 px-3 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate 372mm Disaster Alert</span>
                </button>
                <button
                  type="button"
                  onClick={clearAlerts}
                  className="py-2 px-3 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition-colors text-[11px] font-semibold cursor-pointer"
                  title="Clear notification feed"
                >
                  Clear
                </button>
              </div>

              {/* Notification Feed List */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2 text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                  <span>Telemetry Dispatch Log</span>
                  <span className="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 font-mono">
                    {alerts.length}
                  </span>
                </div>

                {alerts.length === 0 ? (
                  <div className="py-10 text-center text-zinc-400 text-xs">
                    No active notifications.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {alerts.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border text-xs transition-colors ${
                          item.level === "RED"
                            ? "bg-red-50/70 border-red-200"
                            : item.level === "ORANGE"
                            ? "bg-amber-50/70 border-amber-200"
                            : "bg-zinc-50/50 border-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-black text-[11px] truncate max-w-[220px]">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 shrink-0 font-mono">{item.timestamp}</span>
                        </div>

                        <p className="text-[11px] text-zinc-600 font-sans leading-relaxed">
                          {item.message}
                        </p>

                        <div className="mt-2 pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px]">
                          <span className="text-zinc-500 font-semibold">{item.sector}</span>
                          {item.actionUrl && (
                            <Link
                              href={item.actionUrl}
                              onClick={() => setIsOpen(false)}
                              className="text-black font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>Inspect &rarr;</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50/80 flex items-center justify-between text-[11px] font-mono text-zinc-500 sticky bottom-0">
              <span>Browser Desktop Push:</span>
              <button
                type="button"
                onClick={requestDesktopPermission}
                className="text-black font-bold hover:underline cursor-pointer"
              >
                Enable Notifications
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
