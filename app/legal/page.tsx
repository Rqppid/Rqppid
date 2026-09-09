import { Reveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";

const STATS = [
  { value: "£32.7M", label: "Total cost of NI road-defect claims, Apr 2020 – Mar 2025 (compensation + legal/medical costs)" },
  { value: "£20.6M", label: "Compensation paid across ~20,000 claims over that period" },
  { value: "£5.1M", label: "Settled in 2024/25 alone — more than double the £2M paid five years earlier" },
  { value: "76%", label: "Of 2024/25 compensation (£3.9M) went to personal injury claims, though they were only 14% of claim volume" },
  { value: "91%", label: "Of NI drivers report pothole issues in their area (CompareNI survey)" },
  { value: "96%", label: "Say repairs aren't happening fast enough (CompareNI survey)" },
];

const FAQS = [
  {
    q: "Can I actually get compensation if a pothole damages my car?",
    a: "There's no automatic entitlement — each claim is investigated individually, and you have to show the Department for Infrastructure (DfI) was at fault. In practice that means proving both that the specific defect caused your damage, and that DfI knew, or reasonably should have known, about it and hadn't fixed it in reasonable time. Nearly 20,000 people succeeded between April 2020 and March 2025, so it's a real, working process — not a formality, but not a long shot either.",
  },
  {
    q: "What do I need to prove it?",
    a: "Clear, dated photos of the defect and the damage, the exact road name/location, and a repair estimate or invoice. For claims under £350 you need 2 quotes or a receipt; over £350, you need 3 quotes or a receipt.",
  },
  {
    q: "What's the actual process?",
    a: "Two separate steps. First, report the defect itself through nidirect's road-problem reporting service — this gets you a reference number (starts with \"W\"). Then, separately, file a compensation claim (vehicle damage, property damage, and personal injury each have their own claim form/service) either online or via a downloadable form.",
  },
  {
    q: "How long does a decision take?",
    a: "DfI's own published average is about 4 months for vehicle damage claims, and about 6 months for property damage or personal injury claims. Volume of claims can push this out further.",
  },
  {
    q: "Is there a deadline to claim?",
    a: "DfI's own claim guidance doesn't state one. Don't rely on that — report and claim as soon as possible, and check directly with the DfI Roads Claims Unit for current guidance on your specific case.",
  },
  {
    q: "Does HotPots file the claim for me?",
    a: "No. HotPots suggests a priority category from a photo and flags it for human review — it doesn't submit anything to DfI, generate legal documents, or constitute evidence on its own. If you're pursuing a real claim, use DfI's official process (linked below) and get advice from a solicitor for anything beyond a straightforward vehicle-damage claim.",
  },
];

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#071014] text-white">
      <div className="border-b border-white/10 bg-[#071014]/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <TransitionLink className="text-sm font-semibold text-zinc-300 transition hover:text-lime-300" href="/">
            ← Back to HotPots
          </TransitionLink>
          <span className="text-sm font-semibold tracking-[-.05em]">
            hot<span className="text-lime-300">pots</span>
          </span>
        </div>
      </div>

      <main className="mx-auto flex max-w-4xl flex-col gap-16 px-5 py-14">
        <Reveal className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">Northern Ireland</p>
          <h1 className="text-4xl font-medium tracking-[-.05em] sm:text-5xl">Legal &amp; compensation</h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-400">
            What the law actually says about pothole damage in Northern Ireland, what it costs, and how to make a
            real claim. General information only — not legal advice.
          </p>
        </Reveal>

        <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[.03] p-4">
              <span className="text-2xl font-medium tracking-[-.03em] text-lime-300">{s.value}</span>
              <span className="text-xs leading-5 text-zinc-500">{s.label}</span>
            </div>
          ))}
        </Reveal>

        <Reveal className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-[.2em] text-lime-300">
            How a compensation claim actually works
          </h2>
          <p className="text-base leading-7 text-zinc-300">
            Road maintenance in Northern Ireland is centralised under DfI Roads, governed by{" "}
            <a
              href="https://www.legislation.gov.uk/nisi/1993/3160/article/8/made"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-300 hover:underline"
            >
              Article 8 of The Roads (Northern Ireland) Order 1993
            </a>
            . Article 8(1) puts DfI under a duty to maintain public roads. Article 8(2)(a) gives DfI a defence if it
            can show it took &ldquo;such care as in all the circumstances was reasonably required&rdquo; to keep
            that part of the road safe. Article 8(3) tells a court what to weigh in deciding that — including,
            verbatim, <span className="text-zinc-100">&ldquo;whether the Department knew, or could reasonably have
            been expected to know, that the condition of the part of the road... was likely to cause danger to
            users.&rdquo;</span>
          </p>
          <p className="text-base leading-7 text-zinc-300">
            In plain terms: a claim usually turns on two things. That the specific defect caused your damage, and
            that DfI knew — or reasonably should have known — about it and hadn&rsquo;t fixed it in reasonable time.
            An undocumented pothole with no prior report makes the second part harder to prove. A timestamped,
            public record of the same defect makes it easier.
          </p>
        </Reveal>

        <Reveal className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-[.2em] text-lime-300">How HotPots fits in</h2>
          <p className="text-base leading-7 text-zinc-300">
            HotPots documents a defect clearly, with a suggested priority category and a timestamp — useful context
            if you go on to make a real claim. It is <span className="text-zinc-100">not</span> a legal document,
            not evidence on its own, and does not submit anything to DfI on your behalf. Every result is flagged for
            human review; treat it as a starting point, not proof.
          </p>
        </Reveal>

        <Reveal className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-[.2em] text-lime-300">Frequently asked</h2>
          <div className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[.03]">
            {FAQS.map((f) => (
              <details key={f.q} className="group p-5 open:bg-white/[.02]">
                <summary className="cursor-pointer list-none font-medium text-white marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {f.q}
                    <span className="shrink-0 text-zinc-500 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>

        <Reveal className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-[.2em] text-lime-300">Official links</h2>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <a
              href="https://www.nidirect.gov.uk/information-and-services/travel-transport-and-roads/problems-roads-and-streets"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-lime-300 hover:border-white/25"
            >
              Report a road/street problem →
            </a>
            <a
              href="https://www.nidirect.gov.uk/articles/claim-compensation-due-road-or-street-problem"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-lime-300 hover:border-white/25"
            >
              How to claim compensation →
            </a>
            <a
              href="https://www.nidirect.gov.uk/services/claim-compensation-vehicle-damage-due-roadstreet-problem"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-lime-300 hover:border-white/25"
            >
              Claim: vehicle damage →
            </a>
            <a
              href="https://www.nidirect.gov.uk/services/contact-dfi-roads-claims-unit-about-your-compensation-claim"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-lime-300 hover:border-white/25"
            >
              Contact DfI Roads Claims Unit →
            </a>
          </div>
        </Reveal>

        <Reveal className="flex flex-col gap-3 border-t border-white/10 pt-8 text-xs leading-5 text-zinc-600">
          <p>
            This page is general information for Northern Ireland, current as of September 2026, and is{" "}
            <span className="text-zinc-400">not legal advice</span>. Compensation is never guaranteed and every
            claim is assessed individually. For anything beyond a straightforward vehicle-damage claim, get advice
            from a solicitor.
          </p>
          <p>
            Sources: The Roads (Northern Ireland) Order 1993 (legislation.gov.uk) · nidirect.gov.uk claims guidance
            · CompareNI · NI local press reporting on DfI compensation data (2020–2025) · DfI/Infrastructure NI
            published compensation figures.
          </p>
        </Reveal>
      </main>
    </div>
  );
}
