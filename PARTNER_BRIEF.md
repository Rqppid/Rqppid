# HotPots — Project Brief

## The problem
UK highway authorities triage road/footway defect reports manually. Slow, inconsistent, backlog-prone.

## The idea
Upload a photo of a defect → AI suggests a 1–5 risk category (Emergency to No action) with one-line reasoning + confidence. **Decision support for a human inspector, not an automated decision** — every result is flagged for human review. This framing is also our liability answer.

## Why now
Built for **Builders Night** (Belfast) — a one-week AI challenge tied to Northern Ireland's draft AI Strategy.

## What's built (live)
- Working tool at `/tool`: photo upload → AI triage → color-coded result card (red=Emergency → grey=No action), always with the human-review disclaimer.
- Landing page telling the story for judging: problem, what we built, where it broke / what we learned, tech stack.
- **Demo mode**: if no API key is configured, the app still runs end-to-end with clearly-labeled simulated results (🧪 badge) — so a live demo never dies to wifi or a missing key.
- Deployed and live on Vercel: `https://pothole-triage-tool-neon.vercel.app`. GitHub is source of truth (`Rqppid/Rqppid`, branch `claude/pothole-triage-mvp-kl2ps2`).

## Tech
Next.js (App Router) + TypeScript + Tailwind, Google Gemini API (vision + structured JSON output) for triage, Zod for schema validation. Client-side image compression before upload.

## Scope (MVP — deliberately narrow)
One photo at a time. No batch, no real map/database (landing page map is an illustrative mock-up, labeled as such), no auth, no history, no integration with any real government system.

## Brand
Name: **HotPots**. Dark theme, lime-green accent. Risk-category colors intentionally kept distinct from the brand accent so a badge never reads as a clickable button.

## Status / what's next
- Core product + fallback demo mode: done, tested, live.
- Waiting on a valid Gemini API key for real (non-simulated) live analysis — demo mode covers presentation risk in the meantime.
- Open for discussion: real map/live data integration, batch upload, auth/history — all explicitly out of MVP scope, candidates for post-event roadmap.
