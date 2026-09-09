"use client";

import { useState } from "react";
import { CATEGORY_STYLES } from "@/lib/constants";
import type { TriageResult } from "@/lib/schema";

const CLAIM_LINKS = [
  {
    label: "1. Report this defect to DfI first (get a reference number)",
    href: "https://www.nidirect.gov.uk/information-and-services/travel-transport-and-roads/problems-roads-and-streets",
  },
  {
    label: "2. File a vehicle damage compensation claim",
    href: "https://www.nidirect.gov.uk/services/claim-compensation-vehicle-damage-due-roadstreet-problem",
  },
];

function formatPreparedAt(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClaimPack({
  previewUrl,
  result,
  contextText,
}: {
  previewUrl: string;
  result: TriageResult;
  contextText: string;
}) {
  const [preparedAt] = useState(() => new Date());
  const style = result.category ? CATEGORY_STYLES[result.category] : null;

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-[#0d1918] p-5 shadow-2xl shadow-black/20 sm:p-7 print:rounded-none print:border-none print:bg-white print:p-0 print:text-black print:shadow-none">
      <div className="flex flex-col gap-1 border-b border-white/10 pb-4 print:border-black/20">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-lime-300 print:text-black">
          HotPots evidence summary
        </p>
        <p className="text-sm text-zinc-400 print:text-black/70">
          Prepared {formatPreparedAt(preparedAt)}. This is a summary to help you make a claim — it is{" "}
          <strong className="text-zinc-200 print:text-black">not evidence on its own</strong> and does not replace
          DfI&rsquo;s official process.
        </p>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt="Photographed defect"
        className="max-h-96 w-full rounded-2xl border border-white/10 object-contain print:max-h-72 print:rounded-none print:border-black/20"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 print:text-black/60">
            AI-suggested priority (for human review)
          </span>
          {result.can_assess && style ? (
            <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${style.badge}`}>
              Category {result.category} — {style.label}
            </span>
          ) : (
            <span className="text-sm text-zinc-300 print:text-black">Unable to assess automatically</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 print:text-black/60">
            Confidence
          </span>
          <span className="text-sm text-zinc-300 print:text-black">{result.confidence}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 print:text-black/60">
          AI reasoning
        </span>
        <p className="text-sm leading-6 text-zinc-300 print:text-black">{result.reasoning}</p>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 print:text-black/60">
          Location / notes provided
        </span>
        <p className="text-sm leading-6 text-zinc-300 print:text-black">
          {contextText.trim() || "Not provided — add the exact road name and nearest landmark before you claim."}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4 print:border-black/20 print:bg-transparent print:p-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 print:text-black/60">
          Before you submit a claim, you still need
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300 print:text-black">
          <li>A repair estimate or invoice — 2 quotes if under £350, 3 quotes if over £350</li>
          <li>To confirm the exact road name/location above is accurate</li>
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 print:text-black/60">
          Where to submit
        </p>
        {CLAIM_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-lime-300 hover:underline print:text-black print:underline"
          >
            {link.label} →
          </a>
        ))}
      </div>

      <p className="text-xs leading-5 text-zinc-600 print:text-black/60">
        This summary is AI-generated and has not been independently verified. HotPots does not submit claims on
        your behalf. See{" "}
        <a href="/legal" className="underline print:text-black">
          Legal &amp; compensation
        </a>{" "}
        for how NI pothole compensation claims work.
      </p>

      <button
        type="button"
        onClick={() => window.print()}
        className="print:hidden flex items-center justify-center gap-2 self-start rounded-xl border border-lime-300/40 bg-lime-300/10 px-4 py-2.5 text-sm font-semibold text-lime-300 transition hover:bg-lime-300/20"
      >
        Print / save as PDF
      </button>
    </div>
  );
}
