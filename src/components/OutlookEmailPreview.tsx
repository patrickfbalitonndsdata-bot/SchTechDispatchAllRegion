import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FileText,
  Download,
  Sparkles,
  Palette,
  Send,
  Mail,
  RefreshCw,
  StickyNote,
  Sliders,
  Tag,
  ChevronDown,
  Hash,
  Paperclip,
  MapPin,
  Table,
  FileArchive,
  File,
  X,
  Plus,
  Bookmark,
  BookmarkCheck,
  History,
  FileX,
  UploadCloud,
  ClipboardList,
  ExternalLink,
  Filter,
  Copy,
  Check,
  MoveVertical,
} from "lucide-react";
import { TechnicianRoster, TemplateBranding, TemplateStyle, EmailAttachment } from "../types";
import { resolveTechnicianAirtableUrl, hasDirectTechnicianAirtableLink } from "../utils/technicianRosterData";
import {
  generateOutlookHtml,
  generatePlainTextEmail,
  generateEmailSubject,
  getPriorityColors,
  downloadEmlFile,
  getMailtoUrl,
  formatEmailUpdateVersion,
  getEmailUpdateBannerText,
  getTechnicianAttachments,
  formatFileSize,
  createSampleKmzAttachment,
  readFileAsBase64,
  getMimeTypeForFilename,
  formatTechnicianFullName,
  getWeekDateRange,
  filterOrdersForScheduleOverlap,
  isNoteMatchingRegion,
} from "../utils/outlookTemplateGenerator";

interface OutlookEmailPreviewProps {
  roster: TechnicianRoster;
  branding: TemplateBranding;
  currentStyle?: TemplateStyle;
  availableProjects?: string[];
  nextVersionTag?: string;
  savedVersionsCount?: number;
  onRecordDispatch: (method: any, status: any) => void;
  onSaveToHistory?: (customTag?: string) => void;
  onToggleAdditionalNotes?: (val: boolean) => void;
  onOpenNotesModal?: () => void;
  onToggleNoScheduleNotes?: (val: boolean) => void;
  onToggleCustomId?: (val: boolean) => void;
  onUpdateCustomIdProjects?: (projects: string[]) => void;
  onToggleConductStudy?: (val: boolean) => void;
  onUpdateConductStudyProjects?: (projects: string[]) => void;
  onToggleEmailUpdate?: (val: boolean) => void;
  onUpdateEmailUpdateConfig?: (config: { type?: "documentary" | "schedule"; version?: string | number; notes?: string }) => void;
  onToggleArrangeNewProjects?: (val: boolean) => void;
  onOpenArrangeProjectsModal?: () => void;
  onOpenAttachmentModal?: () => void;
  onUpdateAttachments?: (attachments: EmailAttachment[]) => void;
  themeMode?: "dark" | "light";
}

export const OutlookEmailPreview: React.FC<OutlookEmailPreviewProps> = ({
  roster,
  branding,
  currentStyle = "exact_nds_template",
  availableProjects = [],
  nextVersionTag = "Initial",
  savedVersionsCount = 0,
  onRecordDispatch,
  onSaveToHistory,
  onToggleAdditionalNotes,
  onOpenNotesModal,
  onToggleNoScheduleNotes,
  onToggleCustomId,
  onUpdateCustomIdProjects,
  onToggleConductStudy,
  onUpdateConductStudyProjects,
  onToggleEmailUpdate,
  onUpdateEmailUpdateConfig,
  onToggleArrangeNewProjects,
  onOpenArrangeProjectsModal,
  onOpenAttachmentModal,
  onUpdateAttachments,
  themeMode = "dark",
}) => {
  const isLight = themeMode === "light";
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const [saveCustomTag, setSaveCustomTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"html" | "text" | null>(null);
  const [customIdDropdownOpen, setCustomIdDropdownOpen] = useState(false);
  const customIdDropdownRef = useRef<HTMLDivElement>(null);
  const [conductStudyDropdownOpen, setConductStudyDropdownOpen] = useState(false);
  const conductStudyDropdownRef = useRef<HTMLDivElement>(null);
  const [emailUpdateDropdownOpen, setEmailUpdateDropdownOpen] = useState(false);
  const emailUpdateDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const techAttachments = useMemo(() => {
    return getTechnicianAttachments(roster, branding);
  }, [roster, branding]);

  const handleFilesUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !onUpdateAttachments) return;
    const currentList = branding.attachments || [];
    const newItems: EmailAttachment[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const { base64, dataUrl } = await readFileAsBase64(file);
        const mimeType = file.type || getMimeTypeForFilename(file.name);
        newItems.push({
          id: "att_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now(),
          name: file.name,
          size: file.size,
          type: mimeType,
          dataBase64: base64,
          dataUrl: dataUrl,
          technicianScope: roster.technicianName, // Scoped to this tech
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error reading attachment:", err);
      }
    }
    if (newItems.length > 0) {
      onUpdateAttachments([...currentList, ...newItems]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleAddSampleKmz = () => {
    if (!onUpdateAttachments) return;
    const sample = createSampleKmzAttachment(roster.technicianName);
    const currentList = branding.attachments || [];
    onUpdateAttachments([...currentList, sample]);
  };

  const handleRemoveAttachment = (id: string) => {
    if (!onUpdateAttachments) return;
    const currentList = branding.attachments || [];
    onUpdateAttachments(currentList.filter((a) => a.id !== id));
  };

  const handleDownloadAttachment = (att: EmailAttachment) => {
    try {
      const link = document.createElement("a");
      link.href = att.dataUrl || `data:${att.type || "application/octet-stream"};base64,${att.dataBase64}`;
      link.download = att.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Failed to download attachment:", e);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (ext === "kmz" || ext === "kml") return <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    if (ext === "pdf") return <FileText className="w-3.5 h-3.5 text-red-600 shrink-0" />;
    if (ext === "csv" || ext === "xlsx" || ext === "xls") return <Table className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (ext === "zip" || ext === "rar" || ext === "7z") return <FileArchive className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    return <File className="w-3.5 h-3.5 text-zinc-600 shrink-0" />;
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customIdDropdownRef.current && !customIdDropdownRef.current.contains(event.target as Node)) {
        setCustomIdDropdownOpen(false);
      }
      if (conductStudyDropdownRef.current && !conductStudyDropdownRef.current.contains(event.target as Node)) {
        setConductStudyDropdownOpen(false);
      }
      if (emailUpdateDropdownRef.current && !emailUpdateDropdownRef.current.contains(event.target as Node)) {
        setEmailUpdateDropdownOpen(false);
      }
    }
    if (customIdDropdownOpen || conductStudyDropdownOpen || emailUpdateDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [customIdDropdownOpen, conductStudyDropdownOpen, emailUpdateDropdownOpen]);

  const subject = useMemo(() => generateEmailSubject(roster, branding), [roster, branding]);
  const htmlContent = useMemo(
    () => generateOutlookHtml(roster, branding, "exact_nds_template"),
    [roster, branding]
  );
  const plainTextContent = useMemo(
    () => generatePlainTextEmail(roster, branding),
    [roster, branding]
  );

  const activeNotesCount = (branding.additionalNotes || []).filter(
    (p) =>
      p.enabled &&
      isNoteMatchingRegion(
        p,
        (branding.selectedRegion && branding.selectedRegion !== "all" ? branding.selectedRegion : undefined) ||
          branding.regionName ||
          roster.region
      )
  ).length;

  const isFlSeRegion = useMemo(() => {
    if (branding.selectedRegion && branding.selectedRegion !== "all") {
      return branding.selectedRegion === "Florida" || branding.selectedRegion === "South East";
    }
    if (branding.regionName && branding.regionName !== "all") {
      return branding.regionName === "Florida" || branding.regionName === "South East";
    }
    return roster.region === "Florida" || roster.region === "South East";
  }, [roster.region, branding.selectedRegion, branding.regionName]);
  const selectedCustomIdProjects = branding.customIdProjects || [];
  const selectedConductStudyProjects = branding.conductStudyProjects || [];

  const handleToggleProject = (proj: string) => {
    if (!onUpdateCustomIdProjects) return;
    const exists = selectedCustomIdProjects.includes(proj);
    const updated = exists
      ? selectedCustomIdProjects.filter((p) => p !== proj)
      : [...selectedCustomIdProjects, proj];
    onUpdateCustomIdProjects(updated);
  };

  const handleSelectAllProjects = () => {
    if (onUpdateCustomIdProjects) {
      onUpdateCustomIdProjects([...availableProjects]);
    }
  };

  const handleClearAllProjects = () => {
    if (onUpdateCustomIdProjects) {
      onUpdateCustomIdProjects([]);
    }
  };

  const handleToggleConductStudyProject = (proj: string) => {
    if (!onUpdateConductStudyProjects) return;
    const exists = selectedConductStudyProjects.includes(proj);
    const updated = exists
      ? selectedConductStudyProjects.filter((p) => p !== proj)
      : [...selectedConductStudyProjects, proj];
    onUpdateConductStudyProjects(updated);
  };

  const handleSelectAllConductStudyProjects = () => {
    if (onUpdateConductStudyProjects) {
      onUpdateConductStudyProjects([...availableProjects]);
    }
  };

  const handleClearAllConductStudyProjects = () => {
    if (onUpdateConductStudyProjects) {
      onUpdateConductStudyProjects([]);
    }
  };

  const handleDownloadEml = () => {
    downloadEmlFile(roster, branding, "exact_nds_template");
    onRecordDispatch("Outlook EML", "Exported");
  };

  const handleCopyHtml = async () => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([htmlContent], { type: "text/html" });
        const blobText = new Blob([plainTextContent], { type: "text/plain" });
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": blobHtml,
            "text/plain": blobText,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plainTextContent);
      }
      setCopyStatus("html");
      onRecordDispatch("Clipboard HTML", "Copied");
      setTimeout(() => setCopyStatus(null), 2500);
    } catch (err) {
      console.error("Clipboard copy failed, using fallback:", err);
      try {
        await navigator.clipboard.writeText(plainTextContent);
        setCopyStatus("html");
        onRecordDispatch("Clipboard HTML", "Copied");
        setTimeout(() => setCopyStatus(null), 2500);
      } catch (fallbackErr) {
        console.error("Fallback failed:", fallbackErr);
      }
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(plainTextContent);
      setCopyStatus("text");
      onRecordDispatch("Clipboard Text", "Copied");
      setTimeout(() => setCopyStatus(null), 2500);
    } catch (err) {
      console.error("Copy text failed:", err);
    }
  };

  const handleSaveToHistoryClick = () => {
    if (onSaveToHistory) {
      const tagToUse = saveCustomTag.trim() || nextVersionTag;
      onSaveToHistory(tagToUse);
      setSavedFeedback(tagToUse);
      setShowTagInput(false);
      setSaveCustomTag("");
      setTimeout(() => setSavedFeedback(null), 3000);
    }
  };

  const weekInfo = useMemo(() => getWeekDateRange(roster.date, branding), [roster.date, branding]);
  const overlapInfo = useMemo(() => {
    return filterOrdersForScheduleOverlap(roster.orders, weekInfo, branding);
  }, [roster.orders, weekInfo, branding]);

  return (
    <div
      className={`bg-white border rounded-xl shadow-md overflow-hidden flex flex-col ${
        isLight ? "border-blue-200 shadow-blue-900/5" : "border-zinc-200"
      }`}
    >
      {/* Top Preview Controls Bar */}
      <div
        className={`p-4 border-b flex flex-col gap-3.5 transition-colors ${
          isLight
            ? "bg-gradient-to-r from-blue-50 via-white to-blue-50/80 border-blue-200 text-slate-900"
            : "bg-gradient-to-r from-[#0c183d] via-[#0a1538] to-[#07102b] border-blue-900/50 text-white"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isLight
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-[#0e1c45] text-blue-300 border-blue-700/60"
            }`}
          >
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold tracking-tight ${isLight ? "text-blue-950" : "text-white"}`}>
                {branding.selectedRegion || roster.region || branding.regionName || "North East"} Email Template
              </h2>
              <span
                className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isLight
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : "text-emerald-300 bg-emerald-950/90 border-emerald-700/60"
                }`}
              >
                Designated Active
              </span>
            </div>
            <p
              className={`text-xs flex items-center flex-wrap gap-1.5 mt-0.5 font-medium ${
                isLight ? "text-slate-600" : "text-blue-200/70"
              }`}
            >
              <span>
                Generating for{" "}
                <span className={`font-bold ${isLight ? "text-blue-900" : "text-white"}`}>
                  {roster.technicianName}
                </span>{" "}
                ({roster.technicianEmail})
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isLight
                    ? "text-blue-800 bg-blue-100/80 border-blue-200"
                    : "text-blue-300 bg-blue-950/80 border-blue-700/60"
                }`}
              >
                <MapPin className={`w-2.5 h-2.5 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
                Region: {branding.selectedRegion || roster.region || "North East"}
              </span>
            </p>
          </div>
        </div>

        {/* Top Controls: Notes Toggle, No Schedule Notes, Custom ID, Conduct Study & Email Update Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Additional Notes Quick Toggle & Preset Manager */}
          {onToggleAdditionalNotes && (
            <div
              className={`flex items-center border rounded-lg p-0.5 ${
                isLight ? "bg-blue-50/80 border-blue-200" : "bg-[#0e1c45] border-blue-800/60"
              }`}
            >
              <button
                onClick={() => onToggleAdditionalNotes(branding.enableAdditionalNotes === false ? true : false)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  branding.enableAdditionalNotes !== false
                    ? isLight
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : "bg-amber-400 text-stone-950 font-bold shadow-xs"
                    : isLight
                    ? "text-blue-900 hover:text-blue-700"
                    : "text-blue-300/70 hover:text-white"
                }`}
                title="Toggle Additional Notes with yellow highlight in the email"
              >
                <StickyNote className="w-3.5 h-3.5" />
                <span>Additional Notes</span>
                {branding.enableAdditionalNotes !== false && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isLight ? "bg-white/25 text-white" : "bg-[#050b1e] text-amber-300"
                    }`}
                  >
                    {activeNotesCount}
                  </span>
                )}
              </button>
              {onOpenNotesModal && (
                <button
                  onClick={onOpenNotesModal}
                  className={`px-1.5 py-1 transition rounded-md cursor-pointer ${
                    isLight
                      ? "text-blue-700 hover:text-blue-950 hover:bg-blue-100"
                      : "text-blue-300/70 hover:text-amber-300 hover:bg-blue-900/40"
                  }`}
                  title="Configure and manage Additional Notes presets"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* No Schedule Notes Quick Toggle */}
          {onToggleNoScheduleNotes && (
            <button
              onClick={() => onToggleNoScheduleNotes(!branding.disableScheduleNotes)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                branding.disableScheduleNotes
                  ? "bg-rose-600 text-white font-bold border-rose-500 shadow-xs"
                  : isLight
                  ? "bg-blue-50/80 text-blue-900 hover:bg-blue-100 border-blue-200"
                  : "bg-[#0e1c45] text-blue-200 hover:text-white border-blue-800/70"
              }`}
              title="Toggle No Schedule Notes (Omit notes from <Schedule Notes> column)"
            >
              <FileX className="w-3.5 h-3.5" />
              <span>No Schedule Notes</span>
              {branding.disableScheduleNotes && (
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  Active
                </span>
              )}
            </button>
          )}

          {/* Add Custom ID Quick Toggle & Project Multi-Selector */}
          {onToggleCustomId && (
            <div className="relative" ref={customIdDropdownRef}>
              <div
                className={`flex items-center border rounded-lg p-0.5 ${
                  isLight ? "bg-blue-50/80 border-blue-200" : "bg-[#0e1c45] border-blue-800/60"
                }`}
              >
                <button
                  onClick={() => onToggleCustomId(!branding.enableCustomId)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    branding.enableCustomId
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : isLight
                      ? "text-blue-900 hover:text-blue-700"
                      : "text-blue-200 hover:text-white"
                  }`}
                  title="Toggle Add Custom ID next to locations (e.g. • 001 (111223344))"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Add Custom ID</span>
                  {branding.enableCustomId && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isLight ? "bg-white/25 text-white" : "bg-[#050b1e] text-blue-300"
                      }`}
                    >
                      {selectedCustomIdProjects.length === 0
                        ? "All"
                        : `${selectedCustomIdProjects.length}`}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCustomIdDropdownOpen((prev) => !prev)}
                  className={`px-1.5 py-1 transition rounded-md cursor-pointer ${
                    isLight
                      ? "text-blue-700 hover:text-blue-950 hover:bg-blue-100"
                      : "text-blue-200 hover:text-blue-300 hover:bg-blue-900/40"
                  }`}
                  title="Select project numbers to attach Custom ID"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Popover Dropdown for Project Multi-Selection */}
              {customIdDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-zinc-200 z-50 text-zinc-900 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-zinc-900">
                      <Hash className="w-3.5 h-3.5 text-blue-600" />
                      <span>Custom ID Projects</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={handleSelectAllProjects}
                        className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                      >
                        All
                      </button>
                      <span className="text-zinc-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearAllProjects}
                        className="text-zinc-500 hover:text-zinc-800 font-semibold underline cursor-pointer"
                      >
                        None
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-500">
                    Select which Project Numbers will have the Custom ID appended next to location bullets:
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {availableProjects.length > 0 ? (
                      availableProjects.map((proj) => {
                        const isChecked = selectedCustomIdProjects.includes(proj);
                        return (
                          <label
                            key={proj}
                            className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition ${
                              isChecked
                                ? "bg-blue-50 border-blue-300 text-blue-900 font-semibold"
                                : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
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
                                isChecked
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "border-zinc-300 bg-white"
                              }`}
                            >
                              {isChecked && "✓"}
                            </span>
                            <span className="font-mono text-[11px] truncate">{proj}</span>
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-xs text-zinc-400 italic py-2 text-center">
                        No projects detected from CSV.
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">
                      {selectedCustomIdProjects.length === 0
                        ? "Applies to all projects by default"
                        : `${selectedCustomIdProjects.length} of ${availableProjects.length} selected`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomIdDropdownOpen(false)}
                      className="px-2.5 py-1 bg-zinc-900 text-white text-[11px] font-semibold rounded-md hover:bg-zinc-800 transition cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conduct Study Quick Toggle & Project Multi-Selector */}
          {onToggleConductStudy && (
            <div className="relative" ref={conductStudyDropdownRef}>
              <div
                className={`flex items-center border rounded-lg p-0.5 ${
                  isLight ? "bg-blue-50/80 border-blue-200" : "bg-[#0e1c45] border-blue-800/60"
                }`}
              >
                <button
                  onClick={() => onToggleConductStudy(!branding.enableConductStudy)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                    branding.enableConductStudy
                      ? "bg-purple-600 text-white font-bold shadow-xs"
                      : isLight
                      ? "text-blue-900 hover:text-blue-700"
                      : "text-blue-200 hover:text-white"
                  }`}
                  title="Toggle Conduct Study formatting (both Install and Teardown lines formatted as Conduct <Study>, e.g. Conduct Parking Inventory: 26-410095 New Britain, CT PKG with Preset Note #9 auto-injected)"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Conduct Study</span>
                  {branding.enableConductStudy && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isLight ? "bg-white/25 text-white" : "bg-[#050b1e] text-purple-300"
                      }`}
                    >
                      {selectedConductStudyProjects.length === 0
                        ? "All"
                        : `${selectedConductStudyProjects.length}`}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setConductStudyDropdownOpen((prev) => !prev)}
                  className={`px-1.5 py-1 transition rounded-md cursor-pointer ${
                    isLight
                      ? "text-blue-700 hover:text-blue-950 hover:bg-blue-100"
                      : "text-blue-200 hover:text-purple-300 hover:bg-blue-900/40"
                  }`}
                  title="Select project numbers to apply Conduct Study formatting"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Popover Dropdown for Project Multi-Selection */}
              {conductStudyDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-zinc-200 z-50 text-zinc-900 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-zinc-900">
                      <ClipboardList className="w-3.5 h-3.5 text-purple-600" />
                      <span>Conduct Study Projects</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={handleSelectAllConductStudyProjects}
                        className="text-purple-600 hover:text-purple-800 font-semibold underline cursor-pointer"
                      >
                        All
                      </button>
                      <span className="text-zinc-300">|</span>
                      <button
                        type="button"
                        onClick={handleClearAllConductStudyProjects}
                        className="text-zinc-500 hover:text-zinc-800 font-semibold underline cursor-pointer"
                      >
                        None
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-500">
                    Select projects to format both Install and Teardown lines as &ldquo;Conduct &lt;Study&gt;:&rdquo; (or &ldquo;Conduct Parking Inventory:&rdquo; for parking studies with Preset Note #9 auto-injected):
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {availableProjects.length > 0 ? (
                      availableProjects.map((proj) => {
                        const isChecked = selectedConductStudyProjects.includes(proj);
                        return (
                          <label
                            key={proj}
                            className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition ${
                              isChecked
                                ? "bg-purple-50 border-purple-300 text-purple-900 font-semibold"
                                : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
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
                                isChecked
                                  ? "bg-purple-600 text-white border-purple-600"
                                  : "border-zinc-300 bg-white"
                              }`}
                            >
                              {isChecked && "✓"}
                            </span>
                            <span className="font-mono text-[11px] truncate">{proj}</span>
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-xs text-zinc-400 italic py-2 text-center">
                        No projects detected from CSV.
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">
                      {selectedConductStudyProjects.length === 0
                        ? "Applies to all projects"
                        : `${selectedConductStudyProjects.length} of ${availableProjects.length} selected`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setConductStudyDropdownOpen(false)}
                      className="px-2.5 py-1 bg-zinc-900 text-white text-[11px] font-semibold rounded-md hover:bg-zinc-800 transition cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email Update Quick Toggle (Clicking toggles integrated customization box below buttons) */}
          {onToggleEmailUpdate && (
            <button
              onClick={() => onToggleEmailUpdate(!branding.enableEmailUpdate)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                branding.enableEmailUpdate
                  ? isLight
                    ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                    : "bg-amber-400 text-stone-950 border-amber-300 font-bold shadow-xs"
                  : isLight
                  ? "bg-blue-50/80 text-blue-900 border-blue-200 hover:bg-blue-100"
                  : "bg-[#0e1c45] text-blue-200 border-blue-800/70 hover:text-white"
              }`}
              title="Toggle Email Update banner (v2, v3) & open customization panel below"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  branding.enableEmailUpdate ? (isLight ? "text-white" : "text-stone-950") : ""
                }`}
              />
              <span>Email Update</span>
              {branding.enableEmailUpdate && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isLight ? "bg-white/25 text-white" : "bg-[#050b1e] text-amber-300"
                  }`}
                >
                  v{formatEmailUpdateVersion(branding.emailUpdateVersion)} •{" "}
                  {branding.emailUpdateType === "schedule" ? "Schedule" : "Doc"}
                </span>
              )}
            </button>
          )}

          {/* Arrange New Project Quick Toggle on Toolbar (Florida & South East only, when Email Update is enabled) */}
          {isFlSeRegion && branding.enableEmailUpdate && onToggleArrangeNewProjects && (
            <div
              className={`flex items-center border rounded-lg p-0.5 shadow-2xs ${
                isLight ? "bg-blue-50/80 border-blue-200" : "bg-[#0e1c45] border-indigo-700/60"
              }`}
            >
              <button
                onClick={() => onToggleArrangeNewProjects(!branding.enableArrangeNewProjects)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  branding.enableArrangeNewProjects
                    ? "bg-indigo-600 text-white font-bold shadow-xs"
                    : isLight
                    ? "text-blue-900 hover:text-blue-700"
                    : "text-indigo-200 hover:text-white"
                }`}
                title="Toggle manual arrangement of Project Number sequence per Day"
              >
                <MoveVertical
                  className={`w-3.5 h-3.5 ${
                    branding.enableArrangeNewProjects
                      ? "text-white"
                      : isLight
                      ? "text-blue-600"
                      : "text-indigo-400"
                  }`}
                />
                <span>Arrange New Project</span>
                {branding.enableArrangeNewProjects && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isLight ? "bg-white/25 text-white" : "bg-[#050b1e] text-indigo-300"
                    }`}
                  >
                    ON
                  </span>
                )}
              </button>
              {onOpenArrangeProjectsModal && (
                <button
                  onClick={onOpenArrangeProjectsModal}
                  className={`px-2 py-1 text-xs rounded-md transition cursor-pointer font-semibold ${
                    isLight
                      ? "text-blue-700 hover:text-blue-950 hover:bg-blue-100"
                      : "text-indigo-300 hover:text-white hover:bg-indigo-900/50"
                  }`}
                  title="Open Project Repositioning Panel"
                >
                  <span>Rearrange</span>
                </button>
              )}
            </div>
          )}

          {/* Hidden file input for direct file attachment in email preview */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            className="hidden"
            onChange={(e) => handleFilesUpload(e.target.files)}
          />
        </div>
        </div>

        {/* Integrated Email Update Banner Customization Box (Appears below the toggle buttons when Email Update is ON) */}
        {branding.enableEmailUpdate && (
          <div
            className={`w-full rounded-xl p-4 sm:p-5 border transition-all animate-in fade-in slide-in-from-top-2 duration-200 space-y-4 ${
              isLight
                ? "bg-white border-blue-200 shadow-sm text-slate-900"
                : "bg-[#081230]/95 border-blue-800/80 shadow-inner text-white"
            }`}
          >
            {/* Top Controls Row: Title, Update Type Selector, and Version Number */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3.5 border-b border-blue-200/40">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                    isLight
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-amber-400/15 text-amber-300 border-amber-400/30"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-xs sm:text-sm font-bold tracking-tight ${
                        isLight ? "text-blue-950" : "text-white"
                      }`}
                    >
                      Email Update Banner Customization
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isLight
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-400/20 text-amber-300 border-amber-400/40"
                      }`}
                    >
                      Active • v{formatEmailUpdateVersion(branding.emailUpdateVersion)}
                    </span>
                  </div>
                  <p className={`text-[11px] ${isLight ? "text-slate-600" : "text-blue-200/70"}`}>
                    Customize the yellow-highlighted update banner and version number inserted into the email
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Update Type Selector */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold whitespace-nowrap ${
                      isLight ? "text-blue-950" : "text-blue-200"
                    }`}
                  >
                    Update Type:
                  </span>
                  <div
                    className={`inline-flex rounded-lg p-0.5 border ${
                      isLight ? "bg-blue-50/80 border-blue-200" : "bg-[#050b1e] border-blue-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onUpdateEmailUpdateConfig?.({ type: "documentary" })}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                        (branding.emailUpdateType || "documentary") === "documentary"
                          ? isLight
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-amber-400 text-stone-950 shadow-xs"
                          : isLight
                          ? "text-blue-900 hover:text-blue-700"
                          : "text-blue-200 hover:text-white"
                      }`}
                    >
                      For Documentary
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateEmailUpdateConfig?.({ type: "schedule" })}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                        branding.emailUpdateType === "schedule"
                          ? isLight
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-amber-400 text-stone-950 shadow-xs"
                          : isLight
                          ? "text-blue-900 hover:text-blue-700"
                          : "text-blue-200 hover:text-white"
                      }`}
                    >
                      Schedule Update
                    </button>
                  </div>
                </div>

                {/* Version Number Input */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold whitespace-nowrap ${
                      isLight ? "text-blue-950" : "text-blue-200"
                    }`}
                  >
                    Version:
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border ${
                        isLight
                          ? "text-blue-900 bg-blue-50 border-blue-200"
                          : "text-amber-300 bg-[#050b1e] border-blue-800"
                      }`}
                    >
                      v.
                    </span>
                    <input
                      type="text"
                      value={branding.emailUpdateVersion ?? "2"}
                      onChange={(e) => onUpdateEmailUpdateConfig?.({ version: e.target.value })}
                      placeholder="2"
                      className={`w-16 px-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-hidden focus:ring-2 ${
                        isLight
                          ? "bg-white border-blue-300 text-blue-950 focus:ring-blue-500"
                          : "bg-[#050b1e] border-blue-700 text-white focus:ring-amber-400"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Large Added Update Notes Input Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className={`text-xs sm:text-sm font-bold flex items-center gap-2 ${
                    isLight ? "text-blue-950" : "text-white"
                  }`}
                >
                  <span>Added Update Notes:</span>
                  <span
                    className={`text-[11px] font-medium ${
                      isLight ? "text-slate-500" : "text-blue-300/70"
                    }`}
                  >
                    (Leave blank for default banner prefix only, or type custom update notes below)
                  </span>
                </label>
                {branding.emailUpdateNotes && branding.emailUpdateNotes.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => onUpdateEmailUpdateConfig?.({ notes: "" })}
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md border transition cursor-pointer ${
                      isLight
                        ? "text-blue-700 hover:text-blue-950 bg-blue-50 hover:bg-blue-100 border-blue-200"
                        : "text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/60 border-blue-800"
                    }`}
                  >
                    Clear Notes
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={branding.emailUpdateNotes ?? ""}
                onChange={(e) => onUpdateEmailUpdateConfig?.({ notes: e.target.value })}
                placeholder="Type your custom update notes here..."
                className={`w-full px-3.5 py-3 rounded-xl text-sm leading-relaxed border transition min-h-[110px] resize-y focus:outline-hidden focus:ring-2 ${
                  isLight
                    ? "bg-blue-50/30 focus:bg-white border-blue-300 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500"
                    : "bg-[#050b1e]/90 focus:bg-[#050b1e] border-blue-800 text-white placeholder:text-blue-300/40 focus:ring-amber-400"
                }`}
              />
            </div>

            {/* Live Banner Preview */}
            <div
              className={`p-3 rounded-xl border space-y-1.5 ${
                isLight
                  ? "bg-blue-50/50 border-blue-200"
                  : "bg-[#050b1e]/80 border-blue-900/70"
              }`}
            >
              <div
                className={`text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${
                  isLight ? "text-blue-900" : "text-blue-300"
                }`}
              >
                <span>LIVE BANNER PREVIEW:</span>
                <span>Subject Suffix: Update v{formatEmailUpdateVersion(branding.emailUpdateVersion)}</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-black bg-[#FFFF00] px-3 py-2 rounded-lg leading-relaxed shadow-2xs wrap-break-word">
                {getEmailUpdateBannerText(branding)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Outlook Desktop Container */}
      <div className="p-4 sm:p-6 bg-zinc-100/60 flex-1 flex flex-col items-center justify-center overflow-x-auto min-h-[500px]">
        {/* Arrange New Project Active Banner */}
        {isFlSeRegion && branding.enableArrangeNewProjects && (
          <div className="w-full max-w-3xl mb-3 px-3.5 py-2.5 bg-indigo-950/80 border border-indigo-700/60 rounded-xl flex items-center justify-between text-xs text-indigo-200 shadow-md">
            <div className="flex items-center space-x-2">
              <MoveVertical className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Arrange New Project Mode:</strong> Project numbers are sequenced per your custom arrangement for Florida & South East.
              </span>
            </div>
            {onOpenArrangeProjectsModal && (
              <button
                type="button"
                onClick={onOpenArrangeProjectsModal}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg shadow-xs transition cursor-pointer shrink-0"
              >
                Rearrange Order
              </button>
            )}
          </div>
        )}

        <div className="w-full max-w-3xl bg-white rounded-xl shadow-md border border-zinc-300 overflow-hidden flex flex-col">
          {/* Outlook Window Titlebar */}
          <div className="bg-[#0078D4] text-white px-4 py-2 flex items-center justify-between text-xs select-none">
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-white" />
              <span className="font-medium">Microsoft Outlook — Message Viewer</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <span className="w-2.5 h-2.5 rounded-full bg-white/40 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/40 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/40 inline-block"></span>
            </div>
          </div>

          {/* Outlook Simplified Ribbon */}
          <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-1.5 flex items-center space-x-4 text-xs text-zinc-600 select-none">
            <span className="font-semibold text-blue-700 border-b-2 border-blue-600 pb-0.5">Message</span>
            <span
              className="hover:text-zinc-900 cursor-pointer flex items-center space-x-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-3 h-3 text-blue-600" />
              <span>Attach File</span>
            </span>
            {onOpenAttachmentModal && (
              <span className="hover:text-zinc-900 cursor-pointer" onClick={onOpenAttachmentModal}>
                Attachment Manager
              </span>
            )}
            <span className="hover:text-zinc-900 cursor-pointer">Options</span>
            <span className="hover:text-zinc-900 cursor-pointer">Format Text</span>
          </div>

          {/* Outlook Headers (From / To / Subject / Attachments Dropzone) */}
          <div className="p-4 bg-white border-b border-zinc-200 space-y-2 text-xs font-sans">
            <div className="flex items-center">
              <span className="w-16 font-semibold text-zinc-400 uppercase text-[10px]">From:</span>
              <span className="font-medium text-zinc-800">
                {branding.dispatcherName} &lt;{branding.replyToEmail}&gt;
              </span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center">
                <span className="w-16 font-semibold text-zinc-400 uppercase text-[10px]">To:</span>
                <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {roster.technicianName} &lt;{roster.technicianEmail}&gt;
                </span>
              </div>
              {(() => {
                const airtableUrl = resolveTechnicianAirtableUrl(roster.technicianName, branding);
                const hasPersonal = hasDirectTechnicianAirtableLink(roster.technicianName, branding);
                return (
                  <a
                    href={airtableUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-medium rounded-md transition cursor-pointer border ${
                      hasPersonal
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
                    }`}
                    title={
                      hasPersonal
                        ? `Open personal Airtable view for ${roster.technicianName} (${airtableUrl})`
                        : `Technician not recognized in roster — using default Airtable (${airtableUrl})`
                    }
                  >
                    <ExternalLink className={`w-3 h-3 ${hasPersonal ? "text-emerald-600" : "text-stone-500"}`} />
                    <span>Airtable: {hasPersonal ? roster.technicianName : "airtable.com (Default)"}</span>
                  </a>
                );
              })()}
            </div>
            <div className="flex items-center">
              <span className="w-16 font-semibold text-zinc-400 uppercase text-[10px]">Date:</span>
              <span className="text-zinc-600">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex items-start">
              <span className="w-16 font-semibold text-zinc-400 uppercase text-[10px] mt-0.5">Subject:</span>
              <span className="font-bold text-zinc-900 text-sm">{subject}</span>
            </div>

            {/* Direct Drag-and-Drop & Attachments Header Row */}
            <div className="pt-2 mt-1 border-t border-zinc-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-zinc-600 font-semibold uppercase text-[10px]">
                  <Paperclip className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Attachments ({techAttachments.length}):</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Browse Files</span>
                  </button>
                  <span className="text-zinc-300">|</span>
                  <button
                    type="button"
                    onClick={handleAddSampleKmz}
                    className="text-amber-700 hover:text-amber-900 font-semibold cursor-pointer"
                  >
                    + Sample KMZ Route
                  </button>
                </div>
              </div>

              {/* Direct Drag & Drop Zone Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-2.5 rounded-lg border-2 border-dashed transition cursor-pointer flex flex-col gap-2 ${
                  isDraggingOver
                    ? "border-blue-500 bg-blue-50/80 text-blue-900"
                    : techAttachments.length > 0
                    ? "border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/70"
                    : "border-zinc-300 bg-zinc-50 hover:bg-blue-50/40 hover:border-blue-300"
                }`}
              >
                {/* Active Files Chips */}
                {techAttachments.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {techAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center space-x-1.5 px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md text-[11px] font-medium text-zinc-800 shadow-2xs transition group"
                      >
                        {getFileIcon(att.name)}
                        <span className="font-semibold truncate max-w-[160px]" title={att.name}>
                          {att.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-normal">
                          ({formatFileSize(att.size)})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(att)}
                          title="Download file"
                          className="text-zinc-400 hover:text-zinc-700 ml-0.5 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        {onUpdateAttachments && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            title="Remove attachment"
                            className="text-zinc-400 hover:text-red-600 ml-0.5 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="text-[10px] text-zinc-400 pl-1 flex items-center space-x-1">
                      <UploadCloud className="w-3 h-3 text-zinc-400" />
                      <span>Drag more files here to attach</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 py-1.5 text-zinc-500 text-xs">
                    <UploadCloud className="w-4 h-4 text-blue-500" />
                    <span>
                      <strong className="text-zinc-800 font-semibold">Drag &amp; drop KMZ, PDF, CSV files here</strong> or click to attach
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Schedule Overlap Filter Notice */}
          {branding.enableScheduleOverlap && overlapInfo.excludedOrders.length > 0 && (
            <div className="mx-4 mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 shadow-xs">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Schedule Overlap Active:</strong> {overlapInfo.excludedOrders.length} job{overlapInfo.excludedOrders.length > 1 ? "s" : ""} outside <strong>{weekInfo.formattedRange}</strong> ({branding.selectedWorkWeek === "incoming" ? "Incoming Work week" : "Current Work week"}) {overlapInfo.excludedOrders.length > 1 ? "are" : "is"} excluded from this email.
                </span>
              </div>
            </div>
          )}

          {/* Email Body Preview (Rendered HTML) */}
          <div className="p-4 bg-[#F8FAFC] overflow-y-auto max-h-[600px]">
            <div
              className="outlook-body-wrapper"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Export Actions Toolbar */}
      <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-zinc-500">
          <span>Ready for <span className="font-semibold text-zinc-900">{roster.technicianName}</span> ({roster.technicianEmail})</span>
          {savedVersionsCount > 0 && (
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
              {savedVersionsCount} Saved Version{savedVersionsCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Outlook (Rich HTML) Button */}
          <button
            onClick={handleCopyHtml}
            className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer ${
              copyStatus === "html"
                ? "bg-emerald-600 text-white ring-2 ring-emerald-500/30"
                : "bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white hover:shadow-md shadow-blue-950/40"
            }`}
            title="Copy formatted rich HTML to paste directly into Outlook (preserves colors, tables, highlights)"
          >
            {copyStatus === "html" ? (
              <Check className="w-3.5 h-3.5 text-emerald-200" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{copyStatus === "html" ? "Copied Outlook HTML!" : "Copy Outlook HTML"}</span>
          </button>

          {/* Copy Plain Text Button */}
          <button
            onClick={handleCopyText}
            className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
              copyStatus === "text"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700 shadow-2xs"
            }`}
            title="Copy plain text format"
          >
            {copyStatus === "text" ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-stone-400" />
            )}
            <span>{copyStatus === "text" ? "Copied Text!" : "Copy Text"}</span>
          </button>

          {/* Save to History Button with Version Tag */}
          {onSaveToHistory && (
            <div className="relative">
              <div className="flex items-center shadow-2xs rounded-xl overflow-hidden border border-amber-300">
                <button
                  onClick={handleSaveToHistoryClick}
                  className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 transition cursor-pointer ${
                    savedFeedback
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-50 hover:bg-amber-100 text-amber-950"
                  }`}
                  title={`Save this generated email to local history (Auto-tagged as ${nextVersionTag})`}
                >
                  {savedFeedback ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-white" />
                      <span>Saved as {savedFeedback}!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5 text-amber-700" />
                      <span>Save ({nextVersionTag})</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="px-2 py-2 bg-amber-100/80 hover:bg-amber-200 text-amber-900 border-l border-amber-300 text-xs cursor-pointer transition"
                  title="Customize version tag before saving"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Custom Tag Input Popover */}
              {showTagInput && (
                <div className="absolute right-0 bottom-full mb-2 w-64 bg-white border border-zinc-200 rounded-xl p-3 shadow-xl z-50 space-y-2 animate-in fade-in zoom-in-95">
                  <div className="text-[11px] font-bold text-zinc-900 flex items-center justify-between">
                    <span>Customize Version Tag:</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Default: {nextVersionTag}</span>
                  </div>
                  <input
                    type="text"
                    value={saveCustomTag}
                    onChange={(e) => setSaveCustomTag(e.target.value)}
                    placeholder={`e.g. ${nextVersionTag} - Added site`}
                    className="w-full px-2.5 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowTagInput(false)}
                      className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveToHistoryClick}
                      className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-md"
                    >
                      Save to History
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Download .EML file */}
          <button
            onClick={handleDownloadEml}
            className="flex items-center space-x-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>.EML File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
