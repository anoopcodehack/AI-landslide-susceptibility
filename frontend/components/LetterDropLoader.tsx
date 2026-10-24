"use client";

import React, { useEffect, useState } from "react";

export const LetterDropLoader: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isFading, setIsFading] = useState<boolean>(false);

  const word = "GEOSHIELD";

  useEffect(() => {
    // After 2.3 seconds, start fade out
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2300);

    // After 3.0 seconds, remove from DOM
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#09090b] flex flex-col items-center justify-center transition-opacity duration-700 ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-coder-grid opacity-30 pointer-events-none" />

      {/* Center Dropping & Bouncing Letters */}
      <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-2 select-none mb-6">
        {word.split("").map((letter, index) => (
          <span
            key={index}
            style={{
              animationDelay: `${index * 0.08}s`,
            }}
            className="text-4xl sm:text-6xl md:text-7xl font-black font-mono text-white inline-block drop-bounce-letter shadow-sm"
          >
            {letter}
          </span>
        ))}
        {/* Terminal Block Cursor */}
        <span
          style={{ animationDelay: `${word.length * 0.08 + 0.1}s` }}
          className="w-3 sm:w-4 h-8 sm:h-12 bg-white inline-block ml-1 drop-bounce-letter"
        />
      </div>

      {/* Subtitle & Loading Status */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <p className="text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-zinc-400 font-semibold animate-pulse">
          Spatial Hazard Infrastructure // Wayanad Sector
        </p>

        {/* Minimal Progress Bar */}
        <div className="w-48 sm:w-64 h-1 bg-zinc-800 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-white rounded-full animate-loader-progress" />
        </div>

        <span className="text-[10px] font-mono text-zinc-500 mt-2.5">
          Initializing Geotechnical Telemetry Nodes...
        </span>
      </div>

      {/* Skip Button */}
      <button
        onClick={() => setIsFading(true)}
        className="absolute bottom-8 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors underline cursor-pointer"
      >
        Skip intro &rarr;
      </button>
    </div>
  );
};
