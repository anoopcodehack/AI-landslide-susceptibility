"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "kn";

interface Translations {
  [key: string]: {
    en: string;
    kn: string;
  };
}

export const translations: Translations = {
  // Navigation
  nav_overview: { en: "Overview", kn: "ಅವಲೋಕನ" },
  nav_radar: { en: "GIS Radar", kn: "ಜಿಐಎಸ್ ರೇಡಾರ್" },
  nav_diagnostics: { en: "XAI Diagnostics", kn: "ಎಕ್ಸ್.ಎ.ಐ ವಿಶ್ಲೇಷಣೆ" },
  nav_simulation: { en: "Simulation Studio", kn: "ಸಿಮ್ಯುಲೇಶನ್ ಸ್ಟುಡಿಯೋ" },
  nav_governance: { en: "Governance & SDGs", kn: "ಆಡಳಿತ ಮತ್ತು ನೀತಿಗಳು" },

  // System Status & Actions
  cluster_online: { en: "Cluster Online • 12ms", kn: "ಕ್ಲಸ್ಟರ್ ಸಕ್ರಿಯ • 12ms" },
  telemetry_active: { en: "Telemetry Active", kn: "ಟೆಲಿಮೆಟ್ರಿ ಸಕ್ರಿಯ" },
  launch_radar: { en: "Launch Radar", kn: "ರೇಡಾರ್ ವೀಕ್ಷಿಸಿ" },
  parametric_sim: { en: "Parametric Sim", kn: "ಸಿಮ್ಯುಲೇಶನ್" },

  // Hero & Command Center
  hero_badge: { en: "Civil Defense Early Warning Infrastructure", kn: "ನಾಗರಿಕ ರಕ್ಷಣಾ ಮುನ್ಸೂಚನಾ ವ್ಯವಸ್ಥೆ" },
  hero_title_1: { en: "Wayanad Spatial Hazard", kn: "ವಯನಾಡು ಪ್ರಾದೇಶಿಕ ಅಪಾಯ" },
  hero_title_2: { en: "Intelligence Radar", kn: "ಮುನ್ಸೂಚನಾ ರೇಡಾರ್" },
  hero_desc: {
    en: "Physics-guided machine learning and hydraulic momentum runout routing across Western Ghats disaster corridors.",
    kn: "ಪಶ್ಚಿಮ ಘಟ್ಟಗಳ ವಿಪತ್ತು ವಲಯಗಳಲ್ಲಿ ಭೌತಶಾಸ್ತ್ರ ಆಧಾರಿತ ಯಂತ್ರ ಕಲಿಕೆ ಮತ್ತು ಶಿಲಾಖಂಡಗಳ ಹರಿವಿನ ಮುನ್ಸೂಚನಾ ವ್ಯವಸ್ಥೆ.",
  },

  // Tactical Dock / Control Bar
  monitored_corridors: { en: "Monitored Corridors • Wayanad Sector", kn: "ಕಣ್ಗಾವಲು ವಲಯಗಳು • ವಯನಾಡು ವಲಯ" },
  susceptibility_index: { en: "Spatial Susceptibility Index", kn: "ಪ್ರಾದೇಶಿಕ ಭೂಕುಸಿತ ಸೂಕ್ಷ್ಮತೆಯ ಸೂಚ್ಯಂಕ" },
  hazard_alerts: { en: "Hazard Alerts & Sensor Displacements", kn: "ಅಪಾಯ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಸಂವೇದಕ ಮಾಹಿತಿ" },
  operator_controls: { en: "Operator Controls", kn: "ನಿಯಂತ್ರಣ ಫಲಕ" },
  incline_threshold: { en: "Incline Shear Threshold", kn: "ಇಳಿಜಾರು ಕತ್ತರಿ ಮಿತಿ" },
  view_gis_radar: { en: "View GIS Radar →", kn: "ಜಿಐಎಸ್ ರೇಡಾರ್ ವೀಕ್ಷಿಸಿ →" },
  shap_attribution: { en: "SHAP Factor Attribution →", kn: "ಶ್ಯಾಪ್ (SHAP) ಕಾರಣ ವಿಶ್ಲೇಷಣೆ →" },

  // Metrics & Headers
  total_drop: { en: "TOTAL DROP (H)", kn: "ಒಟ್ಟು ಇಳಿಕೆ (H)" },
  runout_reach: { en: "RUNOUT REACH (L)", kn: "ಹರಿವಿನ ವ್ಯಾಪ್ತಿ (L)" },
  lead_time: { en: "LEAD TIME", kn: "ಮುನ್ಸೂಚನಾ ಸಮಯ" },
  hazard_level: { en: "Hazard Level", kn: "ಅಪಾಯದ ಮಟ್ಟ" },
  critical_red: { en: "CRITICAL RED", kn: "ತೀವ್ರ ಅಪಾಯ (ಕೆಂಪು)" },
  watch_orange: { en: "WATCH ORANGE", kn: "ಹೆಚ್ಚಿನ ನಿಗಾ (ಕಿತ್ತಳೆ)" },
  stable_green: { en: "STABLE GREEN", kn: "ಸುರಕ್ಷಿತ (ಹಸಿರು)" },

  // Topographic & Runout Sections
  topographic_title: {
    en: "Topographic Elevation Cross-Section & Hydraulic Momentum Profile",
    kn: "ಸ್ಥಳಾಕೃತಿ ಎತ್ತರದ ಅಡ್ಡ-ವಿಭಾಗ ಮತ್ತು ಹೈಡ್ರಾಲಿಕ್ ಚಲನೆಯ ವಿವರ",
  },
  topographic_corridor: {
    en: "Vellarimala → Chooralmala Corridor",
    kn: "ವೆಲ್ಲರಿಮಲ → ಚೂರಲ್‌ಮಾಲಾ ವಲಯ",
  },
  runout_title: {
    en: "Downstream Hydraulic Debris Flow Runout Routing",
    kn: "ಶಿಲಾಖಂಡಗಳ ಹರಿವಿನ ಮಾರ್ಗ ವಿಶ್ಲೇಷಣೆ",
  },

  // Civics & Directives
  civil_directive_title: { en: "Civil Defense Evacuation Directive", kn: "ನಾಗರಿಕ ರಕ್ಷಣಾ ಸ್ಥಳಾಂತರ ನಿರ್ದೇಶನ" },
  shelter_camp: { en: "Designated Relief Shelter", kn: "ನಿಗದಿಪಡಿಸಿದ ಆಶ್ರಯ ಕೇಂದ್ರ" },
  evacuation_corridor: { en: "Safe Evacuation Corridor", kn: "ಸುರಕ್ಷಿತ ಸ್ಥಳಾಂತರ ಮಾರ್ಗ" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("geoshield_language") as Language | null;
      if (saved === "en" || saved === "kn") {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("geoshield_language", lang);
    }
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
