import { EmailAttachment, SavedEmailRecord, TechnicianRoster, TemplateBranding } from "../types";
import {
  generateEmailSubject,
  generateOutlookHtml,
  generatePlainTextEmail,
  getWeekDateRange,
  formatToMMDDYYYY,
  getTechnicianAttachments,
} from "./outlookTemplateGenerator";
import {
  safeSetLocalStorage,
  sanitizeSavedEmailsForLocalStorage,
  storeSavedEmailsInDb,
  getAllSavedEmailsFromDb,
  deleteSavedEmailFromDb,
  clearSavedEmailsInDb,
} from "./storageDb";

export const SAVED_EMAILS_STORAGE_KEY = "techdispatch_saved_emails";

/**
 * Loads all saved email records from localStorage synchronously
 */
export function getSavedEmails(): SavedEmailRecord[] {
  try {
    const raw = localStorage.getItem(SAVED_EMAILS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to load saved emails from localStorage:", err);
    return [];
  }
}

/**
 * Loads saved emails asynchronously from IndexedDB (complete with full attachments if stored)
 */
export async function loadSavedEmailsFromDb(): Promise<SavedEmailRecord[]> {
  try {
    const fromDb = await getAllSavedEmailsFromDb();
    if (fromDb && fromDb.length > 0) {
      return fromDb;
    }
  } catch (err) {
    console.warn("Could not load from IndexedDB:", err);
  }
  return getSavedEmails();
}

/**
 * Persists an array of saved email records safely:
 * 1. Full data into IndexedDB (unlimited quota)
 * 2. Lean metadata copy (stripped base64) into localStorage
 */
export function persistSavedEmails(records: SavedEmailRecord[]): void {
  // 1. Asynchronously store complete records into IndexedDB
  storeSavedEmailsInDb(records).catch((err) => {
    console.warn("[StorageDb] Error persisting saved emails to IndexedDB:", err);
  });

  // 2. Safely store sanitized, quota-safe records into localStorage
  try {
    const sanitized = sanitizeSavedEmailsForLocalStorage(records, 30);
    safeSetLocalStorage(SAVED_EMAILS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn("[StorageDb] Exception during localStorage write:", err);
  }
}

/**
 * Computes a standardized work week key (e.g., Sunday start date YYYY-MM-DD)
 */
export function getWorkWeekKey(dateStr: string, branding?: TemplateBranding): { key: string; formatted: string } {
  const weekInfo = getWeekDateRange(dateStr, branding);
  const sunday = weekInfo.sundayDate;
  const yyyy = sunday.getFullYear();
  const mm = String(sunday.getMonth() + 1).padStart(2, "0");
  const dd = String(sunday.getDate()).padStart(2, "0");
  const key = `${yyyy}-${mm}-${dd}`;
  return {
    key,
    formatted: weekInfo.formattedRange,
  };
}

/**
 * Calculates the next version tag for a technician in a given work week.
 * - 0 previous versions -> "Initial" (versionNumber = 1, isInitialVersion = true)
 * - 1 previous version -> "v.2" (versionNumber = 2, isInitialVersion = false)
 * - N previous versions -> `v.${N + 1}`
 */
export function computeNextVersionInfo(
  technicianName: string,
  workWeekKey: string,
  existingRecords: SavedEmailRecord[]
): { versionNumber: number; versionTag: string; isInitialVersion: boolean } {
  const normTech = (technicianName || "").trim().toLowerCase();
  const techWeekMatches = existingRecords.filter(
    (r) =>
      r.technicianName.trim().toLowerCase() === normTech &&
      (r.workWeekKey === workWeekKey || !workWeekKey)
  );

  if (techWeekMatches.length === 0) {
    return {
      versionNumber: 1,
      versionTag: "Initial",
      isInitialVersion: true,
    };
  }

  // Find highest version number in this work week
  const maxVersion = Math.max(
    ...techWeekMatches.map((r) => r.versionNumber || 1),
    techWeekMatches.length
  );
  const nextNum = maxVersion + 1;

  return {
    versionNumber: nextNum,
    versionTag: `v.${nextNum}`,
    isInitialVersion: false,
  };
}

/**
 * Builds a new SavedEmailRecord from a technician roster and branding config
 */
export function createSavedEmailRecord(
  roster: TechnicianRoster,
  branding: TemplateBranding,
  customTag?: string,
  existingList: SavedEmailRecord[] = getSavedEmails()
): SavedEmailRecord {
  const { key: workWeekKey, formatted: workWeekFormatted } = getWorkWeekKey(roster.date, branding);
  const versionInfo = computeNextVersionInfo(roster.technicianName, workWeekKey, existingList);

  const subject = generateEmailSubject(roster, branding);
  const htmlBody = generateOutlookHtml(roster, branding, "exact_nds_template");
  const plainText = generatePlainTextEmail(roster, branding);

  const ordersSummary = (roster.orders || []).map((o) => ({
    orderNumber: o.orderNumber,
    locationId: o.locationId,
    locationName: o.customerName || o.serviceAddress || "",
    taskCategory: o.taskCategory,
    date: o.date,
    priority: o.priority,
  }));

  const techAttachments = getTechnicianAttachments(roster, branding);
  const attachmentsSummary = techAttachments.map((a) => a.name);

  const notesSnapshot = (branding.additionalNotes || [])
    .filter((n) => n.enabled)
    .map((n) => n.label);

  const finalTag = (customTag && customTag.trim()) ? customTag.trim() : versionInfo.versionTag;

  return {
    id: `saved_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    technicianName: roster.technicianName,
    technicianEmail: roster.technicianEmail,
    workWeekKey,
    workWeekFormatted,
    versionTag: finalTag,
    versionNumber: versionInfo.versionNumber,
    isInitialVersion: versionInfo.isInitialVersion,
    createdAt: new Date().toISOString(),
    subject,
    htmlBody,
    plainText,
    jobCount: roster.orders.length,
    ordersSummary,
    attachmentsSummary,
    attachments: techAttachments,
    notesSnapshot,
    customIdEnabled: branding.enableCustomId,
    conductStudyEnabled: branding.enableConductStudy,
    conductStudyProjects: branding.conductStudyProjects,
    emailUpdateEnabled: branding.enableEmailUpdate,
    emailUpdateType: branding.emailUpdateType,
    emailUpdateVersion: branding.emailUpdateVersion,
  };
}

/**
 * Finds attachments from the latest saved email record for a specific technician and work week.
 * Returns empty array if none found.
 */
export function findHistoryAttachmentsForTech(
  technicianName: string,
  workWeekKey: string,
  existingRecords: SavedEmailRecord[] = getSavedEmails()
): EmailAttachment[] {
  const normTech = (technicianName || "").trim().toLowerCase();
  const matchingRecords = existingRecords.filter(
    (r) =>
      r.technicianName.trim().toLowerCase() === normTech &&
      (r.workWeekKey === workWeekKey || !workWeekKey)
  );

  if (matchingRecords.length === 0) return [];

  // Sort by createdAt descending to pick the most recent saved version
  matchingRecords.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  for (const rec of matchingRecords) {
    if (rec.attachments && rec.attachments.length > 0) {
      return rec.attachments;
    }
  }

  return [];
}

/**
 * Given a list of technician rosters and current work week, pre-fills any attachments
 * saved in previous email history for those technicians on that same work week.
 */
export function prefillRosterAttachmentsFromHistory(
  rosters: TechnicianRoster[],
  branding: TemplateBranding,
  existingRecords: SavedEmailRecord[] = getSavedEmails()
): EmailAttachment[] {
  const currentAttachments = [...(branding.attachments || [])];
  const newAttachments: EmailAttachment[] = [];

  rosters.forEach((roster) => {
    const { key: workWeekKey } = getWorkWeekKey(roster.date, branding);
    const historyAtts = findHistoryAttachmentsForTech(
      roster.technicianName,
      workWeekKey,
      existingRecords
    );

    historyAtts.forEach((att) => {
      // Avoid duplicate by ID or same name+scope
      const existsInCurrent = currentAttachments.some(
        (c) => c.id === att.id || (c.name === att.name && (c.technicianScope === att.technicianScope || c.technicianScope === roster.technicianName))
      );
      const existsInNew = newAttachments.some(
        (c) => c.id === att.id || (c.name === att.name && (c.technicianScope === att.technicianScope || c.technicianScope === roster.technicianName))
      );

      if (!existsInCurrent && !existsInNew) {
        newAttachments.push({
          ...att,
          technicianScope: att.technicianScope === "all" ? "all" : roster.technicianName,
        });
      }
    });
  });

  return [...currentAttachments, ...newAttachments];
}

/**
 * Saves a single email record to localStorage and returns updated list
 */
export function saveEmailRecord(record: SavedEmailRecord): SavedEmailRecord[] {
  const list = getSavedEmails();
  const updated = [record, ...list];
  persistSavedEmails(updated);
  return updated;
}

/**
 * Batch saves all technician rosters at once, auto-versioning each one
 */
export function saveAllRostersToHistory(
  rosters: TechnicianRoster[],
  branding: TemplateBranding
): { savedRecords: SavedEmailRecord[]; updatedList: SavedEmailRecord[] } {
  let currentList = getSavedEmails();
  const newlySaved: SavedEmailRecord[] = [];

  rosters.forEach((roster) => {
    const record = createSavedEmailRecord(roster, branding, undefined, currentList);
    newlySaved.push(record);
    currentList = [record, ...currentList];
  });

  persistSavedEmails(currentList);
  return { savedRecords: newlySaved, updatedList: currentList };
}

/**
 * Updates a saved email's version tag or notes in localStorage
 */
export function updateSavedEmailTag(id: string, newTag: string): SavedEmailRecord[] {
  const list = getSavedEmails();
  const updated = list.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        versionTag: newTag.trim() || item.versionTag,
      };
    }
    return item;
  });
  persistSavedEmails(updated);
  return updated;
}

/**
 * Deletes a single saved email record by ID
 */
export function deleteSavedEmail(id: string): SavedEmailRecord[] {
  deleteSavedEmailFromDb(id).catch((err) => {
    console.warn("[StorageDb] Error deleting email from IndexedDB:", err);
  });
  const list = getSavedEmails();
  const updated = list.filter((item) => item.id !== id);
  persistSavedEmails(updated);
  return updated;
}

/**
 * Clears all saved email history from localStorage and IndexedDB
 */
export function clearAllSavedEmails(): SavedEmailRecord[] {
  clearSavedEmailsInDb().catch((err) => {
    console.warn("[StorageDb] Error clearing IndexedDB emails:", err);
  });
  persistSavedEmails([]);
  return [];
}
