import React from "react";
import { MapPin, Construction } from "lucide-react";
import { REGION_ROSTERS } from "../types";
import { isRegionTemplateActive } from "../utils/regionTemplates";

interface RegionRosterSelectorBarProps {
  selectedRegion: string;
  defaultRegion?: string;
  onSelectRegion: (region: string) => void;
  activeDatasetLoaded: boolean;
  totalOrdersCount: number;
  totalActiveTechs: number;
  filteredTechsCount: number;
  rosterTechsCountByRegion: Record<string, number>;
  activeOrdersTechsCountByRegion?: Record<string, number>;
  techniciansInSelectedRegion: Array<{ name: string; email?: string; region?: string; airtableUrl?: string }>;
  onOpenSettings: () => void;
  themeMode?: "dark" | "light";
}

export const RegionRosterSelectorBar: React.FC<RegionRosterSelectorBarProps> = ({
  selectedRegion,
  defaultRegion,
  onSelectRegion,
  activeDatasetLoaded,
  totalActiveTechs,
  themeMode = "dark",
}) => {
  const isLight = themeMode === "light";

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 shadow-xl transition-all ${
        isLight
          ? "bg-white border border-blue-200 shadow-blue-900/5 text-slate-900"
          : "bg-gradient-to-br from-[#0c183d]/95 to-[#07102b]/95 backdrop-blur-md border border-blue-900/60 shadow-blue-950/40 text-white"
      }`}
    >
      {/* Top Header Row: Clean Title & Summary Badges */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
          isLight ? "border-blue-100" : "border-blue-900/60"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${
              isLight
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-blue-600/20 border-blue-500/40 text-blue-400"
            }`}
          >
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`text-sm font-bold tracking-tight ${
                  isLight ? "text-blue-950" : "text-white"
                }`}
              >
                Dispatch Region Selection
              </h3>
              {defaultRegion && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs border ${
                    isLight
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-amber-400/20 text-amber-300 border-amber-400/40"
                  }`}
                >
                  <span>★ Default:</span>
                  <span className={isLight ? "text-blue-950 font-extrabold" : "text-white"}>
                    {defaultRegion}
                  </span>
                </span>
              )}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isLight
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-blue-950/80 text-blue-300 border-blue-700/60"
                }`}
              >
                {REGION_ROSTERS.length} Regions
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isLight
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}
              >
                4 Active Templates
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isLight
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}
              >
                4 In Progress
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Non-Scrolling Responsive Grid of Region Buttons */}
      <div className="pt-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 w-full">
          {REGION_ROSTERS.map((region) => {
            const isSelected = selectedRegion === region;
            const isDefault = defaultRegion === region;
            const isUnderCon = !isRegionTemplateActive(region);
            const badgeText = isUnderCon
              ? "Paused"
              : activeDatasetLoaded
              ? `${totalActiveTechs}`
              : isDefault
              ? "Default"
              : "Active";

            return (
              <button
                key={region}
                onClick={() => onSelectRegion(region)}
                type="button"
                className={`w-full py-2.5 px-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs select-none relative ${
                  isSelected
                    ? isUnderCon
                      ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30 font-bold ring-2 ring-amber-400/50"
                      : "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold ring-2 ring-blue-400/50"
                    : isUnderCon
                    ? isLight
                      ? "bg-slate-50 hover:bg-amber-50/70 text-slate-600 hover:text-amber-900 border border-slate-200 hover:border-amber-300"
                      : "bg-[#141022]/80 hover:bg-[#231a38] text-amber-200/90 hover:text-amber-100 border border-amber-800/40 hover:border-amber-600/60"
                    : isLight
                    ? "bg-blue-50/60 hover:bg-blue-100/80 text-blue-900 hover:text-blue-950 border border-blue-200 hover:border-blue-400"
                    : "bg-[#0d1a40]/80 hover:bg-[#13255c] text-blue-200 hover:text-white border border-blue-800/60 hover:border-blue-600/70"
                }`}
                title={
                  isUnderCon
                    ? `${region}: Template under construction - paused from email generation${isDefault ? " (Default Region)" : ""}`
                    : `${region}: Active designated template${isDefault ? " (Default Region)" : ""}`
                }
              >
                {isUnderCon ? (
                  <Construction
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? "text-stone-950" : isLight ? "text-amber-600" : "text-amber-400"
                    }`}
                  />
                ) : (
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isSelected
                        ? "bg-white"
                        : isDefault
                        ? "bg-amber-500"
                        : isLight
                        ? "bg-emerald-600"
                        : "bg-emerald-400"
                    }`}
                  />
                )}
                <span className="truncate">{region}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                    isSelected
                      ? isUnderCon
                        ? "bg-stone-950/20 text-stone-950"
                        : "bg-white/20 text-white"
                      : isUnderCon
                      ? isLight
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-amber-950/90 text-amber-300 border border-amber-700/50"
                      : isDefault
                      ? isLight
                        ? "bg-blue-600 text-white border border-blue-600"
                        : "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                      : isLight
                      ? "bg-white text-blue-700 border border-blue-200"
                      : "bg-blue-950 text-blue-300 border border-blue-800/70"
                  }`}
                >
                  {badgeText}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
