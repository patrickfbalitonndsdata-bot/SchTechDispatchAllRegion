import React, { useState, useMemo } from "react";
import {
  X,
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
  ArrowRight,
  Monitor,
} from "lucide-react";
import { SavedEmailRecord } from "../types";
import { copyRichHtmlToClipboard } from "../utils/outlookTemplateGenerator";

interface SavedEmailHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedEmails: SavedEmailRecord[];
  onUpdateTag: (id: string, newTag: string) => void;
  onDeleteEmail: (id: string) => void;
  onClearAll: () => void;
}

export const SavedEmailHistoryModal: React.FC<SavedEmailHistoryModalProps> = ({
  isOpen,
  onClose,
  savedEmails,
  onUpdateTag,
  onDeleteEmail,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("all");
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [previewEmail, setPreviewEmail] = useState<SavedEmailRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tempTagValue, setTempTagValue] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

  if (!isOpen) return null;

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
      `Content-Type: text/plain; charset="utf-8"`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      record.plainText,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset="utf-8"`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      record.htmlBody,
      ``,
      `--${boundary}--`,
    ].join("\r\n");

    const blob = new Blob([emlContent], { type: "message/rfc822;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = `${record.technicianName.replace(/[^a-zA-Z0-9]/g, "_")}_${record.versionTag.replace(/[^a-zA-Z0-9]/g, "_")}_Schedule.eml`;
    link.href = url;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const startEditingTag = (record: SavedEmailRecord) => {
    setEditingTagId(record.id);
    setTempTagValue(record.versionTag);
  };

  const saveEditedTag = (id: string) => {
    if (tempTagValue.trim()) {
      onUpdateTag(id, tempTagValue.trim());
    }
    setEditingTagId(null);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedEmails, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Sch_Tech_Dispatch_Saved_Emails_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#040a1c]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#0c183d] via-[#091433] to-[#07102b] rounded-2xl max-w-5xl w-full border border-blue-900/60 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-blue-900/50 flex items-center justify-between bg-[#0a1538]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-xs">
              <History className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Saved Email History</h2>
                <span className="text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                  {savedEmails.length} Total Saved
                </span>
              </div>
              <p className="text-xs text-blue-200/70">
                Auto-versioned per technician work week (Initial, v.2, v.3...) stored locally in browser
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {savedEmails.length > 0 && (
              <button
                onClick={handleExportJson}
                className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-medium bg-[#0e1c45] hover:bg-[#15275e] text-blue-200 hover:text-white px-3 py-1.5 rounded-lg border border-blue-800/60 transition cursor-pointer"
                title="Backup all saved email records to JSON"
              >
                <Download className="w-3.5 h-3.5 text-blue-300" />
                <span>Export JSON</span>
              </button>
            )}

            {savedEmails.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center space-x-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 px-3 py-1.5 rounded-lg border border-red-800/50 transition cursor-pointer"
                title="Clear all saved history records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-blue-300/70 hover:text-white hover:bg-blue-900/40 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clear All Confirmation Dialog Overlay */}
        {showClearConfirm && (
          <div className="p-4 bg-red-950/90 border-b border-red-800/60 flex items-center justify-between animate-in fade-in">
            <div className="text-xs text-red-200">
              <span className="font-bold">Are you sure?</span> This will delete all {savedEmails.length} saved email version records from local storage.
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 bg-[#091330] text-slate-200 text-xs font-medium rounded-md border border-blue-800/60 hover:bg-[#0e1c45]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                  setPreviewEmail(null);
                }}
                className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="p-4 bg-[#08122d] border-b border-blue-900/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-blue-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search technician, subject, version..."
              className="w-full pl-8.5 pr-3 py-1.75 bg-[#050b1e] border border-blue-800/60 rounded-lg text-xs text-slate-100 placeholder:text-blue-300/40 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Technician Filter */}
          <div className="relative">
            <User className="w-3.5 h-3.5 absolute left-3 top-3 text-blue-400 pointer-events-none" />
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full pl-8.5 pr-8 py-1.75 bg-[#050b1e] border border-blue-800/60 rounded-lg text-xs text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-[#08122d] text-white">All Technicians ({uniqueTechnicians.length})</option>
              {uniqueTechnicians.map((tech) => (
                <option key={tech} value={tech} className="bg-[#08122d] text-white">
                  {tech}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 text-blue-400 pointer-events-none" />
          </div>

          {/* Work Week Filter */}
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-blue-400 pointer-events-none" />
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full pl-8.5 pr-8 py-1.75 bg-[#050b1e] border border-blue-800/60 rounded-lg text-xs text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="all" className="bg-[#08122d] text-white">All Work Weeks ({uniqueWeeks.length})</option>
              {uniqueWeeks.map((week) => (
                <option key={week.key} value={week.key} className="bg-[#08122d] text-white">
                  {week.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 text-blue-400 pointer-events-none" />
          </div>
        </div>

        {/* Content Area: Main List & Side-by-Side Preview (if selected) */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Email Records List */}
          <div className={`overflow-y-auto p-4 space-y-3 flex-1 ${previewEmail ? "md:max-w-md md:border-r md:border-blue-900/50" : "w-full"}`}>
            {filteredEmails.length === 0 ? (
              <div className="p-12 text-center text-blue-300/50 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-950/60 border border-blue-800/50 flex items-center justify-center mx-auto text-blue-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">No Saved Emails Found</h4>
                  <p className="text-xs text-blue-300/60 mt-1 max-w-sm mx-auto">
                    {savedEmails.length === 0
                      ? "When you click 'Save to History' on an email preview, it will be automatically cataloged here with work-week version tags (Initial, v.2, etc.)."
                      : "No saved emails matched your active search and filter criteria."}
                  </p>
                </div>
              </div>
            ) : (
              filteredEmails.map((record) => {
                const isSelected = previewEmail?.id === record.id;
                const isEditing = editingTagId === record.id;

                return (
                  <div
                    key={record.id}
                    className={`border rounded-xl p-3.5 transition-all shadow-sm space-y-2.5 ${
                      isSelected
                        ? "bg-[#13255c] border-amber-400 ring-1 ring-amber-400/30 text-white"
                        : "bg-[#091330]/70 border-blue-900/40 hover:bg-[#0e1c45] hover:border-blue-700/60 text-slate-200"
                    }`}
                  >
                    {/* Top Row: Tech Name + Version Tag Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{record.technicianName}</span>
                          <span className="text-[11px] text-blue-300/70 truncate max-w-[150px]">
                            {record.technicianEmail}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px] text-blue-200/70 mt-0.5">
                          <span className="flex items-center gap-1 text-blue-200 font-medium">
                            <Calendar className="w-3 h-3 text-blue-400" />
                            {record.workWeekFormatted}
                          </span>
                          <span>&bull;</span>
                          <span className="text-blue-300/50">
                            {new Date(record.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            {new Date(record.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Version Tag (Editable) */}
                      <div className="shrink-0 flex items-center space-x-1">
                        {isEditing ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              value={tempTagValue}
                              onChange={(e) => setTempTagValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditedTag(record.id);
                                if (e.key === "Escape") setEditingTagId(null);
                              }}
                              autoFocus
                              className="px-2 py-0.5 text-xs font-bold border border-amber-400 rounded bg-[#050b1e] text-white w-24 focus:outline-hidden"
                            />
                            <button
                              onClick={() => saveEditedTag(record.id)}
                              className="p-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded text-[10px]"
                              title="Save Tag"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingTagId(null)}
                              className="p-1 text-zinc-400 hover:text-white rounded text-[10px]"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="group relative flex items-center space-x-1">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                                record.isInitialVersion || record.versionTag.toLowerCase() === "initial"
                                  ? "bg-blue-950 text-blue-300 border-blue-700/60"
                                  : "bg-amber-950/80 text-amber-300 border-amber-500/50"
                              }`}
                              onClick={() => startEditingTag(record)}
                              title="Click to edit version tag"
                            >
                              {record.versionTag}
                            </span>
                            <button
                              onClick={() => startEditingTag(record)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-blue-300/70 hover:text-white transition"
                              title="Edit tag label"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subject Line */}
                    <div className="text-xs text-blue-100 bg-[#050b1e] px-2.5 py-1.5 rounded-md border border-blue-900/40 font-medium line-clamp-2">
                      <span className="text-[10px] uppercase font-bold text-blue-300/60 block">Subject</span>
                      {record.subject}
                    </div>

                    {/* Meta Badges Row */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-blue-200/80">
                      <span className="bg-[#0c183d] border border-blue-800/50 px-2 py-0.5 rounded font-medium">
                        {record.jobCount} Jobs
                      </span>
                      {record.customIdEnabled && (
                        <span className="bg-blue-950 text-blue-300 border border-blue-700/60 px-1.5 py-0.5 rounded font-medium">
                          Custom ID
                        </span>
                      )}
                      {record.emailUpdateEnabled && (
                        <span className="bg-amber-950/70 text-amber-300 border border-amber-600/50 px-1.5 py-0.5 rounded font-bold">
                          Update v{record.emailUpdateVersion || "2"}
                        </span>
                      )}
                      {(record.attachmentsSummary || []).length > 0 && (
                        <span className="bg-[#0c183d] border border-blue-800/50 px-1.5 py-0.5 rounded flex items-center gap-0.5 text-blue-200">
                          <Paperclip className="w-2.5 h-2.5 text-blue-400" />
                          {record.attachmentsSummary?.length} Attachments
                        </span>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-1.5 border-t border-blue-900/30 flex items-center justify-between gap-1">
                      <button
                        onClick={() => setPreviewEmail(isSelected ? null : record)}
                        className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-md transition cursor-pointer ${
                          isSelected
                            ? "bg-amber-400 text-stone-950 font-bold"
                            : "bg-[#0e1c45] hover:bg-[#15275e] text-blue-200 hover:text-white border border-blue-800/60"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isSelected ? "Close Preview" : "View Email"}</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleCopyEmail(record)}
                          className="p-1.5 text-blue-300/70 hover:text-white hover:bg-blue-900/40 rounded-md transition cursor-pointer"
                          title="Copy Styled HTML for Outlook"
                        >
                          {copiedId === record.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDownloadEml(record)}
                          className="p-1.5 text-blue-300/70 hover:text-white hover:bg-blue-900/40 rounded-md transition cursor-pointer"
                          title="Download Outlook .EML File"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteEmail(record.id)}
                          className="p-1.5 text-blue-300/50 hover:text-red-400 hover:bg-red-950/40 rounded-md transition cursor-pointer"
                          title="Delete Version from History"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Email Detailed Preview Panel */}
          {previewEmail && (
            <div className="flex-1 bg-[#050b1e] p-4 flex flex-col overflow-hidden border-t md:border-t-0 md:border-l border-blue-900/50">
              {/* Preview Header & View Mode Switcher */}
              <div className="bg-[#08122d] border border-blue-900/50 rounded-xl p-3 shadow-xs mb-3 flex flex-wrap items-center justify-between gap-2 text-white">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">
                      {previewEmail.technicianName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                      {previewEmail.versionTag}
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-200/70">{previewEmail.workWeekFormatted}</span>
                </div>
              </div>

              {/* Viewer Area - Desktop Outlook View */}
              <div className="flex-1 bg-[#08122d] rounded-xl border border-blue-800/60 shadow-inner overflow-y-auto p-4 flex justify-center">
                <div className="w-full max-w-2xl">
                  <div className="border-b border-blue-900/50 pb-3 mb-4 space-y-1 text-xs font-sans text-slate-200">
                    <div>
                      <span className="font-semibold text-blue-300/70 w-16 inline-block uppercase text-[10px]">To:</span>
                      <span className="text-blue-300 font-medium bg-blue-950/80 px-2 py-0.5 rounded border border-blue-700/60">
                        {previewEmail.technicianName} &lt;{previewEmail.technicianEmail}&gt;
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300/70 w-16 inline-block uppercase text-[10px]">Subject:</span>
                      <span className="font-bold text-white">{previewEmail.subject}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300/70 w-16 inline-block uppercase text-[10px]">Saved:</span>
                      <span className="text-blue-200/70">{new Date(previewEmail.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div
                    className="outlook-html-body bg-white rounded-lg p-3 sm:p-4 text-zinc-900 font-sans text-xs shadow-md border border-blue-950/40"
                    dangerouslySetInnerHTML={{ __html: previewEmail.htmlBody }}
                  />
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-blue-200/70">
                  Tag: <span className="font-bold text-white">{previewEmail.versionTag}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyEmail(previewEmail)}
                    className="px-3 py-1.5 bg-[#0e1c45] hover:bg-[#15275e] text-blue-200 hover:text-white text-xs font-semibold rounded-lg border border-blue-800/60 shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    {copiedId === previewEmail.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === previewEmail.id ? "Copied!" : "Copy Styled HTML"}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadEml(previewEmail)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-950/40 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .EML</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#0a1538] border-t border-blue-900/50 flex items-center justify-between">
          <div className="text-xs text-blue-200/70">
            Showing <span className="font-semibold text-white">{filteredEmails.length}</span> of{" "}
            <span className="font-semibold text-white">{savedEmails.length}</span> saved email records
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-blue-950/40 cursor-pointer"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
