import React, { useState, useRef } from "react";
import {
  Paperclip,
  X,
  UploadCloud,
  FileText,
  MapPin,
  Table,
  FileArchive,
  File,
  Trash2,
  Download,
  Plus,
  Sparkles,
  CheckCircle2,
  Users,
  User,
} from "lucide-react";
import { EmailAttachment, TechnicianRoster } from "../types";
import {
  formatFileSize,
  readFileAsBase64,
  getMimeTypeForFilename,
  createSampleKmzAttachment,
  createSamplePdfAttachment,
  createSampleCsvAttachment,
  formatTechnicianFullName,
} from "../utils/outlookTemplateGenerator";
import { deleteAttachmentFromDb, clearAttachmentsInDb } from "../utils/storageDb";

interface AttachmentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachments: EmailAttachment[];
  onUpdateAttachments: (attachments: EmailAttachment[]) => void;
  rosters?: TechnicianRoster[];
  currentTechnicianName?: string;
}

export const AttachmentManagerModal: React.FC<AttachmentManagerModalProps> = ({
  isOpen,
  onClose,
  attachments = [],
  onUpdateAttachments,
  rosters = [],
  currentTechnicianName,
}) => {
  const [selectedScope, setSelectedScope] = useState<string>("all");
  const [isDragging, setIsDragging] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newAttachments: EmailAttachment[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const { base64, dataUrl } = await readFileAsBase64(file);
        const mimeType = file.type || getMimeTypeForFilename(file.name);

        newAttachments.push({
          id: "att_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now(),
          name: file.name,
          size: file.size,
          type: mimeType,
          dataBase64: base64,
          dataUrl: dataUrl,
          technicianScope: selectedScope,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error reading file:", file.name, err);
      }
    }

    if (newAttachments.length > 0) {
      onUpdateAttachments([...attachments, ...newAttachments]);
      showFeedback(`Added ${newAttachments.length} attachment${newAttachments.length > 1 ? "s" : ""}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveAttachment = (id: string) => {
    deleteAttachmentFromDb(id).catch((err) => {
      console.warn("[StorageDb] Error removing attachment from DB:", err);
    });
    const updated = attachments.filter((a) => a.id !== id);
    onUpdateAttachments(updated);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to remove all attachments?")) {
      clearAttachmentsInDb().catch((err) => {
        console.warn("[StorageDb] Error clearing attachments in DB:", err);
      });
      onUpdateAttachments([]);
      showFeedback("All attachments removed");
    }
  };

  const handleAddSampleKmz = () => {
    const sample = createSampleKmzAttachment(selectedScope);
    onUpdateAttachments([...attachments, sample]);
    showFeedback("Sample KMZ Route Map added");
  };

  const handleAddSamplePdf = () => {
    const sample = createSamplePdfAttachment(selectedScope);
    onUpdateAttachments([...attachments, sample]);
    showFeedback("Sample PDF Checklist added");
  };

  const handleAddSampleCsv = () => {
    const sample = createSampleCsvAttachment(selectedScope);
    onUpdateAttachments([...attachments, sample]);
    showFeedback("Sample Work Orders CSV added");
  };

  const handleDownloadAttachment = (att: EmailAttachment) => {
    try {
      const link = document.createElement("a");
      if (att.dataUrl) {
        link.href = att.dataUrl;
      } else {
        link.href = `data:${att.type || "application/octet-stream"};base64,${att.dataBase64}`;
      }
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
    if (ext === "kmz" || ext === "kml") {
      return <MapPin className="w-4 h-4 text-blue-600" />;
    }
    if (ext === "pdf") {
      return <FileText className="w-4 h-4 text-red-600" />;
    }
    if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      return <Table className="w-4 h-4 text-emerald-600" />;
    }
    if (ext === "zip" || ext === "rar" || ext === "7z") {
      return <FileArchive className="w-4 h-4 text-amber-600" />;
    }
    return <File className="w-4 h-4 text-zinc-600" />;
  };

  const totalBytes = attachments.reduce((acc, a) => acc + (a.size || 0), 0);

  // Extract unique technician names
  const uniqueTechs = Array.from(
    new Set(rosters.map((r) => formatTechnicianFullName(r.technicianName)))
  ).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#040a1c]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0c183d] via-[#0a1538] to-[#07102b] text-white flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#0e1c45] flex items-center justify-center text-amber-400 border border-blue-700/60">
              <Paperclip className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Email Attachments &amp; Field Documents</h2>
              <p className="text-xs text-blue-200/70">
                Attach KMZ route maps, PDF instructions, CSV reports, or images to email dispatches
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-300/70 hover:text-white rounded-lg hover:bg-blue-900/40 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {feedbackMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Quick Preset Sample Generator Buttons */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Quick Preset Samples (1-Click Test Files)</span>
              </span>
              <span className="text-[11px] text-zinc-500">Supports KMZ, PDF, CSV &amp; more</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleAddSampleKmz}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition shadow-2xs cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>+ Sample KMZ Route Map</span>
              </button>
              <button
                type="button"
                onClick={handleAddSamplePdf}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200 transition shadow-2xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-red-600" />
                <span>+ Sample Safety PDF</span>
              </button>
              <button
                type="button"
                onClick={handleAddSampleCsv}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition shadow-2xs cursor-pointer"
              >
                <Table className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Sample Work Orders CSV</span>
              </button>
            </div>
          </div>

          {/* Scope Selector: Global vs Specific Tech */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-zinc-50/80 border border-zinc-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-zinc-600" />
              <span className="text-xs font-semibold text-zinc-800">Attachment Target Scope:</span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value)}
                className="bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">Global (All Technicians)</option>
                {currentTechnicianName && (
                  <option value={currentTechnicianName}>
                    Current: {formatTechnicianFullName(currentTechnicianName)}
                  </option>
                )}
                {uniqueTechs
                  .filter((t) => t !== currentTechnicianName)
                  .map((tech) => (
                    <option key={tech} value={tech}>
                      Tech: {tech}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 ${
              isDragging
                ? "border-amber-500 bg-amber-50/50"
                : "border-zinc-300 bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-zinc-200 flex items-center justify-center text-zinc-600">
              <UploadCloud className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-xs font-semibold text-zinc-800">
              Click to browse or drag and drop files here
            </div>
            <div className="text-[11px] text-zinc-500 max-w-sm">
              Supports <span className="font-semibold text-zinc-700">.KMZ, .KML, .PDF, .CSV, .XLSX, .DOCX, .ZIP, Images</span> and all standard email attachments.
            </div>
          </div>

          {/* List of Current Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                Attached Files ({attachments.length})
              </span>
              {attachments.length > 0 && (
                <span className="text-xs text-zinc-500 font-medium">
                  Total Payload: <strong className="text-zinc-800">{formatFileSize(totalBytes)}</strong>
                </span>
              )}
            </div>

            {attachments.length === 0 ? (
              <div className="text-center py-6 px-4 border border-zinc-200 border-dashed rounded-xl bg-zinc-50/40 text-xs text-zinc-400">
                No attachments added yet. Drag and drop your KMZ, PDF, CSV files or click the sample presets above.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition shadow-2xs group"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                        {getFileIcon(att.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-zinc-900 truncate" title={att.name}>
                          {att.name}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-zinc-500">
                          <span>{formatFileSize(att.size)}</span>
                          <span>&bull;</span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-semibold ${
                              att.technicianScope === "all" || !att.technicianScope
                                ? "bg-zinc-100 text-zinc-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {att.technicianScope === "all" || !att.technicianScope
                              ? "Global (All)"
                              : `Tech: ${formatTechnicianFullName(att.technicianScope)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(att)}
                        title="Download / Preview file"
                        className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        title="Delete attachment"
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <div>
            {attachments.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-800 font-semibold transition cursor-pointer"
              >
                Remove All ({attachments.length})
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-blue-950/40 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
