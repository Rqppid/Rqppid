import { HeatmapExplorer } from "@/components/HeatmapExplorer";
import { TransitionLink } from "@/components/TransitionLink";

export default function HeatmapPage() {
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
        <HeatmapExplorer />
      </div>
    </div>
  );
}
