import { getHeatmapDataset } from "@/lib/heatmapData";

export const maxDuration = 60;

export async function GET() {
  try {
    const dataset = await getHeatmapDataset();
    return Response.json(dataset, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return Response.json(
      { error: "Could not load defect data from DfI's open data service. Please try again shortly." },
      { status: 502 }
    );
  }
}
