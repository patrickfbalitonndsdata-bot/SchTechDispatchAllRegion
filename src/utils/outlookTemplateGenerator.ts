import JSZip from "jszip";
import { TechnicianRoster, TemplateStyle, TemplateBranding, WorkOrder, AdditionalNotePreset, EmailAttachment } from "../types";
import { extractProjectNumber, extractLocationSuffix, parseDateTimeString } from "./csvParser";
import { DEFAULT_TECHNICIAN_ROSTER, resolveTechnicianAirtableUrl } from "./technicianRosterData";

export const DEFAULT_PRESET_NOTES: AdditionalNotePreset[] = [
  {
    id: "preset_tmc_install",
    label: "For TMC Studies",
    text: "(TMC’s) Please ensure that everything within the polygon, pedestrian crossing and all possible movements are captured.\nFor backup cameras, it is best to place diagonally where the main camera is.\n\nIf the proposed camera placement will not work due to actual site conditions, please use your best judgment where to install the equipment and obtain approval from the region before leaving the site. (See photo attached as format)",
    enabled: true,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "Install",
    autoTriggerType: "tmc_install",
    targetRegions: ["Florida", "South East"],
    isFloridaOrSouthEastNote: true,
  },
  {
    id: "preset_alg_atr_install",
    label: "For ALG/ATR Studies",
    text: "(ALG’s) Please ensure that poles are extended to have our cameras placed high enough to collect good data. (See photo attached for format)",
    enabled: true,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "Install",
    autoTriggerType: "alg_atr_install",
    targetRegions: ["Florida", "South East"],
    isFloridaOrSouthEastNote: true,
  },
  {
    id: "preset_green_batteries",
    label: "Green Batteries Installation Note",
    text: "Note: Please use green batteries upon installing the project.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "Install",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "green_batteries",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_speed_teardown_swap",
    label: "SPEED Add-Ons File Naming Format (Teardowns & Swaps)",
    text: "Note: Please make sure to follow the correct file naming when uploading data for all SPEED locations being collecting by camera. See correct Format: <ALG>SPACE<Project Number>SPACE<SPEED> | Example: “ALG 25-99999 SPEED”.",
    enabled: true,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "All",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "speed_teardown_swap",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_priority_client_upload",
    label: "Priority Client ASAP Data Upload Note",
    text: "Note: Please upload data ASAP as these projects are Priority client.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "All",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "priority_client_upload",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_meeting_auburn",
    label: "Meeting at Auburn Office",
    text: "Note: Please report to the Auburn office at <input time> on <Input Day:Date>\nAddress: 23 Midstate Drive Suite 112 Auburn, MA 01501",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "All",
    targetRegions: ["North East"],
    autoTriggerType: "meeting_auburn",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_meeting_nyc",
    label: "Meeting at New York City",
    text: "Note: Please coordinate with Madison Lopez regarding the meeting location at a central location in New York City. If you have any concerns and question please reach out to Julie Incerpi.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "All",
    targetRegions: ["North East", "NYC"],
    autoTriggerType: "meeting_nyc",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_kmz_placement",
    label: "KMZ File Camera Placement Instructions",
    text: "Note: Please make sure to install the cameras exactly as shown in the KMZ file.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "Install",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "kmz_placement",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_parking_inventory",
    label: "Parking Inventory Requirements & KMZ Coverage",
    text: "Note: Parking Inventory required: include any restrictions: Handicap, One-hour parking, Two-hour parking, Reserved.\nInventory sheet will be provided by the OPS. Please coordinate with Julie Incerpi if you have any questions/clarifications regarding your assigned project.\nSee KMZ for coverage.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "All",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "parking_inventory",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_fl_se_nwt_logos",
    label: "NWT Jobs",
    text: "For Monday installs: (For 26-120462 & 26-120467) All NDS logos must be covered on NWT jobs - please see Juvoney if you don’t have the proper labels to cover prior to install.\nThis is MANDATORY. Submit photos of cam boxes and poles showing covered areas. (See photo attached for format)",
    enabled: true,
    targetDays: ["Monday"],
    targetProjects: ["All"],
    targetCategory: "Install",
    targetRegions: ["Florida", "South East"],
    autoTriggerType: "fl_se_day_note",
    isFloridaOrSouthEastNote: true,
    dayPrefixDay: "Monday",
    dayPrefixAction: "installs",
    customNoteBody: "(For 26-120462 & 26-120467) All NDS logos must be covered on NWT jobs - please see Juvoney if you don’t have the proper labels to cover prior to install.\nThis is MANDATORY. Submit photos of cam boxes and poles showing covered areas. (See photo attached for format)",
  },
  // --- North East & Mid Atlantic Presets ---
  {
    id: "preset_ne_ma_nationwide",
    label: "NATIONWIDE NOTE:",
    text: "All NDS logos must be covered on NWT jobs - please see Damian if you don’t have the proper labels to cover prior to install.\nThis is MANDATORY. Submit photos of cam boxes and poles showing covered areas. (See photo attached as format)",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "Install",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "ne_ma_nationwide",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_ne_ma_inclement_weather",
    label: "INCLEMENT WEATHER NOTE:",
    text: "Do not install the cameras during inclement weather. If it begins raining during the installation, please notify Damian immediately.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "Install",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "ne_ma_inclement_weather",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_ne_ma_que_note",
    label: "QUE NOTE:",
    text: "Note: Please make sure we can see the full length of the red que lines in the cameras view.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "Install",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "ne_ma_que",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_ne_ma_tmc_updated",
    label: "TMC UPDATED NOTE:",
    text: "Note: If the proposed camera placement will not work due to actual site conditions, please use your best judgment where to install the equipment and obtain approval from the region before leaving the site. Also, please ensure that everything within the polygon, including driveways, pedestrian crossing and all possible movements are captured.\nFor backup camera, it is best to place diagonally where the main camera is.",
    enabled: true,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "Install",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "tmc_install",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_ne_ma_working_together",
    label: "WORKING TOGETHER NOTE:",
    text: "Note: You will be working with other Technician for this project, please coordinate with each other prior installation.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "Install",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "ne_ma_working_together",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_ne_ma_parking_study",
    label: "PARKING STUDY:",
    text: "Note: Please coordinate with Private contractor who will conduct this study.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "All",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "ne_ma_parking_study",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_ne_ma_rlv_notes",
    label: "RLV Notes:",
    text: "Note: This is a red-light violation (RLV) study. Please refer to the KMZ file for the exact camera placements and ensure that both the RLV light and stop line are fully covered by the cameras.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "Install",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "ne_ma_rlv",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_ne_ma_priority_client",
    label: "PRIORITY CLIENT:",
    text: "Note: Please upload data ASAP as this project is Priority client.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "All",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "ne_ma_priority_client",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_ne_ma_hard_due_date",
    label: "HARD DUE DATE:",
    text: "Note: Please prioritize uploading the data ASAP as this project has a hard due date.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "All",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "ne_ma_hard_due_date",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_ne_ma_asap",
    label: "ASAP:",
    text: "Note: Please prioritize uploads after teardown as this project needs to be delivered ASAP.",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "Teardown",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "ne_ma_asap",
    isNorthEastOrMidAtlanticNote: true,
  },
  {
    id: "preset_ne_ma_mainline",
    label: "MAINLINE:",
    text: "Notes: For project 26-xxxxxx, cameras must be formatted to record 1080p for Speed studies. Please also use high-definition SD cards. If you have any concerns regarding the camera setup, kindly coordinate with OPS.\n•\tCameras must be set up at 1080p for Speed studies. This is critical. Please ensure you have the proper SD cards to support the required resolution.\n•\tSet the camera to 30 FPS.\n•\tTest the camera at the required resolution before fully deploying it to ensure the video quality is sufficient.\n•\tMaintain a minimum camera height of 20 ft. Any use of short poles will require approval from OPS/Kevin.\n•\tCapture only the intended direction of traffic.\n•\tTwo lanes of traffic are recommended. If collecting three lanes, the camera must be set up higher than usual.\n•\tCameras must be positioned close to the side of the road and facing the rear of the vehicles.\n(See photo attached as format)",
    enabled: false,
    targetDays: ["All"],
    targetProjects: ["All"],
    targetCategory: "Install",
    targetRegions: ["North East", "Mid Atlantic"],
    autoTriggerType: "ne_ma_mainline",
    isNorthEastOrMidAtlanticNote: true,
  },
];

/**
 * Formats the prefix for Florida & South East dispatch notes:
 * "For <Day> installs/Teardowns:"
 * Option if Installs or Teardowns (e.g. "For Monday installs:", "For Tuesday Teardowns:")
 */
export function formatFloridaSouthEastNotePrefix(
  day: string,
  action: "installs" | "Teardowns" | "installs/Teardowns"
): string {
  const cleanDay = day.trim() || "Monday";
  let cleanAction = action;
  if (!cleanAction || (cleanAction !== "Teardowns" && cleanAction !== "installs/Teardowns")) {
    cleanAction = "installs";
  }
  return `For ${cleanDay} ${cleanAction}:`;
}

/**
 * Determines whether a preset note belongs to the specified Region's template.
 * Strictly enforces regional isolation per user requirement:
 * - Florida & South East (FL/SE) template: ONLY displays FL/SE designated note presets (and never NE/MA notes)
 * - North East & Mid Atlantic (NE/MA) template: ONLY displays NE/MA designated note presets (and never FL/SE notes)
 * - Other regions (NYC, etc.): Displays only notes explicitly targeted to them
 */
export function isNoteMatchingRegion(preset: AdditionalNotePreset, region?: string): boolean {
  if (!region || region === "all") return true;
  const cleanRegion = region.trim();
  const isFlSeRegion = cleanRegion === "Florida" || cleanRegion === "South East";
  const isNeMaRegion = cleanRegion === "North East" || cleanRegion === "Mid Atlantic";

  // Check if note is flagged or targeted specifically for FL / SE
  const isFlSeNote =
    Boolean(preset.isFloridaOrSouthEastNote) ||
    preset.id === "preset_tmc_install" ||
    preset.id === "preset_alg_atr_install" ||
    preset.id === "preset_fl_se_nwt_logos" ||
    preset.id?.startsWith("fl_se_") ||
    (preset.targetRegions &&
      preset.targetRegions.length > 0 &&
      !preset.targetRegions.includes("All") &&
      preset.targetRegions.every((r) => r === "Florida" || r === "South East"));

  // Check if note is flagged or targeted specifically for NE / MA
  const isNeMaNote =
    Boolean(preset.isNorthEastOrMidAtlanticNote) ||
    preset.id?.startsWith("preset_ne_ma_") ||
    preset.id === "preset_meeting_auburn" ||
    preset.id === "preset_meeting_nyc" ||
    preset.id === "preset_green_batteries" ||
    preset.id === "preset_speed_teardown_swap" ||
    preset.id === "preset_priority_client_upload" ||
    preset.id === "preset_kmz_placement" ||
    preset.id === "preset_parking_inventory" ||
    (preset.targetRegions &&
      preset.targetRegions.length > 0 &&
      !preset.targetRegions.includes("All") &&
      preset.targetRegions.every((r) => r === "North East" || r === "Mid Atlantic" || r === "NYC"));

  if (isFlSeRegion) {
    // In FL / SE template: MUST NOT display NE/MA notes!
    if (isNeMaNote) return false;
    // FL/SE notes MUST be displayed for FL/SE
    if (isFlSeNote) return true;
    // Check if explicit targetRegions contains Florida or South East
    if (preset.targetRegions && preset.targetRegions.length > 0) {
      return (
        preset.targetRegions.includes("Florida") ||
        preset.targetRegions.includes("South East") ||
        preset.targetRegions.includes(cleanRegion)
      );
    }
    return false;
  }

  if (isNeMaRegion) {
    // In NE / MA template: MUST NOT display FL/SE notes!
    if (isFlSeNote) return false;
    // If it's a NE/MA note, display it
    if (isNeMaNote) return true;
    // Check if explicit targetRegions contains North East or Mid Atlantic
    if (preset.targetRegions && preset.targetRegions.length > 0) {
      return (
        preset.targetRegions.includes("North East") ||
        preset.targetRegions.includes("Mid Atlantic") ||
        preset.targetRegions.includes(cleanRegion)
      );
    }
    return false;
  }

  // Other regions (NYC, NOCAL, SOCAL, Mid West)
  if (isFlSeNote) return false;
  if (isNeMaNote && !preset.targetRegions?.includes(cleanRegion)) return false;
  if (preset.targetRegions && preset.targetRegions.length > 0) {
    return preset.targetRegions.includes(cleanRegion);
  }
  return false;
}

export const DEFAULT_BRANDING: TemplateBranding = {
  companyName: "NDS Data & Field Services",
  dispatcherName: "Central Dispatch Team",
  dispatcherTitle: "Field Resource Coordinator",
  replyToEmail: "dispatch@ndsdata.com",
  supportPhone: "1-800-555-TECH",
  regionName: "North East",
  selectedRegion: "North East",
  defaultRegion: "North East",
  primaryColor: "#0078D4", // Microsoft 365 Outlook Blue
  accentColor: "#107C41", // Excel Green / Success
  includeMapLinks: true,
  includeChecklist: true,
  customDisclaimer: "Please complete digital safety walk-around before operating fleet vehicle. Log all arrival times in field portal.",
  greetingPrefix: "Hello",
  emergencyHotline: "1-800-555-9110",
  // Exact template default fields
  photoUploadLinkText: "South Central Job Photos",
  photoUploadUrl: "https://airtable.com/appPhotos/upload",
  airtableBaseUrl: "https://airtable.com",
  googleMapsBaseUrl: "https://maps.google.com",
  privateJobsNotice: "(FOR PRIVATE JOBS, PLEASE UPLOAD FIELD PHOTOS TO GOOGLE CHAT ONLY IN REAL TIME)",
  dataUploadEmail: "jobs@ndsdata.com",
  useAnytimeTeardowns: true,
  enableAdditionalNotes: true,
  additionalNotes: DEFAULT_PRESET_NOTES,
  enableCustomId: false,
  customIdProjects: [],
  enableEmailUpdate: false,
  emailUpdateType: "documentary",
  emailUpdateVersion: "2",
  emailUpdateNotes: "",
  enableArrangeNewProjects: false,
  customDayProjectOrder: {},
  customTechDayProjectOrder: {},
  enableScheduleOverlap: false,
  selectedWorkWeek: "current",
  enableSunSunView: false,
  disableScheduleNotes: false,
  enableConductStudy: false,
  conductStudyProjects: [],
  technicianAirtableLinks: DEFAULT_TECHNICIAN_ROSTER,
  attachments: [],
};

/**
 * Standard MIME mapping for common dispatch and email file types: KMZ, PDF, CSV, Excel, Word, images, etc.
 */
export function getMimeTypeForFilename(filename: string): string {
  if (!filename) return "application/octet-stream";
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "kmz":
      return "application/vnd.google-earth.kmz";
    case "kml":
      return "application/vnd.google-earth.kml+xml";
    case "pdf":
      return "application/pdf";
    case "csv":
      return "text/csv; charset=\"utf-8\"";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "xls":
      return "application/vnd.ms-excel";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
    case "txt":
    case "log":
      return "text/plain; charset=\"utf-8\"";
    case "zip":
      return "application/zip";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

/**
 * Human-readable file size formatter
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Splits raw base64 string into standard RFC 822 MIME 76-character chunked lines
 */
export function splitBase64Into76CharLines(base64Str: string): string {
  if (!base64Str) return "";
  const clean = base64Str.replace(/[\r\n\s]+/g, "");
  const lines: string[] = [];
  for (let i = 0; i < clean.length; i += 76) {
    lines.push(clean.substring(i, i + 76));
  }
  return lines.join("\r\n");
}

/**
 * Filters attachments matching the given technician (or global 'all' scope)
 */
export function getTechnicianAttachments(
  roster: TechnicianRoster,
  branding: TemplateBranding
): EmailAttachment[] {
  const allAttachments = branding.attachments || [];
  const techFullName = formatTechnicianFullName(roster.technicianName).toLowerCase().trim();
  return allAttachments.filter((att) => {
    if (!att.technicianScope || att.technicianScope === "all") return true;
    const scope = formatTechnicianFullName(att.technicianScope).toLowerCase().trim();
    return scope === techFullName || scope === (roster.technicianName || "").toLowerCase().trim();
  });
}

/**
 * Helper to read a browser File into base64 payload
 */
export function readFileAsBase64(file: File): Promise<{ base64: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      resolve({ base64, dataUrl });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Sample generator for KMZ Route Map
 */
export function createSampleKmzAttachment(scope: "all" | string = "all"): EmailAttachment {
  const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Weekly Field Route &amp; Camera Positions</name>
    <description>Technician weekly installation route with pole GPS coordinates and camera placement pins.</description>
    <Style id="cameraPin">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.2</scale>
      </IconStyle>
    </Style>
    <Placemark>
      <name>Route Point 1 - Auburn Office</name>
      <description>23 Midstate Dr Suite 112, Auburn, MA 01501 (TMC ATR Install)</description>
      <styleUrl>#cameraPin</styleUrl>
      <Point>
        <coordinates>-71.8487,42.2014,0</coordinates>
      </Point>
    </Placemark>
    <Placemark>
      <name>Route Point 2 - Worcester Hub</name>
      <description>Main St &amp; Elm St Intersection (Radar Speed Setup)</description>
      <styleUrl>#cameraPin</styleUrl>
      <Point>
        <coordinates>-71.8023,42.2626,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;

  // Base64 encode string safely
  const base64 = btoa(unescape(encodeURIComponent(kmlContent)));
  return {
    id: "att_sample_kmz_" + Math.random().toString(36).substring(2, 8),
    name: "Weekly_Field_Route_Map.kmz",
    size: new Blob([kmlContent]).size,
    type: "application/vnd.google-earth.kmz",
    dataBase64: base64,
    dataUrl: `data:application/vnd.google-earth.kmz;base64,${base64}`,
    technicianScope: scope,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Sample generator for PDF Field Safety Checklist
 */
export function createSamplePdfAttachment(scope: "all" | string = "all"): EmailAttachment {
  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 174 >>
stream
BT
/F1 18 Tf
50 720 Td
(NDS FIELD DISPATCH - SAFETY & KMZ INSTRUCTIONS) Tj
/F1 12 Tf
0 -30 Td
(1. Minimum pole height 20ft for rear taillight capture) Tj
0 -20 Td
(2. Confirm KMZ coordinates prior to mounting) Tj
0 -20 Td
(3. Wear Class 3 High-Visibility Safety Vests at all times) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000460 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
%%EOF`;

  const base64 = btoa(pdfString);
  return {
    id: "att_sample_pdf_" + Math.random().toString(36).substring(2, 8),
    name: "Field_Safety_&_Install_Checklist.pdf",
    size: new Blob([pdfString]).size,
    type: "application/pdf",
    dataBase64: base64,
    dataUrl: `data:application/pdf;base64,${base64}`,
    technicianScope: scope,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Sample generator for CSV Work Orders Sheet
 */
export function createSampleCsvAttachment(scope: "all" | string = "all"): EmailAttachment {
  const csvData = `"Job Number","Project Number","Task Description","Day Scheduled","Time Window","Location","Priority"
"J-10492","26-450455","TMC/ATR Camera Pole Install (20ft Min)","Monday","07:00 AM - 09:00 AM","Auburn Corridor Rt 12","High"
"J-10493","26-450455","Radar Speed Teardown & Photo Upload","Wednesday","01:00 PM - 03:00 PM","Worcester Expressway","Normal"
"J-10494","25-99999","Priority Client Radar Swap","Friday","11:00 AM","Auburn Regional Office","Urgent"`;

  const base64 = btoa(unescape(encodeURIComponent(csvData)));
  return {
    id: "att_sample_csv_" + Math.random().toString(36).substring(2, 8),
    name: "Work_Orders_Schedule_Export.csv",
    size: new Blob([csvData]).size,
    type: "text/csv; charset=\"utf-8\"",
    dataBase64: base64,
    dataUrl: `data:text/csv;base64,${base64}`,
    technicianScope: scope,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Normalizes email update version to clean number e.g. "2" or "v2" -> "2"
 */
export function formatEmailUpdateVersion(version?: string | number): string {
  if (!version && version !== 0) return "2";
  const str = String(version).trim();
  const stripped = str.replace(/^v\s*/i, "").trim();
  return stripped || "2";
}

/**
 * Builds the Email Update banner text based on type, version, and optional notes
 */
export function getEmailUpdateBannerText(branding?: TemplateBranding): string {
  if (!branding?.enableEmailUpdate) return "";
  const version = formatEmailUpdateVersion(branding.emailUpdateVersion);
  const type = branding.emailUpdateType || "documentary";
  const notes = (branding.emailUpdateNotes || "").trim();

  let prefix = "";
  if (type === "schedule") {
    prefix = `UPDATE v${version}: Schedule is updated.`;
  } else {
    prefix = `UPDATE v${version}: For documentation purposes only.`;
  }

  if (notes) {
    return `${prefix} ${notes}`;
  }
  return prefix;
}

/**
 * Escapes HTML characters for safe template rendering
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Render individual preset note lines with the signature yellow highlight
 */
export function renderPresetLinesHtml(text: string): string {
  if (!text || !text.trim()) return "";
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines
    .map((line) => {
      const matchNote = line.match(/^Note\s*:\s*(.*)$/i);
      if (matchNote) {
        const noteBody = escapeHtml(matchNote[1]);
        return `<div style="margin-bottom: 3px; line-height: 1.5;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">Note:</span> <span style="background-color: #FFFF00; color: #000000; padding: 0 4px;">${noteBody}</span></div>`;
      }
      return `<div style="margin-bottom: 3px; line-height: 1.5;"><span style="background-color: #FFFF00; color: #000000; padding: 0 4px;">${escapeHtml(line)}</span></div>`;
    })
    .join("");
}

/**
 * Render all active Additional Notes for the Outlook HTML email filtered by Region template
 */
export function renderAdditionalNotesHtml(branding: TemplateBranding, region?: string): string {
  if (branding.enableAdditionalNotes === false) return "";
  const targetRegion = region || branding.selectedRegion || branding.regionName;
  const presets = (branding.additionalNotes && branding.additionalNotes.length > 0 ? branding.additionalNotes : DEFAULT_PRESET_NOTES).filter(
    (p) => p.enabled && isNoteMatchingRegion(p, targetRegion)
  );
  if (presets.length === 0) return "";

  const notesHtml = presets
    .map((p) => {
      const rendered = renderPresetLinesHtml(p.text);
      return `<div style="margin: 6px 0 6px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000000;">${rendered}</div>`;
    })
    .join("");

  return `
  <!-- Additional Notes Section (Yellow Highlight) -->
  <div style="margin: 16px 0 10px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt;">
    ${notesHtml}
  </div>`;
}

/**
 * Render all active Additional Notes for Plain Text email filtered by Region template
 */
export function renderAdditionalNotesText(branding: TemplateBranding, region?: string): string {
  if (branding.enableAdditionalNotes === false) return "";
  const targetRegion = region || branding.selectedRegion || branding.regionName;
  const presets = (branding.additionalNotes && branding.additionalNotes.length > 0 ? branding.additionalNotes : DEFAULT_PRESET_NOTES).filter(
    (p) => p.enabled && isNoteMatchingRegion(p, targetRegion)
  );
  if (presets.length === 0) return "";

  return "\n" + presets.map((p) => p.text).join("\n\n") + "\n";
}

/**
 * Parse numeric unit count from a camera count or backup units string
 */
export function parseUnitNumber(val?: string): number {
  if (!val) return 0;
  const trimmed = val.trim().toLowerCase();
  if (trimmed === "" || trimmed === "0" || ["none", "no", "n/a", "na"].includes(trimmed)) return 0;
  const match = trimmed.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export function formatNDSCameraCount(count?: string): string {
  if (!count) return "";
  const trimmed = count.trim();
  if (trimmed === "" || trimmed === "0" || ["none", "no", "n/a", "na"].includes(trimmed.toLowerCase())) return "";
  const clean = trimmed.replace(/^\(/, "").replace(/\)$/, "").trim();
  if (clean === "" || clean === "0" || clean === "0 cameras" || clean === "0 camera") return "";
  if (/^0\s*cameras?$/i.test(clean)) return "";
  if (/^\d+$/.test(clean)) {
    const num = parseInt(clean, 10);
    if (num === 0) return "";
    return num === 1 ? `(1 camera)` : `(${num} cameras)`;
  }
  if (clean.toLowerCase().includes("camera")) {
    const numMatch = clean.match(/^(\d+)/);
    if (numMatch && parseInt(numMatch[1], 10) === 0) return "";
    return `(${clean})`;
  }
  return `(${clean})`;
}

/**
 * Normalizes and abbreviates study types according to NDS specifications:
 * - Parking -> PKG
 * - Driveway -> DWY
 * - Queue -> QUE
 * - Mainline -> MNL
 * - Screenline -> SCN
 * - Red Light Violation -> RLV
 */
export function abbreviateStudyType(text?: string): string {
  if (!text) return "";
  let result = text.trim();

  // Replace study names (supporting optional trailing Study/Studies and plurals)
  result = result.replace(/\bRed\s+Light\s+Violations?(\s+Stud(?:y|ies))?\b/gi, "RLV");
  result = result.replace(/\bParkings?(\s+Stud(?:y|ies))?\b/gi, "PKG");
  result = result.replace(/\bDriveways?(\s+Stud(?:y|ies))?\b/gi, "DWY");
  result = result.replace(/\bQueues?(\s+Stud(?:y|ies))?\b/gi, "QUE");
  result = result.replace(/\bMainlines?(\s+Stud(?:y|ies))?\b/gi, "MNL");
  result = result.replace(/\bScreenlines?(\s+Stud(?:y|ies))?\b/gi, "SCN");

  return result.replace(/\s+/g, " ").trim();
}

/**
 * Format camera count for bullet item (e.g. "1 camera", "2 cameras", "1 camera + 1 backup", "1 camera + 1 backup (East corner)")
 * Disregards and omits 0 cameras completely (e.g. returns "(Data being collected by 26-470263-001)")
 */
export function formatBulletCameraCount(count?: string, backupUnits?: string, scheduleNotes?: string, disableScheduleNotes?: boolean): string {
  let camText = "";
  if (count && count.trim() !== "") {
    const trimmed = count.trim().replace(/^\(/, "").replace(/\)$/, "").trim();
    if (trimmed !== "" && trimmed !== "0" && !["none", "no", "n/a", "na"].includes(trimmed.toLowerCase())) {
      if (/^\d+$/.test(trimmed)) {
        const num = parseInt(trimmed, 10);
        if (num > 0) {
          camText = num === 1 ? "1 camera" : `${num} cameras`;
        }
      } else {
        const matchNum = trimmed.match(/^(\d+)/);
        if (matchNum && parseInt(matchNum[1], 10) === 0) {
          camText = ""; // 0 cameras -> disregarded, omit
        } else if (!/^0\s*cameras?$/i.test(trimmed)) {
          camText = trimmed;
        }
      }
    }
  }

  let backupText = "";
  if (backupUnits && backupUnits.trim() !== "") {
    const trimmedB = backupUnits.trim().replace(/^\(/, "").replace(/\)$/, "");
    if (trimmedB !== "0" && !["none", "no", "n/a", "na"].includes(trimmedB.toLowerCase())) {
      if (/^\d+$/.test(trimmedB)) {
        const numB = parseInt(trimmedB, 10);
        if (numB > 0) {
          backupText = numB === 1 ? "1 backup" : `${numB} backups`;
        }
      } else if (trimmedB.toLowerCase().includes("backup")) {
        backupText = trimmedB;
      } else {
        const matchNum = trimmedB.match(/\d+/);
        if (matchNum) {
          const numB = parseInt(matchNum[0], 10);
          if (numB > 0) {
            backupText = numB === 1 ? "1 backup" : `${numB} backups`;
          }
        } else {
          backupText = `${trimmedB} backup`;
        }
      }
    }
  }

  let parts: string[] = [];
  if (camText) parts.push(camText);
  if (backupText) {
    if (parts.length > 0) {
      parts.push(`+ ${backupText}`);
    } else {
      parts.push(backupText);
    }
  }

  let result = parts.join(" ");

  if (!disableScheduleNotes && scheduleNotes && scheduleNotes.trim() !== "") {
    const trimmedN = scheduleNotes.trim();
    if (!["none", "no", "n/a", "na"].includes(trimmedN.toLowerCase())) {
      const noteFormatted = trimmedN.startsWith("(") && trimmedN.endsWith(")") ? trimmedN : `(${trimmedN})`;
      result = result ? `${result} ${noteFormatted}` : noteFormatted;
    }
  }

  return result.trim();
}

/**
 * Formats the Project Number, City/State, Service Type, and Add Ons string according to NDS specifications:
 *
 * 1. For ALG (ATR with camera or Algorithm study):
 *    Format: `ALG <Project Number> <City, State> <Add ons>`
 *    (e.g., "ALG 26-770115 Chester Volume, Classification & Speed")
 *
 * 2. For Machine (strict "ATR" / tube / machine):
 *    Format: `<Project Number> <City, State> ATR (<Add ons>)` or `<Project Number> <City, State> ATR`
 *    (e.g., "26-420023 Chester ATR (Volume, Classification & Speed)")
 *
 * 3. For TMC and all other studies:
 *    Format: `<Project Number> <City, State> <STUDY>`
 *    (e.g., "26-110022 Stamford TMC w/ Heavy Trucks", "26-554411 Norwalk Pedestrian", "26-410094 New Britain, CT DWY")
 */
/**
 * Extracts only the City from a "City, State" string by removing the state component.
 * e.g. "Houston, TX" -> "Houston", "New Iberia, LA" -> "New Iberia", "Houston TX" -> "Houston"
 */
export function extractCityOnly(cityState: string): string {
  if (!cityState) return "";
  const trimmed = cityState.trim();
  if (trimmed.includes(",")) {
    return trimmed.split(",")[0].trim();
  }
  // Match standard two-letter state abbreviations at end of string without comma (e.g. "Houston TX")
  const match = trimmed.match(/^(.*?)(?:\s+[A-Za-z]{2})$/);
  if (match && match[1].trim()) {
    return match[1].trim();
  }
  return trimmed;
}

export function formatNDSTaskHeaderLine(
  order: WorkOrder,
  projectNumber: string,
  cityState: string,
  serviceType: string,
  rawAddOns: string
): { formattedHtml: string; formattedText: string; isAlg: boolean; isMachine: boolean; studyStr?: string } {
  const eqType = getEquipmentType(order);
  const isMachine = eqType === "machine";

  const rawMethod = (
    order.method ||
    order.rawRowData?.["Method"] ||
    order.rawRowData?.["Method (from Locations)"] ||
    order.rawRowData?.["Study Method"] ||
    ""
  ).toLowerCase();

  const combinedService = `${serviceType} ${rawAddOns} ${rawMethod}`.toLowerCase();

  // Check if ALG / ATR Algorithm (Camera with ATR / ALG)
  const isAlg = (
    !isMachine &&
    (/\b(?:alg|algorithm)\b/i.test(combinedService) ||
     (/\batr\b/i.test(combinedService) && (eqType === "camera" || /\b(?:cam|camera|video)\b/i.test(rawMethod) || rawMethod.startsWith("cam"))))
  );

  const cleanCity = (cityState || "").trim();
  const cleanProj = (projectNumber || "").trim();
  const cleanAddOns = (rawAddOns || "")
    .replace(/\b(?:ATR|ALG|Algorithm|Miovision)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const cleanService = (serviceType || "")
    .replace(/\b(?:ATR|ALG|Algorithm|Miovision)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // 1. ALG Format: `ALG <Project Number> <City, State> <Add ons>`
  if (isAlg) {
    const addOnsParts: string[] = [];
    if (cleanService && cleanService.toUpperCase() !== "ALG") {
      addOnsParts.push(abbreviateStudyType(cleanService));
    }
    if (cleanAddOns) {
      addOnsParts.push(abbreviateStudyType(cleanAddOns));
    }
    const addOnsStr = addOnsParts.join(" ").trim();

    const partsHtml: string[] = ["ALG"];
    const partsText: string[] = ["ALG"];

    if (cleanProj) {
      partsHtml.push(`<strong style="color: #000000;">${escapeHtml(cleanProj)}</strong>`);
      partsText.push(cleanProj);
    }
    if (cleanCity) {
      partsHtml.push(escapeHtml(cleanCity));
      partsText.push(cleanCity);
    }
    if (addOnsStr) {
      partsHtml.push(escapeHtml(addOnsStr));
      partsText.push(addOnsStr);
    }

    return {
      formattedHtml: partsHtml.join(" "),
      formattedText: partsText.join(" "),
      isAlg: true,
      isMachine: false,
      studyStr: "ALG",
    };
  }

  // 2. Machine Format: `<Project Number> <City, State> ATR (<Add ons>)`
  if (isMachine) {
    const addOnsParts: string[] = [];
    if (cleanService && cleanService.toUpperCase() !== "ATR" && cleanService.toUpperCase() !== "TUBE") {
      addOnsParts.push(abbreviateStudyType(cleanService));
    }
    if (cleanAddOns) {
      addOnsParts.push(abbreviateStudyType(cleanAddOns));
    }
    const rawAddOnsText = addOnsParts.join(" ").trim();

    const partsHtml: string[] = [];
    const partsText: string[] = [];

    if (cleanProj) {
      partsHtml.push(`<strong style="color: #000000;">${escapeHtml(cleanProj)}</strong>`);
      partsText.push(cleanProj);
    }
    if (cleanCity) {
      partsHtml.push(escapeHtml(cleanCity));
      partsText.push(cleanCity);
    }

    if (rawAddOnsText) {
      const parenthesized = rawAddOnsText.startsWith("(") && rawAddOnsText.endsWith(")")
        ? rawAddOnsText
        : `(${rawAddOnsText})`;
      partsHtml.push(`ATR ${escapeHtml(parenthesized)}`);
      partsText.push(`ATR ${parenthesized}`);
    } else {
      partsHtml.push("ATR");
      partsText.push("ATR");
    }

    return {
      formattedHtml: partsHtml.join(" "),
      formattedText: partsText.join(" "),
      isAlg: false,
      isMachine: true,
      studyStr: "ATR",
    };
  }

  // 3. TMC and the rest of the studies: `<Project Number> <City, State> <STUDY>`
  // Rule: Exclude <Add ons> for TMC and all other studies (only ALG and ATR keep add-ons)
  // For TMC studies specifically: remove the State and only display the City (e.g. "Houston" instead of "Houston, TX")
  let studyStr = "";
  if (serviceType.toUpperCase().includes("TMC")) {
    studyStr = "TMC";
  } else {
    const cleanService = (serviceType || "")
      .replace(/\b(?:ATR|ALG|Algorithm|Miovision)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    studyStr = cleanService ? abbreviateStudyType(cleanService) : "TMC";
  }

  const isTmcStudy = studyStr === "TMC" || studyStr.startsWith("TMC") || serviceType.toUpperCase().includes("TMC");
  const displayCity = isTmcStudy ? extractCityOnly(cleanCity) : cleanCity;

  const partsHtml: string[] = [];
  const partsText: string[] = [];

  if (cleanProj) {
    partsHtml.push(`<strong style="color: #000000;">${escapeHtml(cleanProj)}</strong>`);
    partsText.push(cleanProj);
  }
  if (displayCity) {
    partsHtml.push(escapeHtml(displayCity));
    partsText.push(displayCity);
  }
  if (studyStr) {
    partsHtml.push(escapeHtml(studyStr));
    partsText.push(studyStr);
  }

  return {
    formattedHtml: partsHtml.join(" "),
    formattedText: partsText.join(" "),
    isAlg: false,
    isMachine: false,
    studyStr: studyStr,
  };
}

/**
 * Legacy wrapper for backward compatibility
 */
export function formatNDSProjectAndServiceLine(
  projectNumber: string,
  serviceType: string,
  rawAddOns: string
): { prefix: string; formattedHtml: string; formattedText: string } {
  let isAtr = false;

  if (/\bATR\b/i.test(serviceType) || /\bATR\b/i.test(rawAddOns)) {
    isAtr = true;
  }

  let cleanServiceType = serviceType.replace(/\bATR\b/gi, "").replace(/\s+/g, " ").trim();
  let cleanAddOns = rawAddOns.replace(/\bATR\b/gi, "").replace(/\s+/g, " ").trim();

  let prefix = "";
  if (isAtr) {
    prefix = "ALG";
  } else if (cleanServiceType.toUpperCase() === "ALG") {
    prefix = "ALG";
    cleanServiceType = "";
  }

  if (cleanServiceType.toUpperCase().includes("TMC") && cleanAddOns) {
    if (!/^w\//i.test(cleanAddOns) && !/^with\s+/i.test(cleanAddOns)) {
      cleanAddOns = `w/ ${cleanAddOns}`;
    }
  }

  const trailingParts: string[] = [];
  if (cleanServiceType && cleanServiceType.toUpperCase() !== "ALG") {
    trailingParts.push(abbreviateStudyType(cleanServiceType));
  }
  if (cleanAddOns) {
    trailingParts.push(abbreviateStudyType(cleanAddOns));
  }
  const trailingStr = trailingParts.join(" ").trim();
  const trailingWithSpace = trailingStr ? `${trailingStr} ` : "";

  let formattedHtml = "";
  let formattedText = "";

  if (prefix) {
    const projHtml = projectNumber ? `<strong style="color: #000000;">${escapeHtml(projectNumber)}</strong>` : "";
    formattedHtml = `${prefix} ${projHtml ? projHtml + " " : ""}${trailingWithSpace}`.trim();
    formattedText = `${prefix} ${projectNumber ? projectNumber + " " : ""}${trailingWithSpace}`.trim();
  } else {
    const projHtml = projectNumber ? `<strong style="color: #000000;">${escapeHtml(projectNumber)}</strong>` : "";
    formattedHtml = `${projHtml ? projHtml + " " : ""}${trailingWithSpace}`.trim();
    formattedText = `${projectNumber ? projectNumber + " " : ""}${trailingWithSpace}`.trim();
  }

  return { prefix, formattedHtml, formattedText };
}

export interface GroupedProjectTask {
  primaryOrder: WorkOrder;
  orders: WorkOrder[];
  isMultiLocation: boolean;
  projectNumber: string;
  category: "Install" | "Teardown" | "BatterySwap";
}

export type EquipmentType = "camera" | "machine" | "wavetronix" | "manual";

/**
 * Resolves the equipment type based on Method, Service Type, and Add-ons columns.
 * Rule: "Cam - ATR Algorithm" or any Camera/Cam/Video is Camera.
 * Strict "ATR" (or tube/piezo) is Machine.
 * Excludes Manual and Wavetronix from camera.
 * Default is Camera.
 */
export function getEquipmentType(order: WorkOrder): EquipmentType {
  const rawMethod = (
    order.method ||
    order.rawRowData?.["Method"] ||
    order.rawRowData?.["Method (from Locations)"] ||
    order.rawRowData?.["Method (from Project ID) (from Locations)"] ||
    order.rawRowData?.["Method (from Project ID)"] ||
    order.rawRowData?.["Study Method"] ||
    order.rawRowData?.["Collection Method"] ||
    ""
  ).trim();

  const rawService = (
    order.jobType ||
    order.rawRowData?.["Service Types (from Project ID) (from Locations)"] ||
    order.rawRowData?.["Service Types (from Locations)"] ||
    order.rawRowData?.["Service Types"] ||
    order.rawRowData?.["Service Type"] ||
    order.rawRowData?.["Study Type"] ||
    ""
  ).trim();

  const rawAddOns = (
    order.serviceTypeAddOns ||
    order.rawRowData?.["Service Type Add-Ons (from Project ID) (from Locations)"] ||
    order.rawRowData?.["Service Type Add-Ons (from Locations)"] ||
    order.rawRowData?.["Service Type Add-Ons"] ||
    order.rawRowData?.["Service Type Add Ons"] ||
    order.rawRowData?.["Add-Ons"] ||
    ""
  ).trim();

  const combined = `${rawMethod} ${rawService} ${rawAddOns} ${order.description || ""} ${order.specialInstructions || ""}`.toLowerCase();

  // 1. If method or service explicitly specifies Camera / Cam / Video / Miovision (e.g. "Cam - ATR Algorithm", "Cam - ATR", "Camera")
  const hasCam = (
    /\b(?:cam|camera|cameras|miovision|video|gridsmart)\b/i.test(rawMethod) ||
    /\b(?:cam|camera|cameras|miovision|video|gridsmart)\b/i.test(rawService) ||
    rawMethod.toLowerCase().startsWith("cam") ||
    rawService.toLowerCase().startsWith("cam") ||
    rawMethod.toLowerCase().includes("camera") ||
    rawService.toLowerCase().includes("camera")
  );

  if (hasCam) {
    return "camera";
  }

  // 2. Wavetronix / Radar
  if (
    /\b(?:wavetronix|radar)\b/i.test(rawMethod) ||
    /\b(?:wavetronix|radar)\b/i.test(rawService) ||
    combined.includes("wavetronix")
  ) {
    return "wavetronix";
  }

  // 3. Manual counts (excluding cam/atr)
  if (
    /\b(?:manual)\b/i.test(rawMethod) ||
    (/\b(?:manual)\b/i.test(rawService) && !combined.includes("cam") && !combined.includes("atr"))
  ) {
    return "manual";
  }

  // 4. Machine: ONLY when method is strictly "ATR" or tube/pneumatic/machine
  // "the app should just read 'ATR' only for Machine equipments, the rest should be camera (excluding: Manual, Wavetronix)."
  const isStrictAtr = (
    /^(?:atr|atr\s*-\s*tube|atr\s*tube|pneumatic\s*tube|road\s*tube|tube|machine|piezo)$/i.test(rawMethod) ||
    (/\batr\b/i.test(rawMethod) && !rawMethod.toLowerCase().includes("cam") && !rawMethod.toLowerCase().includes("camera")) ||
    (!rawMethod && /^(?:atr|pneumatic\s*tube|road\s*tube|tube|machine)$/i.test(rawService)) ||
    (!rawMethod && /\batr\b/i.test(rawService) && !rawService.toLowerCase().includes("cam") && !rawService.toLowerCase().includes("camera")) ||
    combined.includes("pneumatic tube") ||
    combined.includes("road tube")
  );

  if (isStrictAtr) {
    return "machine";
  }

  // 5. Default: Camera!
  return "camera";
}

/**
 * Checks if an order is a machine/tube/ATR installation (as opposed to a camera, wavetronix, or manual installation)
 */
export function isMachineOrder(order: WorkOrder): boolean {
  return getEquipmentType(order) === "machine";
}

export function isWavetronixOrder(order: WorkOrder): boolean {
  return getEquipmentType(order) === "wavetronix";
}

export function isManualOrder(order: WorkOrder): boolean {
  return getEquipmentType(order) === "manual";
}

/**
 * Format equipment count for task bullets (e.g. "1 camera", "1 machine", "1 wavetronix", "1 camera + 1 backup (Chester, CT)")
 */
export function formatBulletEquipmentCount(
  order: WorkOrder,
  count?: string,
  backupUnits?: string,
  scheduleNotes?: string,
  disableScheduleNotes?: boolean
): string {
  const eqType = getEquipmentType(order);
  const numCams = parseUnitNumber(count);

  let unitSingular = "camera";
  let unitPlural = "cameras";

  if (eqType === "machine") {
    unitSingular = "machine";
    unitPlural = "machines";
  } else if (eqType === "wavetronix") {
    unitSingular = "wavetronix";
    unitPlural = "wavetronix";
  } else if (eqType === "manual") {
    unitSingular = "manual count";
    unitPlural = "manual counts";
  }

  let mainText = "";
  if (count && count.trim() !== "") {
    const trimmed = count.trim().replace(/^\(/, "").replace(/\)$/, "").trim();
    if (trimmed !== "" && trimmed !== "0" && !["none", "no", "n/a", "na"].includes(trimmed.toLowerCase())) {
      if (/^\d+$/.test(trimmed)) {
        const num = parseInt(trimmed, 10);
        if (num > 0) {
          mainText = num === 1 ? `1 ${unitSingular}` : `${num} ${unitPlural}`;
        }
      } else {
        const matchNum = trimmed.match(/^(\d+)/);
        if (matchNum && parseInt(matchNum[1], 10) === 0) {
          mainText = "";
        } else {
          if (eqType === "camera" && trimmed.toLowerCase().includes("machine")) {
            mainText = trimmed.replace(/\bmachines?\b/gi, numCams === 1 ? "camera" : "cameras");
          } else {
            mainText = trimmed;
          }
        }
      }
    }
  }

  if (!mainText && numCams > 0) {
    mainText = numCams === 1 ? `1 ${unitSingular}` : `${numCams} ${unitPlural}`;
  } else if (!mainText && !count) {
    mainText = `1 ${unitSingular}`;
  }

  let backupText = "";
  if (backupUnits && backupUnits.trim() !== "") {
    const trimmedB = backupUnits.trim().replace(/^\(/, "").replace(/\)$/, "");
    if (trimmedB !== "0" && !["none", "no", "n/a", "na"].includes(trimmedB.toLowerCase())) {
      if (/^\d+$/.test(trimmedB)) {
        const numB = parseInt(trimmedB, 10);
        if (numB > 0) {
          backupText = numB === 1 ? "1 backup" : `${numB} backups`;
        }
      } else if (trimmedB.toLowerCase().includes("backup")) {
        backupText = trimmedB;
      } else {
        const matchNum = trimmedB.match(/\d+/);
        if (matchNum) {
          const numB = parseInt(matchNum[0], 10);
          if (numB > 0) {
            backupText = numB === 1 ? "1 backup" : `${numB} backups`;
          }
        } else {
          backupText = `${trimmedB} backup`;
        }
      }
    }
  }

  let parts: string[] = [];
  if (mainText) parts.push(mainText);
  if (backupText) {
    if (parts.length > 0) {
      parts.push(`+ ${backupText}`);
    } else {
      parts.push(backupText);
    }
  }

  let result = parts.join(" ");

  if (!disableScheduleNotes && scheduleNotes && scheduleNotes.trim() !== "") {
    const trimmedN = scheduleNotes.trim();
    if (!["none", "no", "n/a", "na"].includes(trimmedN.toLowerCase())) {
      const noteFormatted = trimmedN.startsWith("(") && trimmedN.endsWith(")") ? trimmedN : `(${trimmedN})`;
      result = result ? `${result} ${noteFormatted}` : noteFormatted;
    }
  }

  return result.trim();
}

/**
 * Format machine count for machine task bullets (e.g. "1 machine", "2 machines", "1 machine (Chester, CT)")
 */
export function formatBulletMachineCount(count?: string, backupUnits?: string, scheduleNotes?: string, disableScheduleNotes?: boolean): string {
  let machineText = "1 machine";
  if (count && count.trim() !== "") {
    const trimmed = count.trim().replace(/^\(/, "").replace(/\)$/, "").trim();
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      if (num > 0) machineText = num === 1 ? "1 machine" : `${num} machines`;
    } else if (trimmed.toLowerCase().includes("machine")) {
      machineText = trimmed;
    }
  }

  let backupText = "";
  if (backupUnits && backupUnits.trim() !== "") {
    const trimmedB = backupUnits.trim().replace(/^\(/, "").replace(/\)$/, "");
    if (trimmedB !== "0" && !["none", "no", "n/a", "na"].includes(trimmedB.toLowerCase())) {
      if (/^\d+$/.test(trimmedB)) {
        const numB = parseInt(trimmedB, 10);
        if (numB > 0) {
          backupText = numB === 1 ? "1 backup" : `${numB} backups`;
        }
      } else {
        backupText = trimmedB;
      }
    }
  }

  let parts = [machineText];
  if (backupText) parts.push(`+ ${backupText}`);
  let result = parts.join(" ");

  if (!disableScheduleNotes && scheduleNotes && scheduleNotes.trim() !== "") {
    const trimmedN = scheduleNotes.trim();
    if (!["none", "no", "n/a", "na"].includes(trimmedN.toLowerCase())) {
      const noteFormatted = trimmedN.startsWith("(") && trimmedN.endsWith(")") ? trimmedN : `(${trimmedN})`;
      result = `${result} ${noteFormatted}`;
    }
  }
  return result.trim();
}

/**
 * Computes task header unit count string by summing units and backup units together (e.g. 1 camera + 1 backup = "(2 cameras)")
 */
export function formatNDSTaskHeaderUnitCount(group: GroupedProjectTask): string {
  const isMachine = group.orders.some((o) => getEquipmentType(o) === "machine");
  const isWavetronix = group.orders.some((o) => getEquipmentType(o) === "wavetronix");
  const isManual = group.orders.some((o) => getEquipmentType(o) === "manual");

  let totalUnits = 0;
  let totalBackups = 0;

  group.orders.forEach((ord) => {
    totalUnits += parseUnitNumber(ord.cameraCounts);
    totalBackups += parseUnitNumber(ord.backupUnits);
  });

  const combinedTotal = totalUnits + totalBackups;

  if (isMachine) {
    const count = combinedTotal > 0 ? combinedTotal : (group.orders.length || 1);
    return `(${count} machine${count > 1 ? "s" : ""})`;
  }

  if (isWavetronix) {
    const count = combinedTotal > 0 ? combinedTotal : (group.orders.length || 1);
    return `(${count} wavetronix)`;
  }

  if (isManual) {
    const count = combinedTotal > 0 ? combinedTotal : (group.orders.length || 1);
    return `(${count} manual count${count > 1 ? "s" : ""})`;
  }

  // Camera counts: total sum of camera units and backup units combined
  const count = combinedTotal > 0 ? combinedTotal : (group.orders.length || 1);
  return count === 1 ? "(1 camera)" : `(${count} cameras)`;
}

/**
 * Helper to check if a project number or text matches a target project filter
 */
export function matchesProjectFilter(targetProjects: string[] | undefined, groupProjectNumber: string, fullProjectLine?: string): boolean {
  if (!targetProjects || targetProjects.length === 0 || targetProjects.includes("All")) return true;
  const cleanGroup = groupProjectNumber.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const cleanFull = (fullProjectLine || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  return targetProjects.some((target) => {
    if (target === "All") return true;
    const cleanTarget = target.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    if (!cleanTarget) return true;
    return (
      cleanGroup.includes(cleanTarget) ||
      cleanTarget.includes(cleanGroup) ||
      cleanFull.includes(cleanTarget)
    );
  });
}

/**
 * Helper to check if daySection matches target days
 */
export function matchesDayFilter(targetDays: string[] | undefined, daySection?: string): boolean {
  if (!targetDays || targetDays.length === 0 || targetDays.includes("All") || !daySection) return true;
  return targetDays.includes(daySection);
}

/**
 * Helper to check if category matches target category
 */
export function matchesCategoryFilter(targetCategory: string | undefined, groupCategory: string): boolean {
  if (!targetCategory || targetCategory === "All") return true;
  return targetCategory === groupCategory;
}

/**
 * Helper to check if region matches target regions
 */
export function matchesRegionFilter(
  targetRegions: string[] | undefined,
  branding?: TemplateBranding,
  orderRegion?: string
): boolean {
  if (!targetRegions || targetRegions.length === 0 || targetRegions.includes("All")) {
    return true;
  }

  const selectedRegion = branding?.selectedRegion;
  const brandingRegion = branding?.regionName;

  // If viewing a specific region in the dispatch tab (e.g. "North East", "Florida", etc.)
  if (selectedRegion && selectedRegion !== "all") {
    return targetRegions.includes(selectedRegion);
  }

  // If viewing "all" regions, defer to order/technician assigned region, then branding region
  const effectiveRegion = orderRegion || brandingRegion || "North East";
  return targetRegions.includes(effectiveRegion);
}

/**
 * Checks if an individual order represents an ALG or ATR study.
 * Only applies to ALG (camera algorithm) or ATR (road tube / machine).
 * Excludes Driveway, Parking, Queue, Mainline, Screenline, Red Light Violation, etc.
 */
export function isAlgOrAtrOrder(ord: WorkOrder): boolean {
  const eqType = getEquipmentType(ord);
  if (eqType === "machine") return true;

  const projectNumber = ord.projectNumber || (ord.locationId ? extractProjectNumber(ord.locationId) : extractProjectNumber(ord.orderNumber));
  const serviceType = ord.jobType || "";
  const rawAddOns = ord.serviceTypeAddOns || "";
  const cityState = ord.cityState || ord.serviceAddress || "";

  const headerInfo = formatNDSTaskHeaderLine(ord, projectNumber, cityState, serviceType, rawAddOns);
  if (headerInfo.isAlg || headerInfo.isMachine) return true;

  const rawMethod = (
    ord.method ||
    ord.rawRowData?.["Method"] ||
    ord.rawRowData?.["Method (from Locations)"] ||
    ord.rawRowData?.["Method (from Project ID) (from Locations)"] ||
    ord.rawRowData?.["Method (from Project ID)"] ||
    ord.rawRowData?.["Study Method"] ||
    ""
  );

  const rawService = (
    ord.jobType ||
    ord.rawRowData?.["Service Types (from Project ID) (from Locations)"] ||
    ord.rawRowData?.["Service Types (from Locations)"] ||
    ord.rawRowData?.["Service Types"] ||
    ord.rawRowData?.["Service Type"] ||
    ord.rawRowData?.["Study Type"] ||
    ""
  );

  const rawAddons = (
    ord.serviceTypeAddOns ||
    ord.rawRowData?.["Service Type Add-Ons (from Project ID) (from Locations)"] ||
    ord.rawRowData?.["Service Type Add-Ons (from Locations)"] ||
    ord.rawRowData?.["Service Type Add-Ons"] ||
    ord.rawRowData?.["Service Type Add Ons"] ||
    ord.rawRowData?.["Add-Ons"] ||
    ""
  );

  const textToCheck = `${rawMethod} ${rawService} ${rawAddons}`;
  return /\b(?:ALG|Algorithm|ATR|Road Tube|Pneumatic Tube)\b/i.test(textToCheck);
}

/**
 * Helper to check if group contains ALG or ATR study
 */
export function isAlgOrAtrGroup(group: GroupedProjectTask): boolean {
  return group.orders.some(isAlgOrAtrOrder);
}

/**
 * Checks if an individual order represents a TMC study.
 * Excludes ALG/ATR, Driveway (DWY), Parking (PKG), Queue (QUE), Screenline (SCN), Mainline (MNL), etc.
 */
export function isTmcOrder(ord: WorkOrder): boolean {
  if (isAlgOrAtrOrder(ord)) return false;

  const rawService = (
    ord.jobType ||
    ord.rawRowData?.["Service Types (from Project ID) (from Locations)"] ||
    ord.rawRowData?.["Service Types (from Locations)"] ||
    ord.rawRowData?.["Service Types"] ||
    ord.rawRowData?.["Service Type"] ||
    ord.rawRowData?.["Study Type"] ||
    ""
  );

  const rawMethod = (
    ord.method ||
    ord.rawRowData?.["Method"] ||
    ord.rawRowData?.["Method (from Locations)"] ||
    ord.rawRowData?.["Method (from Project ID) (from Locations)"] ||
    ord.rawRowData?.["Method (from Project ID)"] ||
    ord.rawRowData?.["Study Method"] ||
    ""
  );

  const textToCheck = `${rawMethod} ${rawService}`;
  return /\b(?:TMC|Turning Movement)\b/i.test(textToCheck);
}

/**
 * Helper to check if group contains TMC study
 */
export function isTmcGroup(group: GroupedProjectTask): boolean {
  return group.orders.some(isTmcOrder);
}

/**
 * Helper to check if group contains TMC or ATR study
 */
export function isTmcOrAtrGroup(group: GroupedProjectTask): boolean {
  return isTmcGroup(group) || isAlgOrAtrGroup(group);
}

/**
 * Helper to check if group contains SPEED add-ons
 */
export function isSpeedAddonGroup(group: GroupedProjectTask): boolean {
  return group.orders.some((ord) => {
    const rawCols = [
      ord.serviceTypeAddOns,
      ord.jobType,
      ord.description,
      ord.specialInstructions,
      ord.rawRowData?.["Service Type Add Ons (from Project ID) (from Locations)"],
      ord.rawRowData?.["Service Type Add Ons (from Locations)"],
      ord.rawRowData?.["Service Type Add Ons"],
      ord.rawRowData?.["Service Type Add-Ons"],
      ord.rawRowData?.["Add Ons"],
      ord.rawRowData?.["Add-Ons"],
      ord.rawRowData?.["Addons"],
    ].filter(Boolean).join(" ").toLowerCase();

    const projNum = (ord.projectNumber || "").toLowerCase();
    const locId = (ord.locationId || "").toLowerCase();

    return rawCols.includes("speed") || projNum.includes("speed") || locId.includes("speed");
  });
}

/**
 * Extracts and categorizes notes from work orders in a group with conditional injection
 */
export function extractGroupNotes(
  group: GroupedProjectTask,
  daySection?: string,
  branding?: TemplateBranding
): { text: string; subText?: string; isSpeedNaming?: boolean; isTmcAtrInstall?: boolean; isKmzPlacement?: boolean }[] {
  const effectiveRegion =
    (branding?.selectedRegion && branding.selectedRegion !== "all" ? branding.selectedRegion : undefined) ||
    (branding?.regionName && branding.regionName !== "all" ? branding.regionName : undefined) ||
    group.primaryOrder?.region ||
    "North East";

  // Per requirement: For Florida and Southeast region, notes are ONLY placed above install/teardown lines per day section, NOT per project.
  const isFlSeRegion =
    effectiveRegion === "Florida" ||
    effectiveRegion === "South East";

  if (isFlSeRegion) {
    return [];
  }

  const notesMap = new Map<string, { text: string; subText?: string; isSpeedNaming?: boolean; isTmcAtrInstall?: boolean; isKmzPlacement?: boolean }>();

  const isEnabled = branding?.enableAdditionalNotes !== false;
  const presets = (branding?.additionalNotes && branding.additionalNotes.length > 0
    ? branding.additionalNotes
    : DEFAULT_PRESET_NOTES
  );

  const groupProjectNum = group.primaryOrder?.projectNumber || (group.primaryOrder?.locationId ? extractProjectNumber(group.primaryOrder.locationId) : extractProjectNumber(group.primaryOrder?.orderNumber || ""));

  if (isEnabled) {
    presets.forEach((preset) => {
      if (!preset.enabled) return;

      // Check Scopes (Days, Project, Category, Region)
      if (!matchesDayFilter(preset.targetDays, daySection)) return;
      if (!matchesProjectFilter(preset.targetProjects, groupProjectNum, group.projectNumber)) return;
      if (!matchesCategoryFilter(preset.targetCategory, group.category)) return;
      if (!isNoteMatchingRegion(preset, effectiveRegion)) return;
      if (!matchesRegionFilter(preset.targetRegions, branding, effectiveRegion)) return;

      // Auto-trigger condition checks:
      if (preset.autoTriggerType === "tmc_install") {
        if (group.category === "Install" && isTmcGroup(group)) {
          notesMap.set(preset.id || "tmc_install", {
            text: preset.text,
            isTmcAtrInstall: true,
          });
        }
      } else if (preset.autoTriggerType === "alg_atr_install") {
        if (group.category === "Install" && isAlgOrAtrGroup(group)) {
          notesMap.set(preset.id || "alg_atr_install", {
            text: preset.text,
            isTmcAtrInstall: true,
          });
        }
      } else if (preset.autoTriggerType === "tmc_atr_install") {
        if (group.category === "Install" && isTmcOrAtrGroup(group)) {
          notesMap.set(preset.id || "tmc_atr_install", {
            text: preset.text,
            isTmcAtrInstall: true,
          });
        }
      } else if (preset.autoTriggerType === "speed_teardown_swap") {
        if ((group.category === "Teardown" || group.category === "BatterySwap") && isSpeedAddonGroup(group)) {
          notesMap.set(preset.id || "speed_teardown_swap", {
            text: preset.text,
            isSpeedNaming: true,
          });
        }
      } else if (preset.autoTriggerType === "green_batteries") {
        if (group.category === "Install") {
          notesMap.set(preset.id || "green_batteries", {
            text: preset.text,
          });
        }
      } else if (preset.autoTriggerType === "kmz_placement") {
        notesMap.set(preset.id || "kmz_placement", {
          text: preset.text,
          isKmzPlacement: true,
        });
      } else if (
        preset.autoTriggerType === "fl_se_day_note" ||
        preset.isFloridaOrSouthEastNote ||
        preset.id?.startsWith("fl_se_note")
      ) {
        const isTargetFLorSE =
          effectiveRegion === "Florida" ||
          effectiveRegion === "South East";

        const isTargetNEorMA =
          effectiveRegion === "North East" ||
          effectiveRegion === "Mid Atlantic";

        // Never inject Florida or South East notes into North East or Mid Atlantic
        if (isTargetNEorMA || !isTargetFLorSE) {
          return;
        }

        notesMap.set(preset.id || preset.text, {
          text: preset.text,
          subText: preset.subText,
        });
      } else if (
        preset.isNorthEastOrMidAtlanticNote ||
        preset.id?.startsWith("preset_ne_ma_")
      ) {
        const isTargetNEorMA =
          effectiveRegion === "North East" ||
          effectiveRegion === "Mid Atlantic";

        const isTargetFLorSE =
          effectiveRegion === "Florida" ||
          effectiveRegion === "South East";

        // Never inject North East or Mid Atlantic notes into Florida or South East
        if (isTargetFLorSE || !isTargetNEorMA) {
          return;
        }

        notesMap.set(preset.id || preset.text, {
          text: preset.text,
          subText: preset.subText,
        });
      } else {
        // If a custom note starts with "For <Day> installs/Teardowns:", guard against non-FL/SE regions
        if (
          /^For\s+(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s+(?:installs|Teardowns|installs\/Teardowns):/i.test(
            preset.text.trim()
          )
        ) {
          const isTargetFLorSE =
            effectiveRegion === "Florida" ||
            effectiveRegion === "South East";

          const isTargetNEorMA =
            effectiveRegion === "North East" ||
            effectiveRegion === "Mid Atlantic";

          if (isTargetNEorMA || !isTargetFLorSE) {
            return;
          }
        }

        // Custom or manually scoped preset note
        notesMap.set(preset.id || preset.text, {
          text: preset.text,
          subText: preset.subText,
        });
      }
    });
  }

  // Conduct Study: automatically inject Preset Note #9 (Parking Inventory Requirements & KMZ Coverage)
  if (shouldConductStudyForOrder(group.primaryOrder, branding)) {
    const preset9 = presets.find(
      (p) => p.id === "preset_parking_inventory" || p.autoTriggerType === "parking_inventory"
    ) || DEFAULT_PRESET_NOTES.find((p) => p.id === "preset_parking_inventory");
    if (preset9) {
      notesMap.set("preset_parking_inventory", {
        text: preset9.text,
        subText: preset9.subText,
      });
    }
  }

  // Also include order-specific non-generic instructions if any
  group.orders.forEach((ord) => {
    const rawList = [
      ord.specialInstructions,
      ord.rawRowData?.["Dispatcher Notes"],
      ord.rawRowData?.["Special Instructions"],
    ].filter(Boolean) as string[];

    rawList.forEach((raw) => {
      const trimmed = raw.trim();
      if (!trimmed || ["none", "no", "n/a", "na", "service task as assigned", "task as assigned", "tbd"].includes(trimmed.toLowerCase())) return;
      if (trimmed.toLowerCase().includes("data being collected by")) return;
      if (trimmed.toLowerCase().startsWith("wo-")) return;
      if (
        trimmed.toLowerCase().includes("ensure that poles are extended") ||
        trimmed.toLowerCase().includes("file naming") ||
        trimmed.toLowerCase().includes("everything within the polygon") ||
        trimmed.toLowerCase().includes("all nds logos must be covered") ||
        trimmed.toLowerCase().includes("inclement weather") ||
        trimmed.toLowerCase().includes("red que lines") ||
        trimmed.toLowerCase().includes("working with other technician") ||
        trimmed.toLowerCase().includes("private contractor who will conduct") ||
        trimmed.toLowerCase().includes("red-light violation") ||
        trimmed.toLowerCase().includes("hard due date") ||
        trimmed.toLowerCase().includes("upload data asap as this project is priority client") ||
        trimmed.toLowerCase().includes("prioritize uploads after teardown") ||
        trimmed.toLowerCase().includes("cameras must be formatted to record 1080p")
      ) return; // Handled by presets

      if (trimmed.length > 15 && !notesMap.has(trimmed) && !trimmed.toLowerCase().includes("assigned")) {
        notesMap.set(trimmed, { text: trimmed });
      }
    });
  });

  return sortNotesWithDayInstallsTeardownsOnTop(Array.from(notesMap.values()));
}

/**
 * Render notes formatted cleanly for HTML output immediately below task lines
 */
export function renderGroupNotesHtml(group: GroupedProjectTask, daySection?: string, branding?: TemplateBranding): string {
  const notes = extractGroupNotes(group, daySection, branding);
  if (notes.length === 0) return "";

  const notesHtml = notes
    .map((n) => {
      // 1. SPEED File Naming format (green Note prefix + yellow format text as in reference)
      if (n.isSpeedNaming || (n.text.includes("file naming") && n.text.includes("SPEED"))) {
        return `
        <div style="margin: 4px 0 6px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.45; color: #000000;">
          <span style="background-color: #00FF00; color: #000000; font-weight: bold; font-style: italic; padding: 1px 4px;">Note: Please make sure to follow the correct file naming when uploading data for all SPEED locations being collecting by camera.</span> <span style="background-color: #FFFF00; color: #000000; font-weight: bold; font-style: italic; padding: 1px 4px;">See correct Format: &lt;ALG&gt;SPACE&lt;Project Number&gt;SPACE&lt;SPEED&gt; | Example: “ALG 25-99999 SPEED”.</span>
        </div>`;
      }

      // 2. Multi-line note (e.g. TMC / ALG Studies Note or Custom Notes with yellow highlight)
      const lines = n.text.split("\n");
      const linesHtml = lines
        .map((l) => {
          if (!l.trim()) {
            return `<div style="height: 8px; line-height: 8px; font-size: 8pt; margin: 0; padding: 0;">&nbsp;</div>`;
          }
          const leadingSpacesCount = l.match(/^ +/)?.[0].length || 0;
          const indentHtml = leadingSpacesCount > 0 ? "&nbsp;".repeat(leadingSpacesCount) : "";
          const trimmed = l.trim();
          return `<div style="margin-bottom: 2px;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; font-style: italic; padding: 1px 4px;">${indentHtml}${escapeHtml(trimmed)}</span></div>`;
        })
        .join("");

      return `
      <div style="margin: 4px 0 6px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.45; color: #000000;">
        ${linesHtml}
        ${
          n.subText
            ? `<div style="margin-top: 2px; margin-left: 20px;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; font-style: italic; padding: 1px 4px;">${escapeHtml(n.subText)}</span></div>`
            : ""
        }
      </div>`;
    })
    .join("");

  return notesHtml;
}

/**
 * Render notes formatted for Plain Text output
 */
export function renderGroupNotesText(group: GroupedProjectTask, daySection?: string, branding?: TemplateBranding): string {
  const notes = extractGroupNotes(group, daySection, branding);
  if (notes.length === 0) return "";

  const lines = notes.map((n) => {
    let out = n.text;
    if (
      !out.startsWith("Note:") &&
      !out.startsWith("Note :") &&
      !out.startsWith("For ") &&
      !out.startsWith("Loc.") &&
      !out.startsWith("(") &&
      !out.startsWith("“") &&
      !out.startsWith("\"")
    ) {
      out = `Note: ${out}`;
    }
    if (n.subText) {
      out += `\n                ${n.subText}`;
    }
    return out;
  });

  return `\n${lines.join("\n")}`;
}

/**
 * Helper to check if a note is a "For (Day) installs/teardowns:" note.
 * Matches notes starting with:
 * "For Monday installs:", "For Tuesday teardowns:", "For (Day) installs:", "For Sunday installs/teardowns:", etc.
 */
export function isDayInstallsOrTeardownsNote(note: { text?: string }): boolean {
  if (!note?.text) return false;
  const clean = note.text.trim();
  // 1. Matches "For <Day> installs:" or "For (Day) installs/teardowns:" with colon
  if (/^\s*For\s+.*?\b(?:installs?|teardowns?|installations?|pickups?)\s*:/i.test(clean)) {
    return true;
  }
  // 2. Matches "For <Day> installs" or "For (Day) installs/teardowns" at start of text
  if (/^\s*For\s+(?:(?:\([A-Za-z0-9\s/_-]+\)|[A-Za-z0-9_-]+)\s+)?(?:installs?|teardowns?|installations?|pickups?)\b/i.test(clean)) {
    return true;
  }
  return false;
}

/**
 * Sorts note items so that notes starting with "For (Day) installs/teardowns:" are ALWAYS placed
 * on the TOP layer (first before TMC, ALG, and other notes).
 */
export function sortNotesWithDayInstallsTeardownsOnTop<T extends { text?: string }>(notes: T[]): T[] {
  if (!notes || notes.length <= 1) return notes;

  const topDayNotes: T[] = [];
  const otherNotes: T[] = [];

  notes.forEach((n) => {
    if (isDayInstallsOrTeardownsNote(n)) {
      topDayNotes.push(n);
    } else {
      otherNotes.push(n);
    }
  });

  return [...topDayNotes, ...otherNotes];
}

/**
 * Extracts day-level notes for Florida and South East regions.
 * Per requirement: Notes are only placed above install/teardown lines, not per project.
 * Exactly one note for TMC/ALG (if present) per Day section.
 * Automatic notes are not added per project but per day instead if there is a project on that day.
 * Notes with "For (Day) installs/teardowns:" are ALWAYS placed on the TOP layer.
 */
export function extractFloridaSouthEastDayNotes(
  dayOrders: WorkOrder[],
  daySection: string,
  branding?: TemplateBranding,
  region?: string
): { text: string; subText?: string }[] {
  if (!dayOrders || dayOrders.length === 0 || branding?.enableAdditionalNotes === false) {
    return [];
  }

  const effectiveRegion =
    (branding?.selectedRegion && branding.selectedRegion !== "all" ? branding.selectedRegion : undefined) ||
    (branding?.regionName && branding.regionName !== "all" ? branding.regionName : undefined) ||
    region ||
    dayOrders[0]?.region ||
    "Florida";

  const presets = (branding?.additionalNotes && branding.additionalNotes.length > 0
    ? branding.additionalNotes
    : DEFAULT_PRESET_NOTES
  ).filter((p) => p.enabled && isNoteMatchingRegion(p, effectiveRegion));

  const notesMap = new Map<string, { text: string; subText?: string }>();

  const hasTmcInstall = dayOrders.some((o) => isTmcOrder(o) && (o.taskCategory === "Install" || !o.taskCategory));
  const hasAlgAtrInstall = dayOrders.some((o) => isAlgOrAtrOrder(o) && (o.taskCategory === "Install" || !o.taskCategory));
  const hasTmcOrder = dayOrders.some(isTmcOrder);
  const hasAlgAtrOrder = dayOrders.some(isAlgOrAtrOrder);
  const hasInstall = dayOrders.some((o) => o.taskCategory === "Install" || !o.taskCategory);
  const hasTeardown = dayOrders.some((o) => o.taskCategory === "Teardown");

  // Project numbers present on this day
  const dayProjectNumbers = new Set(
    dayOrders
      .map((o) => o.projectNumber || (o.locationId ? extractProjectNumber(o.locationId) : extractProjectNumber(o.orderNumber || "")))
      .filter(Boolean)
  );

  presets.forEach((preset) => {
    // 1. Day scope check
    if (!matchesDayFilter(preset.targetDays, daySection)) return;

    // 2. Project scope check (if targeted to specific project, check if that project is on this day)
    if (preset.targetProjects && preset.targetProjects.length > 0 && !preset.targetProjects.includes("All")) {
      const matchesAnyDayProject = preset.targetProjects.some((p) => dayProjectNumbers.has(p));
      if (!matchesAnyDayProject) return;
    }

    // 3. Category scope check
    if (preset.targetCategory && preset.targetCategory !== "All") {
      if (preset.targetCategory === "Install" && !hasInstall) return;
      if (preset.targetCategory === "Teardown" && !hasTeardown) return;
    }

    // 4. Auto-trigger type checks
    if (preset.autoTriggerType === "tmc_install" || preset.id === "preset_tmc_install") {
      const condition = preset.targetCategory === "Install" ? hasTmcInstall : hasTmcOrder;
      if (condition) {
        notesMap.set("preset_tmc_install", { text: preset.text, subText: preset.subText });
      }
    } else if (preset.autoTriggerType === "alg_atr_install" || preset.id === "preset_alg_atr_install") {
      const condition = preset.targetCategory === "Install" ? hasAlgAtrInstall : hasAlgAtrOrder;
      if (condition) {
        notesMap.set("preset_alg_atr_install", { text: preset.text, subText: preset.subText });
      }
    } else if (preset.autoTriggerType === "tmc_atr_install" || preset.id === "preset_tmc_atr_install") {
      if (hasTmcOrder || hasAlgAtrOrder) {
        notesMap.set("preset_tmc_atr_install", { text: preset.text, subText: preset.subText });
      }
    } else {
      // General FL/SE note (e.g. NWT logos or custom day note)
      notesMap.set(preset.id || preset.text, { text: preset.text, subText: preset.subText });
    }
  });

  const rawNotes = Array.from(notesMap.values());
  return sortNotesWithDayInstallsTeardownsOnTop(rawNotes);
}

/**
 * Render day-level notes formatted cleanly for HTML output above install/teardown lines
 */
export function renderFloridaSouthEastDayNotesHtml(
  dayOrders: WorkOrder[],
  daySection: string,
  branding?: TemplateBranding,
  region?: string
): string {
  const notes = extractFloridaSouthEastDayNotes(dayOrders, daySection, branding, region);
  if (notes.length === 0) return "";

  const notesHtml = notes
    .map((n) => {
      const lines = n.text.split("\n");
      const linesHtml = lines
        .map((l) => {
          if (!l.trim()) {
            return `<div style="height: 8px; line-height: 8px; font-size: 8pt; margin: 0; padding: 0;">&nbsp;</div>`;
          }
          const leadingSpacesCount = l.match(/^ +/)?.[0].length || 0;
          const indentHtml = leadingSpacesCount > 0 ? "&nbsp;".repeat(leadingSpacesCount) : "";
          const trimmed = l.trim();
          return `<div style="margin-bottom: 2px;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; font-style: italic; padding: 1px 4px;">${indentHtml}${escapeHtml(trimmed)}</span></div>`;
        })
        .join("");

      return `
      <div style="margin: 4px 0 6px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.45; color: #000000;">
        ${linesHtml}
        ${
          n.subText
            ? `<div style="margin-top: 2px; margin-left: 20px;"><span style="background-color: #FFFF00; color: #000000; font-weight: bold; font-style: italic; padding: 1px 4px;">${escapeHtml(n.subText)}</span></div>`
            : ""
        }
      </div>`;
    })
    .join("");

  return `<div style="margin-bottom: 4px;">${notesHtml}</div><div style="height: 10px; line-height: 10px; font-size: 10pt; margin: 0; padding: 0;">&nbsp;</div>`;
}

/**
 * Render day-level notes formatted for Plain Text output above install/teardown lines
 */
export function renderFloridaSouthEastDayNotesText(
  dayOrders: WorkOrder[],
  daySection: string,
  branding?: TemplateBranding,
  region?: string
): string {
  const notes = extractFloridaSouthEastDayNotes(dayOrders, daySection, branding, region);
  if (notes.length === 0) return "";

  const lines = notes.map((n) => {
    let out = n.text;
    if (n.subText) {
      out += `\n                ${n.subText}`;
    }
    return out;
  });

  return lines.join("\n\n");
}

/**
 * Normalizes a technician's name to clean "Firstname Lastname":
 * 1. Automatically strips unnecessary double quotes ("), escaped quotes (\"), and smart quotes (“ ” „ ‟)
 * 2. If name is in "Surname, Firstname" format (e.g. "May, Dustyn" or "May, Dustyn"), rearranges it to "Dustyn May"
 * 3. Handles multiple space collapses and strips extraneous quotation marks from raw CSV imports
 */
export function formatTechnicianFullName(fullName?: string): string {
  if (!fullName) return "Technician";
  let cleaned = String(fullName).trim();
  if (!cleaned) return "Technician";

  // Remove backslash escapes before quotes e.g. \" or \'
  cleaned = cleaned.replace(/\\"/g, " ").replace(/\\'/g, "'");

  // Remove all types of double quotes and curly double quotes
  cleaned = cleaned.replace(/["“”„‟]/g, " ");

  // Remove surrounding single quotes or backticks
  cleaned = cleaned.replace(/^['`‘]+|['`’]+$/g, "");

  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Check if format contains a comma: "Surname, Firstname" (e.g. "May, Dustyn" -> "Dustyn May")
  if (cleaned.includes(",")) {
    const parts = cleaned.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const surname = parts[0].replace(/["“”„‟'`]/g, "").trim();
      const givenNames = parts.slice(1).join(" ").replace(/["“”„‟'`]/g, "").trim();
      cleaned = `${givenNames} ${surname}`.trim();
    }
  }

  // Remove any remaining stray quotes inside name tokens & collapse spaces
  cleaned = cleaned.replace(/["“”„‟]/g, "").replace(/\s+/g, " ").trim();

  return cleaned || "Technician";
}

/**
 * Extracts first name from a technician's full name on a first-name basis (e.g. "Dustyn May" or "May, Dustyn" -> "Dustyn")
 */
export function extractFirstName(fullName?: string): string {
  if (!fullName) return "Technician";
  const normalized = formatTechnicianFullName(fullName);
  const firstWord = normalized.split(/\s+/)[0];
  return firstWord || normalized;
}

/**
 * Converts days collection or schedule details into hours collection string (e.g. "24-hr", "48-hr", "72-hr")
 */
export function formatCollectionDurationHours(scheduleDetails?: string, daysOfCollection?: string): string {
  const combined = `${scheduleDetails || ""} ${daysOfCollection || ""}`.trim();
  if (!combined) return "24-hr";

  // Check for explicit hour patterns e.g. "24-hr", "24hr", "48-hour", "72 hours"
  const hrMatch = combined.match(/(\d+)\s*(?:-| )?\s*(?:hr|hrs|hour|hours)\b/i);
  if (hrMatch) {
    return `${hrMatch[1]}-hr`;
  }

  // Check for explicit day patterns e.g. "1 Day: Tue/Wed/Thu = TBD", "1-day", "2 days", "3-day", "1 Day"
  const dayMatch = combined.match(/(\d+)\s*(?:-| )?\s*(?:day|days)\b/i);
  if (dayMatch) {
    const days = parseInt(dayMatch[1], 10);
    const hours = days * 24;
    return `${hours}-hr`;
  }

  // Check if string has just a number
  const singleNumMatch = combined.match(/\b(\d+)\b/);
  if (singleNumMatch) {
    const num = parseInt(singleNumMatch[1], 10);
    if (num <= 14) {
      return `${num * 24}-hr`;
    }
    return `${num}-hr`;
  }

  return "24-hr";
}

/**
 * Checks if a given time string represents 0:30 / 00:30 / 12:30 AM
 */
export function isMidnightThirtyTime(timeStr?: string): boolean {
  if (!timeStr) return false;
  const trimmed = timeStr.trim().toLowerCase();
  if (/(?:^|\b)(?:0{1,2}:30(?::00)?|12:30(?::00)?\s*am)(?:$|\b)/i.test(trimmed)) {
    return true;
  }
  if (
    trimmed.includes("00:30") ||
    trimmed.includes("0:30") ||
    trimmed.includes("12:30 am") ||
    trimmed.includes("12:30am") ||
    trimmed.includes("after midnight")
  ) {
    return true;
  }
  const hmMatch = trimmed.match(/(\d{1,2}):(\d{2})/);
  if (hmMatch) {
    let hour = parseInt(hmMatch[1], 10);
    const minute = parseInt(hmMatch[2], 10);
    const isAm = /am/i.test(trimmed);
    const isPm = /pm/i.test(trimmed);
    if (isAm && hour === 12) hour = 0;
    if (isPm && hour < 12) hour += 12;
    if (hour === 0 && minute === 30) return true;
  }
  return false;
}

/**
 * Converts a 24-hr or mixed time string into 12-hr format with uppercase AM / PM.
 * Used for Florida & South East teardown times.
 * Examples:
 * - "00:30" -> "12:30AM"
 * - "0:30"  -> "12:30AM"
 * - "18:00" -> "6:00PM"
 * - "14:00" -> "2:00PM"
 * - "08:30" -> "8:30AM"
 * - "12:00" -> "12:00PM"
 * - "00:00" -> "12:00AM"
 */
export function formatTo12HourTime(timeStr: string): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  if (!trimmed || trimmed.toLowerCase() === "anytime" || trimmed.toLowerCase() === "tbd") {
    return trimmed;
  }

  // If already in 12-hr format like "12:30 AM" or "12:30pm"
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]m)$/i);
  if (ampmMatch) {
    let rawH = parseInt(ampmMatch[1], 10);
    const minute = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();
    if (rawH === 0) rawH = 12;
    return `${rawH}:${minute}${period}`;
  }

  // Parse HH:MM from string (e.g. "00:30", "0:30", "18:00", "14:30")
  const hmMatch = trimmed.match(/(?:^|\b)(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*([ap]m))?(?:$|\b)/i);
  if (hmMatch) {
    let hour = parseInt(hmMatch[1], 10);
    const minute = hmMatch[2];
    const modifier = hmMatch[3] ? hmMatch[3].toUpperCase() : null;

    if (modifier === "PM" && hour < 12) hour += 12;
    if (modifier === "AM" && hour === 12) hour = 0;

    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute}${period}`;
  }

  return trimmed;
}

/**
 * Resolves the timing label for a Teardown task header (e.g. "Anytime", "18:00", "12:30AM", etc.)
 * Rules:
 * - For Florida & South East regions:
 *   - Uses 12-hr format (AM & PM) instead of 24:00 time format.
 *   - If teardown time is 00:30, it reads as "12:30AM".
 *   - Teardown at 18:00 reads as "6:00PM", 14:00 reads as "2:00PM", etc.
 * - For North East, Mid Atlantic, etc.:
 *   - Teardowns with 00:30 time are replaced with "Anytime".
 *   - All other specific times use 24-hr format (e.g. "18:00", "14:00").
 */
export function resolveTeardownTimingLabel(
  o: WorkOrder,
  _useAnytime: boolean = false,
  branding?: TemplateBranding
): string {
  const activeRegion =
    (branding?.selectedRegion && branding.selectedRegion !== "all" ? branding.selectedRegion : undefined) ||
    (branding?.regionName && branding.regionName !== "all" ? branding.regionName : undefined) ||
    o.region ||
    "North East";
  const isFLorSE = activeRegion === "Florida" || activeRegion === "South East";

  const rawAfter = (o.teardownAfter || "").trim();
  const rawSlot = (o.timeSlot || "").trim();
  const rawNotes = (o.teardownTimeNotes || "").trim();

  // For non-FL/SE regions (North East, Mid Atlantic, etc.):
  // Any 00:30 / 0:30 / 12:30 AM / Midnight time must be replaced with "Anytime"
  if (!isFLorSE) {
    if (
      isMidnightThirtyTime(rawAfter) ||
      isMidnightThirtyTime(rawSlot) ||
      isMidnightThirtyTime(rawNotes)
    ) {
      return "Anytime";
    }
  }

  let timeStr = "";
  if (rawAfter) {
    const parsed = parseDateTimeString(rawAfter);
    if (parsed && parsed.timeSlot) {
      if (!isFLorSE && isMidnightThirtyTime(parsed.timeSlot)) {
        return "Anytime";
      }
      timeStr = parsed.timeSlot;
    }
  }

  if (!timeStr && rawSlot && !rawSlot.toLowerCase().includes("tbd") && !rawSlot.toLowerCase().includes("anytime")) {
    if (!isFLorSE && isMidnightThirtyTime(rawSlot)) {
      return "Anytime";
    }
    timeStr = rawSlot;
  }

  if (!timeStr && rawNotes && rawNotes.toLowerCase() !== "anytime") {
    if (!isFLorSE && isMidnightThirtyTime(rawNotes)) {
      return "Anytime";
    }
    const timeMatch = rawNotes.match(/(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]m)?)/i);
    if (timeMatch) {
      timeStr = timeMatch[1];
    } else {
      timeStr = rawNotes;
    }
  }

  // If FL/SE and one of the fields had midnight 00:30, ensure timeStr is "00:30"
  if (isFLorSE && !timeStr) {
    if (
      isMidnightThirtyTime(rawAfter) ||
      isMidnightThirtyTime(rawSlot) ||
      isMidnightThirtyTime(rawNotes)
    ) {
      timeStr = "00:30";
    }
  }

  if (!timeStr || timeStr.toLowerCase().includes("anytime")) {
    return "Anytime";
  }

  if (!isFLorSE && isMidnightThirtyTime(timeStr)) {
    return "Anytime";
  }

  const hmMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (hmMatch) {
    let hour = parseInt(hmMatch[1], 10);
    const minute = parseInt(hmMatch[2], 10);
    const isAm = /am/i.test(timeStr);
    const isPm = /pm/i.test(timeStr);
    if (isAm && hour === 12) hour = 0;
    if (isPm && hour < 12) hour += 12;

    if (!isFLorSE && hour === 0 && minute === 30) {
      return "Anytime";
    }

    if (isFLorSE) {
      // 12-hr format (AM & PM) for Florida and South East
      // e.g. 00:30 -> "12:30AM", 18:00 -> "6:00PM", 14:00 -> "2:00PM"
      return formatTo12HourTime(`${hour}:${minute.toString().padStart(2, "0")}`);
    }

    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    return formattedTime;
  }

  if (isFLorSE) {
    return formatTo12HourTime(timeStr);
  }

  return timeStr;
}

/**
 * Calculates previous calendar day string YYYY-MM-DD for a given date string
 */
export function getPreviousDayDateString(dateStr: string): string {
  if (!dateStr) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const date = new Date(y, m, d);
    date.setDate(date.getDate() - 1);
    const prevY = date.getFullYear();
    const prevM = String(date.getMonth() + 1).padStart(2, "0");
    const prevD = String(date.getDate()).padStart(2, "0");
    return `${prevY}-${prevM}-${prevD}`;
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    parsed.setDate(parsed.getDate() - 1);
    return parsed.toISOString().split("T")[0];
  }
  return dateStr;
}

/**
 * Resolves the effective schedule date for a work order.
 * By default, uses the exact Date in Teardown After column (Anytime mode).
 */
export function resolveOrderEffectiveDate(order: WorkOrder, useAnytimeTeardowns: boolean = true): string {
  if (useAnytimeTeardowns === false && order.taskCategory === "Teardown") {
    const rawAfter = (order.teardownAfter || "").trim();
    const timeSlot = (order.timeSlot || "").trim();
    const timeNotes = (order.teardownTimeNotes || "").trim();

    let timeStr = "";
    let baseDate = order.date;
    if (rawAfter) {
      const parsed = parseDateTimeString(rawAfter);
      if (parsed) {
        if (parsed.timeSlot) timeStr = parsed.timeSlot;
        if (parsed.date) baseDate = parsed.date;
      }
    }
    if (!timeStr && timeSlot && !timeSlot.toLowerCase().includes("tbd") && !timeSlot.toLowerCase().includes("anytime")) {
      timeStr = timeSlot;
    }
    if (!timeStr && timeNotes && timeNotes.toLowerCase() !== "anytime") {
      timeStr = timeNotes;
    }

    if (isMidnightThirtyTime(timeStr)) {
      return getPreviousDayDateString(baseDate);
    }
  }
  return order.date;
}

/**
 * Formats Teardown Timing Note according to NDS Dispatch rules:
 * - Florida & South East: 12-hr format (e.g. "After 12:30AM Wednesday morning", "After 6:30PM Wednesday night").
 * - Other regions: 24-hr format (00:30 replaced with "Anytime").
 */
export function formatNDSTeardownNote(
  order: WorkOrder,
  daySection?: string,
  useAnytime: boolean = true,
  branding?: TemplateBranding
): string {
  const activeRegion =
    (branding?.selectedRegion && branding.selectedRegion !== "all" ? branding.selectedRegion : undefined) ||
    (branding?.regionName && branding.regionName !== "all" ? branding.regionName : undefined) ||
    order.region ||
    "North East";
  const isFLorSE = activeRegion === "Florida" || activeRegion === "South East";

  // If Anytime option is on or time is 00:30 (and not FL/SE), format as "Anytime"
  if (useAnytime && !isFLorSE) {
    return "Anytime";
  }

  const rawNotes = (order.teardownTimeNotes || "").trim();
  const rawAfter = (order.teardownAfter || "").trim();
  const rawTimeSlot = (order.timeSlot || "").trim();

  // For non-FL/SE, all 00:30 teardowns are replaced with Anytime
  if (!isFLorSE) {
    if (
      isMidnightThirtyTime(rawAfter) ||
      isMidnightThirtyTime(rawTimeSlot) ||
      isMidnightThirtyTime(rawNotes)
    ) {
      return "Anytime";
    }
  }

  // 1. Detect time string and date
  let timeStr = "";
  let extractedDateStr = order.date || "";

  if (rawAfter) {
    const parsed = parseDateTimeString(rawAfter);
    if (parsed) {
      if (parsed.timeSlot) timeStr = parsed.timeSlot;
      if (parsed.date) extractedDateStr = parsed.date;
    }
  }

  if (!timeStr && rawTimeSlot && !rawTimeSlot.toLowerCase().includes("tbd") && !rawTimeSlot.toLowerCase().includes("anytime")) {
    timeStr = rawTimeSlot;
  }

  if (!timeStr && rawNotes && rawNotes.toLowerCase() !== "anytime") {
    const timeMatch = rawNotes.match(/(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]m)?)/i);
    if (timeMatch) {
      timeStr = timeMatch[1];
    }
  }

  if (!timeStr && isFLorSE) {
    if (
      isMidnightThirtyTime(rawAfter) ||
      isMidnightThirtyTime(rawTimeSlot) ||
      isMidnightThirtyTime(rawNotes)
    ) {
      timeStr = "00:30";
    }
  }

  if (!timeStr || (!isFLorSE && isMidnightThirtyTime(timeStr))) {
    return "Anytime";
  }

  // 2. Detect Day Section (e.g. Wednesday, Thursday)
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let targetDay = daySection || "";

  if (!targetDay && extractedDateStr) {
    const parts = extractedDateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      if (!isNaN(d.getTime())) {
        targetDay = daysOfWeek[d.getDay()];
      }
    }
  }

  if (!targetDay) {
    targetDay = "Wednesday";
  }

  // If no time is found, and rawNotes is provided, return it
  if (!timeStr) {
    if (rawNotes) return rawNotes;
    return "Anytime";
  }

  // 3. Parse hour and minute
  let hour = 0;
  let minute = 0;
  const isPm = /pm/i.test(timeStr);
  const isAm = /am/i.test(timeStr);

  const hmMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (hmMatch) {
    hour = parseInt(hmMatch[1], 10);
    minute = parseInt(hmMatch[2], 10);
  } else {
    return rawNotes || timeStr;
  }

  if (isPm && hour < 12) hour += 12;
  if (isAm && hour === 12) hour = 0;

  if (isFLorSE) {
    const formatted12Hr = formatTo12HourTime(`${hour}:${minute.toString().padStart(2, "0")}`);
    let timeOfDay = "night";
    if (hour < 12) {
      timeOfDay = "morning";
    } else if (hour >= 12 && hour < 18) {
      timeOfDay = "afternoon";
    } else {
      timeOfDay = "night";
    }
    return `After ${formatted12Hr} ${targetDay} ${timeOfDay}`;
  }

  // Format 24-hr time representation like "0:30", "18:30", "14:00", "10:00"
  const formattedTime = `${hour}:${minute.toString().padStart(2, "0")}`;

  // 4. Special Case for 0:30 Time (Midnight) -> Anytime
  if (hour === 0 && minute === 30) {
    return "Anytime";
  }

  // 5. General Time Formatting: Morning / Afternoon / Night
  let timeOfDay = "night";
  if (hour < 12) {
    timeOfDay = "morning";
  } else if (hour >= 12 && hour < 18) {
    timeOfDay = "afternoon";
  } else {
    timeOfDay = "night";
  }

  return `After ${formattedTime} ${targetDay} ${timeOfDay}`;
}

/**
 * Calculates a sorting minute value for ordering teardowns chronologically within the same day.
 * - If useAnytime is TRUE (or if teardown is explicitly "Anytime" / empty time):
 *   Returns -10000 so it is ALWAYS listed on the FIRST rows of that day's teardowns.
 * - Earlier times (e.g. 14:00, 16:00, 18:30, 19:00, 19:30) get their chronological minute-of-day (0 to 1439).
 * - 0:30 / 00:30 / 12:30 AM (Midnight) gets 9999999 so it is ALWAYS sorted on the LAST row of that day's teardowns.
 */
export function getTeardownSortMinute(order: WorkOrder, _useAnytime: boolean = false): number {
  const rawAfter = (order.teardownAfter || "").trim();
  const timeSlot = (order.timeSlot || "").trim();
  const rawNotes = (order.teardownTimeNotes || "").trim();

  let timeStr = "";
  if (rawAfter) {
    const parsed = parseDateTimeString(rawAfter);
    if (parsed && parsed.timeSlot) timeStr = parsed.timeSlot;
  }
  if (!timeStr && timeSlot && !timeSlot.toLowerCase().includes("tbd") && !timeSlot.toLowerCase().includes("anytime")) {
    timeStr = timeSlot;
  }
  if (!timeStr && rawNotes && rawNotes.toLowerCase() !== "anytime") {
    const timeMatch = rawNotes.match(/(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]m)?)/i);
    if (timeMatch) {
      timeStr = timeMatch[1];
    } else {
      timeStr = rawNotes;
    }
  }

  // Check for Midnight 0:30 in time string or notes
  if (isMidnightThirtyTime(timeStr) || isMidnightThirtyTime(rawNotes) || /after\s+midnight/i.test(rawNotes)) {
    return 9999999; // Always at the very end of the day's teardown list (last row)
  }

  if (!timeStr || timeStr.toLowerCase().includes("anytime") || (rawNotes && rawNotes.toLowerCase().includes("anytime"))) {
    return -10000; // Anytime is listed on the first rows!
  }

  // Parse hour & minute
  const hmMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (hmMatch) {
    let hour = parseInt(hmMatch[1], 10);
    const minute = parseInt(hmMatch[2], 10);
    const isAm = /am/i.test(timeStr);
    const isPm = /pm/i.test(timeStr);
    if (isAm && hour === 12) hour = 0;
    if (isPm && hour < 12) hour += 12;

    if (hour === 0 && minute === 30) {
      return 9999999; // 0:30 Midnight is ALWAYS on the last row
    }
    return hour * 60 + minute;
  }

  return -10000; // If no clock time is found, default to Anytime (first rows)
}

/**
 * Extracts numeric sequence value from a work order's scheduleOrder field (e.g. 1, 2, "3", "Order 4" -> 4).
 * Returns 999999 if not defined.
 */
export function getOrderScheduleSequence(ord: WorkOrder): number {
  if (ord.scheduleOrder !== undefined && ord.scheduleOrder !== null && ord.scheduleOrder !== "") {
    if (typeof ord.scheduleOrder === "number") return ord.scheduleOrder;
    const str = String(ord.scheduleOrder).trim();
    const match = str.match(/\d+(\.\d+)?/);
    if (match) {
      const val = parseFloat(match[0]);
      if (!isNaN(val)) return val;
    }
  }
  return 999999;
}

/**
 * Group orders for a single day by (Category + ProjectNumber).
 * If multiple locations with -001, -002 exist under the same Project Number on that day,
 * they will be grouped together and rendered with bullet points for each location.
 */
export function groupDayOrdersByProject(dayOrders: WorkOrder[], useAnytime?: boolean): GroupedProjectTask[] {
  const groups: GroupedProjectTask[] = [];
  const groupMap = new Map<string, GroupedProjectTask>();

  dayOrders.forEach((o) => {
    const projectNumber = o.projectNumber || (o.locationId ? extractProjectNumber(o.locationId) : extractProjectNumber(o.orderNumber));
    const category = o.taskCategory || "Install";
    // Group key by category + project number (if project number exists)
    const key = projectNumber ? `${category}:::${projectNumber}` : `single:::${o.id}`;

    let group = groupMap.get(key);
    if (!group) {
      group = {
        primaryOrder: o,
        orders: [],
        isMultiLocation: false,
        projectNumber,
        category,
      };
      groupMap.set(key, group);
      groups.push(group);
    }
    group.orders.push(o);
  });

  // Calculate total cameras and backup units, sort sub-locations, and mark multi-location
  groups.forEach((g) => {
    // Sort all sub-locations/orders in this group:
    g.orders.sort((a, b) => {
      // For Teardowns, if sub-locations have differing teardown times:
      if (g.category === "Teardown") {
        const timeA = getTeardownSortMinute(a, useAnytime);
        const timeB = getTeardownSortMinute(b, useAnytime);
        if (timeA !== timeB) return timeA - timeB;
      }

      const seqA = getOrderScheduleSequence(a);
      const seqB = getOrderScheduleSequence(b);
      if (seqA !== seqB) return seqA - seqB;

      const sufA = a.locationId ? extractLocationSuffix(a.locationId) : "";
      const sufB = b.locationId ? extractLocationSuffix(b.locationId) : "";
      const numA = parseInt(sufA || "0", 10);
      const numB = parseInt(sufB || "0", 10);
      if (numA !== numB) return numA - numB;
      return (a.locationId || "").localeCompare(b.locationId || "");
    });

    if (g.orders.length > 1) {
      g.isMultiLocation = true;
    }

    const firstOrder = g.orders[0];
    g.primaryOrder = { ...firstOrder };

    // Sum units (cameraCounts) + backup units (backupUnits) for the parent headline across all orders in the group
    let totalCams = 0;
    let hasExplicitCount = false;

    g.orders.forEach((ord) => {
      let ordUnits = 0;
      if (ord.cameraCounts !== undefined && ord.cameraCounts !== "") {
        hasExplicitCount = true;
        ordUnits = parseUnitNumber(ord.cameraCounts);
      } else {
        ordUnits = 1; // Default to 1 if not specified
      }

      let backupCount = 0;
      if (ord.backupUnits !== undefined && ord.backupUnits !== "") {
        hasExplicitCount = true;
        backupCount = parseUnitNumber(ord.backupUnits);
      }

      totalCams += (ordUnits + backupCount);
    });

    const firstWithScheduleDetails = g.orders.find((ord) => !!ord.scheduleDetails)?.scheduleDetails;
    const firstWithTeardownAfter = g.orders.find((ord) => !!ord.teardownAfter)?.teardownAfter;
    const firstWithTeardownTimeNotes = g.orders.find((ord) => !!ord.teardownTimeNotes)?.teardownTimeNotes;
    const firstWithDaysOfCollection = g.orders.find((ord) => !!ord.daysOfCollection)?.daysOfCollection;

    g.primaryOrder = {
      ...g.primaryOrder,
      cameraCounts: (hasExplicitCount || totalCams > 0) ? (totalCams === 0 ? "0 cameras" : (totalCams === 1 ? "1 camera" : `${totalCams} cameras`)) : g.primaryOrder.cameraCounts,
      scheduleDetails: g.primaryOrder.scheduleDetails || firstWithScheduleDetails,
      teardownAfter: g.primaryOrder.teardownAfter || firstWithTeardownAfter,
      teardownTimeNotes: g.primaryOrder.teardownTimeNotes || firstWithTeardownTimeNotes,
      daysOfCollection: g.primaryOrder.daysOfCollection || firstWithDaysOfCollection,
    };
  });

  // Sort groups:
  // 1. Installs -> Battery Swaps -> Teardowns
  // 2. For TEARDOWNS: Time basis in Teardown After supersedes Schedule Order logic!
  //    - "Anytime" -> First rows (sort value -10000)
  //    - Earlier times (14:00, 16:00, 18:30, 19:00) in chronological ascending order
  //    - After Midnight (0:30) -> ALWAYS on the LAST row (sort value 9999999)
  //    - Tie-break: Schedule Order (ascending), then project number
  // 3. For INSTALLS / BATTERY SWAPS: Schedule Order (ascending) comes first, then project number
  groups.sort((a, b) => {
    const catOrder: Record<string, number> = { Install: 1, BatterySwap: 2, Teardown: 3 };
    const catA = catOrder[a.category] || 1;
    const catB = catOrder[b.category] || 1;
    if (catA !== catB) return catA - catB;

    // For TEARDOWNS: Teardown Time supersedes Schedule Order
    if (a.category === "Teardown" && b.category === "Teardown") {
      const timeA = getTeardownSortMinute(a.primaryOrder, useAnytime);
      const timeB = getTeardownSortMinute(b.primaryOrder, useAnytime);
      if (timeA !== timeB) return timeA - timeB;

      // Tie-break with Schedule Order
      const minSeqA = Math.min(...a.orders.map(getOrderScheduleSequence));
      const minSeqB = Math.min(...b.orders.map(getOrderScheduleSequence));
      if (minSeqA !== minSeqB && (minSeqA < 999999 || minSeqB < 999999)) {
        return minSeqA - minSeqB;
      }

      return (a.projectNumber || "").localeCompare(b.projectNumber || "");
    }

    // For Installs and Battery Swaps: Schedule Order comes first
    const minSeqA = Math.min(...a.orders.map(getOrderScheduleSequence));
    const minSeqB = Math.min(...b.orders.map(getOrderScheduleSequence));
    if (minSeqA !== minSeqB && (minSeqA < 999999 || minSeqB < 999999)) {
      return minSeqA - minSeqB;
    }

    return (a.projectNumber || "").localeCompare(b.projectNumber || "");
  });

  return groups;
}

/**
 * Extracts a normalized project number from a GroupedProjectTask
 */
function getGroupProjectNumber(g: GroupedProjectTask): string {
  if (g.projectNumber && g.projectNumber.trim()) return g.projectNumber.trim();
  if (g.primaryOrder?.locationId) {
    const ext = extractProjectNumber(g.primaryOrder.locationId);
    if (ext) return ext.trim();
  }
  if (g.primaryOrder?.orderNumber) {
    const ext = extractProjectNumber(g.primaryOrder.orderNumber);
    if (ext) return ext.trim();
  }
  return "";
}

/**
 * Reorders a list of GroupedProjectTask according to a custom sequence of project numbers.
 * Any project number explicitly listed in customOrder is positioned first in that specific order.
 * Projects not present in customOrder are retained in their default sequence at the end.
 */
export function reorderProjectGroups(
  groups: GroupedProjectTask[],
  customOrder?: string[]
): GroupedProjectTask[] {
  if (!customOrder || customOrder.length === 0) return groups;

  const normalizedOrder = customOrder
    .map((p) => String(p).trim().toLowerCase())
    .filter(Boolean);

  if (normalizedOrder.length === 0) return groups;

  return [...groups].sort((a, b) => {
    const projA = getGroupProjectNumber(a).toLowerCase();
    const projB = getGroupProjectNumber(b).toLowerCase();
    const idxA = projA ? normalizedOrder.indexOf(projA) : -1;
    const idxB = projB ? normalizedOrder.indexOf(projB) : -1;

    if (idxA !== -1 && idxB !== -1) {
      if (idxA !== idxB) return idxA - idxB;
      const catOrder: Record<string, number> = { Install: 1, BatterySwap: 2, Teardown: 3 };
      return (catOrder[a.category] || 1) - (catOrder[b.category] || 1);
    }
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });
}

/**
 * Resolves the custom project sequence for a given day and technician, if active.
 */
export function getCustomDayProjectOrder(
  sectionDayName: string,
  sectionKey: string,
  roster?: TechnicianRoster,
  branding?: TemplateBranding
): string[] | null {
  if (!branding?.enableArrangeNewProjects) {
    return null;
  }

  const techName = roster?.technicianName?.trim();

  // 1. Check technician-specific custom order
  if (techName && branding.customTechDayProjectOrder) {
    // Exact match
    const techMap = branding.customTechDayProjectOrder[techName];
    if (techMap) {
      if (techMap[sectionKey]?.length) return techMap[sectionKey];
      if (techMap[sectionDayName]?.length) return techMap[sectionDayName];
    }
    // Case-insensitive / trimmed match
    const lowerTech = techName.toLowerCase();
    for (const [k, v] of Object.entries(branding.customTechDayProjectOrder)) {
      if (k.trim().toLowerCase() === lowerTech && v) {
        if (v[sectionKey]?.length) return v[sectionKey];
        if (v[sectionDayName]?.length) return v[sectionDayName];
      }
    }
  }

  // 2. Fall back to global day custom order
  if (branding.customDayProjectOrder) {
    if (branding.customDayProjectOrder[sectionKey]?.length) {
      return branding.customDayProjectOrder[sectionKey];
    }
    if (branding.customDayProjectOrder[sectionDayName]?.length) {
      return branding.customDayProjectOrder[sectionDayName];
    }
  }

  return null;
}

/**
 * Determines whether the Custom ID should be rendered for this work order based on the "Add Custom ID" toggle and project selection
 */
export function shouldIncludeCustomIdForOrder(order: WorkOrder, branding?: TemplateBranding): boolean {
  if (!branding || !branding.enableCustomId) {
    return false;
  }
  const customId = order.customId?.trim();
  if (!customId) {
    return false;
  }
  const targetProjects = branding.customIdProjects || [];
  if (targetProjects.length === 0 || targetProjects.includes("All")) {
    return true;
  }
  const orderProj = (
    order.projectNumber ||
    (order.locationId ? extractProjectNumber(order.locationId) : extractProjectNumber(order.orderNumber)) ||
    ""
  ).trim().toLowerCase();

  return targetProjects.some((p) => p.trim().toLowerCase() === orderProj);
}

/**
 * Format the Custom ID part for the bullet suffix e.g. " (111223344)"
 */
export function formatCustomIdBulletSuffix(order: WorkOrder, branding?: TemplateBranding): string {
  if (!shouldIncludeCustomIdForOrder(order, branding)) {
    return "";
  }
  const rawId = (order.customId || "").trim();
  if (!rawId) return "";
  if (rawId.startsWith("(") && rawId.endsWith(")")) {
    return ` ${rawId}`;
  }
  return ` (${rawId})`;
}

/**
 * Checks if a work order represents a parking study / inventory
 */
export function isParkingStudyOrder(order: WorkOrder): boolean {
  const combined = [
    order.jobType,
    order.serviceTypeAddOns,
    order.description,
    order.specialInstructions,
    order.rawRowData?.["Service Type"],
    order.rawRowData?.["Service Type Add Ons"],
    order.rawRowData?.["Service Type Add Ons (from Locations)"],
    order.rawRowData?.["Service Type Add Ons (from Project ID) (from Locations)"],
    order.rawRowData?.["Study Method"],
    order.rawRowData?.["Method"],
  ].filter(Boolean).join(" ").toLowerCase();

  return /\b(?:pkg|parking|parkings)\b/i.test(combined);
}

/**
 * Determines whether Conduct Study is enabled for a given work order / project
 */
export function shouldConductStudyForOrder(order: WorkOrder, branding?: TemplateBranding): boolean {
  if (!branding || !branding.enableConductStudy) {
    return false;
  }
  const targetProjects = branding.conductStudyProjects || [];
  if (targetProjects.length === 0 || targetProjects.includes("All")) {
    return true;
  }
  const orderProj = (
    order.projectNumber ||
    (order.locationId ? extractProjectNumber(order.locationId) : extractProjectNumber(order.orderNumber)) ||
    ""
  ).trim().toLowerCase();

  return targetProjects.some((p) => p.trim().toLowerCase() === orderProj);
}

/**
 * Render exact NDS task lines for Installs, Teardowns, and SD Card & Battery Swaps
 * Includes support for nested sub-location bullets (• 001 (111223344) 1 camera, • 002 1 camera...) and relocated Notes
 */
export function renderNDSTaskGroupHtml(
  group: GroupedProjectTask,
  daySection?: string,
  useAnytime?: boolean,
  branding?: TemplateBranding
): string {
  const o = group.primaryOrder;
  const projectNumber = o.projectNumber || (o.locationId ? extractProjectNumber(o.locationId) : extractProjectNumber(o.orderNumber));
  const serviceType = o.jobType || "Miovision";
  const rawAddOns = o.serviceTypeAddOns || "";
  const cityState = o.cityState || o.serviceAddress || "";
  const category = group.category;
  const isMachine = group.orders.some(isMachineOrder);

  // Format Project, City/State, Service and Add-ons using NDS header formatting rules
  const { formattedHtml, studyStr } = formatNDSTaskHeaderLine(
    o,
    projectNumber,
    cityState,
    serviceType,
    rawAddOns
  );

  // Unit count calculation for the task header line e.g. "(8 cameras, with backups)" or "(1 machine)"
  const unitCountPart = formatNDSTaskHeaderUnitCount(group);
  const unitPartFormatted = unitCountPart
    ? ` <i style="font-style: italic; font-weight: bold;">${unitCountPart}</i>`
    : "";

  let mainLine = "";

  const checkNoteHtml = isMachine
    ? `<span style="color: #000000; font-weight: normal; font-style: italic;">(Check if equipment’s are still working, tampered, etc., replace/adjust/swap if necessary).</span>`
    : `<span style="color: #000000; font-weight: normal; font-style: italic;">(Check if cameras are still working, tampered, etc., replace/adjust/swap if necessary).</span>`;

  const isConduct = shouldConductStudyForOrder(o, branding);

  if (category === "BatterySwap") {
    if (isMachine) {
      mainLine = `
      <div style="margin: 6px 0 3px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000000; font-weight: bold;">
        <span style="background-color: #00FF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">Equipment Checks &amp; Swaps:</span> <span style="color: #FF0000; font-weight: bold;">Upload Data</span> <span style="color: #000000; font-weight: bold;">${formattedHtml}${unitPartFormatted}</span> ${checkNoteHtml}
      </div>`;
    } else {
      mainLine = `
      <div style="margin: 6px 0 3px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000000; font-weight: bold;">
        <span style="background-color: #00FFFF; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">Battery/SD Card Swaps:</span> <span style="color: #FF0000; font-weight: bold;">Upload Data</span> <span style="color: #000000; font-weight: bold;">${formattedHtml}${unitPartFormatted}</span> ${checkNoteHtml}
      </div>`;
    }
  } else if (isConduct) {
    // Conduct Study applies to BOTH Install and Teardown tasks
    const isParking = isParkingStudyOrder(o) || studyStr === "PKG" || /\b(?:pkg|parking)\b/i.test(serviceType);
    const actionLabel = isParking ? "Conduct Parking Inventory:" : `Conduct ${studyStr || "Study"}:`;
    mainLine = `
    <div style="margin: 6px 0 3px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000000; font-weight: bold;">
      <span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">${actionLabel}</span> <span style="color: #000000; font-weight: bold;">${formattedHtml}${unitPartFormatted}</span>
    </div>`;
  } else if (category === "Teardown") {
    const teardownTiming = resolveTeardownTimingLabel(o, useAnytime, branding);
    const timingLabel = teardownTiming ? `Teardown ${teardownTiming}:` : "Teardown:";
    mainLine = `
    <div style="margin: 6px 0 3px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000000; font-weight: bold;">
      <span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">${timingLabel}</span> <span style="color: #FF0000; font-weight: bold;">Upload Data</span> <span style="color: #000000; font-weight: bold;">${formattedHtml}${unitPartFormatted}</span>
    </div>`;
  } else {
    // Default: Install
    mainLine = `
    <div style="margin: 6px 0 3px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000000; font-weight: bold;">
      <span style="background-color: #FFFF00; color: #000000; font-weight: bold; padding: 0 4px; display: inline-block;">Install:</span> <span style="color: #000000; font-weight: bold;">${formattedHtml}${unitPartFormatted}</span>
    </div>`;
  }

  // Location bullets
  const disableNotes = branding?.disableScheduleNotes === true;
  const validBullets = group.orders
    .map((ord) => {
      const suffix = ord.locationId
        ? extractLocationSuffix(ord.locationId)
        : extractLocationSuffix(ord.orderNumber);
      const isMach = isMachineOrder(ord);
      const notesToUse = disableNotes ? "" : ord.scheduleNotes;
      const camStr = formatBulletEquipmentCount(ord, ord.cameraCounts, ord.backupUnits, notesToUse, disableNotes);
      const customIdPart = formatCustomIdBulletSuffix(ord, branding);
      return { suffix, camStr, isMachine: isMach, ord, customIdPart };
    })
    .filter((b) => !!b.suffix);

  let bulletsHtml = "";
  if (validBullets.length > 0) {
    bulletsHtml = validBullets
      .map((b) => {
        const camColor = "#FF0000";
        const camSpan = b.camStr ? ` <span style="color: ${camColor}; font-weight: bold; font-style: italic;">${b.camStr}</span>` : "";
        return `
        <div style="margin: 2px 0 2px 20px; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #000000;">
          <span style="font-weight: bold; color: #000000;">•&nbsp;&nbsp;&nbsp;${b.suffix}${b.customIdPart}</span>${camSpan}
        </div>`;
      })
      .join("");
  }

  // Notes relocated immediately below the bullets with 1-line separation
  const notesHtml = renderGroupNotesHtml(group, daySection, branding);
  const notesSectionHtml = notesHtml
    ? `<div style="height: 14px; line-height: 14px; font-size: 11pt; margin: 0; padding: 0;">&nbsp;</div>${notesHtml}`
    : "";

  return `${mainLine}${bulletsHtml}${notesSectionHtml}<div style="height: 14px; line-height: 14px; font-size: 11pt; margin: 0; padding: 0;">&nbsp;</div>`;
}

export function renderNDSTaskGroupText(
  group: GroupedProjectTask,
  daySection?: string,
  useAnytime?: boolean,
  branding?: TemplateBranding
): string {
  const o = group.primaryOrder;
  const projectNumber = o.projectNumber || (o.locationId ? extractProjectNumber(o.locationId) : extractProjectNumber(o.orderNumber));
  const serviceType = o.jobType || "Miovision";
  const rawAddOns = o.serviceTypeAddOns || "";
  const cityState = o.cityState || o.serviceAddress || "";
  const category = group.category;
  const isMachine = group.orders.some(isMachineOrder);

  const { formattedText, studyStr } = formatNDSTaskHeaderLine(
    o,
    projectNumber,
    cityState,
    serviceType,
    rawAddOns
  );

  const unitCountPart = formatNDSTaskHeaderUnitCount(group);
  const unitPartFormatted = unitCountPart ? ` ${unitCountPart}` : "";

  const checkNoteText = isMachine
    ? "(Check if equipment’s are still working, tampered, etc., replace/adjust/swap if necessary)."
    : "(Check if cameras are still working, tampered, etc., replace/adjust/swap if necessary).";

  let mainLine = "";
  const isConduct = shouldConductStudyForOrder(o, branding);

  if (category === "BatterySwap") {
    if (isMachine) {
      mainLine = `Equipment Checks & Swaps: Upload Data ${formattedText}${unitPartFormatted} ${checkNoteText}`;
    } else {
      mainLine = `Battery/SD Card Swaps: Upload Data ${formattedText}${unitPartFormatted} ${checkNoteText}`;
    }
  } else if (isConduct) {
    // Conduct Study applies to BOTH Install and Teardown tasks
    const isParking = isParkingStudyOrder(o) || studyStr === "PKG" || /\b(?:pkg|parking)\b/i.test(serviceType);
    const actionLabel = isParking ? "Conduct Parking Inventory:" : `Conduct ${studyStr || "Study"}:`;
    mainLine = `${actionLabel} ${formattedText}`;
  } else if (category === "Teardown") {
    const teardownTiming = resolveTeardownTimingLabel(o, useAnytime, branding);
    const timingLabel = teardownTiming ? `Teardown ${teardownTiming}:` : "Teardown:";
    mainLine = `${timingLabel} Upload Data ${formattedText}${unitPartFormatted}`;
  } else {
    mainLine = `Install: ${formattedText}${unitPartFormatted}`;
  }

  const disableNotes = branding?.disableScheduleNotes === true;
  const validBullets = group.orders
    .map((ord) => {
      const suffix = ord.locationId
        ? extractLocationSuffix(ord.locationId)
        : extractLocationSuffix(ord.orderNumber);
      const isMach = isMachineOrder(ord);
      const notesToUse = disableNotes ? "" : ord.scheduleNotes;
      const camStr = formatBulletEquipmentCount(ord, ord.cameraCounts, ord.backupUnits, notesToUse, disableNotes);
      const customIdPart = formatCustomIdBulletSuffix(ord, branding);
      return { suffix, camStr, customIdPart };
    })
    .filter((b) => !!b.suffix);

  let bulletLines = "";
  if (validBullets.length > 0) {
    bulletLines = "\n" + validBullets.map((b) => `•\t${b.suffix}${b.customIdPart}${b.camStr ? ` ${b.camStr}` : ""}`).join("\n");
  }

  const notesText = renderGroupNotesText(group, daySection, branding);
  const notesPart = notesText ? `\n\n${notesText.trim()}` : "";

  return `${mainLine}${bulletLines}${notesPart}`;
}

export function renderNDSTaskItemHtml(o: WorkOrder, daySection?: string, useAnytime?: boolean, branding?: TemplateBranding): string {
  const groups = groupDayOrdersByProject([o], useAnytime);
  return groups.length > 0 ? renderNDSTaskGroupHtml(groups[0], daySection, useAnytime, branding) : "";
}

export function renderNDSTaskItemText(o: WorkOrder, daySection?: string, useAnytime?: boolean, branding?: TemplateBranding): string {
  const groups = groupDayOrdersByProject([o], useAnytime);
  return groups.length > 0 ? renderNDSTaskGroupText(groups[0], daySection, useAnytime, branding) : "";
}

export function getPriorityColors(priority: string) {
  switch (priority) {
    case "Urgent":
      return { bg: "#FEE2E2", text: "#991B1B", border: "#F87171", badge: "#DC2626" };
    case "High":
      return { bg: "#FFEDD5", text: "#9A3412", border: "#FDBA74", badge: "#EA580C" };
    case "Low":
      return { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", badge: "#64748B" };
    default:
      return { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD", badge: "#2563EB" };
  }
}

export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

// Calculate Sunday - Saturday date range for a given date formatted as MM/DD/YYYY
export function formatToMMDDYYYY(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export function formatToMMDDYY(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

export function formatToMMDD(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

/**
 * Checks if the email format is strictly for South East region.
 * Returns true ONLY when the region is explicitly South East.
 * For North East, Mid Atlantic, Florida, and other regions, returns FALSE.
 */
export function isSouthEastRegion(
  roster?: TechnicianRoster,
  branding?: TemplateBranding
): boolean {
  const selected = (branding?.selectedRegion || "").trim();
  const regionName = (branding?.regionName || "").trim();
  const rosterRegion = (roster?.region || "").trim();

  // If user explicitly chose South East in the region selector
  if (selected === "South East") {
    return true;
  }
  // If user explicitly chose another specific region (like Florida or North East), it's not South East
  if (selected && selected !== "all" && selected !== "South East") {
    return false;
  }

  // If regionName was explicitly changed to South East
  if (regionName === "South East") {
    return true;
  }

  // If technician's roster or order region is South East
  if (rosterRegion === "South East") {
    return true;
  }

  return false;
}

/**
 * Checks if the email format is strictly for Florida region.
 * Returns true ONLY when the region is explicitly Florida.
 * For North East, Mid Atlantic, South East, and other regions, returns FALSE.
 */
export function isFloridaRegion(
  roster?: TechnicianRoster,
  branding?: TemplateBranding
): boolean {
  const selected = (branding?.selectedRegion || "").trim();
  const regionName = (branding?.regionName || "").trim();
  const rosterRegion = (roster?.region || "").trim();

  // If user explicitly chose Florida in the region selector
  if (selected === "Florida") {
    return true;
  }
  // If user explicitly chose another specific region (like South East or North East), it's not Florida
  if (selected && selected !== "all" && selected !== "Florida") {
    return false;
  }

  // If regionName was explicitly changed to Florida
  if (regionName === "Florida") {
    return true;
  }

  // If technician's roster or order region is Florida
  if (rosterRegion === "Florida") {
    return true;
  }

  return false;
}

/**
 * Checks if the email should use the Florida or South East custom template format.
 * Returns true ONLY when the selected dispatch region or technician is explicitly "Florida" or "South East".
 * For "North East", "Mid Atlantic", and all other regions, returns FALSE to strictly preserve
 * the official Exact NDS Outlook template format.
 */
export function isFloridaOrSouthEastRegion(
  roster?: TechnicianRoster,
  branding?: TemplateBranding
): boolean {
  const selected = (branding?.selectedRegion || "").trim();
  if (selected && selected !== "all") {
    return selected === "Florida" || selected === "South East";
  }

  const regionName = (branding?.regionName || "").trim();
  if (regionName && regionName !== "all") {
    return regionName === "Florida" || regionName === "South East";
  }

  return isSouthEastRegion(roster, branding) || isFloridaRegion(roster, branding);
}

export function formatDateToYYYYMMDD(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Safely parse date string to local calendar Date without UTC offset shifts
 */
export function parseDateStringSafely(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const clean = dateStr.trim();
  // If YYYY-MM-DD
  const ymdMatch = clean.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    return new Date(parseInt(ymdMatch[1], 10), parseInt(ymdMatch[2], 10) - 1, parseInt(ymdMatch[3], 10));
  }
  // If MM/DD/YYYY
  const mdyMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (mdyMatch) {
    return new Date(parseInt(mdyMatch[3], 10), parseInt(mdyMatch[1], 10) - 1, parseInt(mdyMatch[2], 10));
  }
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }
  return new Date();
}

export interface WorkWeekOption {
  id: "current" | "incoming" | string;
  type: "current" | "incoming" | "other";
  label: string;
  formattedRange: string;
  fullLabel: string;
  sundayDate: Date;
  saturdayDate: Date;
  nextSundayDate: Date;
  sundayStr: string;
  saturdayStr: string;
  nextSundayStr: string;
  orderCount?: number;
}

/**
 * Computes standard Current and Incoming Work Week date boundaries (Sunday to Saturday or Sunday to Sunday).
 */
export function getStandardWorkWeekOptions(
  branding?: TemplateBranding,
  referenceDate?: Date
): { current: WorkWeekOption; incoming: WorkWeekOption } {
  const ref = referenceDate || new Date();
  const day = ref.getDay(); // 0 is Sunday

  // Current Sunday (00:00:00)
  const currentSun = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - day);
  const currentSat = new Date(currentSun.getFullYear(), currentSun.getMonth(), currentSun.getDate() + 6);
  const currentNextSun = new Date(currentSun.getFullYear(), currentSun.getMonth(), currentSun.getDate() + 7);

  // Incoming Sunday (+7 days)
  const incomingSun = new Date(currentSun.getFullYear(), currentSun.getMonth(), currentSun.getDate() + 7);
  const incomingSat = new Date(incomingSun.getFullYear(), incomingSun.getMonth(), incomingSun.getDate() + 6);
  const incomingNextSun = new Date(incomingSun.getFullYear(), incomingSun.getMonth(), incomingSun.getDate() + 7);

  const isSunSun = Boolean(branding?.enableSunSunView);

  const currentRange = isSunSun
    ? `${formatToMMDDYYYY(currentSun)} - ${formatToMMDDYYYY(currentNextSun)}`
    : `${formatToMMDDYYYY(currentSun)} - ${formatToMMDDYYYY(currentSat)}`;

  const incomingRange = isSunSun
    ? `${formatToMMDDYYYY(incomingSun)} - ${formatToMMDDYYYY(incomingNextSun)}`
    : `${formatToMMDDYYYY(incomingSun)} - ${formatToMMDDYYYY(incomingSat)}`;

  const currentSunStr = formatDateToYYYYMMDD(currentSun);
  const currentSatStr = formatDateToYYYYMMDD(currentSat);
  const currentNextSunStr = formatDateToYYYYMMDD(currentNextSun);

  const incomingSunStr = formatDateToYYYYMMDD(incomingSun);
  const incomingSatStr = formatDateToYYYYMMDD(incomingSat);
  const incomingNextSunStr = formatDateToYYYYMMDD(incomingNextSun);

  const current: WorkWeekOption = {
    id: "current",
    type: "current",
    label: "Current Work week",
    formattedRange: currentRange,
    fullLabel: `Current Work week ${currentRange}`,
    sundayDate: currentSun,
    saturdayDate: currentSat,
    nextSundayDate: currentNextSun,
    sundayStr: currentSunStr,
    saturdayStr: currentSatStr,
    nextSundayStr: currentNextSunStr,
  };

  const incoming: WorkWeekOption = {
    id: "incoming",
    type: "incoming",
    label: "Incoming Work week",
    formattedRange: incomingRange,
    fullLabel: `Incoming Work week ${incomingRange}`,
    sundayDate: incomingSun,
    saturdayDate: incomingSat,
    nextSundayDate: incomingNextSun,
    sundayStr: incomingSunStr,
    saturdayStr: incomingSatStr,
    nextSundayStr: incomingNextSunStr,
  };

  return { current, incoming };
}

/**
 * Returns available Work Week options including Current, Incoming, and any other detected weeks from orders.
 */
export function getWorkWeekOptions(
  orders: WorkOrder[] = [],
  branding?: TemplateBranding,
  referenceDate?: Date
): WorkWeekOption[] {
  const std = getStandardWorkWeekOptions(branding, referenceDate);
  const isSunSun = Boolean(branding?.enableSunSunView);

  let currentCount = 0;
  let incomingCount = 0;
  const otherWeeksMap = new Map<string, { sunday: Date; count: number }>();

  orders.forEach((o) => {
    const eff = resolveOrderEffectiveDate(o, branding?.useAnytimeTeardowns);
    if (!eff) return;
    const d = parseDateStringSafely(eff);
    if (isNaN(d.getTime())) return;
    const dStr = formatDateToYYYYMMDD(d);

    const currentEndBound = isSunSun ? std.current.nextSundayStr : std.current.saturdayStr;
    const incomingEndBound = isSunSun ? std.incoming.nextSundayStr : std.incoming.saturdayStr;

    if (dStr >= std.current.sundayStr && dStr <= currentEndBound) {
      currentCount++;
    } else if (dStr >= std.incoming.sundayStr && dStr <= incomingEndBound) {
      incomingCount++;
    } else {
      const oSun = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
      const oSunStr = formatDateToYYYYMMDD(oSun);
      if (!otherWeeksMap.has(oSunStr)) {
        otherWeeksMap.set(oSunStr, { sunday: oSun, count: 1 });
      } else {
        otherWeeksMap.get(oSunStr)!.count++;
      }
    }
  });

  const currentOption: WorkWeekOption = {
    ...std.current,
    orderCount: currentCount,
    fullLabel: `Current Work week ${std.current.formattedRange}${currentCount > 0 ? ` (${currentCount} jobs)` : ""}`,
  };

  const incomingOption: WorkWeekOption = {
    ...std.incoming,
    orderCount: incomingCount,
    fullLabel: `Incoming Work week ${std.incoming.formattedRange}${incomingCount > 0 ? ` (${incomingCount} jobs)` : ""}`,
  };

  const options: WorkWeekOption[] = [currentOption, incomingOption];

  const sortedOtherSundays = Array.from(otherWeeksMap.keys()).sort();
  sortedOtherSundays.forEach((oSunStr) => {
    const item = otherWeeksMap.get(oSunStr)!;
    const oSun = item.sunday;
    const oSat = new Date(oSun.getFullYear(), oSun.getMonth(), oSun.getDate() + 6);
    const oNextSun = new Date(oSun.getFullYear(), oSun.getMonth(), oSun.getDate() + 7);
    const rangeStr = isSunSun
      ? `${formatToMMDDYYYY(oSun)} - ${formatToMMDDYYYY(oNextSun)}`
      : `${formatToMMDDYYYY(oSun)} - ${formatToMMDDYYYY(oSat)}`;

    const isPrior = oSunStr < std.current.sundayStr;
    const prefix = isPrior ? "Prior Work week" : "Work week";

    options.push({
      id: oSunStr,
      type: "other",
      label: `${prefix} ${rangeStr}`,
      formattedRange: rangeStr,
      fullLabel: `${prefix} ${rangeStr}${item.count > 0 ? ` (${item.count} jobs)` : ""}`,
      sundayDate: oSun,
      saturdayDate: oSat,
      nextSundayDate: oNextSun,
      sundayStr: oSunStr,
      saturdayStr: formatDateToYYYYMMDD(oSat),
      nextSundayStr: formatDateToYYYYMMDD(oNextSun),
      orderCount: item.count,
    });
  });

  return options;
}

export function getWeekDateRange(dateStr: string, branding?: TemplateBranding): {
  sundayStr: string;
  saturdayStr: string;
  nextSundayStr: string;
  formattedRange: string;
  sundayDate: Date;
  saturdayDate: Date;
  nextSundayDate: Date;
  sundayFormatted: string;
  saturdayFormatted: string;
  nextSundayFormatted: string;
  sundayShort: string;
  nextSundayShort: string;
} {
  let baseDate: Date;

  if (branding?.selectedWorkWeek === "incoming") {
    const std = getStandardWorkWeekOptions(branding);
    baseDate = std.incoming.sundayDate;
  } else if (branding?.selectedWorkWeek === "current") {
    const std = getStandardWorkWeekOptions(branding);
    baseDate = std.current.sundayDate;
  } else if (branding?.selectedWorkWeek && /^\d{4}-\d{2}-\d{2}$/.test(branding.selectedWorkWeek)) {
    baseDate = parseDateStringSafely(branding.selectedWorkWeek);
  } else if (branding?.weekStartDate) {
    baseDate = parseDateStringSafely(branding.weekStartDate);
  } else {
    baseDate = parseDateStringSafely(dateStr);
  }

  const dayOfWeek = baseDate.getDay(); // 0 is Sunday

  const sunday = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - dayOfWeek);
  const saturday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 6);
  const nextSunday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 7);

  const sundayFormatted = formatToMMDDYYYY(sunday);
  const saturdayFormatted = formatToMMDDYYYY(saturday);
  const nextSundayFormatted = formatToMMDDYYYY(nextSunday);

  const sundayShort = formatToMMDD(sunday);
  const nextSundayShort = formatToMMDD(nextSunday);

  const sundayStr = formatDateToYYYYMMDD(sunday);
  const saturdayStr = formatDateToYYYYMMDD(saturday);
  const nextSundayStr = formatDateToYYYYMMDD(nextSunday);

  let formattedRange = "";
  if (branding?.selectedWorkWeek === "incoming" || branding?.selectedWorkWeek === "current") {
    formattedRange = branding?.enableSunSunView
      ? `${sundayFormatted} - ${nextSundayFormatted}`
      : `${sundayFormatted} - ${saturdayFormatted}`;
  } else if (branding?.weekStartDate && branding?.weekEndDate) {
    formattedRange = `${branding.weekStartDate} - ${branding.weekEndDate}`;
  } else if (branding?.enableSunSunView) {
    formattedRange = `${sundayFormatted} - ${nextSundayFormatted}`;
  } else {
    formattedRange = `${sundayFormatted} - ${saturdayFormatted}`;
  }

  return {
    sundayStr,
    saturdayStr,
    nextSundayStr,
    formattedRange,
    sundayDate: sunday,
    saturdayDate: saturday,
    nextSundayDate: nextSunday,
    sundayFormatted,
    saturdayFormatted,
    nextSundayFormatted,
    sundayShort,
    nextSundayShort,
  };
}

/**
 * Checks if a work order falls within the active workweek range.
 * When Schedule Overlap detection is enabled, schedules from prior or incoming workweeks
 * (such as WW37 schedules detected while viewing WW36) are identified as out-of-range overlaps.
 */
export function isOrderInCurrentWorkWeek(
  order: WorkOrder,
  weekInfo: ReturnType<typeof getWeekDateRange>,
  branding?: TemplateBranding
): boolean {
  const effectiveDate = resolveOrderEffectiveDate(order, branding?.useAnytimeTeardowns);
  if (!effectiveDate) {
    return true; // Fallback without explicit date is kept
  }

  const orderDateObj = parseDateStringSafely(effectiveDate);
  const orderDateStr = formatDateToYYYYMMDD(orderDateObj);

  let startBoundStr = weekInfo.sundayStr;
  let endBoundStr = branding?.enableSunSunView ? weekInfo.nextSundayStr : weekInfo.saturdayStr;

  if (branding?.selectedWorkWeek === "custom" || (!branding?.selectedWorkWeek && (branding?.weekStartDate || branding?.weekEndDate))) {
    if (branding?.weekStartDate) {
      const customStart = parseDateStringSafely(branding.weekStartDate);
      startBoundStr = formatDateToYYYYMMDD(customStart);
    }
    if (branding?.weekEndDate) {
      const customEnd = parseDateStringSafely(branding.weekEndDate);
      endBoundStr = formatDateToYYYYMMDD(customEnd);
    }
  }

  // If orderDate is before the current work week Sunday or after the end date, it is out of range
  if (orderDateStr < startBoundStr || orderDateStr > endBoundStr) {
    return false;
  }
  return true;
}

/**
 * Filters orders based on the Schedule Overlap toggle setting.
 * When enableScheduleOverlap is active, orders out of the current workweek range are disregarded/excluded from the email.
 */
export function filterOrdersForScheduleOverlap(
  orders: WorkOrder[],
  weekInfo: ReturnType<typeof getWeekDateRange>,
  branding?: TemplateBranding
): { activeOrders: WorkOrder[]; excludedOrders: WorkOrder[] } {
  if (!branding || !branding.enableScheduleOverlap) {
    return { activeOrders: orders, excludedOrders: [] };
  }

  const activeOrders: WorkOrder[] = [];
  const excludedOrders: WorkOrder[] = [];

  orders.forEach((o) => {
    if (isOrderInCurrentWorkWeek(o, weekInfo, branding)) {
      activeOrders.push(o);
    } else {
      excludedOrders.push(o);
    }
  });

  return { activeOrders, excludedOrders };
}

export interface DaySectionItem {
  key: string;
  dayName: string;
  displayHeader: string;
  dateStr?: string;
  isSunday?: boolean;
}

/**
 * Returns the list of day sections to render in the email.
 * - For South East region: Every day has a date (e.g. Sunday 09/20, Monday 09/21, Tuesday 09/22...)
 * - For all other regions: Standard headers (Sunday, Monday, Tuesday...)
 * - Sun - Sun: Adds Sunday top & bottom
 */
export function getDaySectionsList(
  weekInfo: ReturnType<typeof getWeekDateRange>,
  branding?: TemplateBranding,
  isSouthEast?: boolean
): DaySectionItem[] {
  const sunDate = weekInfo.sundayDate;
  const getDateShortForDayOffset = (offset: number): string => {
    const d = new Date(sunDate.getFullYear(), sunDate.getMonth(), sunDate.getDate() + offset);
    return formatToMMDD(d);
  };

  if (branding?.enableSunSunView) {
    return [
      {
        key: "Sunday_Top",
        dayName: "Sunday",
        displayHeader: isSouthEast ? `Sunday ${getDateShortForDayOffset(0)}` : `Sunday ${weekInfo.sundayShort}`,
        dateStr: weekInfo.sundayStr,
        isSunday: true,
      },
      {
        key: "Monday",
        dayName: "Monday",
        displayHeader: isSouthEast ? `Monday ${getDateShortForDayOffset(1)}` : "Monday",
        isSunday: false,
      },
      {
        key: "Tuesday",
        dayName: "Tuesday",
        displayHeader: isSouthEast ? `Tuesday ${getDateShortForDayOffset(2)}` : "Tuesday",
        isSunday: false,
      },
      {
        key: "Wednesday",
        dayName: "Wednesday",
        displayHeader: isSouthEast ? `Wednesday ${getDateShortForDayOffset(3)}` : "Wednesday",
        isSunday: false,
      },
      {
        key: "Thursday",
        dayName: "Thursday",
        displayHeader: isSouthEast ? `Thursday ${getDateShortForDayOffset(4)}` : "Thursday",
        isSunday: false,
      },
      {
        key: "Friday",
        dayName: "Friday",
        displayHeader: isSouthEast ? `Friday ${getDateShortForDayOffset(5)}` : "Friday",
        isSunday: false,
      },
      {
        key: "Saturday",
        dayName: "Saturday",
        displayHeader: isSouthEast ? `Saturday ${getDateShortForDayOffset(6)}` : "Saturday",
        isSunday: false,
      },
      {
        key: "Sunday_Bottom",
        dayName: "Sunday",
        displayHeader: isSouthEast ? `Sunday ${getDateShortForDayOffset(7)}` : `Sunday ${weekInfo.nextSundayShort}`,
        dateStr: weekInfo.nextSundayStr,
        isSunday: true,
      },
    ];
  }

  return [
    {
      key: "Sunday",
      dayName: "Sunday",
      displayHeader: isSouthEast ? `Sunday ${getDateShortForDayOffset(0)}` : "Sunday",
      isSunday: true,
    },
    {
      key: "Monday",
      dayName: "Monday",
      displayHeader: isSouthEast ? `Monday ${getDateShortForDayOffset(1)}` : "Monday",
      isSunday: false,
    },
    {
      key: "Tuesday",
      dayName: "Tuesday",
      displayHeader: isSouthEast ? `Tuesday ${getDateShortForDayOffset(2)}` : "Tuesday",
      isSunday: false,
    },
    {
      key: "Wednesday",
      dayName: "Wednesday",
      displayHeader: isSouthEast ? `Wednesday ${getDateShortForDayOffset(3)}` : "Wednesday",
      isSunday: false,
    },
    {
      key: "Thursday",
      dayName: "Thursday",
      displayHeader: isSouthEast ? `Thursday ${getDateShortForDayOffset(4)}` : "Thursday",
      isSunday: false,
    },
    {
      key: "Friday",
      dayName: "Friday",
      displayHeader: isSouthEast ? `Friday ${getDateShortForDayOffset(5)}` : "Friday",
      isSunday: false,
    },
    {
      key: "Saturday",
      dayName: "Saturday",
      displayHeader: isSouthEast ? `Saturday ${getDateShortForDayOffset(6)}` : "Saturday",
      isSunday: false,
    },
  ];
}

// Group work orders by day of week (supports 7-day and 8-day Sun-Sun formats)
export function groupOrdersByDayOfWeek(
  orders: WorkOrder[],
  sundayDate: Date,
  useAnytimeTeardowns?: boolean,
  branding?: TemplateBranding
): Record<string, WorkOrder[]> {
  const sundayStr = formatDateToYYYYMMDD(sundayDate);
  const weekInfo = getWeekDateRange(sundayStr, branding);
  const sections = getDaySectionsList(weekInfo, branding);
  const grouped: Record<string, WorkOrder[]> = {};
  sections.forEach((s) => {
    grouped[s.key] = [];
  });

  // Apply schedule overlap filtering if active
  const { activeOrders } = filterOrdersForScheduleOverlap(orders, weekInfo, branding);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  activeOrders.forEach((order) => {
    const effectiveDate = resolveOrderEffectiveDate(order, useAnytimeTeardowns);
    if (effectiveDate) {
      const orderDate = parseDateStringSafely(effectiveDate);
      if (orderDate) {
        const dayIdx = orderDate.getDay();
        if (branding?.enableSunSunView) {
          if (dayIdx === 0) {
            const oStr = formatDateToYYYYMMDD(orderDate);
            if (oStr === weekInfo.nextSundayStr) {
              grouped["Sunday_Bottom"].push(order);
            } else {
              grouped["Sunday_Top"].push(order);
            }
            return;
          }
          const dayName = days[dayIdx];
          if (grouped[dayName]) {
            grouped[dayName].push(order);
            return;
          }
        } else {
          const dayName = days[dayIdx];
          if (grouped[dayName]) {
            grouped[dayName].push(order);
            return;
          }
        }
      }
    }

    // Fallback: check if job description or timeslot specifies a day
    const text = `${order.description} ${order.specialInstructions} ${order.timeSlot}`.toLowerCase();
    for (const d of days) {
      if (text.includes(d.toLowerCase())) {
        if (branding?.enableSunSunView && d === "Sunday") {
          grouped["Sunday_Top"].push(order);
        } else if (grouped[d]) {
          grouped[d].push(order);
        }
        return;
      }
    }

    // Default fallback to Monday
    if (grouped["Monday"]) {
      grouped["Monday"].push(order);
    }
  });

  return grouped;
}

export function generateEmailSubject(roster: TechnicianRoster, branding: TemplateBranding): string {
  const weekInfo = getWeekDateRange(roster.date, branding);
  const techFullName = formatTechnicianFullName(roster.technicianName);
  const techFirstName = extractFirstName(roster.technicianName);

  if (isFloridaOrSouthEastRegion(roster, branding)) {
    // Format: <Technician First Name> >> Schedule for WEEK OF <Work Week Date Sunday Start only> <Version number if applicable>
    // Example: DAVIAN>>Schedule for WEEK OF 09/20/26 v3
    const sundayMMDDYY = formatToMMDDYY(weekInfo.sundayDate);
    let versionSuffix = "";
    if (branding?.enableEmailUpdate) {
      const version = formatEmailUpdateVersion(branding.emailUpdateVersion);
      versionSuffix = ` v${version}`;
    }
    return `${techFirstName.toUpperCase()}>>Schedule for WEEK OF ${sundayMMDDYY}${versionSuffix}`;
  }

  let subject = `${techFullName}: Weekly Schedule ${weekInfo.formattedRange}`;
  if (branding?.enableEmailUpdate) {
    const version = formatEmailUpdateVersion(branding.emailUpdateVersion);
    subject += ` Update v${version}`;
  }
  return subject;
}

// Generate Outlook HTML formatted email
export function generateOutlookHtml(
  roster: TechnicianRoster,
  branding: TemplateBranding = DEFAULT_BRANDING,
  style: TemplateStyle = "exact_nds_template"
): string {
  const primaryColor = branding.primaryColor || "#0078D4";
  const urgentCount = roster.urgentCount || 0;
  const totalMinutes = roster.totalEstimatedMinutes || roster.orders.length * 60;
  const weekInfo = getWeekDateRange(roster.date, branding);
  const groupedOrders = groupOrdersByDayOfWeek(roster.orders, weekInfo.sundayDate, branding.useAnytimeTeardowns, branding);

  const techFullName = formatTechnicianFullName(roster.technicianName);
  const techFirstName = extractFirstName(roster.technicianName);
  const emailUpdateBanner = getEmailUpdateBannerText(branding);

  const airtableUrl = resolveTechnicianAirtableUrl(roster.technicianName, branding);
  const googleMapsUrl = branding.googleMapsBaseUrl
    ? `${branding.googleMapsBaseUrl}/search/${encodeURIComponent(techFullName + " route")}`
    : `https://maps.google.com/?q=${encodeURIComponent(techFullName)}`;
  const photoUploadUrl = branding.photoUploadUrl || "https://airtable.com/appPhotos";
  const photoUploadText = branding.photoUploadLinkText || "South Central Job Photos";
  const privateJobsNotice = branding.privateJobsNotice || "(FOR PRIVATE JOBS, PLEASE UPLOAD FIELD PHOTOS TO GOOGLE CHAT ONLY IN REAL TIME)";
  const dataUploadEmail = branding.dataUploadEmail || "jobs@ndsdata.com";

  // If exact_nds_template is selected (DEFAULT)
  if (style === "exact_nds_template") {
    const isSE = isSouthEastRegion(roster, branding);
    const sections = getDaySectionsList(weekInfo, branding, isSE);
    const regionName = branding.regionName || "North East";

    const daysHtml = sections
      .map((section) => {
        const dayOrders = groupedOrders[section.key] || [];

        let dayBody = "";

        if (dayOrders.length > 0) {
          let projectGroups = groupDayOrdersByProject(dayOrders, branding.useAnytimeTeardowns);
          const isFlSe = isFloridaOrSouthEastRegion(roster, branding);

          if (isFlSe && branding.enableArrangeNewProjects) {
            const customOrder = getCustomDayProjectOrder(section.dayName, section.key, roster, branding);
            if (customOrder && customOrder.length > 0) {
              projectGroups = reorderProjectGroups(projectGroups, customOrder);
            }
          }

          const dayNotesHtml = isFlSe
            ? renderFloridaSouthEastDayNotesHtml(
                dayOrders,
                section.dayName,
                branding,
                branding.selectedRegion || branding.regionName || roster.region
              )
            : "";

          dayBody = `
          ${dayNotesHtml}
          <div style="margin: 3px 0 8px 0;">
            ${projectGroups.map((g) => renderNDSTaskGroupHtml(g, section.dayName, branding.useAnytimeTeardowns, branding)).join("")}
          </div>
          `;
        } else {
          if (isSE) {
            dayBody = `
            <div style="margin: 4px 0 8px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; font-weight: normal;">
              -
            </div>
            `;
          } else {
            dayBody = `
            <div style="margin: 4px 0 8px 0;">
              <span style="font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; font-weight: bold; background-color: #FFFF00; color: #000000; padding: 2px 6px; display: inline-block;">TBD</span>
            </div>
            `;
          }
        }

        return `
        <!-- ${section.displayHeader} Section -->
        <div style="margin-top: 18px; margin-bottom: 0;">
          <span style="color: #C00000; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 16pt; font-weight: bold; text-decoration: underline;">${section.displayHeader}</span>
        </div>
        <div style="height: 14px; line-height: 14px; font-size: 11pt; margin: 0; padding: 0;">&nbsp;</div>
        ${dayBody}
        `;
      })
      .join("");

    if (isFloridaOrSouthEastRegion(roster, branding)) {
      const workWeekDateText = branding.enableSunSunView
        ? `Sunday, ${formatToMMDDYYYY(weekInfo.sundayDate)} – Sunday, ${formatToMMDDYYYY(weekInfo.nextSundayDate)}`
        : `Sunday, ${formatToMMDDYYYY(weekInfo.sundayDate)} – Saturday, ${formatToMMDDYYYY(weekInfo.saturdayDate)}`;

      return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Installs Schedule: ${escapeHtml(techFullName)}</title>
  <style type="text/css">
    body, table, td, a, p { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    table { border-collapse: collapse !important; }
    body { font-family: Calibri, 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5; margin: 0; padding: 16px; background-color: #FFFFFF; }
  </style>
</head>
<body style="font-family: Calibri, 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5; margin: 0; padding: 16px; background-color: #FFFFFF;">
  <div style="max-width: 800px; width: 100%; margin: 0 auto;">
    
    <!-- Greeting -->
    <p style="margin: 0 0 16px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
      Hello ${escapeHtml(techFirstName)},
    </p>

    ${
      emailUpdateBanner
        ? `
    <!-- Email Update Banner -->
    <p style="margin: 0 0 16px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000000;">
      <span style="background-color: #FFFF00; font-weight: bold; color: #000000; padding: 2px 4px; display: inline;">
        ${escapeHtml(emailUpdateBanner)}
      </span>
    </p>
    `
        : ""
    }

    <!-- Intro Body -->
    <p style="margin: 0 0 16px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
      Hope your week is off to a great start. Please see the attached documents and the table below regarding installs for ${workWeekDateText} . Please be prepared for your scheduled installs and pop-up installs throughout the week.
    </p>

    <p style="margin: 0 0 12px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
      If you have any questions, please let me know. Please see your schedule for this week below:
    </p>

    <!-- Sketch notice highlighted in yellow -->
    <p style="margin: 8px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000000;">
      <span style="background-color: #FFFF00; color: #000000; padding: 1px 4px; display: inline;">Please include a SKETCH of each TMC intersection if the intersection differs from what can be seen on Google Earth</span>
    </p>

    <!-- PLEASE SEE AIR TABLE LINK BELOW highlighted in yellow & bold -->
    <p style="margin: 12px 0 8px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 13pt; line-height: 1.4; color: #000000;">
      <span style="background-color: #FFFF00; font-weight: bold; color: #000000; padding: 2px 6px; display: inline;">PLEASE SEE AIR TABLE LINK BELOW</span>
    </p>

    <!-- Links Section -->
    <p style="margin: 0 0 20px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.8;">
      <u><a href="${photoUploadUrl}" style="color: #004F9F; text-decoration: underline;" target="_blank">Click Here</a></u> - <span style="background-color: #00FF00; font-weight: bold; color: #000000; padding: 1px 4px; display: inline;">PHOTO UPLOADS</span><br />
      <u><a href="${airtableUrl}" style="color: #004F9F; text-decoration: underline;" target="_blank">Click Here</a></u> - <span style="background-color: #00FF00; font-weight: bold; color: #000000; padding: 1px 4px; display: inline;">SCHEDULE</span><br />
      <u><a href="${googleMapsUrl}" style="color: #004F9F; text-decoration: underline;" target="_blank">Click Here</a></u> – <span style="background-color: #00FF00; font-weight: bold; color: #000000; padding: 1px 4px; display: inline;">GOOGLE MAPS</span>
    </p>

    <!-- Days List (Sunday - Saturday) -->
    ${daysHtml}

    <!-- General Notes Section -->
    <div style="margin-top: 28px; padding-top: 12px; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
      <p style="margin: 0 0 10px 0; font-weight: bold; text-decoration: underline; font-size: 11pt; color: #000000;">General Notes:</p>
      <ul style="margin: 0; padding-left: 24px; list-style-type: disc;">
        <li style="margin-bottom: 6px; color: #000000;">
          After reviewing the workload <span style="background-color: #FF0000; color: #FFFFFF; font-weight: bold; padding: 1px 4px; display: inline;">“REPLY ALL”</span> confirming you have received and understand your assignment
        </li>
        <li style="margin-bottom: 6px; color: #000000;">
          After workload completion <span style="background-color: #FF0000; color: #FFFFFF; font-weight: bold; padding: 1px 4px; display: inline;">“REPLY ALL”</span> communicating all assignments complete and any necessary notes about the work done
        </li>
        <li style="margin-bottom: 6px; color: #000000;">
          After picking up equipment, please QC data and send in at time specified on schedule email. Please add your QC notes when you send in the data 
        </li>
        <li style="margin-bottom: 6px; color: #000000;">
          If you have any videos that require uploading, please  <span style="background-color: #FF0000; color: #FFFFFF; font-weight: bold; padding: 1px 4px; display: inline;">“REPLY ALL”</span> communicating the total number of files successfully uploaded when complete.
        </li>
      </ul>
    </div>

  </div>
</body>
</html>`;
    }

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Installs Schedule: ${escapeHtml(techFullName)}</title>
  <style type="text/css">
    body, table, td, a, p { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    table { border-collapse: collapse !important; }
    body { font-family: Calibri, 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5; margin: 0; padding: 16px; background-color: #FFFFFF; }
  </style>
</head>
<body style="font-family: Calibri, 'Segoe UI', Arial, Helvetica, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5; margin: 0; padding: 16px; background-color: #FFFFFF;">
  <div style="max-width: 800px; width: 100%; margin: 0 auto;">
    
    <!-- Greeting -->
    <p style="margin: 0 0 16px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
      Hello ${escapeHtml(techFirstName)},
    </p>

    ${
      emailUpdateBanner
        ? `
    <!-- Email Update Banner -->
    <p style="margin: 0 0 16px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #000000;">
      <span style="background-color: #FFFF00; font-weight: bold; color: #000000; padding: 2px 4px; display: inline;">
        ${escapeHtml(emailUpdateBanner)}
      </span>
    </p>
    `
        : ""
    }

    <!-- Intro Body -->
    <p style="margin: 0 0 16px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.5;">
      Please see link for the jobs scheduled week of ${weekInfo.formattedRange}. If you have any questions, please let me know.<br />
      Please see your schedule for this week below:
    </p>

    <!-- Links Section -->
    <p style="margin: 0 0 20px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000; line-height: 1.8;">
      ${regionName} AirTable Link: <a href="${airtableUrl}" style="color: #0078D4; text-decoration: underline;" target="_blank">${escapeHtml(techFullName)}'s Airtable</a><br />
      Google Maps Link: <a href="${googleMapsUrl}" style="color: #0078D4; text-decoration: underline;" target="_blank">${escapeHtml(techFullName)}: Weekly Schedule ${weekInfo.formattedRange}</a>
    </p>

    <!-- Days List (Sunday - Saturday) -->
    ${daysHtml}

  </div>
</body>
</html>`;
  }

  // AI Briefing section for other layouts
  let aiBriefingHtml = "";
  if (roster.aiBriefing) {
    aiBriefingHtml = `
    <!-- AI Briefing & Safety Callout -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid ${primaryColor}; border-radius: 4px;">
      <tr>
        <td style="padding: 16px; font-family: 'Segoe UI', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size: 14px; font-weight: 700; color: #1E293B; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 6px;">
                ⚡ Daily Morning Dispatch Briefing
              </td>
            </tr>
            <tr>
              <td style="font-size: 14px; color: #334155; line-height: 1.6; padding-bottom: 10px;">
                ${roster.aiBriefing.briefing}
              </td>
            </tr>
            ${
              roster.aiBriefing.safetyAlert
                ? `
            <tr>
              <td style="padding-top: 6px; padding-bottom: 6px;">
                <table cellpadding="0" cellspacing="0" border="0" style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 4px; width: 100%;">
                  <tr>
                    <td style="padding: 8px 12px; font-size: 13px; color: #92400E; font-weight: 600; font-family: 'Segoe UI', Arial, sans-serif;">
                      ⚠️ Safety Focus: <span style="font-weight: 400; color: #78350F;">${roster.aiBriefing.safetyAlert}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`
                : ""
            }
            ${
              roster.aiBriefing.keyHighlights && roster.aiBriefing.keyHighlights.length > 0
                ? `
            <tr>
              <td style="padding-top: 8px;">
                <div style="font-size: 12px; font-weight: 700; color: #64748B; margin-bottom: 4px;">KEY ROUTE HIGHLIGHTS:</div>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.5;">
                  ${roster.aiBriefing.keyHighlights.map((k) => `<li style="margin-bottom: 3px;">${k}</li>`).join("")}
                </ul>
              </td>
            </tr>`
                : ""
            }
          </table>
        </td>
      </tr>
    </table>
    `;
  }

  // Work order rows generator
  let workOrdersContent = "";

  if (style === "compact_table") {
    workOrdersContent = `
    <!-- Compact Table View -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 24px; border: 1px solid #CBD5E1;">
      <thead>
        <tr style="background-color: #0F172A; color: #FFFFFF;">
          <th style="padding: 10px 12px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; text-align: left; border: 1px solid #334155;"># / Time</th>
          <th style="padding: 10px 12px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; text-align: left; border: 1px solid #334155;">Customer & Address</th>
          <th style="padding: 10px 12px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; text-align: left; border: 1px solid #334155;">Task & Priority</th>
          <th style="padding: 10px 12px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; text-align: left; border: 1px solid #334155;">Parts / Instructions</th>
        </tr>
      </thead>
      <tbody>
        ${roster.orders
          .map((order, idx) => {
            const pColors = getPriorityColors(order.priority);
            const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.serviceAddress)}`;
            return `
          <tr style="background-color: ${rowBg};">
            <td style="padding: 10px 12px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; border: 1px solid #E2E8F0; vertical-align: top;">
              <div style="font-weight: 700; color: #0F172A;">${order.orderNumber}</div>
              <div style="color: #2563EB; font-size: 12px; font-weight: 600; margin-top: 3px;">${order.timeSlot}</div>
              <div style="color: #64748B; font-size: 11px;">Est: ${order.estimatedDurationMin || 60}m</div>
            </td>
            <td style="padding: 10px 12px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; border: 1px solid #E2E8F0; vertical-align: top;">
              <div style="font-weight: 700; color: #1E293B;">${order.customerName}</div>
              <div style="color: #475569; font-size: 12px; margin-top: 2px;">
                <a href="${mapUrl}" target="_blank" style="color: ${primaryColor}; text-decoration: none;">📍 ${order.serviceAddress}</a>
              </div>
              <div style="color: #64748B; font-size: 12px; margin-top: 2px;">
                📞 <a href="tel:${order.customerPhone}" style="color: #334155; text-decoration: none;">${order.customerPhone}</a>
              </div>
            </td>
            <td style="padding: 10px 12px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; border: 1px solid #E2E8F0; vertical-align: top;">
              <div style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background-color: ${pColors.bg}; color: ${pColors.text}; border: 1px solid ${pColors.border}; margin-bottom: 4px;">
                ${order.priority.toUpperCase()}
              </div>
              <div style="font-weight: 600; color: #0F172A;">${order.jobType}</div>
              <div style="color: #475569; font-size: 12px; margin-top: 2px;">${order.description}</div>
            </td>
            <td style="padding: 10px 12px; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; border: 1px solid #E2E8F0; vertical-align: top;">
              ${order.requiredParts ? `<div style="color: #0369A1; font-weight: 600; margin-bottom: 3px;">🔧 ${order.requiredParts}</div>` : ""}
              ${order.specialInstructions ? `<div style="color: #B45309; font-style: italic;">📝 ${order.specialInstructions}</div>` : ""}
            </td>
          </tr>
          `;
          })
          .join("")}
      </tbody>
    </table>
    `;
  } else if (style === "field_cards") {
    workOrdersContent = `
    <!-- Field Tech Step-by-Step Stop Cards -->
    <div style="margin-bottom: 24px;">
      ${roster.orders
        .map((order, idx) => {
          const pColors = getPriorityColors(order.priority);
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.serviceAddress)}`;
          return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden;">
          <!-- Card Header Bar -->
          <tr style="background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 12px 16px; font-family: 'Segoe UI', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: ${primaryColor}; color: #FFFFFF; font-weight: 700; font-size: 12px; padding: 3px 8px; border-radius: 4px; margin-right: 8px;">
                      STOP ${idx + 1}
                    </span>
                    <strong style="font-size: 15px; color: #0F172A;">${order.timeSlot}</strong>
                    <span style="color: #64748B; font-size: 13px; margin-left: 8px;">(${order.orderNumber})</span>
                  </td>
                  <td style="text-align: right; vertical-align: middle;">
                    <span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; background-color: ${pColors.bg}; color: ${pColors.text}; border: 1px solid ${pColors.border};">
                      ${order.priority.toUpperCase()} PRIORITY
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Card Body -->
          <tr>
            <td style="padding: 16px; font-family: 'Segoe UI', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: top; width: 60%; padding-right: 16px;">
                    <div style="font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">
                      ${order.jobType}
                    </div>
                    <div style="font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 12px;">
                      ${order.description}
                    </div>
                    
                    ${
                      order.requiredParts
                        ? `
                    <div style="background-color: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 4px; padding: 8px 12px; margin-bottom: 8px;">
                      <div style="font-size: 11px; font-weight: 700; color: #0369A1; text-transform: uppercase;">Required Parts & Tools:</div>
                      <div style="font-size: 13px; color: #0C4A6E; font-weight: 500; margin-top: 2px;">${order.requiredParts}</div>
                    </div>`
                        : ""
                    }

                    ${
                      order.specialInstructions
                        ? `
                    <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 4px; padding: 8px 12px;">
                      <div style="font-size: 11px; font-weight: 700; color: #92400E; text-transform: uppercase;">Dispatcher Special Notes:</div>
                      <div style="font-size: 13px; color: #78350F; margin-top: 2px;">${order.specialInstructions}</div>
                    </div>`
                        : ""
                    }
                  </td>
                  <td style="vertical-align: top; width: 40%; background-color: #F8FAFC; border-radius: 4px; padding: 12px; border: 1px solid #E2E8F0;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">Customer & Location</div>
                    <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">${order.customerName}</div>
                    <div style="font-size: 12px; color: #334155; margin-bottom: 8px;">
                      📍 <a href="${mapUrl}" target="_blank" style="color: ${primaryColor}; text-decoration: none; font-weight: 500;">${order.serviceAddress}</a>
                    </div>
                    <div style="font-size: 12px; color: #334155; margin-bottom: 12px;">
                      📞 <a href="tel:${order.customerPhone}" style="color: #0F172A; font-weight: 600; text-decoration: none;">${order.customerPhone}</a>
                    </div>

                    <!-- Action Navigation Button -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="background-color: ${primaryColor}; border-radius: 4px;">
                          <a href="${mapUrl}" target="_blank" style="display: block; padding: 8px 12px; font-size: 12px; color: #FFFFFF; font-weight: 600; text-decoration: none; font-family: 'Segoe UI', Arial, sans-serif;">
                            🗺️ Open GPS Navigation
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        `;
        })
        .join("")}
    </div>
    `;
  } else if (style === "safety_priority") {
    workOrdersContent = `
    <!-- High Priority & Safety Highlight Layout -->
    <div style="margin-bottom: 24px;">
      <!-- Critical Priority Callout Banner -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px; background-color: #FEF2F2; border: 2px solid #DC2626; border-radius: 6px;">
        <tr>
          <td style="padding: 14px 18px; font-family: 'Segoe UI', Arial, sans-serif;">
            <div style="font-size: 14px; font-weight: 800; color: #991B1B; text-transform: uppercase;">
              🚨 Critical Shift Priority Overview (${urgentCount} Urgent / Emergency Jobs Assigned)
            </div>
            <div style="font-size: 13px; color: #7F1D1D; margin-top: 4px;">
              Please review all safety protocols, Lockout/Tagout procedures, and required PPE before arriving on job sites.
            </div>
          </td>
        </tr>
      </table>

      <!-- Standard Table -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid #E2E8F0;">
        ${roster.orders
          .map((order, idx) => {
            const pColors = getPriorityColors(order.priority);
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.serviceAddress)}`;
            const isUrgent = order.priority === "Urgent";
            return `
          <tr style="background-color: ${isUrgent ? "#FFF5F5" : idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC"}; border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 16px; font-family: 'Segoe UI', Arial, sans-serif; vertical-align: top;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: top; width: 25%;">
                    <div style="font-size: 14px; font-weight: 700; color: #0F172A;">${order.timeSlot}</div>
                    <div style="font-size: 12px; color: #64748B; margin-top: 2px;">${order.orderNumber}</div>
                    <div style="margin-top: 6px;">
                      <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background-color: ${pColors.bg}; color: ${pColors.text}; border: 1px solid ${pColors.border};">
                        ${order.priority.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td style="vertical-align: top; width: 45%; padding-left: 12px; padding-right: 12px;">
                    <div style="font-size: 15px; font-weight: 700; color: #1E293B;">${order.jobType}</div>
                    <div style="font-size: 13px; color: #475569; margin-top: 4px;">${order.description}</div>
                    ${
                      order.requiredParts
                        ? `<div style="font-size: 12px; color: #0369A1; font-weight: 600; margin-top: 6px;">🔧 Required Parts: ${order.requiredParts}</div>`
                        : ""
                    }
                    ${
                      order.specialInstructions
                        ? `<div style="font-size: 12px; color: #B45309; margin-top: 4px;">⚠️ ${order.specialInstructions}</div>`
                        : ""
                    }
                  </td>
                  <td style="vertical-align: top; width: 30%; font-size: 13px;">
                    <div style="font-weight: 700; color: #0F172A;">${order.customerName}</div>
                    <div style="color: #475569; font-size: 12px; margin-top: 2px;">
                      <a href="${mapUrl}" target="_blank" style="color: ${primaryColor}; text-decoration: none;">📍 ${order.serviceAddress}</a>
                    </div>
                    <div style="color: #64748B; font-size: 12px; margin-top: 4px;">
                      📞 <a href="tel:${order.customerPhone}" style="color: #334155; text-decoration: none; font-weight: 600;">${order.customerPhone}</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `;
          })
          .join("")}
      </table>
    </div>
    `;
  } else {
    // Default: Modern Executive Style
    workOrdersContent = `
    <!-- Modern Executive Route Layout -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 24px;">
      ${roster.orders
        .map((order, idx) => {
          const pColors = getPriorityColors(order.priority);
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.serviceAddress)}`;
          return `
        <tr>
          <td style="padding-bottom: 14px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; border-left: 4px solid ${pColors.badge};">
              <tr>
                <td style="padding: 16px; font-family: 'Segoe UI', Arial, sans-serif;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <!-- Top Row: Time, Order#, Priority -->
                    <tr>
                      <td style="vertical-align: middle; padding-bottom: 8px;">
                        <span style="font-size: 15px; font-weight: 800; color: #0F172A;">
                          ⏰ ${order.timeSlot}
                        </span>
                        <span style="font-size: 13px; color: #64748B; margin-left: 10px;">
                          WO: <strong>${order.orderNumber}</strong>
                        </span>
                        <span style="font-size: 12px; color: #94A3B8; margin-left: 10px;">
                          (~${order.estimatedDurationMin || 60} min)
                        </span>
                      </td>
                      <td style="text-align: right; vertical-align: middle; padding-bottom: 8px;">
                        <span style="display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; background-color: ${pColors.bg}; color: ${pColors.text}; border: 1px solid ${pColors.border};">
                          ${order.priority.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                    <!-- Main details -->
                    <tr>
                      <td colspan="2" style="padding-top: 4px; padding-bottom: 8px; border-top: 1px dashed #F1F5F9;">
                        <div style="font-size: 15px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">
                          ${order.jobType}
                        </div>
                        <div style="font-size: 13px; color: #475569; line-height: 1.5;">
                          ${order.description}
                        </div>
                      </td>
                    </tr>
                    <!-- Location & Contacts Row -->
                    <tr>
                      <td colspan="2" style="background-color: #F8FAFC; border-radius: 4px; padding: 10px 12px; margin-top: 6px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="font-size: 13px; color: #334155; vertical-align: middle;">
                              <strong>Customer:</strong> ${order.customerName} &nbsp;|&nbsp; 
                              <strong>Address:</strong> <a href="${mapUrl}" target="_blank" style="color: ${primaryColor}; text-decoration: none; font-weight: 600;">📍 ${order.serviceAddress}</a> &nbsp;|&nbsp; 
                              <strong>Phone:</strong> <a href="tel:${order.customerPhone}" style="color: #0F172A; text-decoration: none; font-weight: 600;">📞 ${order.customerPhone}</a>
                            </td>
                          </tr>
                          ${
                            order.requiredParts
                              ? `
                          <tr>
                            <td style="font-size: 12px; color: #0369A1; padding-top: 6px; font-weight: 600;">
                              🔧 <strong>Parts Required:</strong> ${order.requiredParts}
                            </td>
                          </tr>`
                              : ""
                          }
                          ${
                            order.specialInstructions
                              ? `
                          <tr>
                            <td style="font-size: 12px; color: #B45309; padding-top: 4px; font-style: italic;">
                              📝 <strong>Special Instructions:</strong> ${order.specialInstructions}
                            </td>
                          </tr>`
                              : ""
                          }
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        `;
        })
        .join("")}
    </table>
    `;
  }

  // Complete Outlook HTML Document with MSO and Table structure
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <!--[if gte mso 9]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Technician Schedule: ${roster.technicianName}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F1F5F9; font-family: 'Segoe UI', Arial, Helvetica, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .stack-column { display: block !important; width: 100% !important; direction: ltr !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9;">
  <!-- Centered Email Container Wrapper -->
  <center style="width: 100%; background-color: #F1F5F9; padding: 24px 0;">
    <!--[if mso]>
    <table align="center" border="0" cellspacing="0" cellpadding="0" width="680">
    <tr>
    <td align="center" valign="top" width="680">
    <![endif]-->
    <table class="email-container" align="center" border="0" cellpadding="0" cellspacing="0" width="680" style="max-width: 680px; width: 100%; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Top Brand Header Banner -->
      <tr>
        <td style="background-color: #0F172A; padding: 20px 24px; border-bottom: 4px solid ${primaryColor};">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: middle;">
                <div style="font-size: 20px; font-weight: 800; color: #FFFFFF; font-family: 'Segoe UI', Arial, sans-serif; letter-spacing: -0.5px;">
                  ${branding.companyName}
                </div>
                <div style="font-size: 12px; color: #94A3B8; font-family: 'Segoe UI', Arial, sans-serif; margin-top: 2px;">
                  Official Field Service Dispatch &amp; Work Order Roster
                </div>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <div style="display: inline-block; background-color: rgba(255,255,255,0.12); padding: 6px 12px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">
                  <div style="font-size: 11px; color: #94A3B8; text-transform: uppercase; font-weight: 700;">SERVICE DATE</div>
                  <div style="font-size: 14px; font-weight: 700; color: #38BDF8;">${roster.date}</div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Technician Salutation & Summary Metrics Bar -->
      <tr>
        <td style="padding: 24px 24px 16px 24px; font-family: 'Segoe UI', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: top; padding-bottom: 16px;">
                <div style="font-size: 22px; font-weight: 800; color: #0F172A;">
                  ${branding.greetingPrefix}, ${extractFirstName(roster.technicianName)} 👋
                </div>
                <div style="font-size: 14px; color: #64748B; margin-top: 4px;">
                  You have <strong>${roster.orders.length} assigned appointments</strong> on your itinerary today. Please review the customer work orders below.
                </div>
              </td>
            </tr>
          </table>

          <!-- Metric Highlight Cards -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px;">
            <tr>
              <td align="center" style="padding: 12px 8px; border-right: 1px solid #E2E8F0; width: 25%;">
                <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;">Total Stops</div>
                <div style="font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 2px;">${roster.orders.length}</div>
              </td>
              <td align="center" style="padding: 12px 8px; border-right: 1px solid #E2E8F0; width: 25%;">
                <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;">Est. Work Time</div>
                <div style="font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 2px;">${formatMinutes(totalMinutes)}</div>
              </td>
              <td align="center" style="padding: 12px 8px; border-right: 1px solid #E2E8F0; width: 25%;">
                <div style="font-size: 11px; font-weight: 700; color: #DC2626; text-transform: uppercase;">Urgent Tickets</div>
                <div style="font-size: 20px; font-weight: 800; color: ${urgentCount > 0 ? "#DC2626" : "#0F172A"}; margin-top: 2px;">${urgentCount}</div>
              </td>
              <td align="center" style="padding: 12px 8px; width: 25%;">
                <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;">First Arrival</div>
                <div style="font-size: 16px; font-weight: 800; color: ${primaryColor}; margin-top: 4px;">${roster.orders[0]?.timeSlot.split("-")[0].trim() || "08:00 AM"}</div>
              </td>
            </tr>
          </table>

          ${aiBriefingHtml}

          <!-- Work Orders Section Header -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td style="font-size: 16px; font-weight: 800; color: #0F172A; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Assigned Daily Work Orders
              </td>
              <td style="text-align: right; font-size: 12px; color: #64748B;">
                Sorted chronologically by window
              </td>
            </tr>
          </table>

          <!-- Main Work Orders List -->
          ${workOrdersContent}

          ${
            branding.includeChecklist
              ? `
          <!-- Pre-Departure Tech Checklist -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 16px;">
            <tr>
              <td style="font-family: 'Segoe UI', Arial, sans-serif;">
                <div style="font-size: 13px; font-weight: 700; color: #1E293B; margin-bottom: 8px;">
                  ✅ MANDATORY PRE-SHIFT FIELD CHECKLIST:
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; color: #475569;">
                  <tr>
                    <td style="padding: 3px 0;">[ ] Vehicle fluid &amp; tire pressure pre-trip inspection</td>
                    <td style="padding: 3px 0;">[ ] Verified specialized parts in truck inventory</td>
                  </tr>
                  <tr>
                    <td style="padding: 3px 0;">[ ] Calibrated multimeter &amp; required safety PPE</td>
                    <td style="padding: 3px 0;">[ ] Charged tablet &amp; mobile field dispatch app</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>`
              : ""
          }

          ${renderAdditionalNotesHtml(branding)}

          <!-- Dispatcher Sign-off & Hotline Footer -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #E2E8F0; padding-top: 16px; margin-top: 8px;">
            <tr>
              <td style="vertical-align: top; width: 60%; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #334155;">
                <div style="font-weight: 700; color: #0F172A;">${branding.dispatcherName}</div>
                <div style="color: #64748B; font-size: 12px;">${branding.dispatcherTitle} &bull; ${branding.companyName}</div>
                <div style="color: #64748B; font-size: 12px; margin-top: 4px;">
                  Email: <a href="mailto:${branding.replyToEmail}" style="color: ${primaryColor}; text-decoration: none;">${branding.replyToEmail}</a>
                </div>
              </td>
              <td style="vertical-align: top; width: 40%; text-align: right; font-family: 'Segoe UI', Arial, sans-serif;">
                <div style="display: inline-block; background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 4px; padding: 8px 12px; text-align: right;">
                  <div style="font-size: 10px; font-weight: 700; color: #1E40AF; text-transform: uppercase;">Dispatcher Live Hotline</div>
                  <div style="font-size: 14px; font-weight: 800; color: #1D4ED8; margin-top: 2px;">
                    <a href="tel:${branding.supportPhone}" style="color: #1D4ED8; text-decoration: none;">${branding.supportPhone}</a>
                  </div>
                </div>
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- Disclaimer & Confidentiality Notice -->
      <tr>
        <td style="background-color: #F8FAFC; padding: 16px 24px; border-top: 1px solid #E2E8F0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #94A3B8; line-height: 1.5; text-align: center;">
          ${branding.customDisclaimer}
          <div style="margin-top: 6px; font-size: 10px; color: #CBD5E1;">
            Generated via Outlook Schedule Dispatch Automation System &bull; Confidential Field Service Roster
          </div>
        </td>
      </tr>

    </table>
    <!--[if mso]>
    </td>
    </tr>
    </table>
    <![endif]-->
  </center>
</body>
</html>`;
}

// Generate Plain Text Fallback
export function generatePlainTextEmail(roster: TechnicianRoster, branding: TemplateBranding): string {
  const weekInfo = getWeekDateRange(roster.date, branding);
  const groupedOrders = groupOrdersByDayOfWeek(roster.orders, weekInfo.sundayDate, branding.useAnytimeTeardowns, branding);
  const regionName = branding.regionName || "Northeast";
  const techFullName = formatTechnicianFullName(roster.technicianName);
  const techFirstName = extractFirstName(roster.technicianName);
  const emailUpdateBanner = getEmailUpdateBannerText(branding);
  const isSE = isSouthEastRegion(roster, branding);
  const sections = getDaySectionsList(weekInfo, branding, isSE);
  const airtableUrl = resolveTechnicianAirtableUrl(roster.technicianName, branding);
  const googleMapsUrl = branding.googleMapsBaseUrl
    ? `${branding.googleMapsBaseUrl}/search/${encodeURIComponent(techFullName + " route")}`
    : `https://maps.google.com/?q=${encodeURIComponent(techFullName)}`;
  const photoUploadUrl = branding.photoUploadUrl || "https://airtable.com/appPhotos";

  if (isFloridaOrSouthEastRegion(roster, branding)) {
    const workWeekDateText = branding.enableSunSunView
      ? `Sunday, ${formatToMMDDYYYY(weekInfo.sundayDate)} – Sunday, ${formatToMMDDYYYY(weekInfo.nextSundayDate)}`
      : `Sunday, ${formatToMMDDYYYY(weekInfo.sundayDate)} – Saturday, ${formatToMMDDYYYY(weekInfo.saturdayDate)}`;

    const lines: string[] = [];
    lines.push(`Hello ${techFirstName},\n`);
    if (emailUpdateBanner) {
      lines.push(`${emailUpdateBanner}\n`);
    }
    lines.push(`Hope your week is off to a great start. Please see the attached documents and the table below regarding installs for ${workWeekDateText} . Please be prepared for your scheduled installs and pop-up installs throughout the week.\n`);
    lines.push(`If you have any questions, please let me know. Please see your schedule for this week below:`);
    lines.push(`Please include a SKETCH of each TMC intersection if the intersection differs from what can be seen on Google Earth\n`);
    lines.push(`PLEASE SEE AIR TABLE LINK BELOW\n`);
    lines.push(`Click Here - PHOTO UPLOADS (${photoUploadUrl})`);
    lines.push(`Click Here - SCHEDULE (${airtableUrl})`);
    lines.push(`Click Here– GOOGLE MAPS (${googleMapsUrl})\n\n`);

    sections.forEach((section) => {
      const dayOrders = groupedOrders[section.key] || [];

      lines.push(`${section.displayHeader}\n`);
      if (dayOrders.length > 0) {
        const dayNotesText = renderFloridaSouthEastDayNotesText(
          dayOrders,
          section.dayName,
          branding,
          branding.selectedRegion || branding.regionName || roster.region
        );
        if (dayNotesText) {
          lines.push(dayNotesText);
          lines.push("");
        }
        let projectGroups = groupDayOrdersByProject(dayOrders, branding.useAnytimeTeardowns);
        if (branding.enableArrangeNewProjects) {
          const customOrder = getCustomDayProjectOrder(section.dayName, section.key, roster, branding);
          if (customOrder && customOrder.length > 0) {
            projectGroups = reorderProjectGroups(projectGroups, customOrder);
          }
        }
        projectGroups.forEach((g) => {
          lines.push(renderNDSTaskGroupText(g, section.dayName, branding.useAnytimeTeardowns, branding));
          lines.push("");
        });
      } else {
        if (isSE) {
          lines.push(`-\n`);
        } else {
          lines.push(`TBD\n`);
        }
      }
      lines.push(`\n`);
    });

    lines.push(`General Notes:\n`);
    lines.push(`•\tAfter reviewing the workload “REPLY ALL” confirming you have received and understand your assignment`);
    lines.push(`•\tAfter workload completion “REPLY ALL” communicating all assignments complete and any necessary notes about the work done`);
    lines.push(`•\tAfter picking up equipment, please QC data and send in at time specified on schedule email. Please add your QC notes when you send in the data `);
    lines.push(`•\tIf you have any videos that require uploading, please  “REPLY ALL” communicating the total number of files successfully uploaded when complete.\n`);

    return lines.join("\n");
  }

  const lines: string[] = [];
  lines.push(`Hello ${techFirstName},\n`);
  if (emailUpdateBanner) {
    lines.push(`${emailUpdateBanner}\n`);
  }
  lines.push(`Please see link for the jobs scheduled week of ${weekInfo.formattedRange}. If you have any questions, please let me know.`);
  lines.push(`Please see your schedule for this week below:\n`);
  lines.push(`${regionName} AirTable Link: ${techFullName}'s Airtable (${airtableUrl})`);
  lines.push(`Google Maps Link: ${techFullName}: Weekly Schedule ${weekInfo.formattedRange}\n\n`);

  sections.forEach((section) => {
    const dayOrders = groupedOrders[section.key] || [];

    lines.push(`${section.displayHeader}\n`);
    if (dayOrders.length > 0) {
      const projectGroups = groupDayOrdersByProject(dayOrders, branding.useAnytimeTeardowns);
      projectGroups.forEach((g) => {
        lines.push(renderNDSTaskGroupText(g, section.dayName, branding.useAnytimeTeardowns, branding));
        lines.push("");
      });
    } else {
      lines.push(`TBD\n`);
    }
    lines.push(`\n`);
  });

  return lines.join("\n");
}

// Generate standard RFC 822 .EML format file content (compatible with Outlook Desktop, Mac, Windows)
export function generateEmlFileContent(
  roster: TechnicianRoster,
  branding: TemplateBranding,
  style: TemplateStyle
): string {
  const subject = generateEmailSubject(roster, branding);
  const plainText = generatePlainTextEmail(roster, branding);
  const htmlContent = generateOutlookHtml(roster, branding, style);
  const now = new Date().toUTCString();
  const techAttachments = getTechnicianAttachments(roster, branding);

  if (techAttachments.length === 0) {
    const boundary = `----=_NextPart_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    return [
      `From: "${branding.dispatcherName}" <${branding.replyToEmail}>`,
      `To: "${roster.technicianName}" <${roster.technicianEmail}>`,
      `Date: ${now}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `X-Mailer: Microsoft Outlook Compatible Dispatch Automation`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset="utf-8"`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      plainText,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset="utf-8"`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      htmlContent,
      ``,
      `--${boundary}--`,
    ].join("\r\n");
  }

  // With attachments: multipart/mixed containing multipart/alternative + attachment parts
  const mainBoundary = `----=_Part_Main_${Math.random().toString(36).substring(2)}_${Date.now()}`;
  const altBoundary = `----=_Part_Alt_${Math.random().toString(36).substring(2)}_${Date.now()}`;

  const lines: string[] = [
    `From: "${branding.dispatcherName}" <${branding.replyToEmail}>`,
    `To: "${roster.technicianName}" <${roster.technicianEmail}>`,
    `Date: ${now}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `X-Mailer: Microsoft Outlook Compatible Dispatch Automation`,
    `Content-Type: multipart/mixed; boundary="${mainBoundary}"`,
    ``,
    `--${mainBoundary}`,
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    ``,
    `--${altBoundary}`,
    `Content-Type: text/plain; charset="utf-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    plainText,
    ``,
    `--${altBoundary}`,
    `Content-Type: text/html; charset="utf-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    htmlContent,
    ``,
    `--${altBoundary}--`,
  ];

  // Append each file attachment
  for (const att of techAttachments) {
    const mimeType = att.type || getMimeTypeForFilename(att.name);
    const chunkedBase64 = splitBase64Into76CharLines(att.dataBase64);

    lines.push(
      ``,
      `--${mainBoundary}`,
      `Content-Type: ${mimeType}; name="${att.name}"`,
      `Content-Transfer-Encoding: base64`,
      `Content-Disposition: attachment; filename="${att.name}"`,
      ``,
      chunkedBase64
    );
  }

  lines.push(``, `--${mainBoundary}--`);
  return lines.join("\r\n");
}

// Deep link to Outlook Office 365 Web Compose
export function getOutlook365WebUrl(roster: TechnicianRoster, branding: TemplateBranding): string {
  const subject = generateEmailSubject(roster, branding);
  const body = generatePlainTextEmail(roster, branding);
  const params = new URLSearchParams({
    to: roster.technicianEmail,
    subject: subject,
    body: body,
  });
  return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
}

// Deep link to Outlook Live / Hotmail Web Compose
export function getOutlookLiveWebUrl(roster: TechnicianRoster, branding: TemplateBranding): string {
  const subject = generateEmailSubject(roster, branding);
  const body = generatePlainTextEmail(roster, branding);
  const params = new URLSearchParams({
    to: roster.technicianEmail,
    subject: subject,
    body: body,
  });
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}

// Standard Mailto URL
export function getMailtoUrl(roster: TechnicianRoster, branding: TemplateBranding): string {
  const subject = encodeURIComponent(generateEmailSubject(roster, branding));
  const body = encodeURIComponent(generatePlainTextEmail(roster, branding));
  return `mailto:${encodeURIComponent(roster.technicianEmail)}?subject=${subject}&body=${body}`;
}

// Download single .eml file
export function downloadEmlFile(roster: TechnicianRoster, branding: TemplateBranding, style: TemplateStyle) {
  const emlContent = generateEmlFileContent(roster, branding, style);
  const blob = new Blob([emlContent], { type: "message/rfc822;charset=utf-8" });
  const filename = `Schedule_${roster.date}_${roster.technicianName.replace(/[^a-zA-Z0-9]/g, "_")}.eml`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// Download all technician emails as a ZIP bundle
export async function downloadAllAsZip(
  rosters: TechnicianRoster[],
  branding: TemplateBranding,
  style: TemplateStyle,
  dateStr: string
) {
  const zip = new JSZip();
  const folder = zip.folder(`Technician_Schedules_${dateStr}`);

  for (const roster of rosters) {
    const cleanName = roster.technicianName.replace(/[^a-zA-Z0-9]/g, "_");
    const emlContent = generateEmlFileContent(roster, branding, style);
    const htmlContent = generateOutlookHtml(roster, branding, style);
    const txtContent = generatePlainTextEmail(roster, branding);

    folder?.file(`EML_Templates/Schedule_${cleanName}.eml`, emlContent);
    folder?.file(`HTML_Templates/Schedule_${cleanName}.html`, htmlContent);
    folder?.file(`Text_Summary/Schedule_${cleanName}.txt`, txtContent);
  }

  // Include attached files in Attachments/ directory in ZIP
  const allAttachments = branding.attachments || [];
  if (allAttachments.length > 0) {
    const attachFolder = folder?.folder("Attachments");
    for (const att of allAttachments) {
      if (att.dataBase64) {
        attachFolder?.file(att.name, att.dataBase64, { base64: true });
      }
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  const filename = `Batch_Outlook_Schedules_${dateStr}.zip`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// Copy rich HTML to clipboard
export async function copyRichHtmlToClipboard(htmlString: string, plainText: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([htmlString], { type: "text/html" });
      const textBlob = new Blob([plainText], { type: "text/plain" });
      const clipboardItem = new ClipboardItem({
        "text/html": htmlBlob,
        "text/plain": textBlob,
      });
      await navigator.clipboard.write([clipboardItem]);
      return true;
    } else {
      // Fallback
      await navigator.clipboard.writeText(plainText);
      return true;
    }
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    try {
      await navigator.clipboard.writeText(plainText);
      return true;
    } catch {
      return false;
    }
  }
}
