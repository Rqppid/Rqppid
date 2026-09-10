"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { COUNCILS, DEFECT_TYPES, SEVERITY_TIERS } from "@/lib/heatmapTypes";
import type { HeatmapDataset, HeatmapPoint } from "@/lib/heatmapTypes";

const HeatmapMap = dynamic(() => import("@/components/HeatmapMap").then((m) => m.HeatmapMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">Loading map…</div>
  ),
});

type LoadState = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: HeatmapDataset };

const SEVERITY_SCORES = [5, 4, 3, 2, 1] as const;

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-lime-300 bg-lime-300 text-[#071014]"
          : "border-white/15 bg-white/5 text-zinc-300 hover:border-white/30 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export type MapFocus = { lat: number; lon: number; zoom: number };

export function HeatmapExplorer({
  focus = null,
  initialView = "heat",
}: {
  focus?: MapFocus | null;
  initialView?: "heat" | "points";
}) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const [showDefects, setShowDefects] = useState(true);
  const [showOtherDefects, setShowOtherDefects] = useState(false);
  const [showEnquiries, setShowEnquiries] = useState(false);
  const [severities, setSeverities] = useState<Set<number>>(new Set(SEVERITY_SCORES));
  const [defectTypes, setDefectTypes] = useState<Set<string>>(new Set(DEFECT_TYPES));
  const [council, setCouncil] = useState<string>("All");
  const [includeCompleted, setIncludeCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"heat" | "points">(initialView);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/heatmap-data", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Failed to load data.");
        return res.json() as Promise<HeatmapDataset>;
      })
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ status: "error", message: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleSeverity(score: number) {
    setSeverities((prev) => {
      const next = new Set(prev);
      if (next.has(score)) next.delete(score);
      else next.add(score);
      return next;
    });
  }

  function toggleDefectType(type: string) {
    setDefectTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  const filtered = useMemo(() => {
    if (state.status !== "ready") return [];
    return state.data.points.filter((p: HeatmapPoint) => {
      if (p.source === "DFI_SURFACE_DEFECT") {
        const isPothole = p.defectType === "Pothole";
        if (isPothole && !showDefects) return false;
        if (!isPothole && !showOtherDefects) return false;
      } else if (!showEnquiries) {
        return false;
      }
      if (!severities.has(p.severityScore)) return false;
      if (!defectTypes.has(p.defectType)) return false;
      if (council !== "All" && p.council !== council) return false;
      if (!includeCompleted && !p.outstanding) return false;
      return true;
    });
  }, [state, showDefects, showOtherDefects, showEnquiries, severities, defectTypes, council, includeCompleted]);

  const totalCounts =
    state.status === "ready"
      ? {
          defects: state.data.counts.defectsTotal,
          enquiries: state.data.counts.enquiriesTotal,
        }
      : null;

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 py-6 lg:flex-row lg:gap-5 lg:px-6">
      <aside className="flex w-full flex-col gap-5 rounded-2xl border border-white/10 bg-[#0d1918] p-5 lg:w-80 lg:shrink-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">Layers</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Toggle active={showDefects} onClick={() => setShowDefects((v) => !v)}>
              Confirmed potholes
            </Toggle>
            <Toggle active={showOtherDefects} onClick={() => setShowOtherDefects((v) => !v)}>
              Other surface defects
            </Toggle>
            <Toggle active={showEnquiries} onClick={() => setShowEnquiries((v) => !v)}>
              Public reports
            </Toggle>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">View</p>
          <div className="mt-2 flex gap-2">
            <Toggle active={viewMode === "heat"} onClick={() => setViewMode("heat")}>
              Heatmap
            </Toggle>
            <Toggle active={viewMode === "points"} onClick={() => setViewMode("points")}>
              Points (clustered)
            </Toggle>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">Priority</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {SEVERITY_SCORES.map((score) => {
              const tier = SEVERITY_TIERS[score];
              const active = severities.has(score);
              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => toggleSeverity(score)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition ${
                    active ? "border-white/20 bg-white/10 text-white" : "border-white/5 bg-transparent text-zinc-500"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: tier.color, opacity: active ? 1 : 0.4 }}
                  />
                  {tier.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">Defect type</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {DEFECT_TYPES.map((type) => (
              <Toggle key={type} active={defectTypes.has(type)} onClick={() => toggleDefectType(type)}>
                {type}
              </Toggle>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">Council area</p>
          <select
            value={council}
            onChange={(e) => setCouncil(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-lime-300 focus:outline-none"
          >
            <option value="All">All councils</option>
            {COUNCILS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={includeCompleted}
            onChange={(e) => setIncludeCompleted(e.target.checked)}
            className="h-3.5 w-3.5 accent-lime-300"
          />
          Include completed / repaired records
        </label>

        <div className="mt-auto border-t border-white/10 pt-3 text-xs text-zinc-500">
          {state.status === "ready" ? (
            <>
              <p>
                Showing <strong className="text-zinc-300">{filtered.length.toLocaleString()}</strong> of{" "}
                {(totalCounts!.defects + totalCounts!.enquiries).toLocaleString()} records
              </p>
              <p className="mt-1">Source: DfI Roads open data. Updated nightly by DfI; this view is cached for up to 1 hour.</p>
            </>
          ) : state.status === "loading" ? (
            "Loading defect data…"
          ) : (
            <span className="text-red-300">{state.message}</span>
          )}
        </div>
      </aside>

      <div className="relative min-h-[70vh] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1214] lg:min-h-0">
        {state.status === "loading" && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#0a1214]/80 text-sm text-zinc-400">
            Loading Northern Ireland defect data — this can take a few seconds on first load…
          </div>
        )}
        {state.status === "error" && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#0a1214]/90 px-6 text-center text-sm text-red-300">
            {state.message}
          </div>
        )}
        <HeatmapMap points={filtered} viewMode={viewMode} focus={focus} />

        <div className="pointer-events-none absolute bottom-4 left-4 z-[900] rounded-xl border border-white/10 bg-[#0d1918]/95 p-3 text-xs text-zinc-300 shadow-lg backdrop-blur">
          <p className="mb-1.5 font-semibold uppercase tracking-wide text-zinc-400">Priority legend</p>
          {SEVERITY_SCORES.map((score) => (
            <div key={score} className="flex items-center gap-2 py-0.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SEVERITY_TIERS[score].color }} />
              {SEVERITY_TIERS[score].label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
