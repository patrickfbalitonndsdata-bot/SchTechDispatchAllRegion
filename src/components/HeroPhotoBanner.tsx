import React from "react";
import { Sparkles, Sliders, CalendarDays, CheckCircle2, ChevronRight, Mail, Zap } from "lucide-react";
import { SampleDataset } from "../utils/sampleData";

interface HeroPhotoBannerProps {
  totalOrders?: number;
  totalTechs?: number;
  totalTechnicians?: number;
  currentWorkWeekLabel?: string;
  currentWorkWeek?: string;
  selectedRegion?: string;
  onGoToGenerator?: () => void;
  onUploadClick?: () => void;
  onLoadSample?: (sample: SampleDataset) => void;
  onOpenSettings?: () => void;
  onOpenNotes?: () => void;
  onQuickAction?: (action: "upload" | "settings" | "history" | "sample" | "generator") => void;
  hasData?: boolean;
  themeMode?: "dark" | "light";
}

export const HeroPhotoBanner: React.FC<HeroPhotoBannerProps> = ({
  totalOrders = 0,
  totalTechs,
  totalTechnicians,
  currentWorkWeekLabel,
  currentWorkWeek,
  selectedRegion,
  onGoToGenerator,
  onUploadClick,
  onLoadSample,
  onOpenSettings,
  onOpenNotes,
  onQuickAction,
  hasData = false,
  themeMode = "dark",
}) => {
  const techsCount = totalTechs !== undefined ? totalTechs : (totalTechnicians || 0);
  const weekLabel = currentWorkWeekLabel || currentWorkWeek;
  const isLight = themeMode === "light";

  const handleGoToGenerator = () => {
    if (typeof onGoToGenerator === "function") {
      onGoToGenerator();
    } else if (typeof onQuickAction === "function") {
      onQuickAction("generator");
    } else {
      const el = document.getElementById("email-generator-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleSettings = () => {
    if (typeof onOpenSettings === "function") {
      onOpenSettings();
    } else if (typeof onQuickAction === "function") {
      onQuickAction("settings");
    }
  };

  return (
    <section className={`relative z-10 w-full pt-4 sm:pt-6 pb-8 sm:pb-12 ${isLight ? "text-slate-900" : "text-white"}`}>
      {/* Top Ticker Bar */}
      <div
        className={`w-full flex items-center justify-between py-2 px-1 text-[10px] sm:text-xs font-mono uppercase tracking-widest border-b mb-8 sm:mb-10 ${
          isLight
            ? "text-blue-900 border-blue-200 font-semibold"
            : "text-stone-400/90 border-white/10"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isLight
                ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            }`}
          />
          <span className={isLight ? "text-blue-950 font-bold" : "text-stone-200 font-medium"}>
            PRECISION TRAFFIC LOGISTICS
          </span>
          <span className={isLight ? "text-blue-400" : "text-stone-600"}>•</span>
          <span className={`hidden sm:inline ${isLight ? "text-blue-800 font-semibold" : "text-stone-300"}`}>
            AIRTABLE DISPATCH OPS
          </span>
          <span className={`hidden sm:inline ${isLight ? "text-blue-400" : "text-stone-600"}`}>•</span>
          <span className={`hidden md:inline ${isLight ? "text-blue-700 font-semibold" : "text-stone-400"}`}>
            REAL-TIME REVISION DISPATCH
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isLight
                ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
            }`}
          />
          <span className={`font-bold tracking-wider ${isLight ? "text-blue-700" : "text-emerald-400"}`}>
            API SYNCHRONIZED
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl">
        {/* Eyebrow Pill Tag */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border text-xs font-bold tracking-widest uppercase mb-5 shadow-xs ${
            isLight
              ? "bg-blue-100/90 border-blue-300 text-blue-900"
              : "bg-[#0a163a]/60 border-blue-400/30 text-blue-200 font-medium"
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${isLight ? "text-blue-600" : "text-amber-400"}`} />
          <span>PSU TRACKING AUTOMATION & FIELD DISPATCH</span>
        </div>

        {/* Editorial Headline */}
        <h1
          className={`text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight max-w-3xl leading-[1.18] mb-4 font-editorial ${
            isLight ? "text-blue-950" : "text-white drop-shadow-sm"
          }`}
        >
          Precision Dispatch{" "}
          <span className={`italic font-normal ${isLight ? "text-blue-600" : "text-amber-200"}`}>
            Email Generation
          </span>{" "}
          in an Instant
        </h1>

        {/* Accent Underline Bar */}
        <div
          className={`w-14 h-1.5 rounded-full mb-8 sm:mb-10 ${
            isLight
              ? "bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.35)]"
              : "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
          }`}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Go to Email Generator - Primary Action Button */}
          <button
            type="button"
            onClick={handleGoToGenerator}
            className={`group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs sm:text-sm font-bold tracking-wider uppercase rounded-xl shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 active:translate-y-0 ${
              isLight
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/25 hover:shadow-blue-600/40"
                : "bg-white text-stone-950 hover:bg-amber-300 shadow-xl hover:shadow-[0_0_25px_rgba(251,191,36,0.4)]"
            }`}
            title="Navigate directly to the Outlook Email Generator"
          >
            <Mail
              className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                isLight ? "text-white" : "text-stone-950"
              }`}
            />
            <span>Go to Email Generator</span>
            <ChevronRight
              className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${
                isLight ? "text-white" : "text-stone-950"
              }`}
            />
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={handleSettings}
            className={`group relative inline-flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold tracking-wider uppercase rounded-xl border transition-all duration-300 backdrop-blur-xs cursor-pointer transform hover:-translate-y-1 active:translate-y-0 ${
              isLight
                ? "text-blue-900 hover:text-blue-950 border-blue-300 hover:border-blue-500 bg-white hover:bg-blue-50 shadow-xs"
                : "text-stone-300 hover:text-white border-white/20 hover:border-white/50 bg-transparent hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
            }`}
            title="Custom branding & headers"
          >
            <Sliders
              className={`w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-500 ${
                isLight ? "text-blue-600 group-hover:text-blue-800" : "text-stone-400 group-hover:text-amber-300"
              }`}
            />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>

        {/* Status Metrics Bar below buttons */}
        <div
          className={`flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-mono uppercase tracking-wider mt-10 pt-6 border-t ${
            isLight
              ? "text-blue-950 border-blue-200 font-bold"
              : "text-stone-300/90 border-white/10"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${isLight ? "text-blue-600" : "text-emerald-400"}`} />
            <span>100% OCR ACCURACY</span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${isLight ? "text-blue-600" : "text-amber-400"}`} />
            <span>ZERO-LATENCY SYNC</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLight ? "bg-blue-600" : "bg-blue-400"}`} />
            <span>
              {techsCount > 0 ? `${techsCount} TECHS ASSIGNED` : (hasData ? `${totalOrders} ORDERS LOADED` : "READY FOR INGESTION")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLight ? "bg-blue-500" : "bg-cyan-400"}`} />
            <span>
              REGION: {(selectedRegion || "North East").toUpperCase()}
            </span>
          </div>

          {weekLabel && (
            <div className="flex items-center gap-2 hidden lg:flex">
              <CalendarDays className={`w-4 h-4 ${isLight ? "text-blue-600" : "text-amber-300"}`} />
              <span>WEEK: {weekLabel}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
