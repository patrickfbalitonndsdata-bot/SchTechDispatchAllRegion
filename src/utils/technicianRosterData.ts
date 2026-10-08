import { TechnicianAirtableEntry, TemplateBranding, RegionRoster, REGION_ROSTERS, WorkOrder } from "../types";

/**
 * Official Technician Roster with their assigned personal Airtable View/Share links and Region Rosters.
 * The 8 standard Region Rosters are:
 * - North East
 * - Mid Atlantic
 * - South East
 * - Florida
 * - NYC
 * - NOCAL
 * - SOCAL
 * - Mid West
 */
export const DEFAULT_TECHNICIAN_ROSTER: TechnicianAirtableEntry[] = [
  {
    name: "Alexander Shaw",
    airtableUrl: "https://airtable.com/appPsh2I84PoFJN9x/shrUoxrRAlmIwdc8I",
    email: "alexander.shaw@ndsdata.com",
    active: true,
  },
  {
    name: "Miguel Hendry",
    airtableUrl: "https://airtable.com/appPsh2I84PoFJN9x/shrk0AceEpbOOdZjC",
    email: "miguel.hendry@ndsdata.com",
    active: true,
  },
  {
    name: "Madison Lopez",
    airtableUrl: "https://airtable.com/appPsh2I84PoFJN9x/shrY1ehEwWcySo4xT",
    email: "madison.lopez@ndsdata.com",
    active: true,
  },
  {
    name: "Joshua McDougal",
    airtableUrl: "https://airtable.com/appPsh2I84PoFJN9x/shr4gKW3HuR9ewje3",
    email: "joshua.mcdougal@ndsdata.com",
    active: true,
  },
  {
    name: "Davian Cruz",
    airtableUrl: "https://airtable.com/appPsh2I84PoFJN9x/shrDavianCruzFL",
    email: "davian.cruz@ndsdata.com",
    active: true,
  },
  {
    name: "Damian Palmer",
    airtableUrl: "https://airtable.com/appPsh2I84PoFJN9x/shrBzr508LZssRVY8",
    email: "damian.palmer@ndsdata.com",
    active: true,
  },
  {
    name: "Anthony Ferrell",
    airtableUrl: "https://airtable.com/appPsh2I84PoFJN9x/shrDU4viNwtxetNSQ",
    email: "anthony.ferrell@ndsdata.com",
    active: true,
  },
  {
    name: "Giovonn Robinson",
    airtableUrl: "https://airtable.com/appPsh2I84PoFJN9x/shrs9mWcnMrvI6gWu",
    email: "giovonn.robinson@ndsdata.com",
    active: true,
  },
  {
    name: "James Londeree",
    airtableUrl: "https://airtable.com/appPsh2I84PoFJN9x/shrBmkVz15DWP4R9D",
    email: "james.londeree@ndsdata.com",
    active: true,
  },
  {
    name: "Aria Ghiorbani",
    airtableUrl: "https://airtable.com/appPsh2I84PoFJN9x/shrvrozujNRDd16aZ",
    email: "aria.ghiorbani@ndsdata.com",
    active: true,
  },
  {
    name: "Devon Washington",
    airtableUrl: "https://airtable.com/appPsh2I84PoFJN9x/shrDevonWash992",
    email: "devon.washington@ndsdata.com",
    active: true,
  },
  {
    name: "Kenneth Mayon",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shr79NnP92hcN6f7b",
    email: "kenneth.mayon@ndsdata.com",
    active: true,
  },
  {
    name: "Christopher Schanding",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrXUnJTYJ1fP2CTc",
    email: "christopher.schanding@ndsdata.com",
    active: true,
  },
  {
    name: "James Duncan",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrQk8nylKSWLHPoM",
    email: "james.duncan@ndsdata.com",
    active: true,
  },
  {
    name: "Euclid Woodstock",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrlLiahaFrNN2CPU",
    email: "euclid.woodstock@ndsdata.com",
    active: true,
  },
  {
    name: "Mark Jones",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrj9gngSaxQaGehA",
    email: "mark.jones@ndsdata.com",
    active: true,
  },
  {
    name: "Gabriel Nieves",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrqcMpHCGYKdUpDd",
    email: "gabriel.nieves@ndsdata.com",
    active: true,
  },
  {
    name: "Zacharey Moody",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrrnUE47OVGvs058",
    email: "zacharey.moody@ndsdata.com",
    active: true,
  },
  {
    name: "Neil Paz",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shraYVmNHPn2AlU4F",
    email: "neil.paz@ndsdata.com",
    active: true,
  },
  {
    name: "Davian Jones",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrg8rXcXZTbhz7y5",
    email: "davian.jones@ndsdata.com",
    active: true,
  },
  {
    name: "Adrian Creagh-Diaz",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shr5kHGcl9rygbr4c",
    email: "adrian.creagh-diaz@ndsdata.com",
    active: true,
  },
  {
    name: "Juvoney Bailey",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shreZTDKWazFR7eFC",
    email: "juvoney.bailey@ndsdata.com",
    active: true,
  },
  {
    name: "Chris Rhyne",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrTYijMglhpEedYx",
    email: "chris.rhyne@ndsdata.com",
    active: true,
  },
  {
    name: "Christopher Autrey",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrWXPpdmpqxRSP72",
    email: "christopher.autrey@ndsdata.com",
    active: true,
  },
  {
    name: "Cody Northrup",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shra9YxPObT7vU9Z2",
    email: "cody.northrup@ndsdata.com",
    active: true,
  },
  {
    name: "Palmer Theron",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrfsY2FH4UeZsY41",
    email: "palmer.theron@ndsdata.com",
    active: true,
  },
  {
    name: "Jeremy Dykes",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrbnHDRVHamTYgqD",
    email: "jeremy.dykes@ndsdata.com",
    active: true,
  },
  {
    name: "Nicholas Stillwagon",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrva9jqschF8JAcx",
    email: "nicholas.stillwagon@ndsdata.com",
    active: true,
  },
  {
    name: "Anthony Moore",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrKebgqJkdVW02mI",
    email: "anthony.moore@ndsdata.com",
    active: true,
  },
  {
    name: "Tarel Bartell",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrZ1R55S36CxCQ4i",
    email: "tarel.bartell@ndsdata.com",
    active: true,
  },
  {
    name: "Woodard Michael",
    airtableUrl: "https://airtable.com/appS5raL3ofpawrX5/shrA7VQy1eGtLCL6O",
    email: "woodard.michael@ndsdata.com",
    active: true,
  },
];

/**
 * Normalizes any raw region string into one of the 8 canonical Region Rosters:
 * "North East" | "Mid Atlantic" | "South East" | "Florida" | "NYC" | "NOCAL" | "SOCAL" | "Mid West"
 */
export function normalizeRegionName(raw?: string): RegionRoster | undefined {
  if (!raw) return undefined;
  const s = raw.trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");

  if (s === "north east" || s === "northeast" || s === "ne" || s === "new england") return "North East";
  if (s === "mid atlantic" || s === "midatlantic" || s === "middle atlantic" || s === "ma") return "Mid Atlantic";
  if (s === "south east" || s === "southeast" || s === "se" || s === "south central") return "South East";
  if (s === "florida" || s === "fl" || s.startsWith("fl ") || s.endsWith(" fl")) return "Florida";
  if (s === "nyc" || s === "new york city" || s === "ny city" || s === "manhattan") return "NYC";
  if (s === "nocal" || s === "norcal" || s === "no cal" || s === "northern california" || s === "north cal") return "NOCAL";
  if (s === "socal" || s === "so cal" || s === "southern california" || s === "south cal") return "SOCAL";
  if (s === "mid west" || s === "midwest" || s === "mw" || s === "middle west") return "Mid West";

  // Check if string contains any region name
  for (const r of REGION_ROSTERS) {
    if (s.includes(r.toLowerCase())) return r;
  }
  return undefined;
}

/**
 * Infers a Region Roster from address, city, or state strings if no explicit region column exists.
 */
export function inferRegionFromLocation(cityState?: string, serviceAddress?: string): RegionRoster | undefined {
  const combined = `${cityState || ""} ${serviceAddress || ""}`.toLowerCase();
  if (!combined.trim()) return undefined;

  // Florida
  if (/\bfl\b|\bflorida\b|miami|orlando|tampa|jacksonville|fort lauderdale|tallahassee|gainesville|st\.? petersburg|hialeah|pensacola/i.test(combined)) {
    return "Florida";
  }

  // NYC (Specific to New York City)
  if (/\bnyc\b|new york city|manhattan|brooklyn|queens|bronx|staten island|long island city/i.test(combined)) {
    return "NYC";
  }

  // NOCAL (Northern California)
  if (/san francisco|oakland|san jose|sacramento|fresno|berkeley|santa clara|palo alto|sunnyvale|modesto|stockton|vallejo|fremont|mountain view/i.test(combined)) {
    return "NOCAL";
  }

  // SOCAL (Southern California)
  if (/los angeles|\bla\b|san diego|irvine|long beach|anaheim|riverside|san bernardino|pasadena|glendale|bakersfield|chula vista|santa ana|santa barbara|torrance/i.test(combined)) {
    return "SOCAL";
  }

  // North East (New England / Upstate NY)
  if (/\b(ma|ct|ri|nh|vt|me)\b|massachusetts|connecticut|rhode island|new hampshire|vermont|maine|boston|hartford|providence|albany|worcester|stamford|new britain|new haven|bridgeport/i.test(combined)) {
    return "North East";
  }

  // Mid Atlantic (DC, MD, VA, DE, PA, WV)
  if (/\b(va|md|dc|de|pa|wv)\b|virginia|maryland|delaware|pennsylvania|west virginia|washington\s*d\.?c\.?|richmond|baltimore|philadelphia|pittsburgh|arlington|alexandria|annapolis|wilmington/i.test(combined)) {
    return "Mid Atlantic";
  }

  // Mid West (IL, OH, IN, MI, WI, MN, IA, MO)
  if (/\b(il|oh|in|mi|wi|mn|ia|mo)\b|illinois|ohio|indiana|michigan|wisconsin|minnesota|iowa|missouri|chicago|columbus|indianapolis|detroit|milwaukee|minneapolis|cleveland|cincinnati|st\.? louis|kansas city/i.test(combined)) {
    return "Mid West";
  }

  // South East / South Central (TX, LA, GA, NC, SC, AL, MS, TN, KY, AR)
  if (/\b(tx|la|ga|nc|sc|al|ms|tn|ky|ar)\b|texas|louisiana|georgia|north carolina|south carolina|alabama|mississippi|tennessee|kentucky|arkansas|dallas|houston|austin|san antonio|fort worth|new orleans|baton rouge|lafayette|houma|new iberia|atlanta|charlotte|nashville|memphis|birmingham/i.test(combined)) {
    return "South East";
  }

  return undefined;
}

/**
 * Resolves the primary Region Roster for a technician based on:
 * 1. Explicit technician region from roster settings
 * 2. Explicit CSV order region column
 * 3. Inferred region from work order cities/states
 * 4. Fallback default
 */
export function resolveTechnicianRegion(
  techName: string,
  orders: WorkOrder[] = [],
  branding?: TemplateBranding
): RegionRoster {
  // If an active dispatch region is selected in branding, that applies to all technicians
  if (branding?.selectedRegion && branding.selectedRegion !== "all") {
    const norm = normalizeRegionName(branding.selectedRegion);
    if (norm) return norm;
  }
  if (branding?.regionName && branding.regionName !== "all") {
    const norm = normalizeRegionName(branding.regionName);
    if (norm) return norm;
  }

  // 1. Check if technician has an explicit assigned region in branding.technicianAirtableLinks or DEFAULT_TECHNICIAN_ROSTER
  const entry = findTechnicianAirtableEntry(techName, branding);
  if (entry?.region) {
    const norm = normalizeRegionName(entry.region);
    if (norm) return norm;
  }

  // 2. Check if any order has an explicit region column
  for (const order of orders) {
    if (order.region) {
      const norm = normalizeRegionName(order.region);
      if (norm) return norm;
    }
  }

  // 3. Infer from order locations (city/state or service address)
  for (const order of orders) {
    const inferred = inferRegionFromLocation(order.cityState, order.serviceAddress);
    if (inferred) return inferred;
  }

  return "North East";
}

/**
 * Cleans and normalizes a technician name for reliable matching against roster entries.
 */
export function normalizeTechNameKey(rawName?: string): string {
  if (!rawName) return "";
  let s = String(rawName).trim().toLowerCase();
  // Remove quotation marks, backslashes
  s = s.replace(/["“”„‟'`\\]/g, "");
  // If in "Last, First" format, swap to "First Last"
  if (s.includes(",")) {
    const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      s = `${parts.slice(1).join(" ")} ${parts[0]}`.trim();
    }
  }
  // Collapse whitespace
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Finds a technician's specific Airtable entry by looking up both custom branding overrides
 * and the default roster.
 */
export function findTechnicianAirtableEntry(
  techName: string,
  branding?: TemplateBranding
): TechnicianAirtableEntry | undefined {
  const cleanKey = normalizeTechNameKey(techName);
  if (!cleanKey) return undefined;

  const listToSearch: TechnicianAirtableEntry[] =
    branding?.technicianAirtableLinks && branding.technicianAirtableLinks.length > 0
      ? branding.technicianAirtableLinks
      : DEFAULT_TECHNICIAN_ROSTER;

  // 1. Exact match on normalized key
  const exact = listToSearch.find((entry) => normalizeTechNameKey(entry.name) === cleanKey);
  if (exact) return exact;

  // 1b. Check reversed name order (e.g. "Michael Woodard" vs "Woodard Michael")
  const keyTokens = cleanKey.split(" ").filter((w) => w.length > 1);
  if (keyTokens.length === 2) {
    const reversedKey = `${keyTokens[1]} ${keyTokens[0]}`;
    const reversedMatch = listToSearch.find((entry) => normalizeTechNameKey(entry.name) === reversedKey);
    if (reversedMatch) return reversedMatch;
  }

  // 2. Word-boundary or token match (e.g. "Joshua McDougal" in "Joshua McDougal - Field Tech")
  const words = cleanKey.split(" ").filter((w) => w.length > 1);
  const tokenMatch = listToSearch.find((entry) => {
    const entryWords = normalizeTechNameKey(entry.name).split(" ").filter((w) => w.length > 1);
    if (entryWords.length >= 2 && words.length >= 2) {
      // Check direct order
      const firstMatches = words[0] === entryWords[0];
      const lastMatches = words[words.length - 1] === entryWords[entryWords.length - 1];
      if (firstMatches && lastMatches) return true;

      // Check reverse order
      const firstReversed = words[0] === entryWords[entryWords.length - 1];
      const lastReversed = words[words.length - 1] === entryWords[0];
      if (firstReversed && lastReversed) return true;
    }
    return false;
  });

  return tokenMatch;
}

/**
 * Resolves the final Airtable URL for a technician:
 * - If a personal assigned Airtable link exists in the roster, returns that exact URL
 * - If the technician is not recognized in the roster, defaults to https://www.airtable.com/
 */
export function resolveTechnicianAirtableUrl(
  techName: string,
  branding?: TemplateBranding
): string {
  if (!techName || !techName.trim()) {
    return "https://www.airtable.com/";
  }
  const entry = findTechnicianAirtableEntry(techName, branding);
  if (entry && entry.airtableUrl && entry.airtableUrl.trim()) {
    const trimmed = entry.airtableUrl.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }

  // If technician is non-existent in the roster, default to https://www.airtable.com/
  return "https://www.airtable.com/";
}

/**
 * Checks if a technician has a direct personal Airtable link assigned.
 */
export function hasDirectTechnicianAirtableLink(
  techName: string,
  branding?: TemplateBranding
): boolean {
  if (!techName || !techName.trim()) return false;
  const entry = findTechnicianAirtableEntry(techName, branding);
  if (!entry || !entry.airtableUrl || !entry.airtableUrl.trim()) return false;
  const normalized = entry.airtableUrl.trim().toLowerCase().replace(/\/+$/, "");
  return normalized !== "https://www.airtable.com" && normalized !== "https://airtable.com";
}
