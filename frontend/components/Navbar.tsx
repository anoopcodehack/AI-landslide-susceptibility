"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  const navLinks = [
    { name: "Overview", href: "/" },
    { name: "GIS Radar", href: "/radar" },
    { name: "XAI Diagnostics", href: "/diagnostics" },
    { name: "Simulation Studio", href: "/simulation" },
    { name: "Governance & SDGs", href: "/governance" },
  ];

  return (
    <header className="coder-white-header sticky top-0 z-40 px-6 md:px-12 py-4 flex items-center justify-between border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
      {/* Brand: GEOSHIELD█ */}
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="flex items-center gap-1 cursor-pointer select-none group"
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
                className={`relative py-1 transition-colors ${
                  isActive
                    ? "text-black font-bold"
                    : "text-zinc-600 hover:text-black font-medium"
                }`}
              >
                <span>{item.name}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3">
        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 border border-zinc-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px]">
            {backendOnline ? "Cluster Online // 12ms" : "Telemetry Active"}
          </span>
        </div>

        {/* Action Button 1: Parametric Sim */}
        <Link
          href="/simulation"
          className="btn-coder-light px-4 py-2 text-xs transition-transform active:scale-95"
        >
          Parametric Sim
        </Link>

        {/* Action Button 2: Launch Radar */}
        <Link
          href="/radar"
          className="btn-coder-black px-4 py-2 text-xs flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <span className="w-2 h-2 bg-white inline-block" />
          <span>Launch Radar</span>
        </Link>
      </div>
    </header>
  );
};
