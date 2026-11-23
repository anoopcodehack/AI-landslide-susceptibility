"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, Globe } from "lucide-react";
import { AlertBellDrawer } from "./AlertBellDrawer";
import { useLanguage } from "@/lib/LanguageContext";

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onOpenMap?: () => void;
  onOpenShap?: () => void;
  onOpenSim?: () => void;
  onOpenAbout?: () => void;
  backendOnline?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  backendOnline = true,
}) => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [jumpingLetter, setJumpingLetter] = useState<number | null>(null);
  const [hasEntered, setHasEntered] = useState<boolean>(false);

  const brandLetters = ["G", "E", "O", "S", "H", "I", "E", "L", "D"];

  useEffect(() => {
    // Release entrance animation lock after all letters drop into place
    const timer = setTimeout(() => {
      setHasEntered(true);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  const triggerJump = (index: number) => {
    if (jumpingLetter !== null) return;
    setJumpingLetter(index);
    setTimeout(() => {
      setJumpingLetter(null);
    }, 450);
  };

  const navLinks = [
    { name: t("nav_overview"), href: "/", shortcut: "" },
    { name: t("nav_radar"), href: "/radar", shortcut: "M" },
    { name: t("nav_diagnostics"), href: "/diagnostics", shortcut: "X" },
    { name: t("nav_simulation"), href: "/simulation", shortcut: "S" },
    { name: t("nav_governance"), href: "/governance", shortcut: "" },
  ];

  return (
    <header className="coder-white-header sticky top-0 z-40 px-6 md:px-12 py-3.5 flex items-center justify-between border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
      {/* Brand: GEOSHIELD with Staggered Entrance & Contained Bouncing 'D' on Hover */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="flex items-center cursor-pointer select-none group"
        >
          <span className="text-2xl font-black tracking-tight text-black uppercase font-mono flex items-center">
            {brandLetters.map((char, index) => {
              const isD = char === "D" || index === brandLetters.length - 1;
              const isJumping = jumpingLetter === index;
              return (
                <span
                  key={index}
                  style={!hasEntered ? { animationDelay: `${index * 0.08}s` } : undefined}
                  onMouseEnter={() => {
                    if (isD) triggerJump(index);
                  }}
                  className={`inline-block select-none transition-colors duration-150 ${
                    !hasEntered ? "nav-letter-drop" : ""
                  } ${
                    isJumping
                      ? "animate-jump text-emerald-600"
                      : isD
                      ? "hover:text-emerald-600 cursor-pointer"
                      : "hover:text-zinc-700 cursor-default"
                  }`}
                  title={isD ? "D" : undefined}
                >
                  {char}
                </span>
              );
            })}
          </span>
        </Link>

        {/* Center Product Links (Real Next.js Full Pages) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-1 flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? "text-black font-bold"
                    : "text-zinc-600 hover:text-black font-medium"
                }`}
              >
                <span>{item.name}</span>
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-black rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Action Controls (Desktop lg+) */}
      <div className="hidden lg:flex items-center gap-2.5 xl:gap-3">
        {/* Bilingual Language Switcher (EN | ಕನ್ನಡ) */}
        <div className="flex items-center rounded-full bg-zinc-100 p-0.5 border border-zinc-200/90 shadow-2xs font-sans text-xs">
          <button
            onClick={() => setLanguage("en")}
            className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
              language === "en"
                ? "bg-black text-white shadow-xs"
                : "text-zinc-600 hover:text-black"
            }`}
            title="Switch to English"
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("kn")}
            className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
              language === "kn"
                ? "bg-black text-white shadow-xs"
                : "text-zinc-600 hover:text-black"
            }`}
            title="ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿ (Switch to Kannada)"
          >
            ಕನ್ನಡ
          </button>
        </div>

        {/* Civil Defense Early Warning Notification Drawer */}
        <AlertBellDrawer />

        {/* Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 border border-zinc-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px]">
            {backendOnline ? t("cluster_online") : t("telemetry_active")}
          </span>
        </div>

        {/* Action Button 1: Parametric Sim */}
        <Link
          href="/simulation"
          className={`btn-coder-light px-3.5 py-1.5 text-xs transition-transform active:scale-95 ${
            pathname === "/simulation" ? "border-black font-bold text-black" : ""
          }`}
        >
          {t("parametric_sim")}
        </Link>

        {/* Action Button 2: Launch Radar */}
        <Link
          href="/radar"
          className="btn-coder-black px-3.5 py-1.5 text-xs flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <span className="w-2 h-2 bg-white inline-block" />
          <span>{t("launch_radar")}</span>
        </Link>
      </div>

      {/* Mobile / Tablet Controls (< lg) */}
      <div className="lg:hidden flex items-center gap-2">
        {/* Mobile Language Switcher */}
        <button
          onClick={() => setLanguage(language === "en" ? "kn" : "en")}
          className="px-2 py-1 rounded-md bg-zinc-100 text-zinc-800 text-xs font-bold border border-zinc-200"
          title="Toggle Language"
        >
          {language === "en" ? "ಕನ್ನಡ" : "EN"}
        </button>
        <AlertBellDrawer />
        <Link
          href="/radar"
          className="btn-coder-black px-2.5 py-1 text-xs"
        >
          {t("nav_radar")}
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-800 hover:bg-zinc-200 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-zinc-200 shadow-xl p-5 flex flex-col gap-3 animate-in slide-in-from-top-2">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between transition-colors ${
                pathname === item.href
                  ? "bg-zinc-100 text-black font-bold"
                  : "text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <span>{item.name}</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-400" />
            </Link>
          ))}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Cluster Status:</span>
            <span className="text-emerald-600 font-bold">Online // 12ms</span>
          </div>
        </div>
      )}
    </header>
  );
};
