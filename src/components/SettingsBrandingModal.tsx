import React, { useState } from "react";
import { X, Settings, Building, Phone, Mail, Palette, CheckSquare, ShieldCheck, Check, Tag, Hash, Layers, RefreshCw, AlertCircle, CalendarDays, Filter, FileX, ClipboardList, Users, ExternalLink, Plus, Trash2, Link2, MapPin, ChevronDown, ChevronUp, Eye, EyeOff, MoveVertical } from "lucide-react";
import { TemplateBranding, TechnicianAirtableEntry, REGION_ROSTERS, RegionRoster } from "../types";
import {
  formatEmailUpdateVersion,
  getEmailUpdateBannerText,
  getStandardWorkWeekOptions,
} from "../utils/outlookTemplateGenerator";
import { DEFAULT_TECHNICIAN_ROSTER } from "../utils/technicianRosterData";
import { isRegionTemplateActive } from "../utils/regionTemplates";

interface SettingsBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: TemplateBranding;
  availableProjects?: string[];
  onSaveBranding: (newBranding: TemplateBranding) => void;
}

export const SettingsBrandingModal: React.FC<SettingsBrandingModalProps> = ({
  isOpen,
  onClose,
  branding,
  availableProjects = [],
  onSaveBranding,
}) => {
  const initialDefaultRegion =
    branding.defaultRegion ||
    (typeof window !== "undefined" ? localStorage.getItem("nds_default_region") || "" : "") ||
    (branding.selectedRegion && branding.selectedRegion !== "all" ? branding.selectedRegion : "North East");

  const [form, setForm] = useState<TemplateBranding>({
    ...branding,
    defaultRegion: initialDefaultRegion,
    regionName: initialDefaultRegion,
    selectedRegion: initialDefaultRegion,
    enableCustomId: branding.enableCustomId ?? false,
    customIdProjects: branding.customIdProjects ?? [],
    enableConductStudy: branding.enableConductStudy ?? false,
    conductStudyProjects: branding.conductStudyProjects ?? [],
    enableEmailUpdate: branding.enableEmailUpdate ?? false,
    emailUpdateType: branding.emailUpdateType ?? "documentary",
    emailUpdateVersion: branding.emailUpdateVersion ?? "2",
    emailUpdateNotes: branding.emailUpdateNotes ?? "",
    enableArrangeNewProjects: branding.enableArrangeNewProjects ?? false,
    enableScheduleOverlap: branding.enableScheduleOverlap ?? false,
    selectedWorkWeek: branding.selectedWorkWeek || "current",
    enableSunSunView: branding.enableSunSunView ?? false,
    disableScheduleNotes: branding.disableScheduleNotes ?? false,
    technicianAirtableLinks:
      branding.technicianAirtableLinks && branding.technicianAirtableLinks.length > 0
        ? branding.technicianAirtableLinks
        : DEFAULT_TECHNICIAN_ROSTER,
  });

  const [showHiddenDetails, setShowHiddenDetails] = useState(false);
  const [newTechName, setNewTechName] = useState("");
  const [newTechUrl, setNewTechUrl] = useState("");
  const [showAddTech, setShowAddTech] = useState(false);

  if (!isOpen) return null;

  const handleChange = (key: keyof TemplateBranding, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleUpdateTechLink = (index: number, newUrl: string) => {
    setForm((prev) => {
      const list = [...(prev.technicianAirtableLinks || DEFAULT_TECHNICIAN_ROSTER)];
      list[index] = { ...list[index], airtableUrl: newUrl };
      return { ...prev, technicianAirtableLinks: list };
    });
  };

  const handleResetTechLinks = () => {
    setForm((prev) => ({
      ...prev,
      technicianAirtableLinks: DEFAULT_TECHNICIAN_ROSTER,
    }));
  };

  const handleAddTechLink = () => {
    if (!newTechName.trim()) return;
    const finalUrl = newTechUrl.trim() || "https://www.airtable.com/";
    setForm((prev) => {
      const list = [...(prev.technicianAirtableLinks || DEFAULT_TECHNICIAN_ROSTER)];
      list.push({
        name: newTechName.trim(),
        airtableUrl: finalUrl,
        email: `${newTechName.trim().toLowerCase().replace(/[^a-z0-9]/g, ".")}@ndsdata.com`,
        active: true,
      });
      return { ...prev, technicianAirtableLinks: list };
    });
    setNewTechName("");
    setNewTechUrl("");
    setShowAddTech(false);
  };

  const handleRemoveTechLink = (index: number) => {
    setForm((prev) => {
      const list = [...(prev.technicianAirtableLinks || DEFAULT_TECHNICIAN_ROSTER)];
      list.splice(index, 1);
      return { ...prev, technicianAirtableLinks: list };
    });
  };

  const handleToggleProject = (proj: string) => {
    setForm((prev) => {
      const current = prev.customIdProjects || [];
      const exists = current.includes(proj);
      const updated = exists ? current.filter((p) => p !== proj) : [...current, proj];
      return { ...prev, customIdProjects: updated };
    });
  };

  const handleSelectAllProjects = () => {
    setForm((prev) => ({
      ...prev,
      customIdProjects: [...availableProjects],
    }));
  };

  const handleClearAllProjects = () => {
    setForm((prev) => ({
      ...prev,
      customIdProjects: [],
    }));
  };

  const handleToggleConductStudyProject = (proj: string) => {
    setForm((prev) => {
      const current = prev.conductStudyProjects || [];
      const exists = current.includes(proj);
      const updated = exists ? current.filter((p) => p !== proj) : [...current, proj];
      return { ...prev, conductStudyProjects: updated };
    });
  };

  const handleSelectAllConductStudyProjects = () => {
    setForm((prev) => ({
      ...prev,
      conductStudyProjects: [...availableProjects],
    }));
  };

  const handleClearAllConductStudyProjects = () => {
    setForm((prev) => ({
      ...prev,
      conductStudyProjects: [],
    }));
  };

  const handleSave = () => {
    const activeDefault = form.defaultRegion || initialDefaultRegion || "North East";
    const defaultChanged = activeDefault !== initialDefaultRegion;
    const activeSelected = defaultChanged
      ? activeDefault
      : branding.selectedRegion && branding.selectedRegion !== "all"
      ? branding.selectedRegion
      : activeDefault;

    const finalForm: TemplateBranding = {
      ...form,
      defaultRegion: activeDefault,
      selectedRegion: activeSelected,
      regionName: activeSelected,
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("nds_default_region", activeDefault);
      } catch (e) {
        console.warn("Could not save default region to localStorage", e);
      }
    }
    onSaveBranding(finalForm);
    onClose();
  };

  const COLOR_PRESETS = [
    { name: "Outlook Blue", hex: "#0078D4" },
    { name: "Classic Navy", hex: "#0F172A" },
    { name: "Emerald", hex: "#0F766E" },
    { name: "Amber Orange", hex: "#D97706" },
    { name: "Crimson", hex: "#DC2626" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040a1c]/80 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0c183d] via-[#0a1538] to-[#07102b] text-white flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0e1c45] text-blue-300 flex items-center justify-center border border-blue-700/60">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Outlook Template &amp; Dispatcher Settings</h2>
              <p className="text-xs text-blue-200/70">Configure company branding, dispatcher signature, and safety options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-300/70 hover:text-white p-1 rounded-lg hover:bg-blue-900/40 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Section: Organization & Dispatcher Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <Building className="w-3.5 h-3.5 text-zinc-600" />
              <span>Company &amp; Dispatcher Signature</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-zinc-900 flex items-center gap-1.5 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Region</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                      Default Template (Saved Locally)
                    </span>
                  </label>
                  <span className="text-[11px] text-zinc-500 hidden sm:inline">
                    Choose Region as your default template
                  </span>
                </div>
                <select
                  value={form.defaultRegion || form.selectedRegion || "North East"}
                  onChange={(e) => {
                    const newReg = e.target.value;
                    handleChange("defaultRegion", newReg);
                    handleChange("selectedRegion", newReg);
                    handleChange("regionName", newReg);
                  }}
                  className="w-full px-3.5 py-2.5 bg-blue-50/60 border border-blue-300 rounded-lg text-zinc-900 font-semibold text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 cursor-pointer shadow-2xs"
                >
                  {REGION_ROSTERS.map((r) => {
                    const isActive = isRegionTemplateActive(r);
                    return (
                      <option key={r} value={r}>
                        {r} {isActive ? "• (Active Designated Template)" : "• (Under Construction)"}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Choose your preferred default region template. This preference is stored locally on this device and sets the default template when uploading schedules.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="font-medium text-zinc-700 block mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section: External Links & Upload Channels (for Exact Schedule Template) */}
          <div className="space-y-3 pt-3 border-t border-zinc-200">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <Mail className="w-3.5 h-3.5 text-zinc-600" />
              <span>Airtable &amp; Google Maps Links</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-zinc-700 block mb-1">Airtable View Base URL</label>
                <input
                  type="text"
                  placeholder="https://airtable.com/appYourAirtableBase"
                  value={form.airtableBaseUrl || ""}
                  onChange={(e) => handleChange("airtableBaseUrl", e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-zinc-700 block mb-1">Google Maps Routing URL</label>
                <input
                  type="text"
                  placeholder="https://maps.google.com"
                  value={form.googleMapsBaseUrl || ""}
                  onChange={(e) => handleChange("googleMapsBaseUrl", e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-xs"
                />
              </div>
            </div>

            {/* Technician Roster & Individual Airtable Embed Links */}
            <div className="mt-4 pt-3 border-t border-zinc-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <span>Technician Roster &amp; Airtable Links</span>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-200">
                        {(form.technicianAirtableLinks || DEFAULT_TECHNICIAN_ROSTER).length} Active Links
                      </span>
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Personal Airtable links are automatically matched and embedded for each technician.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={handleResetTechLinks}
                    title="Reset back to official technician roster links"
                    className="flex items-center space-x-1 px-2 py-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md border border-zinc-200 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-zinc-500" />
                    <span>Reset Defaults</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTech(!showAddTech)}
                    className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold bg-[#0e2354] hover:bg-[#153275] text-white rounded-md transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Tech</span>
                  </button>
                </div>
              </div>

              {/* Add New Technician Inline Form */}
              {showAddTech && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2 animate-in fade-in zoom-in-95">
                  <div className="text-xs font-semibold text-emerald-950 flex items-center space-x-1">
                    <Plus className="w-3 h-3 text-emerald-700" />
                    <span>Add New Technician to Airtable Roster</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Technician Full Name (e.g. John Doe)"
                      value={newTechName}
                      onChange={(e) => setNewTechName(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-emerald-300 rounded-md text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                    <input
                      type="text"
                      placeholder="Airtable URL (https://airtable.com/...)"
                      value={newTechUrl}
                      onChange={(e) => setNewTechUrl(e.target.value)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-emerald-300 rounded-md text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddTech(false)}
                      className="px-2.5 py-1 text-xs text-zinc-600 hover:text-zinc-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTechLink}
                      disabled={!newTechName.trim() || !newTechUrl.trim()}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-xs"
                    >
                      Save Technician
                    </button>
                  </div>
                </div>
              )}

              {/* Technician Roster Items */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 divide-y divide-zinc-100 border border-zinc-200 rounded-lg p-2 bg-zinc-50/50">
                {(form.technicianAirtableLinks || DEFAULT_TECHNICIAN_ROSTER).map((tech, idx) => (
                  <div key={tech.name + idx} className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="min-w-[150px] flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-700 uppercase shrink-0">
                        {tech.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-zinc-900 leading-tight truncate">{tech.name}</div>
                        <div className="text-[10px] text-zinc-400 truncate">{tech.email || "Technician"}</div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-wrap sm:flex-nowrap items-center gap-1.5">
                      <input
                        type="text"
                        value={tech.airtableUrl}
                        onChange={(e) => handleUpdateTechLink(idx, e.target.value)}
                        placeholder="https://airtable.com/app.../shr..."
                        className="flex-1 min-w-[160px] px-2 py-1 text-[11px] bg-white border border-zinc-200 rounded text-zinc-800 font-mono focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                      <a
                        href={tech.airtableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Test & open Airtable link"
                        className="p-1.5 text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 border border-zinc-200 rounded transition cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveTechLink(idx)}
                        title="Remove technician"
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-zinc-200 rounded transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Outlook Accent Styling */}
          <div className="space-y-3 pt-3 border-t border-zinc-200">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <Palette className="w-3.5 h-3.5 text-zinc-600" />
              <span>Theme &amp; Brand Accent Colors</span>
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => handleChange("primaryColor", color.hex)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
                    form.primaryColor === color.hex
                      ? "border-zinc-900 bg-zinc-900 text-white font-semibold"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color.hex }}></span>
                  <span>{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Email Content Features */}
          <div className="space-y-3 pt-3 border-t border-zinc-200">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <CheckSquare className="w-3.5 h-3.5 text-zinc-600" />
              <span>Email Content Controls</span>
            </h3>

            <div className="space-y-2.5">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.includeMapLinks}
                  onChange={(e) => handleChange("includeMapLinks", e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-zinc-800">Include Google Maps GPS links for all service addresses</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.includeChecklist}
                  onChange={(e) => handleChange("includeChecklist", e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-zinc-800">Attach Pre-Shift Field &amp; Vehicle Safety Checklist in footer</span>
              </label>

              <label className="flex items-start space-x-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.enableAdditionalNotes !== false}
                  onChange={(e) => handleChange("enableAdditionalNotes", e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 mt-0.5"
                />
                <div>
                  <span className="font-medium text-zinc-900 block">Additional Notes (Yellow Highlight)</span>
                  <span className="text-[11px] text-zinc-500 block">
                    When enabled, includes yellow-highlighted preset notes (pole extensions, file naming format, KMZ instructions) in the Outlook dispatch template.
                  </span>
                </div>
              </label>

              {/* Add Custom ID Toggle & Project Selection */}
              <div className="pt-2 border-t border-zinc-100">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.enableCustomId}
                    onChange={(e) => handleChange("enableCustomId", e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-zinc-900 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      <span>Add Custom ID (from Locations)</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Fetch the Custom ID from the CSV &ldquo;Custom ID (from Locations)&rdquo; column and display it beside each location bullet point (e.g. &bull; 001 (111223344)) for selected project numbers.
                    </span>
                  </div>
                </label>

                {form.enableCustomId && (
                  <div className="mt-3 ml-6.5 p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-950 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-blue-700" />
                        <span>Select Projects to Apply Custom ID</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleSelectAllProjects}
                          className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-blue-300">|</span>
                        <button
                          type="button"
                          onClick={handleClearAllProjects}
                          className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 underline cursor-pointer"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    {availableProjects.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {availableProjects.map((proj) => {
                          const isChecked = (form.customIdProjects || []).includes(proj);
                          return (
                            <label
                              key={proj}
                              className={`flex items-center space-x-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                                isChecked
                                  ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-xs"
                                  : "bg-white text-zinc-700 border-zinc-200 hover:border-blue-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleProject(proj)}
                                className="sr-only"
                              />
                              <span
                                className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border text-[10px] ${
                                  isChecked ? "bg-white text-blue-700 border-white" : "border-zinc-300 bg-zinc-50"
                                }`}
                              >
                                {isChecked && "✓"}
                              </span>
                              <span className="truncate">{proj}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">
                        Upload a CSV file to automatically populate project numbers.
                      </p>
                    )}

                    <div className="text-[11px] text-blue-800/80 bg-blue-100/60 p-2 rounded-md">
                      <strong>Preview Format:</strong> &bull; 001 (CustomID) 1 camera...
                      {(form.customIdProjects || []).length > 0
                        ? ` (Active on ${(form.customIdProjects || []).length} selected project${(form.customIdProjects || []).length > 1 ? "s" : ""})`
                        : " (Select at least one project above to apply)"}
                    </div>
                  </div>
                )}
              </div>

              {/* Conduct Study Toggle & Project Selection */}
              <div className="pt-2 border-t border-zinc-100">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.enableConductStudy}
                    onChange={(e) => handleChange("enableConductStudy", e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-zinc-900 flex items-center gap-1.5">
                      <ClipboardList className="w-3.5 h-3.5 text-purple-600" />
                      <span>Conduct Study (Header Formatting &amp; Preset Note #9)</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      When enabled, formats both Install and Teardown task headers as &ldquo;Conduct Parking Inventory: &lt;Project Number&gt; &lt;City, State&gt; PKG&rdquo; for parking studies (or &ldquo;Conduct &lt;Study&gt;: &lt;Project Number&gt; &lt;City, State&gt; &lt;Study&gt;&rdquo; for other studies) and automatically injects Preset Note #9 (Parking Inventory Requirements &amp; KMZ Coverage).
                    </span>
                  </div>
                </label>

                {form.enableConductStudy && (
                  <div className="mt-3 ml-6.5 p-3.5 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-purple-950 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-purple-700" />
                        <span>Select Projects to Apply Conduct Study</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleSelectAllConductStudyProjects}
                          className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-purple-300">|</span>
                        <button
                          type="button"
                          onClick={handleClearAllConductStudyProjects}
                          className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 underline cursor-pointer"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    {availableProjects.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {availableProjects.map((proj) => {
                          const isChecked = (form.conductStudyProjects || []).includes(proj);
                          return (
                            <label
                              key={proj}
                              className={`flex items-center space-x-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                                isChecked
                                  ? "bg-purple-600 text-white border-purple-600 font-semibold shadow-xs"
                                  : "bg-white text-zinc-700 border-zinc-200 hover:border-purple-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleConductStudyProject(proj)}
                                className="sr-only"
                              />
                              <span
                                className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border text-[10px] ${
                                  isChecked ? "bg-white text-purple-700 border-white" : "border-zinc-300 bg-zinc-50"
                                }`}
                              >
                                {isChecked && "✓"}
                              </span>
                              <span className="truncate">{proj}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic">
                        Upload a CSV file to automatically populate project numbers.
                      </p>
                    )}

                    <div className="text-[11px] text-purple-800/80 bg-purple-100/60 p-2 rounded-md">
                      <strong>Preview:</strong> Conduct Parking Inventory: 26-410095 New Britain, CT PKG
                      {(form.conductStudyProjects || []).length > 0
                        ? ` (Active on ${(form.conductStudyProjects || []).length} selected project${(form.conductStudyProjects || []).length > 1 ? "s" : ""})`
                        : " (Applies to all projects if none specifically selected)"}
                    </div>
                  </div>
                )}
              </div>

              {/* Email Update Toggle & Configuration */}
              <div className="pt-2 border-t border-zinc-100">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.enableEmailUpdate}
                    onChange={(e) => handleChange("enableEmailUpdate", e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-zinc-900 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                      <span>Email Update (v2, v3 Schedule / Documentary Updates)</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      Appends &ldquo;Update v{formatEmailUpdateVersion(form.emailUpdateVersion)}&rdquo; to the email subject and inserts a bold yellow-highlighted update banner between the technician greeting and intro paragraph.
                    </span>
                  </div>
                </label>

                {form.enableEmailUpdate && (
                  <div className="mt-3 ml-6.5 p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/90 space-y-3">
                    {/* Update Type Selector */}
                    <div>
                      <span className="text-xs font-semibold text-amber-950 block mb-1.5">
                        Select Update Type:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleChange("emailUpdateType", "documentary")}
                          className={`flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            (form.emailUpdateType || "documentary") === "documentary"
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white text-zinc-700 border-zinc-200 hover:bg-amber-50/50"
                          }`}
                        >
                          For Documentary
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange("emailUpdateType", "schedule")}
                          className={`flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            form.emailUpdateType === "schedule"
                              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                              : "bg-white text-zinc-700 border-zinc-200 hover:bg-amber-50/50"
                          }`}
                        >
                          Schedule Update
                        </button>
                      </div>
                    </div>

                    {/* Version Number Input */}
                    <div>
                      <label className="text-xs font-semibold text-amber-950 block mb-1">
                        Version Number (e.g. 2 for v2, 3 for v3):
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-amber-900 bg-amber-200/60 px-2.5 py-1.5 rounded-lg border border-amber-300">
                          v.
                        </span>
                        <input
                          type="text"
                          value={form.emailUpdateVersion ?? "2"}
                          onChange={(e) => handleChange("emailUpdateVersion", e.target.value)}
                          placeholder="2"
                          className="w-24 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        />
                        <span className="text-[11px] text-zinc-500">
                          Subject: <code>...Update v{formatEmailUpdateVersion(form.emailUpdateVersion)}</code>
                        </span>
                      </div>
                    </div>

                    {/* Added Update Notes Input */}
                    <div>
                      <label className="text-xs font-semibold text-amber-950 block mb-1">
                        Added Update Notes:
                      </label>
                      <textarea
                        rows={4}
                        value={form.emailUpdateNotes ?? ""}
                        onChange={(e) => handleChange("emailUpdateNotes", e.target.value)}
                        placeholder="Enter custom update notes here (optional)..."
                        className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 min-h-[100px] resize-y leading-relaxed"
                      />
                    </div>

                    {/* Live Banner Preview */}
                    <div className="p-2.5 bg-white rounded-lg border border-amber-200 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Email Banner Live Preview:
                      </div>
                      <div className="text-xs font-bold text-black bg-yellow-300 px-2 py-1.5 rounded leading-relaxed inline-block">
                        {getEmailUpdateBannerText(form)}
                      </div>
                    </div>

                    {/* Arrange New Project Toggle (Florida & South East only) */}
                    {(form.selectedRegion === "Florida" || form.selectedRegion === "South East" || form.regionName === "Florida" || form.regionName === "South East") && (
                      <div className="pt-2 border-t border-amber-200/70">
                        <label className="flex items-start space-x-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!form.enableArrangeNewProjects}
                            onChange={(e) => handleChange("enableArrangeNewProjects", e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5"
                          />
                          <div>
                            <span className="font-medium text-zinc-900 text-xs flex items-center gap-1.5">
                              <MoveVertical className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Arrange New Project (Custom Project Sequence per Day)</span>
                            </span>
                            <span className="text-[11px] text-zinc-600 block">
                              Enables manual reordering of project numbers per day for Florida and South East dispatches.
                            </span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* No Schedule Notes Toggle */}
              <div className="pt-2 border-t border-zinc-100">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.disableScheduleNotes}
                    onChange={(e) => handleChange("disableScheduleNotes", e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-zinc-900 flex items-center gap-1.5">
                      <FileX className="w-3.5 h-3.5 text-rose-600" />
                      <span>No Schedule Notes</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      When enabled, the system will not add the notes from the <code>&lt;Schedule Notes&gt;</code> column to the location bullets in the email.
                    </span>
                  </div>
                </label>
              </div>

              {/* Schedule Overlap Detection Toggle & Work Week Picker */}
              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.enableScheduleOverlap}
                    onChange={(e) => handleChange("enableScheduleOverlap", e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-zinc-900 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Schedule Overlap Filter</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      When enabled, automatically detects project schedules that fall outside the active workweek range (such as overlapped schedules for incoming WW37) and excludes them from the generated email.
                    </span>
                  </div>
                </label>

                {/* Work Week Dropdown Picker */}
                {(() => {
                  const stdWeeks = getStandardWorkWeekOptions(form);
                  return (
                    <div className="ml-6.5 flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
                      <span className="text-xs font-semibold text-emerald-950 whitespace-nowrap">
                        Target Work Week:
                      </span>
                      <select
                        value={form.selectedWorkWeek || "current"}
                        onChange={(e) => handleChange("selectedWorkWeek", e.target.value)}
                        className="text-xs font-medium border border-emerald-300 rounded-md px-2.5 py-1.5 bg-white text-zinc-900 shadow-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer flex-1"
                      >
                        <option value="current">Current Work week {stdWeeks.current.formattedRange}</option>
                        <option value="incoming">Incoming Work week {stdWeeks.incoming.formattedRange}</option>
                      </select>
                    </div>
                  );
                })()}
              </div>

              {/* Sun - Sun (8-Day View) Toggle */}
              <div className="pt-2 border-t border-zinc-100">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.enableSunSunView}
                    onChange={(e) => handleChange("enableSunSunView", e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-zinc-900 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sun - Sun (8-Day Schedule with Dated Sunday Headers)</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      When enabled, adds an additional Sunday section at the bottom of the email and formats both the top and bottom Sunday sections with dates (e.g. <code>Sunday 09/06 ... Sunday 09/13</code>).
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Section: Secondary Dispatch & Contact Details (Hidden by Default) */}
          <div className="pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setShowHiddenDetails(!showHiddenDetails)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition cursor-pointer text-left group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-md bg-zinc-200 group-hover:bg-zinc-300 text-zinc-600 flex items-center justify-center transition">
                  {showHiddenDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                    <span>Secondary Contact &amp; Upload Details</span>
                    <span className="text-[10px] font-semibold bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full">
                      {showHiddenDetails ? "Expanded" : "7 Fields Hidden"}
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Dispatch support phone, reply-to email, dispatcher name, photo upload links, data transfer email &amp; safety notice.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-xs font-semibold text-blue-700 group-hover:text-blue-900 shrink-0 ml-2">
                <span>{showHiddenDetails ? "Hide Fields" : "Show Fields"}</span>
                {showHiddenDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showHiddenDetails && (
              <div className="mt-3 p-4 bg-zinc-50/90 rounded-xl border border-zinc-200 space-y-3.5 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-zinc-700 block mb-1">Dispatcher / Sender Name</label>
                    <input
                      type="text"
                      value={form.dispatcherName}
                      onChange={(e) => handleChange("dispatcherName", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-zinc-700 block mb-1">Reply-To Email Address</label>
                    <input
                      type="email"
                      value={form.replyToEmail}
                      onChange={(e) => handleChange("replyToEmail", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-zinc-700 block mb-1">Dispatch Support Phone</label>
                    <input
                      type="text"
                      value={form.supportPhone}
                      onChange={(e) => handleChange("supportPhone", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-zinc-700 block mb-1">Photo Upload URL</label>
                    <input
                      type="text"
                      placeholder="https://airtable.com/appSouthCentralPhotos"
                      value={form.photoUploadUrl || ""}
                      onChange={(e) => handleChange("photoUploadUrl", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-zinc-700 block mb-1">Photo Upload Link Text</label>
                    <input
                      type="text"
                      placeholder="South Central Job Photos"
                      value={form.photoUploadLinkText || ""}
                      onChange={(e) => handleChange("photoUploadLinkText", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-zinc-700 block mb-1">Data Transfer Upload Email (FileZilla / Reports)</label>
                    <input
                      type="email"
                      placeholder="jobs@ndsdata.com"
                      value={form.dataUploadEmail || ""}
                      onChange={(e) => handleChange("dataUploadEmail", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-medium text-zinc-700 block mb-1">Custom Field Safety Disclaimer / Notice</label>
                    <textarea
                      rows={2}
                      value={form.customDisclaimer}
                      onChange={(e) => handleChange("customDisclaimer", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="text-xs font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white px-5 py-2 rounded-lg shadow-md shadow-blue-950/40 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
