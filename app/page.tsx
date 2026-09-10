import Link from "next/link";
import { CATEGORY_STYLES } from "@/lib/constants";
import { HeroMap } from "@/components/HeroMap";
import { Reveal } from "@/components/Reveal";
import { ScrollProgress } from "@/components/ScrollProgress";
import { TransitionLink } from "@/components/TransitionLink";

const PROCESS_STEPS = [
  {
    n: "01",
    title: "Upload a photo",
    body: "An inspector or member of the public photographs the defect on-site. Resized in the browser before it uploads.",
  },
  {
    n: "02",
    title: "AI suggests a category",
    body: "One Gemini vision call scores it against a 5-category risk rubric and explains its reasoning in one sentence.",
  },
  {
    n: "03",
    title: "A human reviews it",
    body: "Every result is flagged for review. Nothing gets repaired, scheduled, or dismissed without a person deciding.",
  },
];

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
    <main className="min-h-screen overflow-hidden bg-[#071014] text-[#f3f7f4] selection:bg-lime-300 selection:text-[#071014]">
      <ScrollProgress />
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_73%_44%,rgba(119,174,125,.16),transparent_24%),radial-gradient(circle_at_25%_100%,rgba(255,145,56,.12),transparent_30%)]">
        <nav className="relative z-20 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 lg:px-10">
          <Link href="/" className="text-xl font-semibold tracking-[-0.06em]">
            hot<span className="text-lime-300">pots</span>
            <sup className="ml-1 text-[9px] tracking-normal text-zinc-500">BETA</sup>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            <a href="#about" className="hover:text-white">
              About
            </a>
            <a href="#how" className="hover:text-white">
              How it works
            </a>
            <TransitionLink href="/heatmap" className="hover:text-white">
              Live map
            </TransitionLink>
            <TransitionLink href="/legal" className="hover:text-white">
              Legal &amp; compensation
            </TransitionLink>
          </div>
          <TransitionLink
            href="/tool"
            className="rounded-full bg-lime-300 px-4 py-2 text-sm font-semibold text-[#071014] transition hover:bg-lime-200"
          >
            Report a pothole <span aria-hidden="true">↗</span>
          </TransitionLink>
        </nav>

        <section className="relative z-10 mx-auto grid max-w-[1440px] gap-12 px-6 pb-12 pt-12 lg:grid-cols-[.83fr_1.17fr] lg:px-10 lg:pb-20 lg:pt-24">
          <div className="flex flex-col justify-center">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-lime-300">
              Belfast road intelligence
            </p>
            <h1 className="max-w-xl text-5xl font-medium leading-[.94] tracking-[-0.075em] sm:text-7xl">
              See where the road needs us <span className="text-zinc-500">most.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-zinc-400">
              HotPots turns a single photo into a suggested risk category — a
              first-pass triage aid for road and footway defects, never an
              automated repair decision.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <TransitionLink
                href="/tool"
                className="rounded-full bg-lime-300 px-5 py-3 font-semibold text-[#071014] transition hover:bg-lime-200"
              >
                Report an issue <span aria-hidden="true">→</span>
              </TransitionLink>
              <a
                href="#how"
                className="rounded-full border border-white/15 px-5 py-3 font-semibold text-zinc-200 transition hover:border-white/40"
              >
                See how it works
              </a>
            </div>
            <p className="mt-9 max-w-md text-xs leading-5 text-zinc-600">
              The map shows real outstanding defects recorded by DfI Roads.
              Built in one week for Builders Night, Ormeau Labs, Belfast.
            </p>
          </div>

          <HeroMap />
        </section>
      </div>

      {/* What happens today */}
      <section id="about" className="scroll-anchor border-t border-white/10 bg-[#0a1214] px-6 py-16 lg:px-10">
        <Reveal className="mx-auto flex max-w-[1000px] flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[.2em] text-lime-300">
            What happens today
          </h2>
          <p className="text-lg leading-7 text-zinc-300">
            Road defect reports come in as photos with no consistent first pass
            on risk before an inspector looks at them. Northern Ireland&rsquo;s
            draft AI Strategy names exactly this workflow: detect defects or
            early damage, help prioritise repairs, help optimise resources.
            HotPots is one narrow slice of that — a first-pass triage
            suggestion from a single photo, not a replacement for the
            inspector.
          </p>
        </Reveal>
      </section>

      {/* What I built */}
      <section id="how" className="scroll-anchor border-t border-white/10 px-6 py-16 lg:px-10">
        <Reveal className="mx-auto flex max-w-[1000px] flex-col gap-8">
          <div className="flex flex-col gap-5">
            <h2 className="text-xs font-semibold uppercase tracking-[.2em] text-lime-300">
              What I built
            </h2>
            <p className="text-lg leading-7 text-zinc-300">
              One photo, one Gemini vision call, one structured JSON result
              scored against a 5-category risk rubric modelled on how UK highway
              authorities triage defects. Every result is flagged for human
              review — the model can also say &ldquo;I can&rsquo;t assess this
              image&rdquo; rather than force a category onto a blurry or unclear
              photo.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {PROCESS_STEPS.map((step) => (
              <div key={step.n} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[.03] p-5">
                <span className="text-xs font-semibold text-zinc-600">{step.n}</span>
                <h3 className="font-medium text-white">{step.title}</h3>
                <p className="text-sm leading-6 text-zinc-400">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0d1918] p-5 shadow-2xl shadow-black/20 sm:p-7">
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

            <div className="flex flex-col gap-2 rounded-xl border-2 border-orange-500/40 bg-orange-500/10 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold text-[#071014]">
                  Category 2
                </span>
                <span className="text-sm font-semibold text-orange-300">High</span>
              </div>
              <p className="text-sm text-orange-100/80">
                &ldquo;A clearly defined pothole with sharp edges spans the
                wheel path, likely to worsen without repair.&rdquo;
              </p>
              <p className="text-xs uppercase tracking-wide text-orange-300/60">
                Confidence: <span className="font-semibold">High</span>
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Where it broke / what I learned */}
      <section className="border-t border-white/10 bg-[#0a1214] px-6 py-16 lg:px-10">
        <Reveal className="mx-auto flex max-w-[1000px] flex-col gap-5">
          <h2 className="text-xs font-semibold uppercase tracking-[.2em] text-lime-300">
            Where it broke, what I learned
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {REFLECTIONS.map((r) => (
              <div
                key={r.title}
                className="flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[.03] p-4"
              >
                <h3 className="text-sm font-semibold text-zinc-100">{r.title}</h3>
                <p className="text-sm text-zinc-400">{r.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Tech stack + footer */}
      <section className="border-t border-white/10 px-6 py-10 lg:px-10">
        <Reveal className="mx-auto flex max-w-[1000px] flex-col items-center gap-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-600">
            <span>Next.js 16</span>
            <span aria-hidden="true">·</span>
            <span>Gemini API (vision + structured output)</span>
            <span aria-hidden="true">·</span>
            <span>Vercel</span>
            <span aria-hidden="true">·</span>
            <span>TypeScript</span>
          </div>
          <p className="max-w-md text-xs leading-5 text-zinc-600">
            A demo tool. Not connected to any real DfI or council system, and
            does not measure defects precisely — it estimates from a single
            photo.
          </p>
          <TransitionLink href="/tool" className="text-sm font-semibold text-lime-300 hover:underline">
            Try the live demo →
          </TransitionLink>
        </Reveal>
      </section>
    </main>
  );
}
