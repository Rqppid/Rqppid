# HotPots

A demo tool for a UK highway authority: upload a photo of a road or
footway defect, and get back a suggested 1-5 risk category, a one-line
justification, and a confidence note, modelled on how a highway authority
categorises defects. The landing page's map/hotspot view is an illustrative
mock-up, not live data — see Scope below.

**This is decision support for an inspector, not an autonomous repair
decision.** Every result is flagged for human review and must be verified on
site before any action is taken.

## Scope

- The working tool (`/tool`) handles one photo at a time.
- The landing page's "live map" is a static, illustrative mock-up — no real
  map library, no database, no live report feed behind it.
- No live camera capture, no auth, no saved history — refreshing `/tool`
  clears all state.
- No integration with any real government system or real personal data.

## Getting started

```bash
npm install
cp .env.example .env.local
# edit .env.local and set GEMINI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run `npm run build` before a demo to catch type errors that dev mode
tolerates.

### Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `GEMINI_API_KEY` | yes | — | Gemini API key (from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)) used by the server-side triage route. |
| `GEMINI_MODEL` | no | `gemini-3.5-flash` | Override the model used for triage. |

## How it works

1. The user uploads or drags in a photo. It's resized/compressed in the
   browser before upload (Vercel serverless functions cap request bodies at
   4.5MB, and phone photos routinely exceed that).
2. `POST /api/triage` sends the image (plus optional free-text location/notes)
   to the Gemini API as a vision input, with the risk rubric embedded in the
   system instruction (`lib/rubric.ts`).
3. The model returns structured JSON (`lib/schema.ts`): category, label,
   one-line reasoning, confidence, and `flag_for_human_review: true`. If the
   photo can't be usefully triaged (blurry, dark, not a road, etc.), the model
   returns `can_assess: false` instead of forcing a category.
4. The page renders a color-coded result card. Nothing is persisted.

## Manual test checklist

- Clear defect photo, with and without location notes → plausible category,
  one-sentence reasoning, confidence, disclaimer visible.
- Minor surface wear / hairline crack → category 4 or 5.
- Blurry, dark, or non-road photo → "Unable to assess" card, not a forced
  category.
- Oversized phone photo (8-12MB) → still succeeds after client-side resize.
- Wrong file type (e.g. a PDF) → rejected before any network call.
- Missing/invalid API key → clean error banner, no leaked stack trace.
- Network failure → error banner with a retry button, no infinite spinner.
- Refresh after a result → page returns to a blank state.

## Deploying to Vercel

Set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) as a Project
Environment Variable in Vercel for Production and Preview, then deploy.
Before a live demo, re-run the "clear photo" and "oversized photo" tests
against the deployed URL specifically — local `next dev` does not enforce
Vercel's real request body-size limit.

## Non-goals

Not wired to any real DfI/government system or reporting pipeline; does not
claim to measure defects precisely (it estimates); no accounts, storage, or
defect history log; no live Open Data NI integration.
