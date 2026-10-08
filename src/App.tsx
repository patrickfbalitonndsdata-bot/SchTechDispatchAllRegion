import React, { useState, useEffect, useMemo, useCallback } from "react";
import heroImg from "./assets/images/dispatch_hero_banner_1790099867864.jpg";
import { Navbar } from "./components/Navbar";
import { HeroPhotoBanner } from "./components/HeroPhotoBanner";
import { FeatureBannersGrid } from "./components/FeatureBannersGrid";
import { CsvUploadZone } from "./components/CsvUploadZone";
import { RegionRosterSelectorBar } from "./components/RegionRosterSelectorBar";
import { UnderConstructionRegionCard } from "./components/UnderConstructionRegionCard";
import { ColumnMappingModal } from "./components/ColumnMappingModal";
import { OutlookEmailPreview } from "./components/OutlookEmailPreview";
import { DispatchHistoryModal } from "./components/DispatchHistoryModal";
import { SettingsBrandingModal } from "./components/SettingsBrandingModal";
import { AdditionalNotesModal } from "./components/AdditionalNotesModal";
import { ArrangeProjectsModal } from "./components/ArrangeProjectsModal";
import { AttachmentManagerModal } from "./components/AttachmentManagerModal";
import { SavedEmailHistoryModal } from "./components/SavedEmailHistoryModal";
import { SavedHistoryTab } from "./components/SavedHistoryTab";
import { Footer } from "./components/Footer";
import { parseCsvData, extractProjectNumber, formatTechnicianFullName } from "./utils/csvParser";
import { SAMPLE_DATASETS, SampleDataset } from "./utils/sampleData";
import {
  ColumnMapping,
  ParseResult,
  TechnicianRoster,
  TemplateBranding,
  DispatchLogRecord,
  WorkOrder,
  EmailAttachment,
  SavedEmailRecord,
  REGION_ROSTERS,
  RegionRoster,
} from "./types";
import {
  DEFAULT_BRANDING,
  DEFAULT_PRESET_NOTES,
  getWeekDateRange,
  getWorkWeekOptions,
  filterOrdersForScheduleOverlap,
  isNoteMatchingRegion,
} from "./utils/outlookTemplateGenerator";
import { DEFAULT_TECHNICIAN_ROSTER, resolveTechnicianAirtableUrl, resolveTechnicianRegion } from "./utils/technicianRosterData";
import { isRegionTemplateActive, getRegionTemplateConfig, ACTIVE_TEMPLATE_REGIONS } from "./utils/regionTemplates";
import {
  getSavedEmails,
  loadSavedEmailsFromDb,
  createSavedEmailRecord,
  saveEmailRecord,
  saveAllRostersToHistory,
  updateSavedEmailTag,
  deleteSavedEmail,
  clearAllSavedEmails,
  computeNextVersionInfo,
  getWorkWeekKey,
  findHistoryAttachmentsForTech,
} from "./utils/savedEmailStorage";
import {
  safeSetLocalStorage,
  sanitizeBrandingForLocalStorage,
  cleanBloatedLocalStorage,
  storeAttachmentsInDb,
  getAllAttachmentsFromDb,
} from "./utils/storageDb";
import { Mail, Sparkles, StickyNote, Sliders, RefreshCw, Paperclip, Bookmark, History, Trash2, Check, Filter, CalendarDays, FileX, ClipboardList, MapPin, MoveVertical } from "lucide-react";

export default function App() {
  // 0. Theme Mode State ("dark" default, "light" Blue & White palette)
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("nds_theme_mode");
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    }
    return "dark";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.toggle("light-mode", themeMode === "light");
      document.documentElement.classList.toggle("light-mode", themeMode === "light");
    }
    safeSetLocalStorage("nds_theme_mode", themeMode);
  }, [themeMode]);

  const handleToggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // 1. CSV Data & Parsing State (Default to empty on initial visit / refresh)
  const [csvContent, setCsvContent] = useState<string>("");
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [customMapping, setCustomMapping] = useState<Partial<ColumnMapping>>({});

  // 2. Parsed Result
  const parseResult: ParseResult = useMemo(() => {
    return parseCsvData(csvContent, customMapping);
  }, [csvContent, customMapping]);

  // Extract unique project numbers for scoped note targeting
  const availableProjects = useMemo(() => {
    const set = new Set<string>();
    parseResult.orders.forEach((o) => {
      const proj = o.projectNumber || (o.locationId ? extractProjectNumber(o.locationId) : extractProjectNumber(o.orderNumber));
      if (proj && proj.trim()) set.add(proj.trim());
    });
    return Array.from(set).sort();
  }, [parseResult.orders]);

  // 3. Date Selection ("all" for full week or specific date)
  const [selectedDate, setSelectedDate] = useState<string>("all");

  useEffect(() => {
    if (parseResult.detectedDates.length > 0) {
      if (selectedDate !== "all" && !parseResult.detectedDates.includes(selectedDate)) {
        setSelectedDate("all");
      }
    }
  }, [parseResult.detectedDates, selectedDate]);

  // 4. Template Branding Settings
  const [branding, setBranding] = useState<TemplateBranding>(() => {
    const saved = localStorage.getItem("techdispatch_branding");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.additionalNotes)) {
          let updatedNotes: any[] = [];
          for (const n of parsed.additionalNotes) {
            if (n.id === "preset_tmc_atr_install" || n.autoTriggerType === "tmc_atr_install") {
              const tmcPreset = DEFAULT_PRESET_NOTES.find((d) => d.id === "preset_tmc_install");
              const algPreset = DEFAULT_PRESET_NOTES.find((d) => d.id === "preset_alg_atr_install");
              if (tmcPreset && !parsed.additionalNotes.some((b: any) => b.id === tmcPreset.id)) {
                updatedNotes.push({ ...tmcPreset, enabled: n.enabled ?? true });
              }
              if (algPreset && !parsed.additionalNotes.some((b: any) => b.id === algPreset.id)) {
                updatedNotes.push({ ...algPreset, enabled: n.enabled ?? true });
              }
            } else if (
              n.id === "preset_fl_se_nwt_logos" ||
              n.id === "preset_tmc_install" ||
              n.id === "preset_alg_atr_install" ||
              n.id?.startsWith("preset_ne_ma_")
            ) {
              const defaultMatch = DEFAULT_PRESET_NOTES.find((d) => d.id === n.id);
              if (defaultMatch) {
                updatedNotes.push({
                  ...defaultMatch,
                  enabled: n.enabled ?? defaultMatch.enabled,
                  targetDays: n.targetDays || defaultMatch.targetDays,
                  targetCategory: n.targetCategory || defaultMatch.targetCategory,
                  targetProjects: n.targetProjects || defaultMatch.targetProjects,
                  targetRegions: n.targetRegions || defaultMatch.targetRegions,
                });
              } else {
                updatedNotes.push(n);
              }
            } else {
              const defaultMatch = DEFAULT_PRESET_NOTES.find((d) => d.id === n.id);
              if (defaultMatch) {
                updatedNotes.push({
                  ...defaultMatch,
                  enabled: n.enabled ?? defaultMatch.enabled,
                  targetDays: n.targetDays || defaultMatch.targetDays,
                  targetCategory: n.targetCategory || defaultMatch.targetCategory,
                  targetProjects: n.targetProjects || defaultMatch.targetProjects,
                  targetRegions: n.targetRegions || defaultMatch.targetRegions,
                  isNorthEastOrMidAtlanticNote: defaultMatch.isNorthEastOrMidAtlanticNote,
                  isFloridaOrSouthEastNote: defaultMatch.isFloridaOrSouthEastNote,
                });
              } else {
                updatedNotes.push(n);
              }
            }
          }
          for (const d of DEFAULT_PRESET_NOTES) {
            if (!updatedNotes.some((u) => u.id === d.id)) {
              updatedNotes.push(d);
            }
          }
          parsed.additionalNotes = updatedNotes;
        }

        // Ensure default technician roster Airtable links are present and updated
        if (!parsed.technicianAirtableLinks || !Array.isArray(parsed.technicianAirtableLinks) || parsed.technicianAirtableLinks.length === 0) {
          parsed.technicianAirtableLinks = DEFAULT_TECHNICIAN_ROSTER;
        } else {
          // Merge in any missing technicians from official roster
          const existing = [...parsed.technicianAirtableLinks];
          const existingMap = new Map(existing.map((t: any) => [t.name.trim().toLowerCase(), t]));
          for (const defaultTech of DEFAULT_TECHNICIAN_ROSTER) {
            const key = defaultTech.name.trim().toLowerCase();
            const found = existingMap.get(key);
            if (!found) {
              existing.push(defaultTech);
            } else if (!found.airtableUrl || found.airtableUrl.includes("placeholder") || found.airtableUrl === "https://www.airtable.com/") {
              found.airtableUrl = defaultTech.airtableUrl;
            }
          }
          parsed.technicianAirtableLinks = existing;
        }

        // Clear legacy pre-filled sample text for emailUpdateNotes so it defaults to blank for user input
        if (
          parsed.emailUpdateNotes ===
          "I added two meetings to your schedule: one at the Auburn Office at 11:00 AM on Friday, 09/04, and another at a central location in New York City on Sunday."
        ) {
          parsed.emailUpdateNotes = "";
        }

        return {
          ...DEFAULT_BRANDING,
          ...parsed,
          useAnytimeTeardowns: true,
        };
      } catch (e) {
        return DEFAULT_BRANDING;
      }
    }
    return DEFAULT_BRANDING;
  });

  const handleSaveBranding = (newBranding: TemplateBranding, explicitSelectedRegion?: string) => {
    const activeSelectedRegion =
      explicitSelectedRegion ||
      selectedRegion ||
      newBranding.selectedRegion ||
      newBranding.defaultRegion ||
      "North East";

    // Only switch active selectedRegion to defaultRegion if the user explicitly changed defaultRegion in Settings
    const prevDefault = branding.defaultRegion;
    const nextDefault = newBranding.defaultRegion;
    const defaultRegionChanged =
      Boolean(nextDefault) &&
      Boolean(prevDefault) &&
      nextDefault !== prevDefault &&
      !explicitSelectedRegion;

    const finalSelectedRegion =
      defaultRegionChanged && nextDefault && REGION_ROSTERS.includes(nextDefault as any)
        ? nextDefault
        : activeSelectedRegion;

    if (defaultRegionChanged && finalSelectedRegion !== selectedRegion) {
      setSelectedRegion(finalSelectedRegion);
    }

    const syncedBranding: TemplateBranding = {
      ...newBranding,
      selectedRegion: finalSelectedRegion,
      regionName: finalSelectedRegion,
    };

    setBranding(syncedBranding);

    // Persist default region locally without overriding the user's currently selected region
    if (syncedBranding.defaultRegion && REGION_ROSTERS.includes(syncedBranding.defaultRegion as any)) {
      safeSetLocalStorage("nds_default_region", syncedBranding.defaultRegion);
    }

    // 1. Asynchronously persist full attachments into IndexedDB (unlimited quota)
    if (syncedBranding.attachments && syncedBranding.attachments.length > 0) {
      storeAttachmentsInDb(syncedBranding.attachments).catch((err) => {
        console.warn("[StorageDb] Could not store attachments in DB:", err);
      });
    }

    // 2. Sanitize branding to strip base64 payloads before writing to localStorage
    const sanitized = sanitizeBrandingForLocalStorage(syncedBranding);
    safeSetLocalStorage("techdispatch_branding", JSON.stringify(sanitized));
  };

  // 5. Work Week Options (Current vs. Incoming vs. detected weeks)
  const workWeekOptions = useMemo(() => {
    return getWorkWeekOptions(parseResult.orders, branding);
  }, [parseResult.orders, branding]);

  const activeWorkWeek = useMemo(() => {
    const currentSel = branding.selectedWorkWeek || "current";
    return workWeekOptions.find((w) => w.id === currentSel) || workWeekOptions[0];
  }, [workWeekOptions, branding.selectedWorkWeek]);

  // Overall schedule overlap statistics across all orders
  const overlapStats = useMemo(() => {
    if (!branding.enableScheduleOverlap || parseResult.orders.length === 0 || !activeWorkWeek) {
      return { activeCount: parseResult.orders.length, excludedCount: 0 };
    }
    const weekInfo = getWeekDateRange(activeWorkWeek.sundayStr, branding);
    const { activeOrders, excludedOrders } = filterOrdersForScheduleOverlap(
      parseResult.orders,
      weekInfo,
      branding
    );
    return {
      activeCount: activeOrders.length,
      excludedCount: excludedOrders.length,
    };
  }, [branding, parseResult.orders, activeWorkWeek]);

  // 6. Region Roster Selection State (Supports the 8 standard dispatch regions)
  const [selectedRegion, setSelectedRegion] = useState<string>(() => {
    const localDefault = typeof window !== "undefined" ? localStorage.getItem("nds_default_region") : null;
    if (localDefault && REGION_ROSTERS.includes(localDefault as any)) {
      return localDefault;
    }
    if (branding.defaultRegion && REGION_ROSTERS.includes(branding.defaultRegion as any)) {
      return branding.defaultRegion;
    }
    if (branding.selectedRegion && branding.selectedRegion !== "all" && REGION_ROSTERS.includes(branding.selectedRegion as any)) {
      return branding.selectedRegion;
    }
    return "North East";
  });

  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion);
    handleSaveBranding(
      {
        ...branding,
        selectedRegion: newRegion,
        regionName: newRegion,
      },
      newRegion
    );
  };

  // 6b. Group Work Orders by Technician (automatically read from Technicians column)
  const technicianRosters: TechnicianRoster[] = useMemo(() => {
    if (parseResult.orders.length === 0) return [];

    const dateOrders =
      selectedDate === "all" || !selectedDate
        ? parseResult.orders
        : parseResult.orders.filter((o) => o.date === selectedDate);

    const techMap = new Map<string, WorkOrder[]>();

    dateOrders.forEach((order) => {
      const techName = formatTechnicianFullName(order.technicianName || "Unassigned Technician");
      const existing = techMap.get(techName) || [];
      existing.push(order);
      techMap.set(techName, existing);
    });

    const effectiveBrandingForRegion: TemplateBranding = {
      ...branding,
      selectedRegion: selectedRegion,
      regionName: selectedRegion,
    };

    const rosters: TechnicianRoster[] = [];
    techMap.forEach((orders, techName) => {
      const email = orders[0]?.technicianEmail || `${techName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@ndsdata.com`;
      const urgentCount = orders.filter((o) => o.priority === "Urgent").length;
      const highCount = orders.filter((o) => o.priority === "High").length;
      const normalCount = orders.filter((o) => o.priority === "Normal" || o.priority === "Low").length;
      const totalEstimatedMinutes = orders.reduce((sum, o) => sum + (o.estimatedDurationMin || 60), 0);
      const airtableUrl = resolveTechnicianAirtableUrl(techName, effectiveBrandingForRegion);
      const region = resolveTechnicianRegion(techName, orders, effectiveBrandingForRegion);

      rosters.push({
        technicianName: techName,
        technicianEmail: email,
        airtableUrl,
        date: selectedDate === "all" ? (activeWorkWeek ? activeWorkWeek.sundayStr : (parseResult.detectedDates[0] || new Date().toISOString().split("T")[0])) : selectedDate,
        orders,
        totalEstimatedMinutes,
        urgentCount,
        highCount,
        normalCount,
        region,
      });
    });

    return rosters.sort((a, b) => b.urgentCount - a.urgentCount || a.technicianName.localeCompare(b.technicianName));
  }, [parseResult.orders, selectedDate, parseResult.detectedDates, branding, activeWorkWeek, selectedRegion]);

  // Configured Roster Technicians (Default or User-Edited in Settings)
  const allRosterTechnicians = useMemo(() => {
    return branding.technicianAirtableLinks && branding.technicianAirtableLinks.length > 0
      ? branding.technicianAirtableLinks
      : DEFAULT_TECHNICIAN_ROSTER;
  }, [branding.technicianAirtableLinks]);

  // Counts per region from the roster (accessible immediately even before any CSV upload)
  const rosterTechsCountByRegion = useMemo(() => {
    const counts: Record<string, number> = {};
    REGION_ROSTERS.forEach((r) => {
      counts[r] = 0;
    });
    allRosterTechnicians.forEach((t) => {
      const reg = t.region || "North East";
      if (counts[reg] !== undefined) {
        counts[reg]++;
      }
    });
    return counts;
  }, [allRosterTechnicians]);

  // Technicians from the roster (all roster technicians available across all regions)
  const techniciansInSelectedRegion = allRosterTechnicians;

  // Detected work orders count for the currently selected region (from CSV)
  const ordersCountForSelectedRegion = useMemo(() => {
    return parseResult.orders.filter((o) => o.region === selectedRegion).length;
  }, [parseResult.orders, selectedRegion]);

  // Technician count per region for dropdown badge counters
  const technicianCountByRegion = useMemo(() => {
    const counts: Record<string, number> = {};
    REGION_ROSTERS.forEach((r) => {
      counts[r] = isRegionTemplateActive(r) ? technicianRosters.length : 0;
    });
    return counts;
  }, [technicianRosters]);

  // Filter technician rosters based on region template availability:
  // - If the selected region is under construction (NYC, NOCAL, SOCAL, Mid West), no emails are generated.
  // - If an active region is selected (North East, Mid Atlantic, South East, Florida), all technicians in the CSV
  //   generate emails using that region's designated template regardless of roster status.
  const filteredTechnicianRosters = useMemo(() => {
    if (!isRegionTemplateActive(selectedRegion)) {
      return [];
    }
    return technicianRosters;
  }, [technicianRosters, selectedRegion]);

  // 7. Saved Email History (Stored in localStorage per technician + work week)
  const [savedEmails, setSavedEmails] = useState<SavedEmailRecord[]>(() => getSavedEmails());
  const [savedHistoryModalOpen, setSavedHistoryModalOpen] = useState(false);
  const [batchSaveFeedback, setBatchSaveFeedback] = useState(false);

  const handleSaveTechnicianEmail = useCallback(
    (roster: TechnicianRoster, customTag?: string) => {
      const activeBranding: TemplateBranding = {
        ...branding,
        selectedRegion: selectedRegion,
        regionName: selectedRegion,
      };
      const record = createSavedEmailRecord(
        { ...roster, region: selectedRegion as RegionRoster },
        activeBranding,
        customTag,
        savedEmails
      );
      const updated = saveEmailRecord(record);
      setSavedEmails(updated);
    },
    [branding, savedEmails, selectedRegion]
  );

  const handleSaveAllToHistory = useCallback(() => {
    if (!isRegionTemplateActive(selectedRegion) || filteredTechnicianRosters.length === 0) return;
    const activeBranding: TemplateBranding = {
      ...branding,
      selectedRegion: selectedRegion,
      regionName: selectedRegion,
    };
    const { updatedList } = saveAllRostersToHistory(
      filteredTechnicianRosters.map((r) => ({ ...r, region: selectedRegion as RegionRoster })),
      activeBranding
    );
    setSavedEmails(updatedList);
    setBatchSaveFeedback(true);
    setTimeout(() => setBatchSaveFeedback(false), 3000);
  }, [filteredTechnicianRosters, branding, selectedRegion]);

  const handleUpdateSavedTag = useCallback((id: string, newTag: string) => {
    const updated = updateSavedEmailTag(id, newTag);
    setSavedEmails(updated);
  }, []);

  const handleDeleteSavedEmail = useCallback((id: string) => {
    const updated = deleteSavedEmail(id);
    setSavedEmails(updated);
  }, []);

  const handleClearAllSaved = useCallback(() => {
    const updated = clearAllSavedEmails();
    setSavedEmails(updated);
  }, []);

  // Hydrate full saved emails and full attachments from IndexedDB on startup,
  // and proactively purge any bloated legacy keys from localStorage to prevent QuotaExceededError
  useEffect(() => {
    cleanBloatedLocalStorage();

    // Hydrate complete saved emails from IndexedDB
    loadSavedEmailsFromDb().then((records) => {
      if (records && records.length > 0) {
        setSavedEmails(records);
      }
    });

    // Hydrate complete attachment files (base64/dataUrl) into branding state
    getAllAttachmentsFromDb().then((dbAtts) => {
      if (dbAtts && dbAtts.length > 0) {
        setBranding((prev) => {
          const existing = prev.attachments || [];
          const merged = [...existing];
          dbAtts.forEach((dbAtt) => {
            const idx = merged.findIndex((a) => a.id === dbAtt.id);
            if (idx >= 0) {
              if (!merged[idx].dataBase64 && dbAtt.dataBase64) {
                merged[idx] = {
                  ...merged[idx],
                  dataBase64: dbAtt.dataBase64,
                  dataUrl: dbAtt.dataUrl,
                };
              }
            } else {
              merged.push(dbAtt);
            }
          });
          return { ...prev, attachments: merged };
        });
      }
    });
  }, []);

  // Active top-level Tab: "generator" (Main Schedule Generator) or "history" (Saved Email History View)
  const [activeTab, setActiveTab] = useState<"generator" | "history">("generator");

  // Auto-prefill attachments from saved email history for technicians on matching work week
  useEffect(() => {
    if (technicianRosters.length === 0) return;

    setBranding((prevBranding) => {
      const existingAtts = prevBranding.attachments || [];
      let updatedAtts = [...existingAtts];
      let hasChanges = false;

      technicianRosters.forEach((roster) => {
        const { key: workWeekKey } = getWorkWeekKey(roster.date, prevBranding);
        const techName = roster.technicianName.trim().toLowerCase();

        // Check if this technician already has attachments in current session
        const alreadyHasTechAtts = updatedAtts.some(
          (a) =>
            a.technicianScope &&
            a.technicianScope !== "all" &&
            a.technicianScope.trim().toLowerCase() === techName
        );

        // If nothing set for this technician, look up history on the same work week
        if (!alreadyHasTechAtts) {
          const historyAtts = findHistoryAttachmentsForTech(
            roster.technicianName,
            workWeekKey,
            savedEmails
          );

          if (historyAtts && historyAtts.length > 0) {
            historyAtts.forEach((att) => {
              const isDuplicate = updatedAtts.some((a) => a.id === att.id);
              if (!isDuplicate) {
                updatedAtts.push({
                  ...att,
                  technicianScope: roster.technicianName,
                });
                hasChanges = true;
              }
            });
          }
        }
      });

      if (hasChanges) {
        return {
          ...prevBranding,
          attachments: updatedAtts,
        };
      }
      return prevBranding;
    });
  }, [technicianRosters, savedEmails]);

  // 7. Clear Functionality (Clears uploaded CSV and generated email previews)
  const handleClear = () => {
    setCsvContent("");
    setCurrentFileName("");
    setCustomMapping({});
    setSelectedDate("all");
    setBranding((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((a) => a.technicianScope === "all"),
    }));
  };

  // 8. Dispatch Logs State
  const [dispatchLogs, setDispatchLogs] = useState<DispatchLogRecord[]>(() => {
    const saved = localStorage.getItem("techdispatch_logs");
    return saved ? JSON.parse(saved) : [];
  });

  const handleRecordDispatch = useCallback((roster: TechnicianRoster, method: any, status: any) => {
    const weekInfo = getWeekDateRange(roster.date, branding);
    const newLog: DispatchLogRecord = {
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      technicianName: roster.technicianName,
      technicianEmail: roster.technicianEmail,
      date: roster.date,
      jobCount: roster.orders.length,
      status: status,
      method: method,
      previewSubject: `${roster.technicianName} | ${weekInfo.formattedRange}`,
      notes: `Export via ${method}`,
    };

    setDispatchLogs((prev) => {
      const updated = [newLog, ...prev.slice(0, 49)];
      safeSetLocalStorage("techdispatch_logs", JSON.stringify(updated));
      return updated;
    });

    fetch("/api/dispatch/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logs: [newLog] }),
    }).catch((e) => console.error(e));
  }, [branding]);

  const handleClearLogs = () => {
    setDispatchLogs([]);
    localStorage.removeItem("techdispatch_logs");
    fetch("/api/dispatch/logs", { method: "DELETE" }).catch((e) => console.error(e));
  };

  // 9. Modal States
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [arrangeProjectsModalOpen, setArrangeProjectsModalOpen] = useState(false);
  const [arrangeProjectsActiveRoster, setArrangeProjectsActiveRoster] = useState<TechnicianRoster | undefined>(undefined);

  // File Upload Handler
  const handleFileUpload = (content: string, fileName: string) => {
    setCsvContent(content);
    setCurrentFileName(fileName);
    setCustomMapping({});
    setBranding((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((a) => a.technicianScope === "all"),
    }));
    setActiveTab("generator");
  };

  const handleLoadSample = (sample: SampleDataset) => {
    setCsvContent(sample.csvContent);
    setCurrentFileName(`${sample.name.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    setCustomMapping({});
    setBranding((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((a) => a.technicianScope === "all"),
    }));
    setActiveTab("generator");
  };

  const handleGoToEmailGenerator = useCallback(() => {
    setActiveTab("generator");
    setTimeout(() => {
      const el = document.getElementById("email-generator-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  }, []);

  const activeNotesCount = (branding.additionalNotes || []).filter(
    (p) => p.enabled && isNoteMatchingRegion(p, selectedRegion)
  ).length;
  const attachmentsCount = (branding.attachments || []).length;

  return (
    <div
      className={`min-h-screen font-sans flex flex-col antialiased relative overflow-x-hidden transition-colors duration-300 ${
        themeMode === "light"
          ? "bg-gradient-to-b from-[#eaf2ff] via-[#f4f8ff] to-[#ffffff] text-slate-900 selection:bg-blue-600 selection:text-white"
          : "bg-gradient-to-b from-[#0a1b42] via-[#071433] to-[#040c20] text-slate-100 selection:bg-amber-400 selection:text-stone-950"
      }`}
    >
      {/* Edge-to-Edge Integrated Background Image with Multi-Stage Fading Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[720px] sm:h-[820px] lg:h-[860px] pointer-events-none z-0 overflow-hidden select-none">
        <img
          src={heroImg}
          alt="Precision Dispatch Operations Workspace"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-[center_32%] scale-100 transition-all duration-500 ${
            themeMode === "light"
              ? "filter contrast-100 brightness-[1.05] saturate-[0.95] opacity-25"
              : "filter contrast-105 brightness-[0.62] saturate-[1.15]"
          }`}
        />
        {themeMode === "light" ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-[#f0f6ff]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-[#f0f6ff]/75 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-64 sm:h-80 bg-gradient-to-b from-transparent via-[#f4f8ff]/90 to-[#f4f8ff]" />
          </>
        ) : (
          <>
            {/* Top navy vignette ensuring sticky transparent Navbar labels remain sharp */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1b42]/90 via-[#071433]/50 to-transparent" />
            {/* Horizontal navy shade for left-aligned typography readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1b42]/95 via-[#071433]/65 to-transparent" />
            {/* Smooth fading navy gradient at bottom to seamlessly melt into navy page background upon scroll */}
            <div className="absolute bottom-0 left-0 right-0 h-64 sm:h-80 bg-gradient-to-b from-transparent via-[#071433]/85 to-[#071433]" />
          </>
        )}
      </div>

      {/* Top Main Navigation Bar - Sticky & Transparent */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLoadSample={(sample) => {
          handleLoadSample(sample);
          setActiveTab("generator");
        }}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenSavedHistory={() => setActiveTab("history")}
        savedEmailsCount={savedEmails.length}
        activeDatasetName={currentFileName}
        totalOrdersCount={parseResult.orders.length}
        techniciansCount={technicianRosters.length}
        selectedRegion={selectedRegion}
        onRegionChange={handleRegionChange}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main App Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 flex-1 relative z-10">
        {activeTab === "history" ? (
          <SavedHistoryTab
            savedEmails={savedEmails}
            onUpdateTag={handleUpdateSavedTag}
            onDeleteEmail={handleDeleteSavedEmail}
            onClearAll={handleClearAllSaved}
            onSwitchToGenerator={() => setActiveTab("generator")}
            themeMode={themeMode}
          />
        ) : (
          <>
            {/* Trendy Editorial Photo Banner */}
            <HeroPhotoBanner
              totalOrders={parseResult.orders.length}
              totalTechs={technicianRosters.length}
              totalTechnicians={technicianRosters.length}
              currentWorkWeekLabel={activeWorkWeek ? activeWorkWeek.fullLabel : "Current Week"}
              currentWorkWeek={branding.selectedWorkWeek || "current"}
              selectedRegion={selectedRegion}
              onGoToGenerator={handleGoToEmailGenerator}
              onUploadClick={() => document.getElementById("csv-file-input")?.click()}
              onLoadSample={(sample) => {
                handleLoadSample(sample || SAMPLE_DATASETS[0]);
                setActiveTab("generator");
              }}
              onOpenSettings={() => setSettingsModalOpen(true)}
              hasData={parseResult.orders.length > 0}
              onQuickAction={(action) => {
                if (action === "generator") {
                  handleGoToEmailGenerator();
                } else if (action === "upload") {
                  document.getElementById("csv-file-input")?.click();
                } else if (action === "settings") {
                  setSettingsModalOpen(true);
                } else if (action === "history") {
                  setActiveTab("history");
                } else if (action === "sample") {
                  handleLoadSample(SAMPLE_DATASETS[0]);
                  setActiveTab("generator");
                }
              }}
              themeMode={themeMode}
            />

            {/* Split Feature Visual Banners Grid */}
            <FeatureBannersGrid
              onOpenSettings={() => setSettingsModalOpen(true)}
              onOpenNotes={() => setNotesModalOpen(true)}
              onOpenAttachments={() => setAttachmentModalOpen(true)}
              onToggleOverlap={() =>
                handleSaveBranding({
                  ...branding,
                  enableScheduleOverlap: !branding.enableScheduleOverlap,
                })
              }
              enableOverlap={!!branding.enableScheduleOverlap}
              overlapExcludedCount={overlapStats.excludedCount}
              activeNotesCount={activeNotesCount}
              attachmentsCount={attachmentsCount}
              savedEmailsCount={savedEmails.length}
              onViewHistory={() => setActiveTab("history")}
              activeDatasetName={currentFileName}
              ordersCount={parseResult.orders.length}
              techCount={technicianRosters.length}
              onLoadSample={(sample) => {
                handleLoadSample(sample || SAMPLE_DATASETS[0]);
                setActiveTab("generator");
              }}
              themeMode={themeMode}
            />

            {/* Region Roster Selector Bar - Outside Email Preview, immediately displayed even when no CSV uploaded */}
            <RegionRosterSelectorBar
              selectedRegion={selectedRegion}
              defaultRegion={branding.defaultRegion || (typeof window !== "undefined" ? localStorage.getItem("nds_default_region") || "North East" : "North East")}
              onSelectRegion={handleRegionChange}
              activeDatasetLoaded={parseResult.orders.length > 0}
              totalOrdersCount={parseResult.orders.length}
              totalActiveTechs={technicianRosters.length}
              filteredTechsCount={filteredTechnicianRosters.length}
              rosterTechsCountByRegion={rosterTechsCountByRegion}
              activeOrdersTechsCountByRegion={technicianCountByRegion}
              techniciansInSelectedRegion={techniciansInSelectedRegion}
              onOpenSettings={() => setSettingsModalOpen(true)}
              themeMode={themeMode}
            />

            {/* CSV Dropzone Card */}
            <CsvUploadZone
              onFileUpload={handleFileUpload}
              onLoadSample={handleLoadSample}
              parseResult={parseResult}
              currentFileName={currentFileName}
              onOpenMappingModal={() => setMappingModalOpen(true)}
              onClear={handleClear}
              themeMode={themeMode}
            />

        {/* Technician Outlook Email Template Views */}
        <div id="email-generator-section" className="scroll-mt-24 space-y-6">
        {!isRegionTemplateActive(selectedRegion) ? (
          <UnderConstructionRegionCard
            region={selectedRegion}
            config={getRegionTemplateConfig(selectedRegion)}
            techniciansInRegion={techniciansInSelectedRegion}
            ordersCountForRegion={ordersCountForSelectedRegion}
            hasUploadedCsv={parseResult.orders.length > 0}
            onSelectRegion={handleRegionChange}
            onOpenSettings={() => setSettingsModalOpen(true)}
            themeMode={themeMode}
          />
        ) : technicianRosters.length > 0 ? (
          <div className="space-y-6">
            {/* Modernized Quick Dispatch Controls Bar */}
            <div
              className={`rounded-2xl p-4 shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4 transition-colors ${
                themeMode === "light"
                  ? "bg-white border border-blue-200 shadow-blue-900/5 text-slate-900"
                  : "bg-gradient-to-br from-[#0c183d]/95 to-[#07102b]/95 border border-blue-900/60 shadow-blue-950/40 text-white"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      themeMode === "light" ? "bg-blue-600" : "bg-emerald-400"
                    }`}
                  />
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      themeMode === "light" ? "text-blue-950" : "text-blue-200"
                    }`}
                  >
                    Technician Schedules
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    themeMode === "light"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : "bg-[#091436] text-amber-300 border-blue-700/60"
                  }`}
                >
                  {filteredTechnicianRosters.length} Active Technicians ({selectedRegion})
                </span>
                <button
                  onClick={handleClear}
                  className={`inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    themeMode === "light"
                      ? "text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
                      : "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/20"
                  }`}
                  title="Clear current generated emails and CSV file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Region Roster Selector Dropdown */}
                <div
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl shadow-2xs border ${
                    themeMode === "light"
                      ? "bg-blue-50/80 border-blue-200 text-blue-950"
                      : "bg-blue-950/70 border-blue-700/80 text-white"
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${themeMode === "light" ? "text-blue-600" : "text-blue-400"}`} />
                  <span className={`text-xs font-semibold ${themeMode === "light" ? "text-blue-900" : "text-blue-200"}`}>
                    Region:
                  </span>
                  <select
                    value={selectedRegion}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className={`text-xs font-semibold rounded-lg px-2.5 py-1 shadow-2xs focus:ring-1 focus:ring-blue-400 focus:outline-none cursor-pointer border ${
                      themeMode === "light"
                        ? "bg-white border-blue-300 text-blue-950"
                        : "bg-[#070e24] border-blue-600/80 text-blue-100"
                    }`}
                    title="Choose active dispatch Region Roster"
                  >
                    {REGION_ROSTERS.map((r) => {
                      const count = technicianCountByRegion[r] || 0;
                      return (
                        <option
                          key={r}
                          value={r}
                          className={themeMode === "light" ? "bg-white text-slate-900" : "bg-[#070e24] text-slate-100"}
                        >
                          {r} ({count})
                        </option>
                      );
                    })}
                  </select>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      themeMode === "light"
                        ? "text-blue-800 bg-white border-blue-200"
                        : "text-blue-300 bg-blue-900/70 border-blue-700"
                    }`}
                  >
                    {filteredTechnicianRosters.length} emails
                  </span>
                </div>

                {/* Save All to History Button */}
                <button
                  onClick={handleSaveAllToHistory}
                  className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer active:scale-95 ${
                    batchSaveFeedback
                      ? "bg-emerald-600 text-white"
                      : themeMode === "light"
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                      : "bg-amber-400 hover:bg-amber-300 text-stone-950 hover:shadow-amber-400/20"
                  }`}
                  title="Save generated technician emails to local history with auto-version tags"
                >
                  {batchSaveFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Saved All {filteredTechnicianRosters.length} Emails!</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className={`w-3.5 h-3.5 ${themeMode === "light" ? "text-white" : "text-stone-950"}`} />
                      <span>Save All ({filteredTechnicianRosters.length}) to History</span>
                    </>
                  )}
                </button>

                {/* No Schedule Notes Toggle */}
                <div
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl shadow-2xs border ${
                    themeMode === "light"
                      ? "bg-blue-50/80 border-blue-200"
                      : "bg-[#0e1c45]/90 border-blue-800/80"
                  }`}
                >
                  <FileX className={`w-3.5 h-3.5 ${themeMode === "light" ? "text-red-600" : "text-rose-400"}`} />
                  <span className={`text-xs font-semibold ${themeMode === "light" ? "text-blue-950" : "text-blue-100"}`}>
                    No Notes:
                  </span>
                  <button
                    onClick={() =>
                      handleSaveBranding({
                        ...branding,
                        disableScheduleNotes: !branding.disableScheduleNotes,
                      })
                    }
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-hidden cursor-pointer ${
                      branding.disableScheduleNotes
                        ? "bg-rose-600"
                        : themeMode === "light"
                        ? "bg-slate-300"
                        : "bg-blue-950"
                    }`}
                    title="Do not add notes from the <Schedule Notes> column to the locations in the email"
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        branding.disableScheduleNotes ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-[11px] font-bold ${themeMode === "light" ? "text-blue-800" : "text-blue-200"}`}>
                    {branding.disableScheduleNotes ? "ON (Omit)" : "Off"}
                  </span>
                </div>

                {/* Schedule Overlap Toggle & Work Week Dropdown Picker */}
                <div
                  className={`flex flex-wrap items-center gap-2.5 px-3 py-1.5 rounded-xl shadow-2xs border ${
                    themeMode === "light"
                      ? "bg-blue-50/80 border-blue-200"
                      : "bg-emerald-950/40 border-emerald-800/70"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Filter className={`w-3.5 h-3.5 ${themeMode === "light" ? "text-blue-600" : "text-emerald-400"}`} />
                    <span className={`text-xs font-semibold ${themeMode === "light" ? "text-blue-950" : "text-emerald-200"}`}>
                      Overlap:
                    </span>
                    <button
                      onClick={() =>
                        handleSaveBranding({
                          ...branding,
                          enableScheduleOverlap: !branding.enableScheduleOverlap,
                        })
                      }
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-hidden cursor-pointer ${
                        branding.enableScheduleOverlap
                          ? themeMode === "light"
                            ? "bg-blue-600"
                            : "bg-emerald-500"
                          : themeMode === "light"
                          ? "bg-slate-300"
                          : "bg-stone-700"
                      }`}
                      title="Exclude schedules with dates outside the selected work week"
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          branding.enableScheduleOverlap ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className={`text-[11px] font-bold ${themeMode === "light" ? "text-blue-800" : "text-emerald-300"}`}>
                      {branding.enableScheduleOverlap ? "Active" : "Off"}
                    </span>
                  </div>

                  {/* Work Week Dropdown Picker */}
                  <div
                    className={`flex items-center space-x-1.5 pl-2 border-l ${
                      themeMode === "light" ? "border-blue-200" : "border-emerald-800/80"
                    }`}
                  >
                    <CalendarDays className={`w-3.5 h-3.5 ${themeMode === "light" ? "text-blue-600" : "text-emerald-400"}`} />
                    <span className={`text-xs font-semibold ${themeMode === "light" ? "text-blue-950" : "text-emerald-300"}`}>
                      Week:
                    </span>
                    <select
                      value={branding.selectedWorkWeek || "current"}
                      onChange={(e) => {
                        const nextWeek = e.target.value;
                        handleSaveBranding({
                          ...branding,
                          selectedWorkWeek: nextWeek,
                        });
                      }}
                      className={`text-xs font-semibold rounded-lg px-2 py-1 shadow-2xs focus:ring-1 focus:outline-none cursor-pointer border ${
                        themeMode === "light"
                          ? "bg-white border-blue-300 text-blue-950 focus:ring-blue-400"
                          : "bg-[#070e24] border-emerald-700/80 text-emerald-100 focus:ring-emerald-400"
                      }`}
                      title="Select which work week to generate schedule for"
                    >
                      {workWeekOptions.map((opt) => (
                        <option
                          key={opt.id}
                          value={opt.id}
                          className={themeMode === "light" ? "bg-white text-slate-900" : "bg-[#070e24] text-slate-100"}
                        >
                          {opt.fullLabel}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Excluded overlap counter badge */}
                  {branding.enableScheduleOverlap && overlapStats.excludedCount > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        themeMode === "light"
                          ? "text-blue-800 bg-white border-blue-200"
                          : "text-emerald-300 bg-emerald-900/60 border-emerald-700"
                      }`}
                      title={`${overlapStats.excludedCount} job(s) from outside the selected work week are excluded from dispatch emails`}
                    >
                      {overlapStats.excludedCount} excluded
                    </span>
                  )}
                </div>

                {/* Sun - Sun (8-Day View) Toggle */}
                <div
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl shadow-2xs border ${
                    themeMode === "light"
                      ? "bg-blue-50/80 border-blue-200"
                      : "bg-indigo-950/40 border-indigo-800/70"
                  }`}
                >
                  <CalendarDays className={`w-3.5 h-3.5 ${themeMode === "light" ? "text-blue-600" : "text-indigo-400"}`} />
                  <span className={`text-xs font-semibold ${themeMode === "light" ? "text-blue-950" : "text-indigo-200"}`}>
                    Sun - Sun:
                  </span>
                  <button
                    onClick={() =>
                      handleSaveBranding({
                        ...branding,
                        enableSunSunView: !branding.enableSunSunView,
                      })
                    }
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-hidden cursor-pointer ${
                      branding.enableSunSunView
                        ? themeMode === "light"
                          ? "bg-blue-600"
                          : "bg-indigo-500"
                        : themeMode === "light"
                        ? "bg-slate-300"
                        : "bg-stone-700"
                    }`}
                    title="Add dated Sunday at the top and another dated Sunday at the bottom"
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        branding.enableSunSunView ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-[11px] font-bold ${themeMode === "light" ? "text-blue-800" : "text-indigo-300"}`}>
                    {branding.enableSunSunView ? "8-Day" : "Off"}
                  </span>
                </div>

                {/* Conduct Study Toggle */}
                <div
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl shadow-2xs border ${
                    themeMode === "light"
                      ? "bg-blue-50/80 border-blue-200"
                      : "bg-purple-950/40 border-purple-800/70"
                  }`}
                >
                  <ClipboardList className={`w-3.5 h-3.5 ${themeMode === "light" ? "text-blue-600" : "text-purple-400"}`} />
                  <span className={`text-xs font-semibold ${themeMode === "light" ? "text-blue-950" : "text-purple-200"}`}>
                    Conduct Study:
                  </span>
                  <button
                    onClick={() =>
                      handleSaveBranding({
                        ...branding,
                        enableConductStudy: !branding.enableConductStudy,
                      })
                    }
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-hidden cursor-pointer ${
                      branding.enableConductStudy
                        ? themeMode === "light"
                          ? "bg-blue-600"
                          : "bg-purple-500"
                        : themeMode === "light"
                        ? "bg-slate-300"
                        : "bg-stone-700"
                    }`}
                    title="Toggle Conduct Study formatting"
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        branding.enableConductStudy ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-[11px] font-bold ${themeMode === "light" ? "text-blue-800" : "text-purple-300"}`}>
                    {branding.enableConductStudy
                      ? (branding.conductStudyProjects && branding.conductStudyProjects.length > 0
                          ? `ON (${branding.conductStudyProjects.length})`
                          : "ON (All)")
                      : "OFF"}
                  </span>
                </div>

                {/* Email Update Toggle */}
                <div
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl shadow-2xs border ${
                    themeMode === "light"
                      ? "bg-blue-50/80 border-blue-200"
                      : "bg-amber-950/40 border-amber-800/70"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${themeMode === "light" ? "text-blue-600" : "text-amber-400"}`} />
                  <span className={`text-xs font-semibold ${themeMode === "light" ? "text-blue-950" : "text-amber-200"}`}>
                    Email Update:
                  </span>
                  <button
                    onClick={() =>
                      handleSaveBranding({
                        ...branding,
                        enableEmailUpdate: !branding.enableEmailUpdate,
                      })
                    }
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-hidden cursor-pointer ${
                      branding.enableEmailUpdate
                        ? themeMode === "light"
                          ? "bg-blue-600"
                          : "bg-amber-400"
                        : themeMode === "light"
                        ? "bg-slate-300"
                        : "bg-stone-700"
                    }`}
                    title="Toggle Email Update banner and subject suffix"
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        branding.enableEmailUpdate ? "translate-x-4" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span className={`text-[11px] font-bold ${themeMode === "light" ? "text-blue-800" : "text-amber-300"}`}>
                    {branding.enableEmailUpdate
                      ? `ON (v${branding.emailUpdateVersion || "2"})`
                      : "OFF"}
                  </span>
                </div>

                {/* Arrange New Project Toggle (Florida & South East only, when Email Update is enabled) */}
                {(selectedRegion === "Florida" || selectedRegion === "South East") && branding.enableEmailUpdate && (
                  <div
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl shadow-2xs border ${
                      themeMode === "light"
                        ? "bg-blue-50/80 border-blue-200"
                        : "bg-indigo-950/50 border-indigo-700/70"
                    }`}
                  >
                    <MoveVertical className={`w-3.5 h-3.5 ${themeMode === "light" ? "text-blue-600" : "text-indigo-400"}`} />
                    <span className={`text-xs font-semibold ${themeMode === "light" ? "text-blue-950" : "text-indigo-200"}`}>
                      Arrange New Project:
                    </span>
                    <button
                      onClick={() =>
                        handleSaveBranding({
                          ...branding,
                          enableArrangeNewProjects: !branding.enableArrangeNewProjects,
                        })
                      }
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-hidden cursor-pointer ${
                        branding.enableArrangeNewProjects
                          ? themeMode === "light"
                            ? "bg-blue-600"
                            : "bg-indigo-500"
                          : themeMode === "light"
                          ? "bg-slate-300"
                          : "bg-stone-700"
                      }`}
                      title="Toggle manual arrangement of Project Number sequence per Day"
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          branding.enableArrangeNewProjects ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className={`text-[11px] font-bold ${themeMode === "light" ? "text-blue-800" : "text-indigo-300"}`}>
                      {branding.enableArrangeNewProjects ? "ON" : "OFF"}
                    </span>
                    {branding.enableArrangeNewProjects && (
                      <button
                        onClick={() => {
                          setArrangeProjectsActiveRoster(filteredTechnicianRosters[0]);
                          setArrangeProjectsModalOpen(true);
                        }}
                        className="ml-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-md shadow-xs transition cursor-pointer"
                        title="Open Project Repositioning Panel"
                      >
                        Rearrange
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {filteredTechnicianRosters.length === 0 ? (
                <div
                  className={`rounded-2xl p-10 text-center space-y-4 shadow-xl transition-colors ${
                    themeMode === "light"
                      ? "bg-white border border-blue-200 shadow-blue-900/5 text-slate-900"
                      : "bg-gradient-to-br from-[#0c183d]/90 to-[#07102b]/95 border border-blue-900/50 shadow-blue-950/40 text-white"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto ${
                      themeMode === "light"
                        ? "bg-blue-50 border-blue-200 text-blue-600"
                        : "bg-blue-950/80 border-blue-800 text-blue-400"
                    }`}
                  >
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-base font-bold ${themeMode === "light" ? "text-blue-950" : "text-white"}`}>
                      No Active Work Orders or Technicians Detected
                    </h3>
                    <p className={`text-xs max-w-md mx-auto font-medium ${themeMode === "light" ? "text-slate-600" : "text-blue-200/70"}`}>
                      Upload a CSV schedule file to automatically generate formatted Outlook email templates for all assigned technicians using the <strong>{selectedRegion}</strong> regional template.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => document.getElementById("csv-file-input")?.click()}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-blue-600/20"
                    >
                      Upload CSV Schedule
                    </button>
                  </div>
                </div>
              ) : (
                filteredTechnicianRosters.map((roster) => {
                  const rosterRegionName = selectedRegion;
                  const rosterWithSelectedRegion: TechnicianRoster = {
                    ...roster,
                    region: selectedRegion as RegionRoster,
                  };
                  const rosterBranding: TemplateBranding = {
                    ...branding,
                    selectedRegion: selectedRegion,
                    regionName: rosterRegionName,
                  };
                  const { key: workWeekKey } = getWorkWeekKey(rosterWithSelectedRegion.date, rosterBranding);
                  const versionInfo = computeNextVersionInfo(rosterWithSelectedRegion.technicianName, workWeekKey, savedEmails);
                  const techWeekSaved = savedEmails.filter(
                    (r) =>
                      r.technicianName.trim().toLowerCase() === rosterWithSelectedRegion.technicianName.trim().toLowerCase() &&
                      r.workWeekKey === workWeekKey
                  );

                  return (
                    <OutlookEmailPreview
                      key={rosterWithSelectedRegion.technicianName}
                      roster={rosterWithSelectedRegion}
                      branding={rosterBranding}
                      currentStyle="exact_nds_template"
                      availableProjects={availableProjects}
                      nextVersionTag={versionInfo.versionTag}
                      savedVersionsCount={techWeekSaved.length}
                      onRecordDispatch={(method, status) => handleRecordDispatch(rosterWithSelectedRegion, method, status)}
                      onSaveToHistory={(customTag) => handleSaveTechnicianEmail(rosterWithSelectedRegion, customTag)}
                      onToggleAdditionalNotes={(val) =>
                        handleSaveBranding({
                          ...branding,
                          enableAdditionalNotes: val,
                        })
                      }
                      onOpenNotesModal={() => setNotesModalOpen(true)}
                      onToggleNoScheduleNotes={(val) =>
                        handleSaveBranding({
                          ...branding,
                          disableScheduleNotes: val,
                        })
                      }
                      onToggleCustomId={(val) =>
                        handleSaveBranding({
                          ...branding,
                          enableCustomId: val,
                        })
                      }
                      onUpdateCustomIdProjects={(projs) =>
                        handleSaveBranding({
                          ...branding,
                          customIdProjects: projs,
                        })
                      }
                      onToggleConductStudy={(val) =>
                        handleSaveBranding({
                          ...branding,
                          enableConductStudy: val,
                        })
                      }
                      onUpdateConductStudyProjects={(projs) =>
                        handleSaveBranding({
                          ...branding,
                          conductStudyProjects: projs,
                        })
                      }
                      onToggleEmailUpdate={(val) =>
                        handleSaveBranding({
                          ...branding,
                          enableEmailUpdate: val,
                        })
                      }
                      onUpdateEmailUpdateConfig={(cfg) =>
                        handleSaveBranding({
                          ...branding,
                          emailUpdateType: cfg.type !== undefined ? cfg.type : branding.emailUpdateType,
                          emailUpdateVersion: cfg.version !== undefined ? cfg.version : branding.emailUpdateVersion,
                          emailUpdateNotes: cfg.notes !== undefined ? cfg.notes : branding.emailUpdateNotes,
                        })
                      }
                      onToggleArrangeNewProjects={(val) =>
                        handleSaveBranding({
                          ...branding,
                          enableArrangeNewProjects: val,
                        })
                      }
                      onOpenArrangeProjectsModal={() => {
                        setArrangeProjectsActiveRoster(rosterWithSelectedRegion);
                        setArrangeProjectsModalOpen(true);
                      }}
                      onOpenAttachmentModal={() => setAttachmentModalOpen(true)}
                      onUpdateAttachments={(atts) => handleSaveBranding({ ...branding, attachments: atts })}
                      themeMode={themeMode}
                    />
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div
            className={`p-12 text-center rounded-2xl border shadow-xl space-y-4 max-w-2xl mx-auto my-8 transition-colors ${
              themeMode === "light"
                ? "bg-white border-blue-200 shadow-blue-900/5 text-slate-900"
                : "bg-gradient-to-br from-[#0c1c44] to-[#07122e] border-blue-900/60 shadow-blue-950/50 text-white"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto shadow-inner ${
                themeMode === "light"
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "bg-blue-950/80 border-blue-800/80 text-blue-400"
              }`}
            >
              <Mail className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className={`font-bold text-base ${themeMode === "light" ? "text-blue-950" : "text-white"}`}>
                Outlook Email Template Viewer
              </h3>
              <p className={`text-sm max-w-md mx-auto font-medium ${themeMode === "light" ? "text-slate-600" : "text-blue-200/80"}`}>
                Upload a schedule CSV file above to automatically generate formatted Outlook email templates for your assigned technicians.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => document.getElementById("csv-file-input")?.click()}
                className="inline-flex items-center space-x-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <span>Upload Schedule CSV</span>
              </button>
            </div>
          </div>
        )}
        </div>
        </>
        )}
      </main>

      {/* Global Footer with All Rights Reserved & Watermark Developer Credit */}
      <Footer themeMode={themeMode} />

      {/* Modals */}
      <SavedEmailHistoryModal
        isOpen={savedHistoryModalOpen}
        onClose={() => setSavedHistoryModalOpen(false)}
        savedEmails={savedEmails}
        onUpdateTag={handleUpdateSavedTag}
        onDeleteEmail={handleDeleteSavedEmail}
        onClearAll={handleClearAllSaved}
      />

      <ColumnMappingModal
        isOpen={mappingModalOpen}
        onClose={() => setMappingModalOpen(false)}
        headers={parseResult.headers}
        currentMapping={parseResult.mapping}
        sampleRows={parseResult.rawRows}
        onSaveMapping={(newMap) => setCustomMapping(newMap)}
      />

      <DispatchHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        logs={dispatchLogs}
        onClearLogs={handleClearLogs}
      />

      <SettingsBrandingModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        branding={branding}
        availableProjects={availableProjects}
        onSaveBranding={handleSaveBranding}
      />

      <AdditionalNotesModal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        branding={branding}
        onSaveBranding={handleSaveBranding}
        activeRegion={selectedRegion}
        availableProjects={availableProjects}
      />

      <AttachmentManagerModal
        isOpen={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        attachments={branding.attachments || []}
        onUpdateAttachments={(atts) => handleSaveBranding({ ...branding, attachments: atts })}
        rosters={technicianRosters}
      />

      <ArrangeProjectsModal
        isOpen={arrangeProjectsModalOpen}
        onClose={() => setArrangeProjectsModalOpen(false)}
        branding={{
          ...branding,
          selectedRegion: selectedRegion,
          regionName: selectedRegion,
        }}
        onSaveBranding={handleSaveBranding}
        activeRoster={arrangeProjectsActiveRoster || filteredTechnicianRosters[0]}
        availableRosters={filteredTechnicianRosters}
        allOrders={parseResult.orders}
      />
    </div>
  );
}
