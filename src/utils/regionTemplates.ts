import { RegionRoster, REGION_ROSTERS } from "../types";

export type RegionTemplateStatus = "active" | "under_construction";

export interface RegionTemplateConfig {
  region: RegionRoster;
  templateKey: string;
  templateName: string;
  status: RegionTemplateStatus;
  statusMessage: string;
  description: string;
  version?: string;
  targetEmailFormat: string;
  supportedFeatures: string[];
}

/**
 * Registry of regional email templates.
 * Currently designated:
 * - North East (Exact NDS Outlook Template) -> ACTIVE
 * - Mid Atlantic (Exact NDS Outlook Template) -> ACTIVE
 *
 * Currently Under Construction (no designated template yet):
 * - South East
 * - Florida
 * - NYC
 * - NOCAL
 * - SOCAL
 * - Mid West
 */
export const REGION_TEMPLATE_CONFIGS: Record<RegionRoster, RegionTemplateConfig> = {
  "North East": {
    region: "North East",
    templateKey: "exact_nds_template",
    templateName: "North East Dispatch Template",
    status: "active",
    statusMessage: "Active & Designated",
    description: "Full multi-day schedule bullets, technician Airtable view link, project numbers, location IDs, and equipment tallies.",
    version: "v1.0 (Official Exact NDS)",
    targetEmailFormat: "Outlook HTML / EML with Airtable link & work week versioning",
    supportedFeatures: [
      "Technician Airtable Links",
      "Conduct Study Directives",
      "Custom ID Overrides",
      "Schedule Notes Filtering",
      "Email Update v.2/v.3 Banners",
      "Attachments & EML Export",
    ],
  },
  "Mid Atlantic": {
    region: "Mid Atlantic",
    templateKey: "exact_nds_template",
    templateName: "Mid Atlantic Dispatch Template",
    status: "active",
    statusMessage: "Active & Designated",
    description: "Standard Mid Atlantic multi-day location dispatch format with personal Airtable links, work week versioning, and equipment count tables.",
    version: "v1.0 (Official Exact NDS)",
    targetEmailFormat: "Outlook HTML / EML with Airtable link & work week versioning",
    supportedFeatures: [
      "Technician Airtable Links",
      "Conduct Study Directives",
      "Custom ID Overrides",
      "Schedule Notes Filtering",
      "Email Update v.2/v.3 Banners",
      "Attachments & EML Export",
    ],
  },
  "South East": {
    region: "South East",
    templateKey: "florida_southeast_template",
    templateName: "South East Dispatch Template",
    status: "active",
    statusMessage: "Active & Designated",
    description: "Designated South East template with TMC sketch requirement, Airtable Schedule, Photo Uploads & Google Maps links, and Reply All General Notes.",
    version: "v1.0 (Official Designated)",
    targetEmailFormat: "Outlook HTML / EML with Custom South East Header & Reply All General Notes",
    supportedFeatures: [
      "First Name Subject Line (<NAME>>>Schedule for WEEK OF MM/DD/YY)",
      "Underlined Hello Greeting & Work Week Install Dates",
      "TMC Intersection Sketch Notice (Yellow Highlight)",
      "PLEASE SEE AIR TABLE LINK BELOW (Yellow Highlight)",
      "Photo Uploads, Schedule & Google Maps Direct Links",
      "General Notes with RED 'REPLY ALL' Highlights",
      "Multi-Day Location Bullets & Equipment Counts",
      "Attachments & EML Export",
    ],
  },
  "Florida": {
    region: "Florida",
    templateKey: "florida_southeast_template",
    templateName: "Florida Dispatch Template",
    status: "active",
    statusMessage: "Active & Designated",
    description: "Designated Florida template with TMC sketch requirement, Airtable Schedule, Photo Uploads & Google Maps links, and Reply All General Notes.",
    version: "v1.0 (Official Designated)",
    targetEmailFormat: "Outlook HTML / EML with Custom Florida Header & Reply All General Notes",
    supportedFeatures: [
      "First Name Subject Line (<NAME>>>Schedule for WEEK OF MM/DD/YY)",
      "Underlined Hello Greeting & Work Week Install Dates",
      "TMC Intersection Sketch Notice (Yellow Highlight)",
      "PLEASE SEE AIR TABLE LINK BELOW (Yellow Highlight)",
      "Photo Uploads, Schedule & Google Maps Direct Links",
      "General Notes with RED 'REPLY ALL' Highlights",
      "Multi-Day Location Bullets & Equipment Counts",
      "Attachments & EML Export",
    ],
  },
  "NYC": {
    region: "NYC",
    templateKey: "exact_nds_template",
    templateName: "NYC Regional Template",
    status: "under_construction",
    statusMessage: "Template Under Construction",
    description: "The custom email template for the NYC region is currently under construction. Work orders uploaded for this region will not generate emails until its designated template is finalized and deployed.",
    version: "Pending Deployment",
    targetEmailFormat: "Designated NYC template pending specification",
    supportedFeatures: [],
  },
  "NOCAL": {
    region: "NOCAL",
    templateKey: "exact_nds_template",
    templateName: "NOCAL Regional Template",
    status: "under_construction",
    statusMessage: "Template Under Construction",
    description: "The custom email template for Northern California (NOCAL) is currently under construction. Work orders uploaded for this region will not generate emails until its designated template is finalized and deployed.",
    version: "Pending Deployment",
    targetEmailFormat: "Designated NOCAL template pending specification",
    supportedFeatures: [],
  },
  "SOCAL": {
    region: "SOCAL",
    templateKey: "exact_nds_template",
    templateName: "SOCAL Regional Template",
    status: "under_construction",
    statusMessage: "Template Under Construction",
    description: "The custom email template for Southern California (SOCAL) is currently under construction. Work orders uploaded for this region will not generate emails until its designated template is finalized and deployed.",
    version: "Pending Deployment",
    targetEmailFormat: "Designated SOCAL template pending specification",
    supportedFeatures: [],
  },
  "Mid West": {
    region: "Mid West",
    templateKey: "exact_nds_template",
    templateName: "Mid West Regional Template",
    status: "under_construction",
    statusMessage: "Template Under Construction",
    description: "The custom email template for the Mid West region is currently under construction. Work orders uploaded for this region will not generate emails until its designated template is finalized and deployed.",
    version: "Pending Deployment",
    targetEmailFormat: "Designated Mid West template pending specification",
    supportedFeatures: [],
  },
};

/**
 * Checks if a region has an active designated email template.
 * - Active regions: North East, Mid Atlantic, South East, Florida.
 * - Under construction regions (NYC, NOCAL, SOCAL, Mid West) return false.
 */
export function isRegionTemplateActive(region?: string): boolean {
  if (!region || region === "all") return true;
  const config = REGION_TEMPLATE_CONFIGS[region as RegionRoster];
  if (!config) return false;
  return config.status === "active";
}

/**
 * Returns all regions that have active email templates.
 */
export const ACTIVE_TEMPLATE_REGIONS: RegionRoster[] = (
  Object.keys(REGION_TEMPLATE_CONFIGS) as RegionRoster[]
).filter((r) => REGION_TEMPLATE_CONFIGS[r].status === "active");

/**
 * Returns all regions that are currently under construction.
 */
export const UNDER_CONSTRUCTION_REGIONS: RegionRoster[] = (
  Object.keys(REGION_TEMPLATE_CONFIGS) as RegionRoster[]
).filter((r) => REGION_TEMPLATE_CONFIGS[r].status === "under_construction");

/**
 * Gets template config for a region, falling back safely.
 */
export function getRegionTemplateConfig(region: string): RegionTemplateConfig | null {
  if (!region || region === "all") return null;
  return REGION_TEMPLATE_CONFIGS[region as RegionRoster] || null;
}
