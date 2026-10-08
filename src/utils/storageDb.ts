import { EmailAttachment, SavedEmailRecord, TemplateBranding } from "../types";

const DB_NAME = "techdispatch_db";
const DB_VERSION = 1;
const ATTACHMENTS_STORE = "attachments";
const SAVED_EMAILS_STORE = "saved_emails";

// In-memory fallback if IndexedDB is unavailable in certain sandboxed environments
const memoryStore = {
  attachments: new Map<string, EmailAttachment>(),
  savedEmails: new Map<string, SavedEmailRecord>(),
};

/**
 * Opens or initializes the IndexedDB database
 */
function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(ATTACHMENTS_STORE)) {
          db.createObjectStore(ATTACHMENTS_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(SAVED_EMAILS_STORE)) {
          db.createObjectStore(SAVED_EMAILS_STORE, { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (err) => {
        console.warn("[IndexedDB] Could not open database, using in-memory store:", err);
        resolve(null);
      };

      request.onblocked = () => {
        console.warn("[IndexedDB] Database open blocked by another tab/process");
        resolve(null);
      };
    } catch (e) {
      console.warn("[IndexedDB] Exception opening database:", e);
      resolve(null);
    }
  });
}

// ---------------------------------------------------------------------------
// Attachment IndexedDB Operations
// ---------------------------------------------------------------------------

/**
 * Stores full attachments (including base64 and dataUrl) into IndexedDB
 */
export async function storeAttachmentsInDb(attachments: EmailAttachment[]): Promise<void> {
  if (!attachments || attachments.length === 0) return;

  // Update in-memory fallback
  attachments.forEach((a) => memoryStore.attachments.set(a.id, a));

  const db = await openDb();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(ATTACHMENTS_STORE, "readwrite");
      const store = tx.objectStore(ATTACHMENTS_STORE);

      attachments.forEach((att) => {
        store.put(att);
      });

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      resolve();
    }
  });
}

/**
 * Retrieves all full attachments from IndexedDB
 */
export async function getAllAttachmentsFromDb(): Promise<EmailAttachment[]> {
  const db = await openDb();
  if (!db) {
    return Array.from(memoryStore.attachments.values());
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(ATTACHMENTS_STORE, "readonly");
      const store = tx.objectStore(ATTACHMENTS_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as EmailAttachment[];
        db.close();
        // Sync to in-memory store
        results.forEach((a) => memoryStore.attachments.set(a.id, a));
        resolve(results);
      };

      req.onerror = () => {
        db.close();
        resolve(Array.from(memoryStore.attachments.values()));
      };
    } catch {
      resolve(Array.from(memoryStore.attachments.values()));
    }
  });
}

/**
 * Deletes a single attachment from IndexedDB
 */
export async function deleteAttachmentFromDb(id: string): Promise<void> {
  memoryStore.attachments.delete(id);
  const db = await openDb();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(ATTACHMENTS_STORE, "readwrite");
      const store = tx.objectStore(ATTACHMENTS_STORE);
      store.delete(id);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      resolve();
    }
  });
}

/**
 * Clears all attachments in IndexedDB
 */
export async function clearAttachmentsInDb(): Promise<void> {
  memoryStore.attachments.clear();
  const db = await openDb();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(ATTACHMENTS_STORE, "readwrite");
      const store = tx.objectStore(ATTACHMENTS_STORE);
      store.clear();
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      resolve();
    }
  });
}

// ---------------------------------------------------------------------------
// Saved Email IndexedDB Operations
// ---------------------------------------------------------------------------

/**
 * Persists all saved emails into IndexedDB (no 5MB quota limit)
 */
export async function storeSavedEmailsInDb(records: SavedEmailRecord[]): Promise<void> {
  if (!records) return;

  records.forEach((r) => memoryStore.savedEmails.set(r.id, r));

  const db = await openDb();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SAVED_EMAILS_STORE, "readwrite");
      const store = tx.objectStore(SAVED_EMAILS_STORE);

      records.forEach((record) => {
        store.put(record);
      });

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      resolve();
    }
  });
}

/**
 * Retrieves all saved emails from IndexedDB
 */
export async function getAllSavedEmailsFromDb(): Promise<SavedEmailRecord[]> {
  const db = await openDb();
  if (!db) {
    return Array.from(memoryStore.savedEmails.values());
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SAVED_EMAILS_STORE, "readonly");
      const store = tx.objectStore(SAVED_EMAILS_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as SavedEmailRecord[];
        db.close();
        results.forEach((r) => memoryStore.savedEmails.set(r.id, r));
        resolve(results);
      };

      req.onerror = () => {
        db.close();
        resolve(Array.from(memoryStore.savedEmails.values()));
      };
    } catch {
      resolve(Array.from(memoryStore.savedEmails.values()));
    }
  });
}

/**
 * Deletes a single saved email from IndexedDB
 */
export async function deleteSavedEmailFromDb(id: string): Promise<void> {
  memoryStore.savedEmails.delete(id);
  const db = await openDb();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SAVED_EMAILS_STORE, "readwrite");
      const store = tx.objectStore(SAVED_EMAILS_STORE);
      store.delete(id);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      resolve();
    }
  });
}

/**
 * Clears all saved emails in IndexedDB
 */
export async function clearSavedEmailsInDb(): Promise<void> {
  memoryStore.savedEmails.clear();
  const db = await openDb();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(SAVED_EMAILS_STORE, "readwrite");
      const store = tx.objectStore(SAVED_EMAILS_STORE);
      store.clear();
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      resolve();
    }
  });
}

// ---------------------------------------------------------------------------
// LocalStorage Quota Protections & Sanitizers
// ---------------------------------------------------------------------------

/**
 * Strips bulky base64 data and data URLs from attachments for lean storage in localStorage.
 * Keeps all vital metadata: id, name, size, type, technicianScope, createdAt.
 */
export function sanitizeBrandingForLocalStorage(branding: TemplateBranding): TemplateBranding {
  if (!branding.attachments || branding.attachments.length === 0) {
    return branding;
  }

  const leanAttachments: EmailAttachment[] = branding.attachments.map((att) => ({
    id: att.id,
    name: att.name,
    size: att.size,
    type: att.type,
    dataBase64: "", // Strip base64 payload from localStorage
    dataUrl: undefined,
    technicianScope: att.technicianScope,
    createdAt: att.createdAt,
  }));

  return {
    ...branding,
    attachments: leanAttachments,
  };
}

/**
 * Sanitizes an array of saved emails for localStorage storage:
 * - Strips bulky base64 payload from attached files (keeping metadata)
 * - Limits to the most recent `maxRecords` (default 30) so localStorage never exceeds quota
 */
export function sanitizeSavedEmailsForLocalStorage(
  records: SavedEmailRecord[],
  maxRecords = 30
): SavedEmailRecord[] {
  if (!records) return [];

  const limited = records.slice(0, maxRecords);
  return limited.map((r) => ({
    ...r,
    attachments: (r.attachments || []).map((att) => ({
      id: att.id,
      name: att.name,
      size: att.size,
      type: att.type,
      dataBase64: "",
      dataUrl: undefined,
      technicianScope: att.technicianScope,
      createdAt: att.createdAt,
    })),
  }));
}

/**
 * Safely writes to localStorage with automatic quota recovery.
 * Never throws an uncaught error.
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[SafeStorage] localStorage quota reached when saving "${key}". Running automated recovery...`);

    // 1. If key is techdispatch_branding, strip all attachment payload data
    if (key === "techdispatch_branding") {
      try {
        const parsed = JSON.parse(value);
        const stripped = sanitizeBrandingForLocalStorage(parsed);
        window.localStorage.setItem(key, JSON.stringify(stripped));
        console.log(`[SafeStorage] Successfully saved sanitized branding without base64.`);
        return true;
      } catch {
        // continue
      }
    }

    // 2. If key is techdispatch_saved_emails, aggressively reduce records count
    if (key === "techdispatch_saved_emails") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const minimal = sanitizeSavedEmailsForLocalStorage(parsed, 10);
          window.localStorage.setItem(key, JSON.stringify(minimal));
          console.log(`[SafeStorage] Successfully saved trimmed saved emails.`);
          return true;
        }
      } catch {
        // continue
      }
    }

    // 3. Purge non-critical cache keys
    try {
      window.localStorage.removeItem("techdispatch_logs");
      window.localStorage.setItem(key, value);
      console.log(`[SafeStorage] Saved "${key}" after clearing old dispatch logs.`);
      return true;
    } catch {
      // 4. Last resort: if still overflowing, log a clean warning and keep data in memory
      console.warn(
        `[SafeStorage] LocalStorage quota fully exhausted. Data safely retained in memory & IndexedDB.`
      );
      return false;
    }
  }
}

/**
 * Initial boot cleanup to purge existing bloated keys from localStorage
 * so that previous QuotaExceededError states are resolved instantly.
 */
export function cleanBloatedLocalStorage(): void {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    // 1. Clean branding if it has huge base64 attachments
    const rawBranding = window.localStorage.getItem("techdispatch_branding");
    if (rawBranding && rawBranding.length > 50000) {
      try {
        const parsed = JSON.parse(rawBranding);
        const sanitized = sanitizeBrandingForLocalStorage(parsed);
        window.localStorage.setItem("techdispatch_branding", JSON.stringify(sanitized));
      } catch {
        // ignore
      }
    }

    // 2. Clean saved emails if base64 is present
    const rawEmails = window.localStorage.getItem("techdispatch_saved_emails");
    if (rawEmails && rawEmails.length > 500000) {
      try {
        const parsed = JSON.parse(rawEmails);
        if (Array.isArray(parsed)) {
          const sanitized = sanitizeSavedEmailsForLocalStorage(parsed, 20);
          window.localStorage.setItem("techdispatch_saved_emails", JSON.stringify(sanitized));
        }
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.warn("[SafeStorage] Cleanup warning:", err);
  }
}
