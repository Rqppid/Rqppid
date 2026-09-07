# Pothole Triage Tool

A single-page demo tool for a UK highway authority: upload a photo of a road or
footway defect, and get back a suggested 1-5 risk category, a one-line
justification, and a confidence note, modelled on how a highway authority
categorises defects.

**This is decision support for an inspector, not an autonomous repair
decision.** Every result is flagged for human review and must be verified on
site before any action is taken.

## Scope

- One page, one photo at a time.
- No map, no live camera capture, no database, no auth, no saved history —
  refreshing the page clears all state.
- No integration with any real government system or real personal data.

## Getting started

```bash
npm install
cp .env.example .env.local
# edit .env.local and set ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run `npm run build` before a demo to catch type errors that dev mode
tolerates.

### Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | yes | — | Anthropic API key used by the server-side triage route. |
| `ANTHROPIC_MODEL` | no | `claude-opus-5` | Override the model used for triage. |

## How it works

1. The user uploads or drags in a photo. It's resized/compressed in the
   browser before upload (Vercel serverless functions cap request bodies at
   4.5MB, and phone photos routinely exceed that).
2. `POST /api/triage` sends the image (plus optional free-text location/notes)
   to the Claude API as a vision input, with the risk rubric embedded in the
   system prompt (`lib/rubric.ts`).
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

Set `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`) as a Project
Environment Variable in Vercel for Production and Preview, then deploy.
Before a live demo, re-run the "clear photo" and "oversized photo" tests
against the deployed URL specifically — local `next dev` does not enforce
Vercel's real request body-size limit.

## Non-goals

Not wired to any real DfI/government system or reporting pipeline; does not
claim to measure defects precisely (it estimates); no accounts, storage, or
defect history log; no live Open Data NI integration.
