import { HeatmapExplorer } from "@/components/HeatmapExplorer";
import { TransitionLink } from "@/components/TransitionLink";
import { isWithinNI } from "@/lib/nigrid";

function parseFocus(params: Record<string, string | string[] | undefined>) {
  const raw = (key: string) => (typeof params[key] === "string" ? params[key] : undefined);
  const lat = Number(raw("lat"));
  const lon = Number(raw("lon"));
  if (!raw("lat") || !raw("lon") || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  // Reject coordinates outside Northern Ireland so a hand-edited URL can't
  // fling the map somewhere meaningless.
  if (!isWithinNI(lat, lon)) return null;
  const zoom = Number(raw("zoom"));
  return { lat, lon, zoom: Number.isFinite(zoom) ? Math.min(Math.max(zoom, 7), 18) : 16 };
}

export default async function HeatmapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const focus = parseFocus(params);
  const initialView = params.view === "points" ? "points" : "heat";

  return (
    <div className="flex min-h-screen flex-col bg-[#071014] text-white">
      <div className="border-b border-white/10 bg-[#071014]/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <TransitionLink className="text-sm font-semibold text-zinc-300 transition hover:text-lime-300" href="/">
            ← Back to HotPots
          </TransitionLink>
          <span className="text-sm font-semibold tracking-[-.05em]">
            hot<span className="text-lime-300">pots</span>
          </span>
        </div>
      </div>

      <header className="mx-auto w-full max-w-6xl px-5 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">Northern Ireland</p>
        <h1 className="mt-2 text-3xl font-medium tracking-[-.05em] text-white sm:text-4xl">Pothole heatmap</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
          Live from DfI Roads&apos; open data: recorded carriageway/footway surface defects and public pothole
          enquiries across Northern Ireland. Priority is derived from DfI&apos;s own response-time targets, not an
          official DfI severity score. This reflects recorded/reported data only — not every pothole in Northern
          Ireland is necessarily represented.
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <HeatmapExplorer focus={focus} initialView={initialView} />
      </div>
    </div>
  );
}
