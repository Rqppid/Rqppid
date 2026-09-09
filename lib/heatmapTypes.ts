export type DefectSource = "DFI_SURFACE_DEFECT" | "POTHOLE_ENQUIRY";

export type HeatmapPoint = {
  id: string;
  lat: number;
  lon: number;
  defectType: string; // "Pothole" | "Cracked" | "Rutted" | ... | "Other" | "Unspecified"
  pavement: string; // "Carriageway" | "Footway" | "Hardshoulder" | "Unspecified"
  material: string; // "Asphalt" | "Bitmac" | "Concrete" | "Unspecified"
  priorityCode: string; // raw RESPONSE_TIME_NAME, or "Unspecified"
  severityScore: number; // 1-5, see SEVERITY_TIERS; 1 for unscored/"From Matrix"
  severityLabel: string;
  recordedDate: string | null; // ISO date, if parseable
  road: string; // best-effort readable road/section description
  council: string; // normalised NI council area, or "Unknown"
  status: string; // raw DEFECT_STATUS / APPROVAL_STATUS_NAME
  outstanding: boolean; // false for completed/archived/paid records
  source: DefectSource;
};

export type HeatmapDataset = {
  points: HeatmapPoint[];
  generatedAt: string;
  counts: {
    defectsTotal: number;
    defectsSkippedInvalidCoords: number;
    enquiriesTotal: number;
    enquiriesSkippedInvalidCoords: number;
  };
};

export const SEVERITY_TIERS: Record<
  number,
  { label: string; color: string; description: string }
> = {
  5: {
    label: "Emergency",
    color: "#ef4444",
    description: "R0 - As soon as practical",
  },
  4: {
    label: "High",
    color: "#f97316",
    description: "R1 - 1 calendar day",
  },
  3: {
    label: "Medium",
    color: "#facc15",
    description: "R2 - 5 working days",
  },
  2: {
    label: "Low",
    color: "#22c55e",
    description: "R3 - 4 weeks",
  },
  1: {
    label: "Routine / unspecified",
    color: "#a1a1aa",
    description: "R4 - next available programme, or no response-time category recorded",
  },
};

export const COUNCILS = [
  "Antrim and Newtownabbey",
  "Ards and North Down",
  "Armagh City, Banbridge and Craigavon",
  "Belfast",
  "Causeway Coast and Glens",
  "Derry City and Strabane",
  "Fermanagh and Omagh",
  "Lisburn and Castlereagh",
  "Mid and East Antrim",
  "Mid Ulster",
  "Newry, Mourne and Down",
  "Unknown",
] as const;

export const DEFECT_TYPES = [
  "Pothole",
  "Edge deterioration",
  "Cracked",
  "Rutted",
  "Uneven",
  "Depressed",
  "Defective",
  "Crazed",
  "Bleeding",
  "Other",
] as const;
