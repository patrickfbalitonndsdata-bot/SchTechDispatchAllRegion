import React, { useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, Sparkles, Check, AlertTriangle, ArrowRight, RefreshCw, Layers, Trash2, X } from "lucide-react";
import { ColumnMapping, ParseResult } from "../types";
import { SAMPLE_DATASETS, SampleDataset } from "../utils/sampleData";

interface CsvUploadZoneProps {
  onFileUpload: (fileContent: string, fileName: string) => void;
  onLoadSample: (sample: SampleDataset) => void;
  parseResult: ParseResult | null;
  currentFileName: string;
  onOpenMappingModal: () => void;
  onClear?: () => void;
  themeMode?: "dark" | "light";
}

export const CsvUploadZone: React.FC<CsvUploadZoneProps> = ({
  onFileUpload,
  onLoadSample,
  parseResult,
  currentFileName,
  onOpenMappingModal,
  onClear,
  themeMode = "dark",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isLight = themeMode === "light";

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        onFileUpload(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const isLoaded = (parseResult && parseResult.orders.length > 0) || !!currentFileName;

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 shadow-xl transition-all ${
        isLight
          ? "bg-white border border-blue-200 shadow-blue-900/5 text-slate-900"
          : "bg-gradient-to-br from-[#0c183d]/95 to-[#07102b]/95 backdrop-blur-md border border-blue-900/50 shadow-blue-950/30 text-white"
      }`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Upload Dropzone & Status */}
        <div className="flex-1 w-full">
          <input
            id="csv-file-input"
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            accept=".csv,text/csv,text/plain"
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isDragging
                ? isLight
                  ? "border-blue-600 bg-blue-100/70 scale-[1.005]"
                  : "border-amber-400 bg-amber-950/30 scale-[1.005]"
                : isLight
                ? "border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50"
                : "border-blue-800/60 hover:border-amber-400/60 bg-[#08122d]/80 hover:bg-[#0a1738]/90"
            }`}
          >
            <div className="flex items-center space-x-4 text-left">
              <div
                className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${
                  isLight
                    ? "bg-white border-blue-200 text-blue-600 shadow-blue-500/5"
                    : "bg-gradient-to-br from-amber-500/20 to-amber-600/30 border-amber-500/40 text-amber-400"
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div
                  className={`text-sm font-bold flex items-center gap-2 ${
                    isLight ? "text-blue-950" : "text-white"
                  }`}
                >
                  <span>{currentFileName ? currentFileName : "Upload Technician Dispatch CSV"}</span>
                  {parseResult && parseResult.orders.length > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs border ${
                        isLight
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-emerald-950/70 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          isLight ? "bg-emerald-600" : "bg-emerald-400"
                        }`}
                      />
                      Ready
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 font-medium ${
                    isLight ? "text-slate-600" : "text-blue-200/70"
                  }`}
                >
                  {parseResult && parseResult.orders.length > 0
                    ? `${parseResult.orders.length} work orders loaded across ${parseResult.technicians.length} technician${parseResult.technicians.length === 1 ? "" : "s"}`
                    : "Drag & drop your .csv work orders schedule, or click to browse"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                className={`w-full sm:w-auto text-xs font-bold tracking-wide px-4 py-2.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border ${
                  isLight
                    ? "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-blue-600/20"
                    : "bg-[#0e1c45] hover:bg-[#15275e] border-blue-700/60 text-white hover:border-amber-400/50"
                }`}
              >
                <UploadCloud className={`w-4 h-4 ${isLight ? "text-white" : "text-amber-300"}`} />
                <span>{currentFileName ? "Replace CSV" : "Select CSV"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick actions, mapping info & Clear button */}
        {isLoaded && (
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
            {parseResult && parseResult.orders.length > 0 && (
              <button
                onClick={onOpenMappingModal}
                className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-lg border transition-all shadow-xs cursor-pointer ${
                  isLight
                    ? "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200 hover:border-blue-300"
                    : "bg-[#0e1c45] hover:bg-[#15275e] text-blue-100 border-blue-700/60 hover:border-blue-500"
                }`}
                title="Inspect or tweak CSV column field mappings"
              >
                <Layers className={`w-3.5 h-3.5 ${isLight ? "text-blue-600" : "text-blue-300"}`} />
                <span>Column Mapping ({Object.values(parseResult.mapping).filter(Boolean).length}/12)</span>
              </button>
            )}

            {onClear && (
              <button
                onClick={onClear}
                className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 text-xs font-bold px-3.5 py-2.5 rounded-lg border transition-all shadow-xs cursor-pointer ${
                  isLight
                    ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                    : "bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border-rose-800/60 hover:border-rose-700"
                }`}
                title="Clear current CSV upload and reset generated emails"
              >
                <Trash2 className={`w-3.5 h-3.5 ${isLight ? "text-red-600" : "text-rose-400"}`} />
                <span>Clear</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Warnings & Suggestions Banner */}
      {parseResult && parseResult.orders.length > 0 && parseResult.warnings.length > 0 && (
        <div className="mt-3.5 bg-amber-50/90 border border-amber-200 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-stone-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-950">Auto-Detection Note:</span>{" "}
            {parseResult.warnings[0]}
            {parseResult.warnings.length > 1 && (
              <span className="ml-1 text-stone-600 font-medium">
                (+{parseResult.warnings.length - 1} other auto-resolved fields)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
