import React from "react";
import { ShieldCheck, Mail, Server, Clock, MapPin, Sparkles } from "lucide-react";

interface FooterProps {
  themeMode?: "dark" | "light";
}

export const Footer: React.FC<FooterProps> = ({ themeMode = "dark" }) => {
  const isLight = themeMode === "light";

  return (
    <footer
      className={`w-full mt-16 border-t relative z-10 transition-colors ${
        isLight
          ? "border-blue-200 bg-gradient-to-b from-blue-50/60 via-white to-blue-50/40 text-slate-600"
          : "border-blue-900/50 bg-gradient-to-b from-[#071333]/40 via-[#050e26]/80 to-[#04091c] text-blue-200/80"
      }`}
    >
      {/* Upper Footer: Professional Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: System Identification */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                  isLight
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-blue-600/20 border-blue-500/40 text-blue-400"
                }`}
              >
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-bold tracking-tight ${isLight ? "text-blue-950" : "text-white"}`}>
                  Tech Dispatch
                </h3>
                <p
                  className={`text-[10px] uppercase tracking-widest font-mono ${
                    isLight ? "text-blue-600 font-semibold" : "text-blue-300/70"
                  }`}
                >
                  Operations Hub
                </p>
              </div>
            </div>
            <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-blue-200/70"}`}>
              Automated multi-region technician schedule ingester and precision Outlook dispatch template generator.
            </p>
          </div>

          {/* Column 2: Architecture & Security */}
          <div className="space-y-2.5 text-xs">
            <h4
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? "text-blue-950" : "text-blue-300"
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isLight ? "text-blue-600" : "text-emerald-400"}`} />
              <span>Data &amp; Security</span>
            </h4>
            <ul className={`space-y-1.5 text-[11px] ${isLight ? "text-slate-600" : "text-blue-200/70"}`}>
              <li className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isLight ? "bg-blue-600" : "bg-emerald-400"}`}></span>
                <span>Client-Side Ingestion (Zero Cloud Exposure)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isLight ? "bg-blue-500" : "bg-blue-400"}`}></span>
                <span>Encrypted IndexedDB &amp; Local Persistence</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isLight ? "bg-blue-500" : "bg-blue-400"}`}></span>
                <span>Strict RFC-822 / EML Format Compliance</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Regional Template Coverage */}
          <div className="space-y-2.5 text-xs">
            <h4
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? "text-blue-950" : "text-blue-300"
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${isLight ? "text-blue-600" : "text-amber-400"}`} />
              <span>Template Status</span>
            </h4>
            <div className={`space-y-1.5 text-[11px] ${isLight ? "text-slate-600" : "text-blue-200/70"}`}>
              <p>
                <strong className={`font-semibold ${isLight ? "text-blue-700" : "text-emerald-300"}`}>
                  Active:
                </strong>{" "}
                North East, Mid Atlantic, South East, Florida
              </p>
              <p>
                <strong className={`font-semibold ${isLight ? "text-slate-800" : "text-amber-300"}`}>
                  Development:
                </strong>{" "}
                NYC, NOCAL, SOCAL, Mid West
              </p>
              <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-blue-300/50"}`}>
                Universal technician roster enabled across all active regions.
              </p>
            </div>
          </div>

          {/* Column 4: Operational Metrics & Specs */}
          <div className="space-y-2.5 text-xs">
            <h4
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? "text-blue-950" : "text-blue-300"
              }`}
            >
              <Server className={`w-3.5 h-3.5 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
              <span>System Specifications</span>
            </h4>
            <ul className={`space-y-1.5 text-[11px] font-mono ${isLight ? "text-slate-600" : "text-blue-200/70"}`}>
              <li>Engine: Outlook HTML 5.4 / EML Engine</li>
              <li>Airtable Sync: Universal View Links</li>
              <li>Teardown Formats: 12H AM/PM &amp; Military</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className={`my-8 border-t ${isLight ? "border-blue-200/70" : "border-blue-900/40"}`} />

        {/* Bottom Row: All Rights Reserved & Watermark Developer Credit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Copyright notice */}
          <div className={`text-center sm:text-left text-[11px] ${isLight ? "text-slate-600" : "text-blue-300/70"}`}>
            <span>© {new Date().getFullYear()} NDS Precision Dispatch Automated Operations. All rights reserved.</span>
          </div>

          {/* Watermark-style Developer Credit */}
          <div
            className={`text-[10px] font-mono tracking-widest uppercase transition-colors duration-300 select-none cursor-default ${
              isLight
                ? "text-blue-900/35 hover:text-blue-900/75"
                : "text-blue-300/25 hover:text-blue-200/60"
            }`}
            title="System Architecture & Implementation"
          >
            Credit to the developer: Patrick Franz O. B.
          </div>
        </div>
      </div>
    </footer>
  );
};
