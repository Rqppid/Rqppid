import { getHeatmapDataset } from "@/lib/heatmapData";
import type { HeatmapPoint } from "@/lib/heatmapTypes";

export const maxDuration = 60;

const MAX_PINS = 9;
const MIN_SEPARATION = 16; // in projected % units, stops pins overlapping visually
const INSET = 10; // keeps pins off the very edge of the frame

function daysSince(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const recorded = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(recorded)) return null;
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.round((todayUtc - recorded) / 86_400_000));
}

// "DONEGALL SQUARE WEST1: WELLINGTON PL1 TO HOWARD ST1" -> "Donegall Square West".
// Trailing digits are DfI's section suffixes, but only stripped from words long
// enough that removing them can't destroy a real road number like M1 or A1.
function shortRoadLabel(road: string): string {
  const head = road.split(":")[0] ?? road;
  return head
    .trim()
    .split(/\s+/)
    .map((word) => {
      const stripped = word.replace(/^(.{2,}?)\d+$/, "$1");
      return stripped.charAt(0) + stripped.slice(1).toLowerCase();
    })
    .join(" ");
}

// Min/max via reduce rather than Math.min(...arr) - the Belfast subset runs to
// thousands of points and spreading that many arguments risks a stack overflow.
function bounds(values: number[]): { min: number; max: number } {
  return values.reduce(
    (acc, v) => ({ min: Math.min(acc.min, v), max: Math.max(acc.max, v) }),
    { min: Infinity, max: -Infinity }
  );
}

export async function GET() {
  try {
    const dataset = await getHeatmapDataset();

    const belfast = dataset.points.filter(
      (p) => p.council === "Belfast" && p.outstanding && p.defectType === "Pothole"
    );

    if (belfast.length === 0) {
      return Response.json({ points: [], total: 0, generatedAt: dataset.generatedAt });
    }

    // Project real coordinates into the frame using the bounding box of every
    // outstanding Belfast pothole, so the pins sit in genuinely correct
    // positions relative to each other rather than decorative ones.
    const lat = bounds(belfast.map((p) => p.lat));
    const lon = bounds(belfast.map((p) => p.lon));
    const latSpan = lat.max - lat.min || 1;
    const lonSpan = lon.max - lon.min || 1;
    const scale = 100 - INSET * 2;

    const projected = belfast.map((p) => ({
      point: p,
      x: INSET + ((p.lon - lon.min) / lonSpan) * scale,
      y: INSET + ((lat.max - p.lat) / latSpan) * scale, // screen y grows downward
    }));

    // Highest priority first, then greedily keep only points far enough apart
    // to read as distinct pins.
    const sorted = [...projected].sort((a, b) => b.point.severityScore - a.point.severityScore);
    const chosen: typeof sorted = [];
    for (const candidate of sorted) {
      if (chosen.length >= MAX_PINS) break;
      const tooClose = chosen.some(
        (c) => Math.hypot(c.x - candidate.x, c.y - candidate.y) < MIN_SEPARATION
      );
      if (!tooClose) chosen.push(candidate);
    }

    const toPin = ({ point, x, y }: { point: HeatmapPoint; x: number; y: number }) => ({
      id: point.id,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      lat: point.lat,
      lon: point.lon,
      label: shortRoadLabel(point.road),
      severityLabel: point.severityLabel,
      severityScore: point.severityScore,
      recordedDate: point.recordedDate,
      daysSince: daysSince(point.recordedDate),
    });

    return Response.json(
      {
        points: chosen.map(toPin),
        total: belfast.length,
        generatedAt: dataset.generatedAt,
      },
      { headers: { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch {
    return Response.json({ error: "Could not load defect data." }, { status: 502 });
  }
}
