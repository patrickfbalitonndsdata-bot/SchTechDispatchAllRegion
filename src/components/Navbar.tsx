import React from "react";
import { Mail, Settings, Sparkles, ChevronDown, History, MapPin, Construction, Sun, Moon } from "lucide-react";
import { SAMPLE_DATASETS, SampleDataset } from "../utils/sampleData";
import { REGION_ROSTERS } from "../types";
import { isRegionTemplateActive } from "../utils/regionTemplates";

interface NavbarProps {
  activeTab?: "generator" | "history";
  onTabChange?: (tab: "generator" | "history") => void;
  onLoadSample: (sample: SampleDataset) => void;
  onOpenSettings: () => void;
  onOpenSavedHistory?: () => void;
  savedEmailsCount?: number;
  activeDatasetName?: string;
  totalOrdersCount: number;
  techniciansCount: number;
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
  themeMode?: "dark" | "light";
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = "generator",
  onTabChange,
  onLoadSample,
  onOpenSettings,
  onOpenSavedHistory,
  savedEmailsCount = 0,
  activeDatasetName,
  totalOrdersCount,
  techniciansCount,
  selectedRegion = "all",
  onRegionChange,
  themeMode = "dark",
  onToggleTheme,
}) => {
  const [sampleMenuOpen, setSampleMenuOpen] = React.useState(false);
  const isLight = themeMode === "light";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-md border-b ${
        isLight
          ? "bg-white/90 border-blue-200 text-slate-900 shadow-sm shadow-blue-900/5"
          : "bg-[#08122d]/60 border-blue-500/20 text-stone-100 shadow-md shadow-blue-950/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-6">
            <div
              className="flex items-center space-x-3 cursor-pointer select-none group transition-transform duration-300 hover:scale-[1.02]"
              onClick={() => onTabChange?.("generator")}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-all duration-300 ${
                  isLight
                    ? "bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-blue-600/25 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    : "bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 shadow-amber-500/20 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                }`}
              >
                <Mail className={`w-4 h-4 ${isLight ? "text-white" : "text-stone-950"}`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-semibold text-sm tracking-tight transition-colors ${
                      isLight
                        ? "text-blue-950 group-hover:text-blue-700"
                        : "text-white group-hover:text-amber-200 drop-shadow-xs"
                    }`}
                  >
                    Sch Tech Dispatch
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isLight
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-400/20 text-amber-300 border-amber-400/30"
                    }`}
                  >
                    Pro Edition
                  </span>
                </div>
                <p
                  className={`text-[11px] font-normal ${
                    isLight ? "text-slate-600" : "text-stone-300/80 font-light"
                  }`}
                >
                  Scheduling Team Outlook Email Generator via Airtable
                </p>
              </div>
            </div>

            {/* Top Navigation Tabs */}
            {onTabChange && (
              <div className="hidden sm:flex items-center space-x-2 bg-transparent">
                <button
                  type="button"
                  onClick={() => onTabChange("generator")}
                  className={`group relative flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-transparent transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 ${
                    activeTab === "generator"
                      ? isLight
                        ? "text-blue-700 font-bold"
                        : "text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] font-bold"
                      : isLight
                      ? "text-slate-600 hover:text-blue-800"
                      : "text-stone-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  }`}
                >
                  <Mail
                    className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 ${
                      activeTab === "generator"
                        ? isLight
                          ? "text-blue-600"
                          : "text-amber-400"
                        : isLight
                        ? "text-slate-500 group-hover:text-blue-600"
                        : "text-stone-400 group-hover:text-amber-300"
                    }`}
                  />
                  <span className="tracking-wide">Generator</span>
                  {/* Floating Indicator Underline */}
                  <span
                    className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full transition-all duration-300 ${
                      activeTab === "generator"
                        ? isLight
                          ? "bg-blue-600 scale-100 opacity-100"
                          : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-100 opacity-100"
                        : isLight
                        ? "bg-blue-300 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                        : "bg-white/40 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange("history")}
                  className={`group relative flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-transparent transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 ${
                    activeTab === "history"
                      ? isLight
                        ? "text-blue-700 font-bold"
                        : "text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] font-bold"
                      : isLight
                      ? "text-slate-600 hover:text-blue-800"
                      : "text-stone-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  }`}
                >
                  <History
                    className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 ${
                      activeTab === "history"
                        ? isLight
                          ? "text-blue-600"
                          : "text-amber-400"
                        : isLight
                        ? "text-slate-500 group-hover:text-blue-600"
                        : "text-stone-400 group-hover:text-amber-300"
                    }`}
                  />
                  <span className="tracking-wide">Saved History</span>
                  {savedEmailsCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-all duration-300 ${
                        activeTab === "history"
                          ? isLight
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-amber-400 text-stone-950 shadow-xs"
                          : isLight
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                      }`}
                    >
                      {savedEmailsCount}
                    </span>
                  )}
                  {/* Floating Indicator Underline */}
                  <span
                    className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full transition-all duration-300 ${
                      activeTab === "history"
                        ? isLight
                          ? "bg-blue-600 scale-100 opacity-100"
                          : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-100 opacity-100"
                        : isLight
                        ? "bg-blue-300 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                        : "bg-white/40 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Tab Switcher */}
            {onTabChange && (
              <div
                className={`flex sm:hidden items-center p-0.5 rounded-lg border ${
                  isLight ? "bg-blue-50/70 border-blue-200" : "bg-transparent border-white/15"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onTabChange("generator")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeTab === "generator"
                      ? isLight
                        ? "text-white font-bold bg-blue-600"
                        : "text-amber-300 font-bold bg-white/10"
                      : isLight
                      ? "text-slate-600"
                      : "text-stone-300"
                  }`}
                >
                  Gen
                </button>
                <button
                  type="button"
                  onClick={() => onTabChange("history")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center space-x-1 transition-all ${
                    activeTab === "history"
                      ? isLight
                        ? "text-white font-bold bg-blue-600"
                        : "text-amber-300 font-bold bg-white/10"
                      : isLight
                      ? "text-slate-600"
                      : "text-stone-300"
                  }`}
                >
                  <span>Hist</span>
                  {savedEmailsCount > 0 && (
                    <span
                      className={`text-[9px] px-1 rounded-full font-bold ${
                        isLight ? "bg-blue-100 text-blue-900" : "bg-amber-400 text-stone-950"
                      }`}
                    >
                      {savedEmailsCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Region Roster Selector Dropdown */}
            {onRegionChange && (
              <div
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl backdrop-blur-md transition shadow-xs ${
                  !isRegionTemplateActive(selectedRegion)
                    ? isLight
                      ? "bg-amber-50 border border-amber-300 text-amber-900"
                      : "bg-amber-950/80 border border-amber-500/70 text-amber-200"
                    : isLight
                    ? "bg-blue-50 border border-blue-300 hover:border-blue-500 text-blue-950"
                    : "bg-[#0c183d]/90 border border-blue-600/60 hover:border-blue-400 text-white"
                }`}
              >
                {!isRegionTemplateActive(selectedRegion) ? (
                  <Construction className={`w-3.5 h-3.5 shrink-0 ${isLight ? "text-amber-600" : "text-amber-400"}`} />
                ) : (
                  <MapPin className={`w-3.5 h-3.5 shrink-0 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
                )}
                <span className="text-[11px] font-semibold hidden md:inline">
                  Region:
                </span>
                <select
                  value={selectedRegion}
                  onChange={(e) => onRegionChange(e.target.value)}
                  className="text-xs font-semibold bg-transparent border-0 text-inherit focus:ring-0 focus:outline-hidden cursor-pointer pr-1"
                  title="Choose active dispatch Region Roster"
                >
                  {REGION_ROSTERS.map((r) => {
                    const isUnderCon = !isRegionTemplateActive(r);
                    return (
                      <option
                        key={r}
                        value={r}
                        className={isLight ? "bg-white text-slate-900" : "bg-[#091436] text-slate-100"}
                      >
                        {r} {isUnderCon ? "(No Template)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Theme Mode Toggle Button (Light / Dark) */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode (Blue & White)"}
                className={`group relative flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 ${
                  isLight
                    ? "bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200 hover:border-blue-400 shadow-2xs"
                    : "bg-transparent text-stone-200 hover:text-white border-white/20 hover:border-white/50 backdrop-blur-xs"
                }`}
              >
                {isLight ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-blue-700 transition-transform duration-300 group-hover:-rotate-12" />
                    <span className="hidden sm:inline tracking-wide">Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-300 transition-transform duration-300 group-hover:rotate-45" />
                    <span className="hidden sm:inline tracking-wide">Light</span>
                  </>
                )}
              </button>
            )}

            {/* Branding & Template Settings */}
            <button
              onClick={onOpenSettings}
              title="Branding & Outlook Template Settings"
              className={`group relative flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 ${
                isLight
                  ? "bg-white hover:bg-blue-50 text-blue-950 border-blue-200 hover:border-blue-400 shadow-2xs"
                  : "text-stone-200 hover:text-white bg-transparent border-white/20 hover:border-white/50 backdrop-blur-xs hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              }`}
            >
              <Settings
                className={`w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-500 ${
                  isLight ? "text-blue-600 group-hover:text-blue-800" : "text-stone-300 group-hover:text-amber-300"
                }`}
              />
              <span className="hidden sm:inline tracking-wide">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

