import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  MoveVertical,
  GripVertical,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Check,
  Calendar,
  Info,
  MapPin,
  User,
} from "lucide-react";
import { TemplateBranding, TechnicianRoster, WorkOrder } from "../types";
import {
  getWeekDateRange,
  groupOrdersByDayOfWeek,
  getDaySectionsList,
  groupDayOrdersByProject,
  isSouthEastRegion,
} from "../utils/outlookTemplateGenerator";
import { extractProjectNumber } from "../utils/csvParser";

interface ArrangeProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: TemplateBranding;
  onSaveBranding: (newBranding: TemplateBranding) => void;
  activeRoster?: TechnicianRoster;
  availableRosters?: TechnicianRoster[];
  allOrders?: WorkOrder[];
}

interface ProjectSummaryItem {
  projectNumber: string;
  categories: string[];
  orderCount: number;
  locationSuffixes: string[];
  cityState: string;
  serviceType: string;
}

export const ArrangeProjectsModal: React.FC<ArrangeProjectsModalProps> = ({
  isOpen,
  onClose,
  branding,
  onSaveBranding,
  activeRoster,
  availableRosters = [],
  allOrders = [],
}) => {
  // If no rosters provided but activeRoster exists, use it
  const rostersList = useMemo(() => {
    if (availableRosters && availableRosters.length > 0) return availableRosters;
    if (activeRoster) return [activeRoster];
    return [];
  }, [availableRosters, activeRoster]);

  // Selected technician for custom arrangement
  const [selectedTechName, setSelectedTechName] = useState<string>(() => {
    return activeRoster?.technicianName || rostersList[0]?.technicianName || "All Technicians";
  });

  // Track dragging state
  const [draggedItem, setDraggedItem] = useState<{ dayKey: string; index: number } | null>(null);
  const [dragOverDayKey, setDragOverDayKey] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Sync selectedTechName whenever activeRoster changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (activeRoster?.technicianName) {
        setSelectedTechName(activeRoster.technicianName);
      } else if (rostersList.length > 0 && (!selectedTechName || selectedTechName === "All Technicians")) {
        setSelectedTechName(rostersList[0].technicianName);
      }
    }
  }, [activeRoster, isOpen, rostersList]);

  // Active roster being viewed
  const currentRoster = useMemo(() => {
    return (
      rostersList.find(
        (r) =>
          r.technicianName.trim().toLowerCase() === selectedTechName.trim().toLowerCase()
      ) ||
      activeRoster ||
      rostersList[0]
    );
  }, [rostersList, selectedTechName, activeRoster]);

  // Compute the week range and day sections
  const weekInfo = useMemo(() => {
    const baseDate = currentRoster?.date || new Date().toISOString().split("T")[0];
    return getWeekDateRange(baseDate, branding);
  }, [currentRoster?.date, branding]);

  const isSE = useMemo(() => {
    return isSouthEastRegion(currentRoster, branding);
  }, [currentRoster, branding]);

  const daySections = useMemo(() => {
    return getDaySectionsList(weekInfo, branding, isSE);
  }, [weekInfo, branding, isSE]);

  // Group work orders by day
  const groupedOrders = useMemo(() => {
    const orders = currentRoster?.orders || allOrders || [];
    return groupOrdersByDayOfWeek(
      orders,
      weekInfo.sundayDate,
      branding.useAnytimeTeardowns,
      branding
    );
  }, [currentRoster?.orders, allOrders, weekInfo.sundayDate, branding]);

  // Helper to get raw projects present on a given day
  const getDayProjectsMap = useMemo(() => {
    const map = new Map<string, { defaultList: string[]; summaries: Map<string, ProjectSummaryItem> }>();

    daySections.forEach((section) => {
      const orders = groupedOrders[section.key] || [];
      const summaries = new Map<string, ProjectSummaryItem>();
      const defaultList: string[] = [];

      if (orders.length > 0) {
        const groups = groupDayOrdersByProject(orders, branding.useAnytimeTeardowns);
        groups.forEach((g) => {
          const proj = g.projectNumber || (g.primaryOrder?.locationId ? extractProjectNumber(g.primaryOrder.locationId) : "");
          if (proj) {
            if (!defaultList.includes(proj)) {
              defaultList.push(proj);
            }

            const existing = summaries.get(proj);
            const category = g.category || "Install";
            const suffixes = g.orders
              .map((o) => (o.locationId?.includes("-") ? "-" + o.locationId.split("-").pop() : ""))
              .filter(Boolean);

            if (existing) {
              if (!existing.categories.includes(category)) {
                existing.categories.push(category);
              }
              existing.orderCount += g.orders.length;
              suffixes.forEach((s) => {
                if (!existing.locationSuffixes.includes(s)) {
                  existing.locationSuffixes.push(s);
                }
              });
            } else {
              summaries.set(proj, {
                projectNumber: proj,
                categories: [category],
                orderCount: g.orders.length,
                locationSuffixes: suffixes,
                cityState: g.primaryOrder?.cityState || g.primaryOrder?.serviceAddress || "",
                serviceType: g.primaryOrder?.jobType || "Miovision",
              });
            }
          }
        });
      }

      map.set(section.dayName, { defaultList, summaries });
      map.set(section.key, { defaultList, summaries });
    });

    return map;
  }, [daySections, groupedOrders, branding.useAnytimeTeardowns]);

  // Local state for draft project order per day section
  const [draftDayOrders, setDraftDayOrders] = useState<Record<string, string[]>>({});

  // Initialize draft orders from saved branding or default sequence
  useEffect(() => {
    if (!isOpen) return;
    const initialMap: Record<string, string[]> = {};
    const techName = currentRoster?.technicianName || selectedTechName;

    daySections.forEach((section) => {
      const dayData = getDayProjectsMap.get(section.key) || getDayProjectsMap.get(section.dayName);
      if (!dayData || dayData.defaultList.length === 0) {
        initialMap[section.key] = [];
        initialMap[section.dayName] = [];
        return;
      }

      const savedOrder =
        (techName && branding.customTechDayProjectOrder?.[techName]?.[section.key]) ||
        (techName && branding.customTechDayProjectOrder?.[techName]?.[section.dayName]) ||
        branding.customDayProjectOrder?.[section.key] ||
        branding.customDayProjectOrder?.[section.dayName];

      if (savedOrder && savedOrder.length > 0) {
        const validSaved = savedOrder.filter((p) => dayData.defaultList.includes(p));
        const missing = dayData.defaultList.filter((p) => !validSaved.includes(p));
        const combined = [...validSaved, ...missing];
        initialMap[section.key] = combined;
        initialMap[section.dayName] = combined;
      } else {
        initialMap[section.key] = [...dayData.defaultList];
        initialMap[section.dayName] = [...dayData.defaultList];
      }
    });

    setDraftDayOrders(initialMap);
  }, [isOpen, selectedTechName, daySections, getDayProjectsMap, currentRoster?.technicianName]);

  // Helper to read active projects for a day
  const getProjectsForSection = (sectionKey: string, sectionDayName: string): string[] => {
    if (draftDayOrders[sectionKey] && draftDayOrders[sectionKey].length > 0) {
      return draftDayOrders[sectionKey];
    }
    if (draftDayOrders[sectionDayName] && draftDayOrders[sectionDayName].length > 0) {
      return draftDayOrders[sectionDayName];
    }
    const dayData = getDayProjectsMap.get(sectionKey) || getDayProjectsMap.get(sectionDayName);
    return dayData?.defaultList || [];
  };

  // Update order for a specific day in state & persist
  const updateDayOrder = (sectionKey: string, sectionDayName: string, newOrder: string[]) => {
    const techName = currentRoster?.technicianName || selectedTechName;

    // 1. Update local draft state immediately
    const updatedDraft = {
      ...draftDayOrders,
      [sectionKey]: newOrder,
      [sectionDayName]: newOrder,
    };
    setDraftDayOrders(updatedDraft);

    // 2. Also persist to branding immediately
    const updatedGlobal = {
      ...(branding.customDayProjectOrder || {}),
      [sectionKey]: newOrder,
      [sectionDayName]: newOrder,
    };

    let updatedTech = { ...(branding.customTechDayProjectOrder || {}) };
    if (techName) {
      updatedTech[techName] = {
        ...(updatedTech[techName] || {}),
        [sectionKey]: newOrder,
        [sectionDayName]: newOrder,
      };
    }

    onSaveBranding({
      ...branding,
      enableArrangeNewProjects: true,
      customDayProjectOrder: updatedGlobal,
      customTechDayProjectOrder: updatedTech,
    });
  };

  // Move item up / down
  const moveItem = (sectionKey: string, sectionDayName: string, fromIndex: number, toIndex: number) => {
    const list = [...getProjectsForSection(sectionKey, sectionDayName)];
    if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) return;
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    updateDayOrder(sectionKey, sectionDayName, list);
  };

  // Reset a specific day to default CSV sequence
  const resetDay = (sectionKey: string, sectionDayName: string) => {
    const dayData = getDayProjectsMap.get(sectionKey) || getDayProjectsMap.get(sectionDayName);
    const defaultSeq = dayData?.defaultList || [];
    updateDayOrder(sectionKey, sectionDayName, [...defaultSeq]);
  };

  // Reset all days
  const resetAllDays = () => {
    const techName = currentRoster?.technicianName || selectedTechName;
    const resetMap: Record<string, string[]> = {};

    daySections.forEach((section) => {
      const dayData = getDayProjectsMap.get(section.key) || getDayProjectsMap.get(section.dayName);
      if (dayData) {
        resetMap[section.key] = [...dayData.defaultList];
        resetMap[section.dayName] = [...dayData.defaultList];
      }
    });

    setDraftDayOrders(resetMap);

    let updatedTech = { ...(branding.customTechDayProjectOrder || {}) };
    if (techName) {
      delete updatedTech[techName];
    }

    onSaveBranding({
      ...branding,
      customDayProjectOrder: {},
      customTechDayProjectOrder: techName ? updatedTech : {},
    });
  };

  // HTML5 Drag and Drop handlers with proper dataTransfer
  const handleDragStart = (e: React.DragEvent, dayKey: string, index: number) => {
    e.dataTransfer.setData("text/plain", `${dayKey}:${index}`);
    e.dataTransfer.effectAllowed = "move";
    setDraggedItem({ dayKey, index });
  };

  const handleDragOver = (e: React.DragEvent, dayKey: string, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!draggedItem || draggedItem.dayKey !== dayKey) return;
    setDragOverDayKey(dayKey);
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dayKey: string, dayName: string, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.dayKey !== dayKey) {
      setDraggedItem(null);
      setDragOverDayKey(null);
      setDragOverIndex(null);
      return;
    }

    moveItem(dayKey, dayName, draggedItem.index, targetIndex);
    setDraggedItem(null);
    setDragOverDayKey(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverDayKey(null);
    setDragOverIndex(null);
  };

  // Handle final Apply & View Email
  const handleApply = () => {
    const techName = currentRoster?.technicianName || selectedTechName;

    const updatedGlobal = {
      ...(branding.customDayProjectOrder || {}),
      ...draftDayOrders,
    };

    let updatedTech = { ...(branding.customTechDayProjectOrder || {}) };
    if (techName) {
      updatedTech[techName] = {
        ...(updatedTech[techName] || {}),
        ...draftDayOrders,
      };
    }

    onSaveBranding({
      ...branding,
      enableEmailUpdate: true,
      enableArrangeNewProjects: true,
      customDayProjectOrder: updatedGlobal,
      customTechDayProjectOrder: updatedTech,
    });

    onClose();
  };

  if (!isOpen) return null;

  const totalDaysWithProjects = daySections.filter(
    (s) => getProjectsForSection(s.key, s.dayName).length > 0
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#040a1c]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#0c183d] via-[#091433] to-[#07102b] rounded-2xl max-w-4xl w-full border border-blue-900/60 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-blue-900/60 bg-[#07112d]/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-950/50">
              <MoveVertical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Arrange New Project Sequence
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Florida &amp; South East
                </span>
              </div>
              <p className="text-xs text-blue-200/70 mt-0.5">
                Drag project cards or use the ▲/▼ buttons to rearrange project number sequence per day.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-300 hover:text-white hover:bg-blue-900/40 rounded-lg transition cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar */}
        <div className="px-5 py-3 bg-[#081336]/60 border-b border-blue-900/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Technician Selector Tabs */}
          {rostersList.length > 1 ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-blue-200 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Technician:</span>
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-md pb-0.5">
                {rostersList.map((r) => {
                  const isSel = r.technicianName === selectedTechName;
                  return (
                    <button
                      key={r.technicianName}
                      type="button"
                      onClick={() => setSelectedTechName(r.technicianName)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer shrink-0 ${
                        isSel
                          ? "bg-indigo-600 text-white font-bold shadow-xs"
                          : "bg-blue-950/60 text-blue-300 hover:bg-blue-900/60 hover:text-white border border-blue-800/40"
                      }`}
                    >
                      {r.technicianName}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-blue-200">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>
                Technician: <strong className="text-white">{currentRoster?.technicianName || "Default"}</strong>
              </span>
            </div>
          )}

          {/* Toggle Switch */}
          <div className="flex items-center space-x-3 ml-auto">
            <div className="flex items-center space-x-2 bg-indigo-950/70 border border-indigo-700/60 px-2.5 py-1 rounded-lg">
              <span className="text-[11px] font-semibold text-indigo-200">
                Arrange Projects Feature:
              </span>
              <button
                type="button"
                onClick={() =>
                  onSaveBranding({
                    ...branding,
                    enableEmailUpdate: true,
                    enableArrangeNewProjects: !branding.enableArrangeNewProjects,
                  })
                }
                className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors cursor-pointer ${
                  branding.enableArrangeNewProjects ? "bg-indigo-500" : "bg-stone-700"
                }`}
                title="Toggle Arrange New Project order in template"
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    branding.enableArrangeNewProjects ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-[10px] font-bold text-indigo-300">
                {branding.enableArrangeNewProjects ? "ENABLED" : "DISABLED"}
              </span>
            </div>

            <button
              type="button"
              onClick={resetAllDays}
              className="flex items-center space-x-1 px-2.5 py-1 bg-blue-950/60 hover:bg-red-950/40 text-blue-300 hover:text-red-300 text-xs rounded-lg border border-blue-800/50 hover:border-red-800/50 transition cursor-pointer"
              title="Reset all days to default sequence"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          </div>
        </div>

        {/* Explanatory Banner */}
        <div className="px-5 py-2.5 bg-blue-950/30 border-b border-blue-900/30 flex items-center justify-between text-xs text-blue-200/80 shrink-0">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Per Day Sequence:</strong> Under each day, drag the project number card or click ▲/▼ to arrange which project appears first, second, etc., in the Florida/SE email.
            </span>
          </div>
          <span className="text-[11px] text-blue-300 font-semibold shrink-0">
            {totalDaysWithProjects} {totalDaysWithProjects === 1 ? "day" : "days"} with scheduled projects
          </span>
        </div>

        {/* Scrollable Day Sections Area */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {daySections.map((section) => {
            const projects = getProjectsForSection(section.key, section.dayName);
            const dayData = getDayProjectsMap.get(section.key) || getDayProjectsMap.get(section.dayName);
            const isDayEmpty = projects.length === 0;

            if (isDayEmpty) {
              return (
                <div
                  key={section.key}
                  className="bg-[#081230]/40 border border-blue-900/30 rounded-xl p-3.5 flex items-center justify-between opacity-60"
                >
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">
                      {section.displayHeader}
                    </span>
                    <span className="text-[10px] text-blue-300/70">
                      — No projects scheduled (TBD / -)
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={section.key}
                className="bg-[#081230]/80 border border-blue-800/50 rounded-xl overflow-hidden shadow-md shadow-blue-950/40"
              >
                {/* Day Header */}
                <div className="px-4 py-2.5 bg-gradient-to-r from-blue-950 to-[#0c1840] border-b border-blue-800/50 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {section.displayHeader}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-200 border border-blue-700/50">
                      {projects.length} {projects.length === 1 ? "Project" : "Projects"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => resetDay(section.key, section.dayName)}
                    className="text-[11px] text-blue-300 hover:text-white flex items-center space-x-1 hover:underline cursor-pointer"
                    title="Reset this day to default CSV sequence"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Day</span>
                  </button>
                </div>

                {/* Draggable Projects List */}
                <div className="p-3 space-y-2">
                  {projects.map((projNum, index) => {
                    const summary = dayData?.summaries.get(projNum);
                    const isDragging =
                      draggedItem?.dayKey === section.key &&
                      draggedItem?.index === index;
                    const isDragOver =
                      dragOverDayKey === section.key &&
                      dragOverIndex === index;

                    return (
                      <div
                        key={projNum}
                        draggable
                        onDragStart={(e) => handleDragStart(e, section.key, index)}
                        onDragOver={(e) => handleDragOver(e, section.key, index)}
                        onDrop={(e) => handleDrop(e, section.key, section.dayName, index)}
                        onDragEnd={handleDragEnd}
                        className={`group flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition duration-150 ${
                          isDragging
                            ? "opacity-40 bg-blue-900/40 border-dashed border-indigo-400"
                            : isDragOver
                            ? "bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg"
                            : "bg-[#0a163e]/90 hover:bg-[#0e1d4d] border-blue-900/60 hover:border-blue-700/80"
                        }`}
                      >
                        {/* Drag Handle & Project Info */}
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className="cursor-grab active:cursor-grabbing text-blue-400 group-hover:text-indigo-300 p-1 -ml-1 rounded hover:bg-blue-800/40 transition"
                            title="Drag to reposition project"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <div className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-600/60 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                            {index + 1}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="font-mono text-sm font-bold text-white tracking-wider">
                                {projNum}
                              </span>

                              {summary?.categories.map((cat) => (
                                <span
                                  key={cat}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    cat === "Install"
                                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                                      : cat === "Teardown"
                                      ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                                      : "bg-cyan-950/80 text-cyan-300 border border-cyan-800/60"
                                  }`}
                                >
                                  {cat}
                                </span>
                              ))}

                              {summary && (
                                <span className="text-[11px] text-blue-300/80">
                                  {summary.orderCount} {summary.orderCount === 1 ? "location" : "locations"}
                                  {summary.locationSuffixes.length > 0 && ` (${summary.locationSuffixes.join(", ")})`}
                                </span>
                              )}
                            </div>

                            {summary && (summary.cityState || summary.serviceType) && (
                              <div className="text-[11px] text-blue-200/60 flex items-center gap-2 mt-0.5">
                                {summary.serviceType && <span>{summary.serviceType}</span>}
                                {summary.cityState && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-blue-400" />
                                    {summary.cityState}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Reorder Control Buttons */}
                        <div className="flex items-center space-x-1 shrink-0 ml-3">
                          <button
                            type="button"
                            onClick={() => moveItem(section.key, section.dayName, index, index - 1)}
                            disabled={index === 0}
                            className={`p-1.5 rounded-md transition cursor-pointer ${
                              index === 0
                                ? "text-zinc-600 cursor-not-allowed"
                                : "text-blue-300 hover:text-white hover:bg-blue-800/60 active:scale-95"
                            }`}
                            title="Move Project Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(section.key, section.dayName, index, index + 1)}
                            disabled={index === projects.length - 1}
                            className={`p-1.5 rounded-md transition cursor-pointer ${
                              index === projects.length - 1
                                ? "text-zinc-600 cursor-not-allowed"
                                : "text-blue-300 hover:text-white hover:bg-blue-800/60 active:scale-95"
                            }`}
                            title="Move Project Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-blue-900/60 bg-[#07112d]/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-blue-300">
            {branding.enableArrangeNewProjects ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Custom Project Arrangement is Active
              </span>
            ) : (
              <span className="text-amber-400/90 font-medium">
                Feature is currently disabled. Toggle &ldquo;Arrange New Project&rdquo; on to apply in email.
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-blue-950/80 hover:bg-blue-900 text-blue-200 hover:text-white text-xs font-semibold rounded-xl border border-blue-800/60 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-950/60 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply &amp; View Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
