# The AI Funding Brief

A VC-grade interactive research report of Series A & Series B AI financings
announced in the trailing 60 days. Built with Next.js, Tailwind, and Recharts.
Dataset auto-refreshes daily via GitHub Actions.

## Quick start

```bash
cd ai-funding-tracker
npm install
npm run dev
```

Open http://localhost:3000.

## What's inside

```
ai-funding-tracker/
├── app/                     Next.js App Router (server components)
│   ├── page.tsx             The report (editorial sections, charts, deal log)
│   └── layout.tsx
├── components/              UI building blocks
│   ├── Masthead.tsx
│   ├── Section.tsx
│   ├── Charts.tsx           Recharts client component
│   ├── DealTable.tsx        Searchable / sortable table
│   ├── LeagueTable.tsx      Most-active-investor league table
│   └── Methodology.tsx
├── lib/
│   ├── types.ts             Deal / Dataset types
│   ├── aggregate.ts         Pure analytics helpers
│   └── data.ts              Reads data/deals.json at build/render time
├── data/
│   ├── deals.json           Canonical curated dataset (rendered on the page)
│   └── candidates.json      Raw RSS candidates from the last refresh
├── scripts/
│   └── fetch-deals.mjs      Daily ingestion pipeline (no npm deps)
└── .github/workflows/
    └── refresh-deals.yml    GitHub Actions cron: daily at 13:00 UTC
```

## Data pipeline

`scripts/fetch-deals.mjs` runs daily on GitHub Actions and:

1. Pulls RSS from TechCrunch (AI + Venture), VentureBeat, Sifted, The Verge.
2. Filters to items matching `Series A|B` + AI keywords inside the 60-day window.
3. Writes raw matches to `data/candidates.json`.
4. **If `ANTHROPIC_API_KEY` is set** (repo secret), asks Claude to structure each
   candidate into the full `Deal` schema and merges results into
   `data/deals.json` by `company_name`. Hand-curated entries are preserved.

Set the secret under **Settings → Secrets and variables → Actions** to
`ANTHROPIC_API_KEY`. Without it, the pipeline still runs — it just populates
`candidates.json` for manual curation rather than writing to `deals.json`.

## Extending

- **Add a source:** append to `FEEDS` in `scripts/fetch-deals.mjs`.
- **Add a sector:** update `Sector` in `lib/types.ts` and `inferSector()` in the
  fetch script.
- **Add a chart:** drop a client component into `components/Charts.tsx` and
  wire it into `app/page.tsx`.
- **Change the window:** edit `WINDOW_DAYS` in `scripts/fetch-deals.mjs`.

## Deploy

Any Next.js-compatible host. Vercel is fastest:

```bash
npx vercel --cwd ai-funding-tracker
```

The GitHub Actions cron commits updates back to the repo; Vercel's git
integration will redeploy automatically on each commit.

## Data integrity

Public disclosures only. Valuations are left blank unless explicitly announced
— no estimation. Exhaustive global coverage of Series A/B requires a paid data
provider (Crunchbase, PitchBook); this dataset is best-effort from
English-language tier-one press.
