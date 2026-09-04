# Personal Project Hub

A scalable personal website for documenting projects, activities, and ideas.

## Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Supabase (optional unique visitor counter)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding a project

1. Open `data/projects.ts`
2. Add a new object to the `projects` array
3. Fill in at least `slug`, `title`, `description`, and `category`
4. Optional detail fields (`overview`, `goals`, `timeline`, etc.) appear automatically on `/projects/[slug]`

Set `featured: true` to show a project on the homepage.

## Customizing site info

Edit `data/site.ts` for your name, about copy, email, and social links.

## Visitor counter (Supabase)

The footer shows a unique-visit count next to the copyright, e.g.
`© 2026 Name · 1,284 visits`.

- **With Supabase configured:** uses the cloud tables (best for production).
- **Without Supabase:** uses a local file at `.data/visits.json` so the number still appears while developing.
- If both fail, the count is hidden and the rest of the site still works.

### Tables to create (Supabase)

Run the SQL in [`supabase/visitor-counter.sql`](supabase/visitor-counter.sql) in the Supabase SQL Editor.

It creates:

| Object | Purpose |
|--------|---------|
| `visitors` | Stores anonymous browser UUIDs (no name, email, IP, or location) |
| `site_stats` | Single row with `total_visits` |
| `register_visit(p_visitor_id)` | RPC that increments only for new visitor IDs |

### Environment variables

Create a `.env.local` file in the project root (see `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Where to find them:

1. Open your [Supabase project](https://supabase.com/dashboard)
2. Go to **Project Settings → API**
3. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Restart `npm run dev` after adding the variables.

### How it works

1. The browser stores a random UUID in `localStorage` (`site_visitor_id`)
2. `VisitorCount` (in the footer) POSTs that ID to `/api/visits` once per page load
3. The API registers the visit (Supabase or local fallback); the count only increases for a new UUID
4. Navigating between pages does not create extra visits for the same browser

### Files added or modified

| File | Role |
|------|------|
| `supabase/visitor-counter.sql` | SQL to create tables + RPC |
| `lib/supabase.ts` | Supabase client helper |
| `lib/visits.ts` | Local `.data/visits.json` fallback store |
| `app/api/visits/route.ts` | API route to register/fetch visits |
| `components/VisitorCount.tsx` | Footer counter UI |
| `components/Footer.tsx` | Renders count next to copyright |
| `.env.example` | Env var template |
| `README.md` | This documentation |
