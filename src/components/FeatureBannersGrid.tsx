import React from "react";
import fieldCardImg from "../assets/images/field_ops_card_1790099880746.jpg";
import { Sliders, Filter, StickyNote, Paperclip, Sparkles, ArrowUpRight, CheckCircle2, Bookmark } from "lucide-react";

interface FeatureBannersGridProps {
  onOpenSettings?: () => void;
  onOpenNotes?: () => void;
  onOpenAttachments?: () => void;
  onToggleOverlap?: () => void;
  enableOverlap?: boolean;
  overlapExcludedCount?: number;
  activeNotesCount?: number;
  attachmentsCount?: number;
  savedEmailsCount?: number;
  onViewHistory?: () => void;
  onLoadSample?: (sample?: any) => void;
  activeDatasetName?: string | null;
  ordersCount?: number;
  techCount?: number;
  themeMode?: "dark" | "light";
}

export const FeatureBannersGrid: React.FC<FeatureBannersGridProps> = ({
  onOpenSettings,
  onOpenNotes,
  onOpenAttachments,
  onToggleOverlap,
  enableOverlap = false,
  overlapExcludedCount = 0,
  activeNotesCount = 0,
  attachmentsCount = 0,
  savedEmailsCount = 0,
  onViewHistory,
  themeMode = "dark",
}) => {
  const isLight = themeMode === "light";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 my-2">
      {/* Block 1: Compact Field Intelligence & Schedule Overlap */}
      <div
        className={`flex flex-col sm:flex-row rounded-xl overflow-hidden border backdrop-blur-md transition-colors ${
          isLight
            ? "border-blue-200 bg-white shadow-md shadow-blue-900/5 hover:border-blue-400"
            : "border-blue-900/50 bg-gradient-to-br from-[#0c183d]/95 to-[#07102b]/95 shadow-lg shadow-blue-950/30 hover:border-blue-700/60"
        }`}
      >
        {/* Left: Compact Thumbnail */}
        <div className="relative w-full sm:w-36 md:w-40 shrink-0 h-28 sm:h-auto overflow-hidden">
          <img
            src={fieldCardImg}
            alt="Field Operations and Planning"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter contrast-105 brightness-90 hover:scale-105 transition-transform duration-500"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${
              isLight ? "from-blue-950/70 via-transparent to-transparent" : "from-[#08122d]/90 via-transparent to-transparent"
            }`}
          />
          <div className="absolute bottom-2 left-2.5 text-[9px] font-bold text-white tracking-wider uppercase bg-blue-700/90 backdrop-blur-md px-2 py-0.5 rounded border border-blue-400/40">
            Field Intel
          </div>
        </div>

        {/* Right: Streamlined Content */}
        <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 min-w-0 space-y-2.5">
          <div className="space-y-1">
            <span
              className={`text-[9px] font-bold tracking-widest uppercase ${
                isLight ? "text-blue-600" : "text-amber-400"
              }`}
            >
              Automated Operations
            </span>
            <h3 className={`text-sm font-semibold leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>
              Work Week &amp; Schedule Overlap
            </h3>
          </div>

          <div
            className={`pt-2 border-t flex items-center justify-between ${
              isLight ? "border-blue-100" : "border-blue-900/50"
            }`}
          >
            <button
              type="button"
              onClick={() => onToggleOverlap?.()}
              className={`inline-flex items-center justify-center px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md transition cursor-pointer border ${
                enableOverlap
                  ? isLight
                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                    : "bg-amber-400/20 text-amber-300 border-amber-400/50 hover:bg-amber-400/30"
                  : isLight
                  ? "bg-blue-50 text-blue-800 border-blue-200 hover:border-blue-400 hover:bg-blue-100"
                  : "bg-transparent text-blue-200 border-blue-800/70 hover:border-blue-500 hover:text-white"
              }`}
            >
              <span>{enableOverlap ? "Overlap: Active" : "Enable Overlap"}</span>
            </button>

            {overlapExcludedCount > 0 && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isLight
                    ? "text-blue-800 bg-blue-50 border-blue-200"
                    : "text-amber-300 bg-amber-950/80 border-amber-500/30"
                }`}
              >
                {overlapExcludedCount} Excluded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Block 2: Compact Outlook Templates & History Hub */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 rounded-xl overflow-hidden border backdrop-blur-md divide-y sm:divide-y-0 sm:divide-x transition-colors ${
          isLight
            ? "border-blue-200 bg-white shadow-md shadow-blue-900/5 divide-blue-100 hover:border-blue-400"
            : "border-blue-900/50 bg-gradient-to-br from-[#0c183d]/95 to-[#07102b]/95 shadow-lg shadow-blue-950/30 divide-blue-900/50 hover:border-blue-700/60"
        }`}
      >
        {/* Left Side: Templates & Notes Controls */}
        <div
          className={`p-3.5 sm:p-4 flex flex-col justify-between space-y-2.5 ${
            isLight ? "bg-white" : "bg-[#0d1a40]/50"
          }`}
        >
          <div className="space-y-1">
            <span
              className={`text-[9px] font-bold tracking-widest uppercase ${
                isLight ? "text-blue-600" : "text-blue-300"
              }`}
            >
              Standardized Formatting
            </span>
            <h3 className={`text-sm font-semibold leading-snug ${isLight ? "text-slate-900" : "text-white"}`}>
              Outlook Ready Templates
            </h3>
          </div>

          <div
            className={`pt-2 border-t flex items-center justify-between gap-2 ${
              isLight ? "border-blue-100" : "border-blue-900/50"
            }`}
          >
            <button
              type="button"
              onClick={() => onOpenNotes?.()}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md border transition cursor-pointer ${
                isLight
                  ? "text-blue-800 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-400"
                  : "text-blue-100 hover:text-white bg-transparent border-blue-800/70 hover:border-blue-500"
              }`}
            >
              <StickyNote className={`w-3 h-3 ${isLight ? "text-blue-600" : "text-amber-400"}`} />
              <span>Notes ({activeNotesCount})</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAttachments?.()}
              className={`inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                isLight ? "text-blue-700 hover:text-blue-950" : "text-blue-300/80 hover:text-white"
              }`}
            >
              <Paperclip className="w-3 h-3" />
              <span>Atts ({attachmentsCount})</span>
            </button>
          </div>
        </div>

        {/* Right Side: Compact History Hub */}
        <div
          className={`p-3.5 sm:p-4 flex flex-col justify-between space-y-2.5 ${
            isLight ? "bg-blue-50/40" : "bg-[#0a1433]/70"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={`text-[9px] font-bold tracking-widest uppercase ${
                  isLight ? "text-blue-700" : "text-amber-400"
                }`}
              >
                Dispatch Records
              </span>
              <span className={`text-[10px] font-medium ${isLight ? "text-slate-600" : "text-blue-200/70"}`}>
                History Hub
              </span>
            </div>

            <div className="space-y-1.5">
              <div
                className={`flex items-center justify-between px-2 py-1 rounded border text-[11px] ${
                  isLight
                    ? "bg-white border-blue-200 text-slate-700"
                    : "bg-[#060c20]/80 border-blue-900/60 text-blue-300/80"
                }`}
              >
                <span>Saved Rosters</span>
                <span className={`font-semibold ${isLight ? "text-blue-700" : "text-amber-300"}`}>
                  {savedEmailsCount} Available
                </span>
              </div>
              <div
                className={`flex items-center justify-between px-2 py-1 rounded border text-[11px] ${
                  isLight
                    ? "bg-white border-blue-200 text-slate-700"
                    : "bg-[#060c20]/80 border-blue-900/60 text-blue-300/80"
                }`}
              >
                <span>Custom Branding</span>
                <span className={`font-semibold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
                  Synchronized
                </span>
              </div>
            </div>
          </div>

          <div className={`pt-2 border-t ${isLight ? "border-blue-100" : "border-blue-900/50"}`}>
            <button
              type="button"
              onClick={() => onViewHistory?.()}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md border transition cursor-pointer w-full ${
                isLight
                  ? "text-white bg-blue-600 border-blue-600 hover:bg-blue-700 shadow-2xs"
                  : "text-amber-300 bg-amber-950/40 border-amber-500/40 hover:bg-amber-900/40"
              }`}
            >
              <Bookmark className={`w-3 h-3 ${isLight ? "text-white" : "text-amber-300"}`} />
              <span>Open Saved History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
