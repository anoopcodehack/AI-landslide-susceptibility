"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navLinks = [
    { name: "Overview", href: "/", shortcut: "" },
    { name: "GIS Radar", href: "/radar", shortcut: "M" },
    { name: "XAI Diagnostics", href: "/diagnostics", shortcut: "X" },
    { name: "Simulation Studio", href: "/simulation", shortcut: "S" },
    { name: "Governance & SDGs", href: "/governance", shortcut: "" },
  ];

  return (
    <header className="coder-white-header sticky top-0 z-40 px-6 md:px-12 py-3.5 flex items-center justify-between border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
      {/* Brand: GEOSHIELD█ */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="flex items-center gap-1.5 cursor-pointer select-none group"
        >
          <span className="text-xl font-black tracking-tighter text-black uppercase font-mono group-hover:opacity-85 transition-opacity">
            GEOSHIELD
          </span>
          <span className="w-2.5 h-3.5 bg-black inline-block ml-0.5" />
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
                {item.shortcut && (
                  <kbd className="hidden xl:inline-block text-[9px] font-mono px-1 py-0.2 bg-zinc-100 border border-zinc-300 rounded text-zinc-500 font-semibold">
                    {item.shortcut}
                  </kbd>
                )}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-black rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Action Controls */}
      <div className="hidden sm:flex items-center gap-3">
        {/* Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 border border-zinc-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px]">
            {backendOnline ? "Cluster Online // 12ms" : "Telemetry Active"}
          </span>
        </div>

        {/* Action Button 1: Parametric Sim */}
        <Link
          href="/simulation"
          className={`btn-coder-light px-3.5 py-1.5 text-xs transition-transform active:scale-95 ${
            pathname === "/simulation" ? "border-black font-bold text-black" : ""
          }`}
        >
          Parametric Sim
        </Link>

        {/* Action Button 2: Launch Radar */}
        <Link
          href="/radar"
          className="btn-coder-black px-3.5 py-1.5 text-xs flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <span className="w-2 h-2 bg-white inline-block" />
          <span>Launch Radar</span>
        </Link>
      </div>

      {/* Mobile Hamburger Toggle Button */}
      <div className="lg:hidden flex items-center gap-2">
        <Link
          href="/radar"
          className="btn-coder-black px-2.5 py-1 text-xs sm:hidden"
        >
          Radar
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
