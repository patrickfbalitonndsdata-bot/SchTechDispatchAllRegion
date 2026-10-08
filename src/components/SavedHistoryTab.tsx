import React, { useState, useMemo } from "react";
import {
  History,
  Trash2,
  Copy,
  Check,
  Download,
  Eye,
  Edit2,
  Calendar,
  User,
  Search,
  ChevronDown,
  Filter,
  FileText,
  Mail,
  ExternalLink,
  Tag,
  Paperclip,
  Clock,
  Sparkles,
  MapPin,
  Table,
  FileArchive,
  File,
  Layers,
  CalendarDays,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import { SavedEmailRecord, EmailAttachment } from "../types";
import { copyRichHtmlToClipboard, formatFileSize } from "../utils/outlookTemplateGenerator";
import { getAllAttachmentsFromDb } from "../utils/storageDb";

interface SavedHistoryTabProps {
  savedEmails: SavedEmailRecord[];
  onUpdateTag: (id: string, newTag: string) => void;
  onDeleteEmail: (id: string) => void;
  onClearAll: () => void;
  onSwitchToGenerator?: () => void;
  themeMode?: "dark" | "light";
}

export const SavedHistoryTab: React.FC<SavedHistoryTabProps> = ({
  savedEmails,
  onUpdateTag,
  onDeleteEmail,
  onClearAll,
  onSwitchToGenerator,
  themeMode = "dark",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("all");
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(() => {
    return savedEmails.length > 0 ? savedEmails[0].id : null;
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tempTagValue, setTempTagValue] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const isLight = themeMode === "light";

  // Extract unique technician names
  const uniqueTechnicians = useMemo(() => {
    const set = new Set<string>();
    savedEmails.forEach((e) => {
      if (e.technicianName) set.add(e.technicianName);
    });
    return Array.from(set).sort();
  }, [savedEmails]);

  // Extract unique work week keys/formatted
  const uniqueWeeks = useMemo(() => {
    const map = new Map<string, string>();
    savedEmails.forEach((e) => {
      if (e.workWeekKey) {
        map.set(e.workWeekKey, e.workWeekFormatted || e.workWeekKey);
      }
    });
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [savedEmails]);

  // Filtered saved emails list
  const filteredEmails = useMemo(() => {
    return savedEmails.filter((record) => {
      const matchesTech =
        selectedTech === "all" ||
        record.technicianName.toLowerCase() === selectedTech.toLowerCase();

      const matchesWeek =
        selectedWeek === "all" || record.workWeekKey === selectedWeek;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        record.technicianName.toLowerCase().includes(q) ||
        record.technicianEmail.toLowerCase().includes(q) ||
        record.subject.toLowerCase().includes(q) ||
        record.versionTag.toLowerCase().includes(q) ||
        record.workWeekFormatted.toLowerCase().includes(q);

      return matchesTech && matchesWeek && matchesSearch;
    });
  }, [savedEmails, selectedTech, selectedWeek, searchQuery]);

  const activeEmail = useMemo(() => {
    if (selectedEmailId) {
      const found = filteredEmails.find((e) => e.id === selectedEmailId);
      if (found) return found;
    }
    return filteredEmails.length > 0 ? filteredEmails[0] : null;
  }, [filteredEmails, selectedEmailId]);

  const handleCopyEmail = async (record: SavedEmailRecord) => {
    const success = await copyRichHtmlToClipboard(record.htmlBody, record.plainText);
    if (success) {
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleDownloadEml = (record: SavedEmailRecord) => {
    const boundary = "----=_Part_" + Math.random().toString(36).substring(2);
    const emlContent = [
      `From: Sch Tech Dispatch System <dispatch@ndsdata.com>`,
      `To: ${record.technicianName} <${record.technicianEmail}>`,
      `Subject: ${record.subject}`,
      `Date: ${new Date(record.createdAt).toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      `X-Version-Tag: ${record.versionTag}`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      record.plainText,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      record.htmlBody,
      ``,
      `--${boundary}--`,
    ].join("\r\n");

    const blob = new Blob([emlContent], { type: "message/rfc822" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTag = record.versionTag.replace(/[^a-zA-Z0-9_-]/g, "_");
    link.download = `${record.technicianName.replace(/\s+/g, "_")}_${safeTag}_schedule.eml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAttachment = async (att: EmailAttachment) => {
    try {
      let base64 = att.dataBase64;
      let dataUrl = att.dataUrl;

      // If base64 is stripped from localStorage cache, recover from IndexedDB
      if (!base64 && !dataUrl) {
        try {
          const dbAtts = await getAllAttachmentsFromDb();
          const found = dbAtts.find((a) => a.id === att.id || a.name === att.name);
          if (found) {
            base64 = found.dataBase64;
            dataUrl = found.dataUrl;
          }
        } catch (dbErr) {
          console.warn("Could not retrieve attachment from DB:", dbErr);
        }
      }

      const href = dataUrl || (base64 ? `data:${att.type || "application/octet-stream"};base64,${base64}` : null);
      if (!href) {
        console.warn("Attachment content is not available.");
        return;
      }

      const link = document.createElement("a");
      link.href = href;
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

  const handleStartEditTag = (record: SavedEmailRecord) => {
    setEditingTagId(record.id);
    setTempTagValue(record.versionTag);
  };

  const handleSaveTag = (id: string) => {
    if (tempTagValue.trim()) {
      onUpdateTag(id, tempTagValue.trim());
    }
    setEditingTagId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div
        className={`rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md transition-colors ${
          isLight
            ? "bg-white border border-blue-200 shadow-blue-900/5 text-slate-900"
            : "bg-gradient-to-br from-[#0c183d]/95 to-[#07102b]/95 border border-blue-900/50 shadow-blue-950/30 text-white"
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs ${
              isLight ? "bg-blue-600 text-white" : "bg-amber-400 text-stone-950"
            }`}
          >
            <History className={`w-5 h-5 ${isLight ? "text-white" : "text-stone-950"}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-blue-950" : "text-white"}`}>
                Saved Email History
              </h2>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isLight
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-amber-400/20 text-amber-300 border-amber-400/40"
                }`}
              >
                {savedEmails.length} Email{savedEmails.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-blue-200/70"}`}>
              Persisted technician dispatches categorized by Work Week schedule with automatic versioning.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {savedEmails.length > 0 && (
            <>
              {showClearConfirm ? (
                <div
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs border ${
                    isLight
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-red-950/80 border-red-700/60 text-red-200"
                  }`}
                >
                  <span className="font-semibold">Delete all history?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setShowClearConfirm(false);
                    }}
                    className="px-2 py-0.5 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition cursor-pointer"
                  >
                    Yes, Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className={`px-2 py-0.5 rounded transition cursor-pointer ${
                      isLight
                        ? "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                        : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition cursor-pointer ${
                    isLight
                      ? "text-red-600 hover:text-red-700 bg-red-50/70 hover:bg-red-100 border-red-200"
                      : "text-red-400 hover:text-red-300 hover:bg-red-950/40 border-transparent hover:border-red-800/60"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All History</span>
                </button>
              )}
            </>
          )}

          {onSwitchToGenerator && (
            <button
              type="button"
              onClick={onSwitchToGenerator}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Back to Schedule Generator</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`rounded-xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur-md transition-colors ${
          isLight
            ? "bg-white border border-blue-200 shadow-blue-900/5 text-slate-900"
            : "bg-gradient-to-br from-[#0c183d]/95 to-[#07102b]/95 border border-blue-900/50 shadow-blue-950/30 text-white"
        }`}
      >
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isLight ? "text-blue-600" : "text-blue-400"
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search technician, subject, version..."
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                isLight
                  ? "bg-blue-50/50 border-blue-200 text-slate-900 placeholder-slate-400"
                  : "bg-[#08122d] border-blue-800/60 text-slate-100 placeholder-blue-300/40"
              }`}
            />
          </div>

          {/* Technician Filter */}
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className={`w-full sm:w-48 px-2.5 py-1.5 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer ${
              isLight
                ? "bg-blue-50/50 border-blue-200 text-blue-950"
                : "bg-[#08122d] border-blue-800/60 text-slate-100"
            }`}
          >
            <option value="all" className={isLight ? "bg-white text-slate-900" : "bg-[#08122d] text-white"}>
              All Technicians ({uniqueTechnicians.length})
            </option>
            {uniqueTechnicians.map((tech) => (
              <option key={tech} value={tech} className={isLight ? "bg-white text-slate-900" : "bg-[#08122d] text-white"}>
                {tech}
              </option>
            ))}
          </select>

          {/* Work Week Filter */}
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className={`w-full sm:w-56 px-2.5 py-1.5 text-xs border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer ${
              isLight
                ? "bg-blue-50/50 border-blue-200 text-blue-950"
                : "bg-[#08122d] border-blue-800/60 text-slate-100"
            }`}
          >
            <option value="all" className={isLight ? "bg-white text-slate-900" : "bg-[#08122d] text-white"}>
              All Work Weeks ({uniqueWeeks.length})
            </option>
            {uniqueWeeks.map(({ key, label }) => (
              <option key={key} value={key} className={isLight ? "bg-white text-slate-900" : "bg-[#08122d] text-white"}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-blue-200/70"}`}>
          Showing{" "}
          <span className={`font-bold ${isLight ? "text-blue-700" : "text-white"}`}>
            {filteredEmails.length}
          </span>{" "}
          of {savedEmails.length} records
        </div>
      </div>

      {/* Main Split Layout: Left List + Right Outlook Simulator */}
      {savedEmails.length === 0 ? (
        <div
          className={`rounded-xl p-12 text-center space-y-3 shadow-lg backdrop-blur-md transition-colors ${
            isLight
              ? "bg-white border border-blue-200 shadow-blue-900/5 text-slate-900"
              : "bg-gradient-to-br from-[#0c183d]/95 to-[#07102b]/95 border border-blue-900/50 shadow-blue-950/30 text-white"
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border shadow-inner ${
              isLight
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-amber-400/10 text-amber-400 border-amber-400/30"
            }`}
          >
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className={`text-base font-bold ${isLight ? "text-blue-950" : "text-white"}`}>
            No Saved Email History Yet
          </h3>
          <p className={`text-xs max-w-md mx-auto font-medium ${isLight ? "text-slate-600" : "text-blue-200/80"}`}>
            When you generate email schedules for your technicians, click{" "}
            <strong className={isLight ? "text-blue-900" : "text-white"}>"Save (Initial)"</strong> or{" "}
            <strong className={isLight ? "text-blue-900" : "text-white"}>"Save All to History"</strong> in the generator to save a snapshot.
          </p>
          {onSwitchToGenerator && (
            <button
              type="button"
              onClick={onSwitchToGenerator}
              className="mt-2 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Go to Schedule Generator</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Email Records List */}
          <div
            className={`lg:col-span-4 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[750px] backdrop-blur-md transition-colors ${
              isLight
                ? "bg-white border border-blue-200 shadow-blue-900/5"
                : "bg-gradient-to-br from-[#0c183d]/95 to-[#07102b]/95 border border-blue-900/50 shadow-blue-950/30"
            }`}
          >
            <div
              className={`p-3 border-b flex items-center justify-between text-xs font-bold ${
                isLight
                  ? "bg-blue-50/80 border-blue-100 text-blue-950"
                  : "bg-[#0a1538] border-blue-900/50 text-blue-200"
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Layers className={`w-3.5 h-3.5 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
                <span>Saved Dispatches</span>
              </span>
              <span className={`text-[11px] font-medium ${isLight ? "text-blue-700" : "text-blue-300/60"}`}>
                {filteredEmails.length} matching
              </span>
            </div>

            <div
              className={`overflow-y-auto divide-y flex-1 p-2 space-y-1 ${
                isLight ? "divide-blue-100" : "divide-blue-900/30"
              }`}
            >
              {filteredEmails.length === 0 ? (
                <div className={`p-6 text-center text-xs italic ${isLight ? "text-slate-500" : "text-blue-300/50"}`}>
                  No records match your filter criteria.
                </div>
              ) : (
                filteredEmails.map((record) => {
                  const isSelected = activeEmail?.id === record.id;
                  const isEditingThisTag = editingTagId === record.id;
                  const attsCount = record.attachments?.length || record.attachmentsSummary?.length || 0;

                  return (
                    <div
                      key={record.id}
                      onClick={() => setSelectedEmailId(record.id)}
                      className={`p-3 rounded-lg border transition cursor-pointer flex flex-col gap-2 ${
                        isSelected
                          ? isLight
                            ? "bg-blue-50 border-blue-500 ring-1 ring-blue-400/40 shadow-sm text-slate-900"
                            : "bg-[#13255c] border-amber-400/70 ring-1 ring-amber-400/30 shadow-md text-white"
                          : isLight
                          ? "bg-white border-blue-100 hover:bg-blue-50/50 hover:border-blue-300 text-slate-800"
                          : "bg-[#091330]/70 border-blue-900/40 hover:bg-[#0e1c45] hover:border-blue-700/60 text-slate-200"
                      }`}
                    >
                      {/* Top Row: Tech Name + Version Tag */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div
                            className={`flex items-center space-x-1.5 font-bold text-xs ${
                              isLight ? "text-blue-950" : "text-white"
                            }`}
                          >
                            <span>{record.technicianName}</span>
                          </div>
                          <div
                            className={`text-[11px] truncate max-w-[180px] font-medium ${
                              isLight ? "text-slate-600" : "text-blue-300/70"
                            }`}
                          >
                            {record.technicianEmail}
                          </div>
                        </div>

                        {/* Tag Badge / Inline Edit */}
                        {isEditingThisTag ? (
                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={tempTagValue}
                              onChange={(e) => setTempTagValue(e.target.value)}
                              className={`w-20 px-1.5 py-0.5 text-[11px] font-bold border rounded ${
                                isLight
                                  ? "border-blue-500 bg-white text-slate-900"
                                  : "border-amber-400 bg-[#08122d] text-white"
                              }`}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveTag(record.id)}
                              className={`p-1 rounded ${
                                isLight
                                  ? "text-emerald-600 hover:bg-emerald-50"
                                  : "text-emerald-400 hover:bg-emerald-950/50"
                              }`}
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                record.isInitialVersion
                                  ? isLight
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : "bg-blue-950 text-blue-300 border-blue-700/60"
                                  : isLight
                                  ? "bg-amber-50 text-amber-800 border-amber-300"
                                  : "bg-amber-950/80 text-amber-300 border-amber-500/50"
                              }`}
                            >
                              {record.versionTag}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditTag(record);
                              }}
                              className={`p-1 rounded ${
                                isLight
                                  ? "text-slate-500 hover:text-blue-700"
                                  : "text-blue-300/60 hover:text-white"
                              }`}
                              title="Edit version tag"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Work Week & Job info */}
                      <div
                        className={`flex items-center justify-between text-[11px] pt-1 border-t ${
                          isLight
                            ? "text-slate-600 border-blue-100"
                            : "text-blue-200/70 border-blue-900/30"
                        }`}
                      >
                        <span className="flex items-center space-x-1 font-medium">
                          <CalendarDays className={`w-3 h-3 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
                          <span>{record.workWeekFormatted}</span>
                        </span>
                        <span
                          className={`font-semibold border px-1.5 py-0.2 rounded text-[10px] ${
                            isLight
                              ? "text-blue-800 bg-blue-50 border-blue-200"
                              : "text-blue-200 bg-blue-950/80 border-blue-800/60"
                          }`}
                        >
                          {record.jobCount} Job{record.jobCount !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Attachments & Date info */}
                      <div
                        className={`flex items-center justify-between text-[10px] font-medium ${
                          isLight ? "text-slate-500" : "text-blue-300/50"
                        }`}
                      >
                        <span>
                          {new Date(record.createdAt).toLocaleDateString()}{" "}
                          {new Date(record.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {attsCount > 0 && (
                          <span className={`flex items-center space-x-1 font-semibold ${isLight ? "text-blue-600" : "text-blue-400"}`}>
                            <Paperclip className="w-3 h-3" />
                            <span>
                              {attsCount} file{attsCount !== 1 ? "s" : ""}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Outlook Simulator for Active Saved Record */}
          <div className="lg:col-span-8 space-y-4">
            {activeEmail ? (
              <div
                className={`rounded-xl shadow-lg overflow-hidden flex flex-col backdrop-blur-md transition-colors ${
                  isLight
                    ? "bg-white border border-blue-200 shadow-blue-900/5"
                    : "bg-gradient-to-br from-[#0c183d]/95 to-[#07102b]/95 border border-blue-900/50 shadow-blue-950/30"
                }`}
              >
                {/* Header Action Bar */}
                <div
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
                    isLight
                      ? "bg-blue-50/80 border-blue-200 text-slate-900"
                      : "bg-gradient-to-r from-[#0c183d] via-[#0a1538] to-[#07102b] text-white border-blue-900/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                        isLight
                          ? "bg-white text-blue-600 border-blue-200 shadow-2xs"
                          : "bg-[#0e1c45] text-blue-300 border-blue-700/60"
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-sm font-bold tracking-tight ${isLight ? "text-blue-950" : "text-white"}`}>
                          {activeEmail.technicianName}
                        </h3>
                        <span
                          className={`font-bold text-[10px] px-2 py-0.2 rounded-full ${
                            isLight ? "bg-blue-600 text-white" : "bg-amber-400 text-zinc-950"
                          }`}
                        >
                          {activeEmail.versionTag}
                        </span>
                      </div>
                      <p className={`text-xs font-medium ${isLight ? "text-slate-600" : "text-blue-200/70"}`}>
                        Work Week: {activeEmail.workWeekFormatted} &bull; Saved {new Date(activeEmail.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this saved record */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyEmail(activeEmail)}
                      className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer ${
                        copiedId === activeEmail.id
                          ? "bg-emerald-600 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {copiedId === activeEmail.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === activeEmail.id ? "Copied!" : "Copy for Outlook"}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadEml(activeEmail)}
                      className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition border cursor-pointer ${
                        isLight
                          ? "bg-white hover:bg-blue-50 text-blue-800 border-blue-200 hover:border-blue-400"
                          : "bg-[#0e1c45] hover:bg-[#15275e] text-blue-200 hover:text-white border-blue-800/60"
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.EML</span>
                    </button>

                    <button
                      onClick={() => onDeleteEmail(activeEmail.id)}
                      className={`p-1.5 transition rounded-lg cursor-pointer ${
                        isLight
                          ? "text-slate-500 hover:text-red-600 hover:bg-red-50"
                          : "text-blue-300/60 hover:text-red-400 hover:bg-blue-900/40"
                      }`}
                      title="Delete this saved record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Outlook Desktop Simulator Content Container */}
                <div
                  className={`p-4 sm:p-6 flex-1 flex flex-col items-center justify-center overflow-x-auto border-t ${
                    isLight
                      ? "bg-blue-50/40 border-blue-100"
                      : "bg-[#050b1e] border-blue-900/40"
                  }`}
                >
                  <div
                    className={`w-full max-w-3xl rounded-xl shadow-2xl border overflow-hidden flex flex-col ${
                      isLight
                        ? "bg-white border-blue-200 shadow-blue-900/10"
                        : "bg-[#091330] border-blue-800/60"
                    }`}
                  >
                    {/* Outlook Window Titlebar */}
                    <div className="bg-[#0078D4] text-white px-4 py-2 flex items-center justify-between text-xs select-none shadow-xs">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5 text-white" />
                        <span className="font-medium">Microsoft Outlook — Saved History Record</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono text-white">
                          {activeEmail.versionTag}
                        </span>
                      </div>
                    </div>

                    {/* Headers */}
                    <div
                      className={`p-4 border-b space-y-2 text-xs font-sans ${
                        isLight
                          ? "bg-blue-50/50 border-blue-100 text-slate-800"
                          : "bg-[#0a1538] border-blue-900/60 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          className={`w-16 font-bold uppercase text-[10px] ${
                            isLight ? "text-slate-500" : "text-blue-300/70"
                          }`}
                        >
                          To:
                        </span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded border ${
                            isLight
                              ? "text-blue-900 bg-white border-blue-200"
                              : "text-blue-300 bg-blue-950/80 border-blue-700/60"
                          }`}
                        >
                          {activeEmail.technicianName} &lt;{activeEmail.technicianEmail}&gt;
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`w-16 font-bold uppercase text-[10px] ${
                            isLight ? "text-slate-500" : "text-blue-300/70"
                          }`}
                        >
                          Saved Date:
                        </span>
                        <span className={`font-medium ${isLight ? "text-slate-700" : "text-blue-200/80"}`}>
                          {new Date(activeEmail.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span
                          className={`w-16 font-bold uppercase text-[10px] mt-0.5 ${
                            isLight ? "text-slate-500" : "text-blue-300/70"
                          }`}
                        >
                          Subject:
                        </span>
                        <span className={`font-bold text-sm ${isLight ? "text-blue-950" : "text-white"}`}>
                          {activeEmail.subject}
                        </span>
                      </div>

                      {/* Attachments Section in Saved View */}
                      {activeEmail.attachments && activeEmail.attachments.length > 0 && (
                        <div
                          className={`pt-2 mt-1 border-t flex flex-col sm:flex-row sm:items-start gap-2 ${
                            isLight ? "border-blue-100" : "border-blue-900/40"
                          }`}
                        >
                          <div
                            className={`flex items-center space-x-1.5 w-24 shrink-0 font-bold uppercase text-[10px] pt-1 ${
                              isLight ? "text-slate-600" : "text-blue-300/70"
                            }`}
                          >
                            <Paperclip className={`w-3.5 h-3.5 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
                            <span>Saved Files ({activeEmail.attachments.length}):</span>
                          </div>
                          <div className="flex-1 flex flex-wrap items-center gap-1.5">
                            {activeEmail.attachments.map((att) => (
                              <div
                                key={att.id}
                                className={`flex items-center space-x-1.5 px-2.5 py-1 border rounded-md text-[11px] font-medium transition ${
                                  isLight
                                    ? "bg-white hover:bg-blue-50 border-blue-200 text-blue-900"
                                    : "bg-[#0e1c45] hover:bg-[#15275e] border-blue-800/60 text-blue-200"
                                }`}
                              >
                                {getFileIcon(att.name)}
                                <span
                                  className={`font-semibold truncate max-w-[140px] ${
                                    isLight ? "text-blue-950" : "text-white"
                                  }`}
                                  title={att.name}
                                >
                                  {att.name}
                                </span>
                                <span className={`text-[10px] font-normal ${isLight ? "text-slate-500" : "text-blue-300/60"}`}>
                                  ({formatFileSize(att.size)})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadAttachment(att)}
                                  title="Download saved attachment"
                                  className={`ml-0.5 cursor-pointer ${
                                    isLight ? "text-blue-600 hover:text-blue-800" : "text-blue-300/70 hover:text-white"
                                  }`}
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email HTML Body */}
                    <div
                      className={`p-4 sm:p-5 overflow-y-auto max-h-[550px] ${
                        isLight ? "bg-slate-50" : "bg-[#050b1e]"
                      }`}
                    >
                      <div
                        className={`outlook-body-wrapper bg-white text-zinc-900 rounded-lg p-3 sm:p-4 shadow-md max-w-2xl mx-auto border ${
                          isLight ? "border-blue-200" : "border-blue-950/40"
                        }`}
                        dangerouslySetInnerHTML={{ __html: activeEmail.htmlBody }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`rounded-xl p-12 text-center text-xs italic shadow-lg backdrop-blur-md ${
                  isLight
                    ? "bg-white border border-blue-200 text-slate-500 shadow-blue-900/5"
                    : "bg-gradient-to-br from-[#0c183d]/95 to-[#07102b]/95 border border-blue-900/50 text-blue-300/60 shadow-blue-950/30"
                }`}
              >
                Select a saved email record on the left to preview.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
