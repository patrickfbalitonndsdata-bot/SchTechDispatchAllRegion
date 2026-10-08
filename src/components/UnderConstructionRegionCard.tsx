import React from "react";
import {
  AlertTriangle,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import underConstructionImg from "../assets/images/region_under_construction_1790701926629.jpg";
import { RegionTemplateConfig, ACTIVE_TEMPLATE_REGIONS } from "../utils/regionTemplates";
import { TechnicianAirtableEntry } from "../types";

interface UnderConstructionRegionCardProps {
  region: string;
  config: RegionTemplateConfig | null;
  techniciansInRegion: TechnicianAirtableEntry[];
  ordersCountForRegion: number;
  hasUploadedCsv: boolean;
  onSelectRegion: (region: string) => void;
  onOpenSettings: () => void;
  themeMode?: "dark" | "light";
}

export const UnderConstructionRegionCard: React.FC<UnderConstructionRegionCardProps> = ({
  region,
  onSelectRegion,
  themeMode = "dark",
}) => {
  const isLight = themeMode === "light";

  return (
    <div
      className={`rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-colors duration-300 ${
        isLight
          ? "bg-white border border-blue-200 shadow-blue-900/5 text-slate-900"
          : "bg-gradient-to-br from-[#0b1c44] via-[#081533] to-[#050e26] border border-blue-900/60 shadow-blue-950/50 text-white"
      }`}
    >
      {/* Decorative ambient navy/amber glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Minimalist and Clean */}
      <div className="text-center max-w-2xl mx-auto space-y-3 relative z-10">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold shadow-xs ${
            isLight
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : "bg-[#0d2254] border-blue-700/60 text-amber-300"
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${isLight ? "text-amber-600" : "text-amber-400"}`} />
          <span>Regional Template Under Construction</span>
          <span className={isLight ? "text-blue-400" : "text-blue-300/60"}>·</span>
          <span className={`font-mono font-bold ${isLight ? "text-blue-700" : "text-blue-200"}`}>
            {region}
          </span>
        </div>

        <h2
          className={`text-2xl sm:text-3xl font-bold tracking-tight ${
            isLight ? "text-blue-950" : "text-white"
          }`}
        >
          {region} Dispatch Template
        </h2>

        <p
          className={`text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-medium ${
            isLight ? "text-slate-600" : "text-blue-200/80"
          }`}
        >
          The designated Outlook email layout for the{" "}
          <strong className={isLight ? "text-blue-700" : "text-amber-300"}>{region}</strong> region is currently in active development. Email generation for this region is paused.
        </p>
      </div>

      {/* Simplified, Minimalist Under Construction Graphic */}
      <div className="my-8 max-w-2xl mx-auto relative z-10">
        <div
          className={`relative rounded-2xl overflow-hidden border shadow-2xl group ${
            isLight
              ? "border-blue-200 shadow-blue-900/10 bg-blue-950"
              : "border-blue-800/60 shadow-blue-950/80 bg-[#06102b]"
          }`}
        >
          <img
            src={underConstructionImg}
            alt={`${region} Regional Template Under Construction`}
            referrerPolicy="no-referrer"
            className="w-full h-56 sm:h-72 object-cover object-center filter contrast-105 brightness-[0.9] transition duration-500 group-hover:scale-[1.02]"
          />
          {/* Subtle gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06102b] via-transparent to-transparent opacity-80" />

          {/* Minimalist Floating Badge on Graphic */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#081538]/90 border border-blue-700/60 text-blue-200 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Status: Architecture In Progress</span>
            </span>
            <span className="hidden sm:inline-flex text-[11px] text-blue-300/80 bg-[#081538]/80 px-2.5 py-1 rounded-md border border-blue-800/60 backdrop-blur-md font-mono">
              RFC-822 · Awaiting Spec
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer: Minimalist switcher to active regions */}
      <div
        className={`max-w-2xl mx-auto pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs relative z-10 ${
          isLight ? "border-blue-100" : "border-blue-900/50"
        }`}
      >
        <div
          className={`flex items-center space-x-2 font-semibold ${
            isLight ? "text-slate-700" : "text-blue-300/80"
          }`}
        >
          <MapPin className={`w-4 h-4 shrink-0 ${isLight ? "text-blue-600" : "text-emerald-400"}`} />
          <span>Switch to an active regional template:</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {ACTIVE_TEMPLATE_REGIONS.map((activeReg) => (
            <button
              key={activeReg}
              onClick={() => onSelectRegion(activeReg)}
              type="button"
              className={`px-3 py-1.5 font-bold rounded-xl border transition shadow-xs flex items-center gap-1 cursor-pointer ${
                isLight
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-blue-600/15"
                  : "bg-[#0e2354] hover:bg-[#153275] text-blue-100 hover:text-white border-blue-700/70"
              }`}
            >
              <span>{activeReg}</span>
              <ArrowRight className={`w-3 h-3 ${isLight ? "text-white" : "text-blue-300"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
