import Papa from "papaparse";
import { irishGridToLatLon, isWithinNI } from "@/lib/nigrid";
import type { HeatmapDataset, HeatmapPoint } from "@/lib/heatmapTypes";

const SURFACE_DEFECTS_URL = "https://dfi.highway-iams.uk/opendata/Surface_Defects_Current_Year.csv";
const POTHOLE_ENQUIRIES_URL = "https://dfi.highway-iams.uk/opendata/Pothole_Enquiries_2026.csv";

// Response-time category -> severity score. Order (and therefore the score)
// comes directly from each category's own stated target - "as soon as
// practical" is more urgent than "1 calendar day", which is more urgent than
// "5 working days", and so on - not an invented DfI severity field. Verified
// against DfI's own "Surface Defects Table Descriptions" document, which
// defines RESPONSE_TIME_NAME as the target-completion category but does not
// itself publish a numeric severity. "R2 Weekend" is the weekend-logged
// equivalent of "R2 - 5 Working days", same tier.
const RESPONSE_TIME_SEVERITY: Record<string, number> = {
  "R0  - As Soon As Practical": 5,
  "R1 - 1 Calendar Day": 4,
  "R2 - 5 Working days": 3,
  "R2 Weekend": 3,
  "R3 - 4 Weeks": 2,
  "R4 - next available programme": 1,
};

const SEVERITY_LABELS: Record<number, string> = {
  5: "Emergency",
  4: "High",
  3: "Medium",
  2: "Low",
  1: "Routine / unspecified",
};

const DEFECT_TYPE_KEYWORDS: [string, string][] = [
  ["POTHOLE", "Pothole"],
  ["EDGE DETERIORATION", "Edge deterioration"],
  ["CRACKED", "Cracked"],
  ["RUTTED", "Rutted"],
  ["UNEVEN", "Uneven"],
  ["DEPRESSED", "Depressed"],
  ["DEFECTIVE", "Defective"],
  ["CRAZED", "Crazed"],
  ["BLEEDING", "Bleeding"],
];

const PAVEMENT_CODES: Record<string, string> = { C: "Carriageway", F: "Footway", H: "Hardshoulder" };
const MATERIAL_WORDS: Record<string, string> = { ASPHALT: "Asphalt", BITMAC: "Bitmac", CONCRETE: "Concrete" };

// DfI's SECTION_OFFICE values are split by sub-area within a council (e.g.
// "BELFAST NORTH" / "BELFAST SOUTH"); this collapses them onto the 11 real
// Northern Ireland local government districts.
const COUNCIL_MAP: [RegExp, string][] = [
  [/^ANTRIM and NEWTOWNABBEY$/, "Antrim and Newtownabbey"],
  [/^ARDS and NORTH DOWN$/, "Ards and North Down"],
  [/^ARMAGH CITY BANBRIDGE and CRAIGAVON/, "Armagh City, Banbridge and Craigavon"],
  [/^BELFAST/, "Belfast"],
  [/^CASTLEREAGH and LISBURN$/, "Lisburn and Castlereagh"],
  [/^CAUSEWAY COAST and GLENS/, "Causeway Coast and Glens"],
  [/^FERMANAGH and OMAGH/, "Fermanagh and Omagh"],
  [/^LONDONDERRY and STRABANE$/, "Derry City and Strabane"],
  [/^MID ULSTER/, "Mid Ulster"],
  [/^MID and EAST ANTRIM$/, "Mid and East Antrim"],
  [/^NEWRY MOURNE and DOWN/, "Newry, Mourne and Down"],
];

const OUTSTANDING_STATUSES = new Set([
  "Works Order Issued",
  "Works Order Prep",
  "R2. R3, R4 Awaiting Action",
  "Further Information Required",
  "Defect Checking",
  "Disputed",
  "Part Complete",
  "Standard - New",
  "Standard - In Progress",
]);

function normaliseCouncil(office: string): string {
  const trimmed = office.trim();
  for (const [pattern, name] of COUNCIL_MAP) {
    if (pattern.test(trimmed)) return name;
  }
  return "Unknown";
}

function classifyDefectDetail(detail: string): { defectType: string; pavement: string; material: string } {
  let defectType = "Other";
  for (const [keyword, label] of DEFECT_TYPE_KEYWORDS) {
    if (detail.includes(keyword)) {
      defectType = label;
      break;
    }
  }
  let material = "Unspecified";
  for (const [word, label] of Object.entries(MATERIAL_WORDS)) {
    if (detail.startsWith(word)) {
      material = label;
      break;
    }
  }
  const codeMatch = detail.match(/\(([A-Z]{3,4})\)\s*$/);
  const pavement = codeMatch ? (PAVEMENT_CODES[codeMatch[1][0]] ?? "Unspecified") : "Unspecified";
  return { defectType, pavement, material };
}

// DfI dates are DD/MM/YYYY HH:MM:SS (UK format) - parsed manually because
// `new Date(string)` treats ambiguous slash-dates as MM/DD/YYYY in Node/V8.
function parseUkDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  if (yyyy === "9999") return null; // DfI's "not yet completed" sentinel date
  const date = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function cleanRoadName(sectionName: string): string {
  // Strips the leading numeric section code, e.g.
  // "7035A0001_21 HOWARD ST1: BEDFORD ST1 TO GREAT VICTORIA ST1" -> the rest.
  const stripped = sectionName.replace(/^\S+_\d+\s*/, "").trim();
  return stripped.length > 0 ? stripped : sectionName.trim();
}

async function fetchCsv(url: string): Promise<Record<string, string>[]> {
  // No Next.js fetch cache here: these CSVs (~20MB combined) exceed the
  // default Data Cache's per-item size limit, so caching is handled
  // ourselves in getHeatmapDataset() below instead.
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  return parsed.data;
}

function parseSurfaceDefects(rows: Record<string, string>[]): { points: HeatmapPoint[]; skipped: number } {
  const points: HeatmapPoint[] = [];
  const seenIds = new Set<string>();
  let skipped = 0;

  for (const row of rows) {
    const id = row.INSTRUCTION_REFERENCE;
    if (!id || seenIds.has(id)) continue;
    seenIds.add(id);

    const easting = Number(row.EASTING);
    const northing = Number(row.NORTHING);
    if (!easting || !northing) {
      skipped++;
      continue;
    }
    const [lat, lon] = irishGridToLatLon(easting, northing);
    if (!isWithinNI(lat, lon)) {
      skipped++;
      continue;
    }

    const detail = row.DEFECT_DETAIL ?? "";
    const { defectType, pavement, material } = classifyDefectDetail(detail);
    const priorityCode = row.RESPONSE_TIME_NAME?.trim() || "Unspecified";
    const severityScore = RESPONSE_TIME_SEVERITY[priorityCode] ?? 1;
    const severityLabel = RESPONSE_TIME_SEVERITY[priorityCode] ? SEVERITY_LABELS[severityScore] : "Unspecified";
    const status = row.DEFECT_STATUS?.trim() || "Unspecified";

    points.push({
      id,
      lat,
      lon,
      defectType,
      pavement,
      material,
      priorityCode,
      severityScore,
      severityLabel,
      recordedDate: parseUkDate(row.RECORDED_DATE),
      road: cleanRoadName(row.SECTION_NAME ?? ""),
      council: normaliseCouncil(row.SECTION_OFFICE ?? ""),
      status,
      outstanding: OUTSTANDING_STATUSES.has(status),
      source: "DFI_SURFACE_DEFECT",
    });
  }
  return { points, skipped };
}

function parsePotholeEnquiries(rows: Record<string, string>[]): { points: HeatmapPoint[]; skipped: number } {
  const points: HeatmapPoint[] = [];
  const seen = new Set<string>();
  let skipped = 0;
  let counter = 0;

  for (const row of rows) {
    const easting = Number(row.EASTING);
    const northing = Number(row.NORTHING);
    if (!easting || !northing) {
      skipped++;
      continue;
    }
    const [lat, lon] = irishGridToLatLon(easting, northing);
    if (!isWithinNI(lat, lon)) {
      skipped++;
      continue;
    }

    // No unique id is published for enquiries - derive one from the full
    // row content so exact-duplicate rows collapse to a single point.
    const dedupeKey = [row.DATE_RECORDED, row.EASTING, row.NORTHING, row.CLIENT_OFFICE_NAME].join("|");
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const status = row.APPROVAL_STATUS_NAME?.trim() || "Unspecified";
    counter++;
    points.push({
      id: `enquiry-${counter}-${dedupeKey}`,
      lat,
      lon,
      defectType: "Pothole",
      pavement: "Unspecified",
      material: "Unspecified",
      priorityCode: "Unspecified",
      severityScore: 1,
      severityLabel: "Unspecified",
      recordedDate: parseUkDate(row.DATE_RECORDED),
      road: row.SECTION_NAME && row.SECTION_NAME !== "?" ? cleanRoadName(row.SECTION_NAME) : "Unspecified",
      council: normaliseCouncil(row.CLIENT_OFFICE_NAME ?? ""),
      status,
      outstanding: OUTSTANDING_STATUSES.has(status),
      source: "POTHOLE_ENQUIRY",
    });
  }
  return { points, skipped };
}

async function buildHeatmapDataset(): Promise<HeatmapDataset> {
  const [defectRows, enquiryRows] = await Promise.all([
    fetchCsv(SURFACE_DEFECTS_URL),
    fetchCsv(POTHOLE_ENQUIRIES_URL),
  ]);

  const defects = parseSurfaceDefects(defectRows);
  const enquiries = parsePotholeEnquiries(enquiryRows);

  return {
    points: [...defects.points, ...enquiries.points],
    generatedAt: new Date().toISOString(),
    counts: {
      defectsTotal: defects.points.length,
      defectsSkippedInvalidCoords: defects.skipped,
      enquiriesTotal: enquiries.points.length,
      enquiriesSkippedInvalidCoords: enquiries.skipped,
    },
  };
}

// Next's built-in Data Cache (fetch cache / unstable_cache) caps individual
// entries around 2MB, well under this dataset's size, so it's cached here
// as a plain module-scope singleton instead. This persists for the
// lifetime of a warm server/serverless instance and is shared by every
// request it serves, which is what actually matters for a live demo: it
// stops every visitor from re-downloading ~20MB from DfI and re-parsing
// ~80k rows on their own request.
let cached: { data: HeatmapDataset; expiresAt: number } | null = null;
let inFlight: Promise<HeatmapDataset> | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function getHeatmapDataset(): Promise<HeatmapDataset> {
  if (cached && Date.now() < cached.expiresAt) return cached.data;
  if (inFlight) return inFlight;

  inFlight = buildHeatmapDataset()
    .then((data) => {
      cached = { data, expiresAt: Date.now() + CACHE_TTL_MS };
      return data;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}
