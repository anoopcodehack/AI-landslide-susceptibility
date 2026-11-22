"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAlerts } from "./AlertCenter";
import {
  Bell,
  Volume2,
  VolumeX,
  X,
  ShieldAlert,
  Zap,
  Send,
  CheckCircle2,
  Smartphone,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { sendTelegramAlert, autoDetectTelegramChat } from "@/lib/api";

const DEFAULT_BOT_TOKEN = "8792643988:AAGT1vj7yD6AsIh8ND72VvssIwCpWG1DGtU";

export const AlertBellDrawer: React.FC = () => {
  const {
    alerts,
    unreadCount,
    audioEnabled,
    toggleAudio,
    clearAlerts,
    triggerSimulatedCloudburstAlert,
  } = useAlerts();

  const [mounted, setMounted] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Telegram Bot State
  const [telegramToken, setTelegramToken] = useState<string>(DEFAULT_BOT_TOKEN);
  const [telegramChatId, setTelegramChatId] = useState<string>("");
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);
  const [telegramLoading, setTelegramLoading] = useState<boolean>(false);
  const [detectingChat, setDetectingChat] = useState<boolean>(false);
  const [showTelegramConfig, setShowTelegramConfig] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("geoshield_telegram_token") || DEFAULT_BOT_TOKEN;
      const savedChat = localStorage.getItem("geoshield_telegram_chat_id") || "";
      setTelegramToken(savedToken);
      if (savedChat) setTelegramChatId(savedChat);
    }
  }, []);

  const handleAutoDetectChat = async () => {
    setDetectingChat(true);
    setTelegramStatus(null);
    try {
      const res = await autoDetectTelegramChat(telegramToken);
      if (res.ok && res.detected && res.chat_id) {
        setTelegramChatId(res.chat_id);
        if (typeof window !== "undefined") {
          localStorage.setItem("geoshield_telegram_chat_id", res.chat_id);
        }
        setTelegramStatus(`Detected recipient: ${res.user || "You"} (Chat ID: ${res.chat_id})`);
      } else {
        setTelegramStatus(res.detail || "Open @GeoShield_Warning_Bot on Telegram and tap 'Start', then try again.");
      }
    } catch (err: any) {
      setTelegramStatus(`Detection failed: ${err.message}`);
    } finally {
      setDetectingChat(false);
    }
  };

  const handleDispatchTelegram = async () => {
    setTelegramLoading(true);
    setTelegramStatus(null);
    try {
      const latest = alerts[0];
      const res = await sendTelegramAlert({
        level: latest?.level || "RED",
        sector: latest?.sector || "Chooralmala & Mundakkai (6.1 km Axis)",
        sector_kn: latest?.sectorKn || "ಚೂರಲ್ಮಲಾ ಮತ್ತು ಮುಂಡಕ್ಕೈ ಕಾರಿಡಾರ್",
        rainfall_mm: latest?.rainfallMm || 372.0,
        susceptibility_pct: latest?.susceptibilityPct || 96.4,
        message_en: latest?.message || "Immediate valley-floor evacuation order active. Relocate to Meppadi relief shelter.",
        message_kn: latest?.messageKn || "ತೀವ್ರ ಭೂಕುಸಿತದ ಸಾಧ್ಯತೆ ಇರುವುದರಿಂದ ನದಿ ಪಾತ್ರದ ನಿವಾಸಿಗಳು ತಕ್ಷಣ ಸುರಕ್ಷಿತ ಸ್ಥಳಗಳಿಗೆ ತೆರಳಿ. ಮೆಪ್ಪಾಡಿ ಪರಿಹಾರ ಕೇಂದ್ರಕ್ಕೆ ಸ್ಥಳಾಂತರಗೊಳ್ಳಿ.",
        bot_token: telegramToken.trim() || undefined,
        chat_id: telegramChatId.trim() || undefined,
      });

      if (res.status === "SENT") {
        setTelegramStatus(`Dispatched live to Telegram: Chat ID ${res.recipient_chat_id}`);
      } else if (res.status === "SIMULATED") {
        setTelegramStatus("Simulated Mode: Bilingual alert generated. To receive live on phone, enter Bot Token & Chat ID.");
      } else {
        setTelegramStatus(`Telegram Error: ${res.detail}`);
      }
    } catch (err: any) {
      setTelegramStatus(`Failed to send: ${err.message}`);
    } finally {
      setTelegramLoading(false);
    }
  };

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

  const drawerModal = (
    <div className="fixed inset-0 z-[99999] flex justify-end">
      {/* Dimmed Full-Viewport Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Right Pinned Slide-Over Drawer: True Full Viewport Height */}
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Civil Defense Early Warning Alerts"
        className="relative z-[100000] w-full max-w-[440px] bg-white border-l border-zinc-200 shadow-2xl flex flex-col h-[100dvh] max-h-[100dvh] text-zinc-900 animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header (Fixed at top) */}
        <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shrink-0">
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
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4 font-mono text-xs">
          {/* Civil Defense Posture Card */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 shrink-0">
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
          <div className="flex items-center gap-2 shrink-0">
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

          {/* Telegram Bot Bilingual Alert Dispatch Panel */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-black text-[11px]">
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Telegram Bot Broadcast (Eng + ಕನ್ನಡ)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTelegramConfig(!showTelegramConfig)}
                className="text-[10px] text-zinc-500 hover:text-black underline font-semibold cursor-pointer"
              >
                {showTelegramConfig ? "Hide Config" : "Bot Setup"}
              </button>
            </div>

            {showTelegramConfig && (
              <div className="space-y-2.5 mb-2.5 pt-2 border-t border-zinc-200">
                <div className="p-2 bg-blue-50/70 border border-blue-200/60 rounded text-[10.5px] text-blue-900 leading-snug">
                  <div className="font-bold flex items-center gap-1 mb-0.5">
                    <Smartphone className="w-3 h-3 text-blue-600" />
                    <span>Quick 1-Step Telegram Connect:</span>
                  </div>
                  <div>
                    1. Open{" "}
                    <a
                      href="https://t.me/GeoShield_Warning_Bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline text-blue-800"
                    >
                      @GeoShield_Warning_Bot
                    </a>{" "}
                    on Telegram and press <strong>Start</strong>.
                  </div>
                  <div>
                    2. Click <strong>Auto-Detect Phone</strong> below!
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] text-zinc-500 font-semibold">RECIPIENT CHAT ID</label>
                    <button
                      type="button"
                      onClick={handleAutoDetectChat}
                      disabled={detectingChat}
                      className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${detectingChat ? "animate-spin" : ""}`} />
                      <span>{detectingChat ? "Checking..." : "Auto-Detect Phone"}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Click 'Auto-Detect' or enter Chat ID (e.g. 987654321)"
                    value={telegramChatId}
                    onChange={(e) => {
                      setTelegramChatId(e.target.value);
                      if (typeof window !== "undefined") localStorage.setItem("geoshield_telegram_chat_id", e.target.value);
                    }}
                    className="w-full px-2 py-1 text-[11px] rounded border border-zinc-300 font-mono focus:outline-none focus:border-black bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block mb-0.5 font-semibold">BOT TOKEN (Preset to @GeoShield_Warning_Bot)</label>
                  <input
                    type="password"
                    placeholder="Bot API Token"
                    value={telegramToken}
                    onChange={(e) => {
                      setTelegramToken(e.target.value);
                      if (typeof window !== "undefined") localStorage.setItem("geoshield_telegram_token", e.target.value);
                    }}
                    className="w-full px-2 py-1 text-[11px] rounded border border-zinc-300 font-mono focus:outline-none focus:border-black bg-white"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleDispatchTelegram}
              disabled={telegramLoading}
              className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3 h-3" />
              <span>{telegramLoading ? "Dispatching..." : "Send Bilingual Alert to Telegram"}</span>
            </button>

            {telegramStatus && (
              <div className="mt-2 p-2 rounded bg-white border border-zinc-200 text-[10px] text-zinc-700 font-mono leading-relaxed">
                {telegramStatus}
              </div>
            )}
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

                    {item.messageKn && (
                      <div className="mt-1.5 p-2 rounded bg-white/80 border border-zinc-200/60 text-[10.5px] text-zinc-700 font-sans leading-relaxed">
                        <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase mb-0.5">
                          ಕನ್ನಡ // Kannada Advisory
                        </span>
                        {item.messageKn}
                      </div>
                    )}

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

        {/* Drawer Footer (Fixed at bottom) */}
        <div className="shrink-0 p-4 border-t border-zinc-200 bg-zinc-50/90 flex items-center justify-between text-[11px] font-mono text-zinc-500">
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
  );

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

      {/* Render via Portal to document.body so navbar filters/backdrop-blur never trap or clip it */}
      {isOpen && mounted && typeof document !== "undefined"
        ? createPortal(drawerModal, document.body)
        : null}
    </>
  );
};
