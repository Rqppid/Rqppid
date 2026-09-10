"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { TransitionLink } from "@/components/TransitionLink";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

type HeroPin = {
  id: string;
  x: number;
  y: number;
  label: string;
  severityLabel: string;
  severityScore: number;
  recordedDate: string | null;
  daysSince: number | null;
};

type HeroData = { points: HeroPin[]; total: number; generatedAt: string };

const TILT = 40; // degrees, chosen so the plane reads as 3D without wrecking label legibility
const PARALLAX = 6; // max degrees the scene leans toward the cursor

function pinColor(score: number): string {
  if (score >= 5) return "#ef4444";
  if (score === 4) return "#f97316";
  if (score === 3) return "#facc15";
  return "#a1a1aa";
}

export function HeroMap() {
  const [data, setData] = useState<HeroData | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [lean, setLean] = useState({ x: 0, y: 0 });
  const frameRef = useRef<HTMLDivElement | null>(null);

  // Server snapshot is false so the prerendered HTML assumes motion is fine;
  // React swaps in the real value right after hydration.
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/hero-points")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((body: HeroData) => {
        if (!cancelled && Array.isArray(body.points)) setData(body);
      })
      .catch(() => {
        /* leave the frame in its decorative state, never fake real pins */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setLean({ x: -py * PARALLAX, y: px * PARALLAX });
  }

  const tilt = reducedMotion ? 0 : TILT;

  return (
    <div
      id="map"
      ref={frameRef}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        setLean({ x: 0, y: 0 });
        setHovered(null);
      }}
      className="relative min-h-[510px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1918] shadow-2xl shadow-black/30 lg:min-h-[650px]"
      style={{ perspective: "1200px" }}
    >
      <div className="absolute left-5 right-5 top-5 z-30 flex items-center justify-between">
        <div className="rounded-full border border-white/10 bg-[#0c1515]/80 px-3 py-2 text-xs text-zinc-300 backdrop-blur">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-lime-300" />
          {data
            ? `${data.total.toLocaleString()} live defects · Belfast`
            : "Loading live DfI data…"}
        </div>
        <TransitionLink
          href="/heatmap"
          className="rounded-full border border-lime-300/40 bg-lime-300/10 px-3 py-2 text-xs font-semibold text-lime-300 backdrop-blur transition hover:bg-lime-300/20"
        >
          See all NI data ↗
        </TransitionLink>
      </div>

      {/* The tilted ground plane */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt + lean.x}deg) rotateZ(${lean.y}deg) scale(1.08)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(30deg,transparent 47%,rgba(202,220,199,.11) 48%,rgba(202,220,199,.11) 49%,transparent 50%),linear-gradient(-18deg,transparent 48%,rgba(202,220,199,.1) 49%,rgba(202,220,199,.1) 50%,transparent 51%),linear-gradient(90deg,transparent 49%,rgba(202,220,199,.07) 50%,transparent 51%)",
            backgroundSize: "110px 80px, 150px 110px, 96px 96px",
          }}
        />
        <div className="absolute left-[12%] top-[43%] h-[2px] w-[80%] rotate-[-10deg] bg-[#b5c5a4]/35 shadow-[0_0_12px_2px_rgba(205,227,190,.1)]" />
        <div className="absolute left-[39%] top-[-7%] h-[115%] w-[2px] rotate-[23deg] bg-[#b5c5a4]/25" />
        <div className="absolute left-[64%] top-[18%] h-[2px] w-[48%] rotate-[57deg] bg-[#b5c5a4]/25" />

        {data?.points.map((pin) => {
          const active = hovered === pin.id;
          const color = pinColor(pin.severityScore);
          return (
            <div
              key={pin.id}
              className="absolute"
              style={{ left: `${pin.x}%`, top: `${pin.y}%`, transformStyle: "preserve-3d" }}
              onMouseEnter={() => setHovered(pin.id)}
            >
              {/* Shadow cast on the ground plane */}
              <span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 blur-[3px] transition-all duration-300 motion-reduce:transition-none"
                style={{
                  width: active ? 22 : 14,
                  height: active ? 9 : 6,
                  opacity: active ? 0.75 : 0.45,
                }}
              />
              {/* The pin itself, standing upright off the tilted plane */}
              <span
                className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center transition-transform duration-300 ease-out motion-reduce:transition-none"
                style={{
                  transform: `rotateX(${-(tilt + lean.x)}deg) rotateZ(${-lean.y}deg) translateY(${
                    active ? -22 : -10
                  }px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <span
                  className="grid place-items-center rounded-full transition-all duration-300 motion-reduce:transition-none"
                  style={{
                    width: active ? 34 : 26,
                    height: active ? 34 : 26,
                    backgroundColor: `${color}26`,
                    boxShadow: active ? `0 0 0 1px ${color}80` : "none",
                  }}
                >
                  <span
                    className="rounded-full transition-all duration-300 motion-reduce:transition-none"
                    style={{
                      width: active ? 13 : 10,
                      height: active ? 13 : 10,
                      backgroundColor: color,
                      boxShadow: `0 0 ${active ? 26 : 16}px ${active ? 7 : 4}px ${color}73`,
                    }}
                  />
                </span>

                {active && (
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-white/10 bg-[#111e1d]/95 px-3 py-2 text-left shadow-xl backdrop-blur">
                    <span className="block text-xs font-semibold text-white">{pin.label}</span>
                    <span className="mt-0.5 block text-[11px]" style={{ color }}>
                      {pin.severityLabel}
                      {pin.daysSince !== null && (
                        <span className="text-zinc-500">
                          {" · "}
                          {pin.daysSince === 0
                            ? "recorded today"
                            : pin.daysSince === 1
                              ? "1 day ago"
                              : `${pin.daysSince} days ago`}
                        </span>
                      )}
                    </span>
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <aside className="absolute bottom-5 left-5 right-5 z-30 rounded-2xl border border-white/10 bg-[#111e1d]/95 p-4 shadow-xl backdrop-blur sm:left-auto sm:w-[330px]">
        {data && data.points.length > 0 ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-lime-300">Highest priority nearby</p>
                <h2 className="mt-1 text-lg font-medium leading-tight tracking-tight">
                  {data.points[0].label}
                </h2>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold"
                style={{
                  backgroundColor: `${pinColor(data.points[0].severityScore)}26`,
                  color: pinColor(data.points[0].severityScore),
                }}
              >
                {data.points[0].severityLabel.toUpperCase()}
              </span>
            </div>
            <p className="mt-3 text-sm leading-5 text-zinc-400">
              Real outstanding defects recorded by DfI Roads, positioned by their actual
              coordinates. The street backdrop is stylised.
            </p>
          </>
        ) : (
          <p className="text-sm leading-5 text-zinc-400">
            Loading outstanding road defects recorded by DfI Roads in Belfast.
          </p>
        )}
      </aside>
    </div>
  );
}
