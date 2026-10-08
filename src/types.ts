export type PriorityLevel = "Urgent" | "High" | "Normal" | "Low";

export type RegionRoster =
  | "North East"
  | "Mid Atlantic"
  | "South East"
  | "Florida"
  | "NYC"
  | "NOCAL"
  | "SOCAL"
  | "Mid West";

export const REGION_ROSTERS: RegionRoster[] = [
  "North East",
  "Mid Atlantic",
  "South East",
  "Florida",
  "NYC",
  "NOCAL",
  "SOCAL",
  "Mid West",
];

export interface WorkOrder {
  id: string;
  orderNumber: string;
  locationId?: string; // Location ID e.g. "26-999999-001"
  projectNumber?: string; // Parsed Project Number e.g. "26-999999" (without -001)
  technicianName: string;
  technicianEmail: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "08:00 AM - 10:00 AM" or "09:00"
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceAddress: string;
  cityState?: string; // e.g. "Dallas, TX"
  countyParish?: string; // e.g. "Vermilion Parish" or from "Different County (from Locations)"
  workWeek?: string; // e.g. "Work Week 32" or "32"
  region?: string; // Region e.g. "North East", "Mid Atlantic", etc.
  jobType: string; // Service Type e.g. "TMC", "Miovision"
  taskCategory?: "Install" | "Teardown" | "BatterySwap"; // Install, Teardown, or SD Card & Battery Swap
  serviceTypeAddOns?: string; // Service Type Add Ons (from Project ID) (from Locations)
  cameraCounts?: string; // Camera Counts e.g. "2 cameras" or "0 cameras"
  backupUnits?: string; // Backup Units column e.g. "1 backup" or "1"
  scheduleNotes?: string; // Schedule Notes e.g. "East corner pole", "Requires bucket truck"
  scheduleDetails?: string; // Schedule Details e.g. "1 Day: Tue/Wed/Thu = TBD", "24-hr"
  teardownTimeNotes?: string; // Teardown Time Notes e.g. "Anytime"
  daysOfCollection?: string; // Days of collection e.g. "3-day"
  setupBefore?: string; // Setup Before timestamp from CSV e.g. "08/27/2026 08:00"
  teardownAfter?: string; // Teardown After timestamp from CSV e.g. "08/29/2026 17:00"
  scheduleOrder?: number | string; // Sequence / order from "Schedule Order" column
  batteryCheckDates?: string[]; // Battery Change/Equipment Check 1..N dates
  customId?: string; // Custom ID from "Custom ID (from Locations)" column e.g. "111223344"
  priority: PriorityLevel;
  description: string;
  specialInstructions?: string;
  requiredParts?: string;
  estimatedDurationMin?: number;
  method?: string;
  status?: "Scheduled" | "In Progress" | "Completed" | "Pending Parts";
  rawRowData?: Record<string, string>;
}

export interface ColumnMapping {
  orderNumber: string;
  locationId: string;
  method: string;
  serviceType: string;
  serviceTypeAddOns: string;
  cityState: string;
  countyParish: string;
  workWeek: string;
  region: string;
  cameraCounts: string;
  backupUnits: string;
  scheduleNotes: string;
  scheduleDetails: string;
  taskCategory: string;
  teardownTimeNotes: string;
  daysOfCollection: string;
  setupBefore: string;
  teardownAfter: string;
  scheduleOrder: string;
  batteryCheckPrefix: string;
  technicianName: string;
  technicianEmail: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceAddress: string;
  jobType: string;
  priority: string;
  description: string;
  specialInstructions: string;
  requiredParts: string;
  estimatedDurationMin: string;
  customId: string;
}

export interface AIBriefing {
  briefing: string;
  keyHighlights: string[];
  safetyAlert: string;
  suggestedRouteTip?: string;
}

export interface TechnicianRoster {
  technicianName: string;
  technicianEmail: string;
  airtableUrl?: string;
  date: string;
  orders: WorkOrder[];
  totalEstimatedMinutes: number;
  urgentCount: number;
  highCount: number;
  normalCount: number;
  aiBriefing?: AIBriefing;
  customDispatcherNote?: string;
  region?: string; // Resolved region e.g. "North East", "Mid Atlantic", etc.
}

export interface TechnicianAirtableEntry {
  name: string;
  airtableUrl: string;
  email?: string;
  region?: string;
  active?: boolean;
}

export interface AdditionalNotePreset {
  id: string;
  label: string;
  text: string;
  subText?: string;
  enabled: boolean;
  isCustom?: boolean;
  targetDays?: string[]; // e.g. ["All"] or ["Monday", "Tuesday"]
  targetProjects?: string[]; // e.g. ["All"] or ["26-410082"]
  targetCategory?: "All" | "Install" | "Teardown" | "BatterySwap";
  targetRegions?: string[]; // e.g. ["North East", "Mid Atlantic"] or ["Florida", "South East"]
  autoTriggerType?:
    | "tmc_install"
    | "alg_atr_install"
    | "tmc_atr_install"
    | "speed_teardown_swap"
    | "priority_client_upload"
    | "meeting_auburn"
    | "meeting_nyc"
    | "kmz_placement"
    | "parking_inventory"
    | "green_batteries"
    | "fl_se_day_note"
    | "ne_ma_nationwide"
    | "ne_ma_inclement_weather"
    | "ne_ma_que"
    | "ne_ma_tmc_updated"
    | "ne_ma_working_together"
    | "ne_ma_parking_study"
    | "ne_ma_rlv"
    | "ne_ma_priority_client"
    | "ne_ma_hard_due_date"
    | "ne_ma_asap"
    | "ne_ma_mainline"
    | "custom";
  isFloridaOrSouthEastNote?: boolean;
  isNorthEastOrMidAtlanticNote?: boolean;
  dayPrefixDay?: string; // e.g. "Monday", "Tuesday", etc.
  dayPrefixAction?: "installs" | "Teardowns" | "installs/Teardowns"; // e.g. "installs" or "Teardowns"
  customNoteBody?: string; // pure content after the prefix
}

export type TemplateStyle = "exact_nds_template" | "modern_executive" | "field_cards" | "compact_table" | "safety_priority";

export interface TemplateBranding {
  companyName: string;
  dispatcherName: string;
  dispatcherTitle: string;
  replyToEmail: string;
  supportPhone: string;
  primaryColor: string; // Hex e.g. #0078D4 (Outlook Blue)
  accentColor: string; // Hex
  includeMapLinks: boolean;
  includeChecklist: boolean;
  customDisclaimer: string;
  greetingPrefix: string;
  emergencyHotline?: string;
  regionName?: string; // e.g. "Northeast", "South Central"
  selectedRegion?: string; // Selected Region Roster e.g. "all" | "North East" | "Mid Atlantic" etc.
  defaultRegion?: string; // User-selected default template region (persisted locally)
  // Specific fields for the exact Outlook template
  photoUploadLinkText?: string;
  photoUploadUrl?: string;
  airtableBaseUrl?: string;
  googleMapsBaseUrl?: string;
  privateJobsNotice?: string;
  dataUploadEmail?: string;
  weekStartDate?: string;
  weekEndDate?: string;
  useAnytimeTeardowns?: boolean;
  ladotdExclusive?: boolean;
  // Additional Notes toggle and preset notes
  enableAdditionalNotes?: boolean;
  additionalNotes?: AdditionalNotePreset[];
  // Custom ID toggle and project selection
  enableCustomId?: boolean; // "Add Custom ID" toggle
  customIdProjects?: string[]; // Selected project numbers e.g. ["26-450455"] or ["All"]
  // Email Update toggle and configuration
  enableEmailUpdate?: boolean; // "Email Update" toggle
  emailUpdateType?: "documentary" | "schedule"; // "For Documentary" vs "Schedule Update"
  emailUpdateVersion?: string | number; // e.g. "2"
  emailUpdateNotes?: string; // e.g. "I added two meetings to your schedule..."
  // Arrange New Project toggle and custom project sequence (Florida & South East only)
  enableArrangeNewProjects?: boolean; // "Arrange New Project" toggle
  customDayProjectOrder?: Record<string, string[]>; // dayName/dayKey -> ordered projectNumbers
  customTechDayProjectOrder?: Record<string, Record<string, string[]>>; // techName -> dayName/dayKey -> ordered projectNumbers
  // Schedule Overlap detection & filtering toggle
  enableScheduleOverlap?: boolean; // When enabled, detects and excludes schedules out of the active workweek range
  selectedWorkWeek?: "current" | "incoming" | string; // Selected work week ("current" | "incoming" or custom week identifier)
  // Sun - Sun 8-day view toggle
  enableSunSunView?: boolean; // When enabled, adds an additional Sunday section at the bottom and labels top and bottom Sunday with dates (e.g. Sunday 09/06 ... Sunday 09/13)
  // No Schedule Notes toggle
  disableScheduleNotes?: boolean; // When enabled ("No Schedule Notes"), disregards/omits notes from <Schedule Notes> column on location bullets
  // Conduct Study toggle and project selection
  enableConductStudy?: boolean; // "Conduct Study" toggle
  conductStudyProjects?: string[]; // Selected project numbers e.g. ["26-410095"] or ["All"]
  // Technician Roster & Individual Airtable Links
  technicianAirtableLinks?: TechnicianAirtableEntry[];
  // File Attachments (KMZ, PDF, CSV, XLSX, etc.)
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: number; // File size in bytes
  type: string; // MIME type or extension identifier
  dataBase64: string; // Base64 payload without prefix
  dataUrl?: string; // Data URL for download/preview
  technicianScope?: "all" | string; // "all" or specific technician name
  createdAt?: string;
}

export interface AutomationConfig {
  enabled: boolean;
  dailyTime: string; // e.g. "07:00" (24h)
  targetStrategy: "today" | "tomorrow" | "upcoming_48h" | "all";
  sendMode: "simulation" | "webhook" | "smtp";
  webhookUrl: string;
  autoExportZip: boolean;
  lastRunTime: string | null;
  nextRunTime: string | null;
  recipientFilter: "all" | "active_only";
  smtpConfig?: {
    host: string;
    port: number;
    user: string;
    secure: boolean;
  };
}

export interface DispatchLogRecord {
  id: string;
  timestamp: string;
  technicianName: string;
  technicianEmail: string;
  date: string;
  jobCount: number;
  status: "Delivered" | "Pending" | "Failed" | "Exported";
  method: "Outlook EML" | "Outlook Web" | "Daily Scheduler" | "Batch ZIP" | "Mailto" | "Clipboard";
  previewSubject: string;
  previewBodyHtml?: string;
  notes?: string;
}

export interface SavedEmailRecord {
  id: string;
  technicianName: string;
  technicianEmail: string;
  workWeekKey: string; // e.g. "2026-09-07" or "2026-W37"
  workWeekFormatted: string; // e.g. "09/07/2026 - 09/13/2026"
  versionTag: string; // "Initial" or "v.2", "v.3", etc., user-editable
  versionNumber: number; // 1, 2, 3...
  isInitialVersion: boolean; // true for 1st version
  createdAt: string; // ISO string
  subject: string;
  htmlBody: string;
  plainText: string;
  jobCount: number;
  ordersSummary?: {
    orderNumber: string;
    locationId?: string;
    locationName?: string;
    taskCategory?: string;
    date?: string;
    priority?: string;
  }[];
  attachmentsSummary?: string[];
  attachments?: EmailAttachment[];
  notesSnapshot?: string[];
  customIdEnabled?: boolean;
  conductStudyEnabled?: boolean;
  conductStudyProjects?: string[];
  emailUpdateEnabled?: boolean;
  emailUpdateType?: string;
  emailUpdateVersion?: string | number;
}

export interface ParseResult {
  orders: WorkOrder[];
  headers: string[];
  mapping: ColumnMapping;
  detectedDates: string[];
  technicians: string[];
  warnings: string[];
  rawRows: Record<string, string>[];
}
