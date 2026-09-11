# Personal Project Hub

A scalable personal website for documenting projects, activities, and ideas.

**Live site (GitHub Pages):**  
[https://ivanlin0402.github.io/personal-website/](https://ivanlin0402.github.io/personal-website/)

> This site is built as **static files** and hosted on **GitHub Pages** — no Vercel required.  
> `http://localhost:3000` only works on your own computer while `npm run dev` is running.

## Stack

- Next.js (App Router, static export)
- React
- TypeScript
- Tailwind CSS
- GitHub Pages (hosting)
- Supabase (optional unique visitor counter)

## Run locally (your computer only)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on this machine.

## Share with others (GitHub Pages only)

The site is built as static files and published to a `gh-pages` branch by GitHub Actions.

### Fix the 404 (one-time setup)

The 404 means Pages is not publishing yet. Do this:

1. Open **[Settings → Pages](https://github.com/ivanlin0402/personal-website/settings/pages)**
2. Under **Build and deployment → Source**, choose **Deploy from a branch**
3. Branch: **`gh-pages`** / folder: **`/ (root)`** → click **Save**
4. Open the **[Actions](https://github.com/ivanlin0402/personal-website/actions)** tab
5. Open **Deploy to GitHub Pages** → **Run workflow** (or push a new commit to `main`)
6. Wait until the workflow is green
7. Open: **https://ivanlin0402.github.io/personal-website/**

It can take 1–2 minutes after a green deploy before the link works.

### After it works

Anyone can use that `github.io` link. It does not need your computer to be on.

## Adding a project

1. Open `data/projects.ts`
2. Add a new object to the `projects` array
3. Fill in at least `slug`, `title`, `description`, and `category`
4. Optional detail fields appear automatically on `/projects/[slug]`

Set `featured: true` to show a project on the homepage.

## Customizing site info

Edit `data/site.ts` for your name, about copy, email, and social links.

## Visitor counter

The footer shows a live visit count.

**Default (no setup):** uses a public hit counter, so the number updates on GitHub Pages automatically.

**Optional Supabase (unique visitors):**

1. Run [`supabase/visitor-counter.sql`](supabase/visitor-counter.sql) in the Supabase SQL Editor
2. Add secrets in GitHub → **Settings → Secrets and variables → Actions**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. For local testing, put the same values in `.env.local` (see `.env.example`)

When Supabase is configured, that unique-visitor total is preferred.
