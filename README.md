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

The site is deployed automatically by GitHub Actions whenever you push to `main`.

### One-time setup in GitHub

1. Open your repo: [ivanlin0402/personal-website](https://github.com/ivanlin0402/personal-website)
2. Go to **Settings → Pages**
3. Under **Build and deployment → Source**, choose **GitHub Actions**
4. Push these changes to `main` (or run the **Deploy to GitHub Pages** workflow manually under the **Actions** tab)
5. After the workflow finishes (1–2 minutes), open:  
   **https://ivanlin0402.github.io/personal-website/**

Anyone can use that link — it does not depend on your computer being on.

### Important limitation

GitHub Pages can only host **static** websites (HTML/CSS/JS). There is no Node.js server, so API routes are not used. The visitor counter only works if you configure Supabase (optional).

## Adding a project

1. Open `data/projects.ts`
2. Add a new object to the `projects` array
3. Fill in at least `slug`, `title`, `description`, and `category`
4. Optional detail fields appear automatically on `/projects/[slug]`

Set `featured: true` to show a project on the homepage.

## Customizing site info

Edit `data/site.ts` for your name, about copy, email, and social links.

## Visitor counter (optional Supabase)

Because GitHub Pages has no server, the footer talks to Supabase **from the browser**.

1. Run [`supabase/visitor-counter.sql`](supabase/visitor-counter.sql) in the Supabase SQL Editor
2. Add secrets in GitHub → **Settings → Secrets and variables → Actions**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. For local testing, put the same values in `.env.local` (see `.env.example`)

Without Supabase, the rest of the site still works; the visit count is simply hidden.
