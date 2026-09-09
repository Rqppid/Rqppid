import Link from "next/link";
import { CATEGORY_STYLES } from "@/lib/constants";

const CATEGORY_ORDER = [1, 2, 3, 4, 5] as const;

const REFLECTIONS = [
  {
    title: "Structured output isn't uniform across providers",
    body: "Assumed a JSON schema would be enforced the same way everywhere. It isn't — some providers quietly downgrade constraints like enums and value limits into descriptive hints instead of hard guarantees. Worth verifying directly against the real API response, not the docs alone.",
  },
  {
    title: "Error shapes don't match intuition",
    body: "First guess was that an invalid API key would come back as a 401. It didn't — verifying against a live request beat guessing, and the fix was a one-line correction once the actual response was in hand.",
  },
  {
    title: "The upload has to shrink before it can travel",
    body: "Serverless functions cap request bodies well under what a phone camera produces by default, so the photo is resized in the browser before it ever leaves the device.",
  },
  {
    title: "Admitting \"I can't tell\" beats guessing",
    body: "For a safety-relevant tool, a false category is worse than an honest non-answer. Blurry or ambiguous photos get flagged as unassessable instead of forced into a risk bucket.",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-16 px-4 py-12 sm:py-20">
      {/* Hero */}
      <header className="flex flex-col items-center gap-5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
          Built in one week for Builders Night · Ormeau Labs, Belfast
        </span>

        <div className="flex items-center gap-3">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-3xl shadow-lg shadow-blue-600/25"
            aria-hidden="true"
          >
            🚧
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Pothole Triage Tool
          </h1>
        </div>

        <p className="max-w-lg text-balance text-lg text-zinc-600 dark:text-zinc-400">
          Photo in, risk category out. AI-assisted first-pass triage for road
          and footway defects — decision support for an inspector, never an
          automated repair decision.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/tool"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/30"
          >
            Try the live demo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <a
            href="https://github.com/Rqppid/Rqppid"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-zinc-300 px-5 py-3 font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            View source
          </a>
        </div>
      </header>

      {/* What happens today */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          What happens today
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          Road defect reports come in as photos with no consistent first pass
          on risk before an inspector looks at them. Northern Ireland&rsquo;s
          draft AI Strategy names exactly this workflow: detect defects or
          early damage, help prioritise repairs, help optimise resources.
          This tool is one narrow slice of that — a first-pass triage
          suggestion from a single photo, not a replacement for the
          inspector.
        </p>
      </section>

      {/* What I built — rubric + mock result */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          What I built
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          One photo, one Gemini vision call, one structured JSON result
          scored against a 5-category risk rubric modelled on how UK highway
          authorities triage defects. Every result is flagged for human
          review — the model can also say &ldquo;I can&rsquo;t assess this
          image&rdquo; rather than force a category onto a blurry or unclear
          photo.
        </p>

        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white/80 p-5 shadow-xl shadow-zinc-900/5 backdrop-blur-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="grid grid-cols-5 gap-2">
            {CATEGORY_ORDER.map((n) => {
              const style = CATEGORY_STYLES[n];
              return (
                <div
                  key={n}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center ${style.bg} ${style.border}`}
                >
                  <span className={`text-xs font-bold ${style.text}`}>{n}</span>
                  <span className={`text-[10px] font-medium leading-tight ${style.text}`}>
                    {style.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 rounded-xl border-2 border-orange-400 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-950/40">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold text-white">
                Category 2
              </span>
              <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                High
              </span>
            </div>
            <p className="text-sm text-orange-900/90 dark:text-orange-100/90">
              &ldquo;A clearly defined pothole with sharp edges spans the
              wheel path, likely to worsen without repair.&rdquo;
            </p>
            <p className="text-xs uppercase tracking-wide text-orange-700/70 dark:text-orange-300/70">
              Confidence: <span className="font-semibold">High</span>
            </p>
          </div>
        </div>
      </section>

      {/* Where it broke / what I learned */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Where it broke, what I learned
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {REFLECTIONS.map((r) => (
            <div
              key={r.title}
              className="flex flex-col gap-1.5 rounded-xl border border-zinc-200 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
            >
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {r.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-400 dark:text-zinc-600">
        <span>Next.js 16</span>
        <span aria-hidden="true">·</span>
        <span>Gemini API (vision + structured output)</span>
        <span aria-hidden="true">·</span>
        <span>Vercel</span>
        <span aria-hidden="true">·</span>
        <span>TypeScript</span>
      </section>

      <footer className="flex flex-col items-center gap-2 text-center text-xs text-zinc-400 dark:text-zinc-600">
        <p>
          A demo tool. Not connected to any real DfI or council system, and
          does not measure defects precisely — it estimates from a single
          photo.
        </p>
        <Link href="/tool" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          Try the live demo →
        </Link>
      </footer>
    </div>
  );
}
