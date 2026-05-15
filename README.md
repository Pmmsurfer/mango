# Mango

The CRM for brands in retail.

A Next.js 15 (App Router) + Supabase app for emerging CPG brands tracking accounts, buyers, interactions, and reorders across retail doors.

## Quick start

```bash
npm install
cp .env.example .env.local   # or create .env.local with the three keys below
npm run dev
```

Open <http://localhost:3737>.

### Required environment variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The service role key is used server-side to seed sample data on first signup. Never expose it to the browser.

### Apply the database schema

1. Open your Supabase project's **SQL Editor**.
2. Paste the contents of `supabase/migrations/0001_init.sql`.
3. Click **Run**.

This creates 6 tables (`brands`, `accounts`, `buyers`, `interactions`, `reorders`, `reminders`), 2 enums, RLS on every table, and a public `brand-logos` storage bucket.

### Configure Supabase auth

In **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3737` (or your production URL)
- **Redirect URLs**: add `http://localhost:3737/auth/callback`

## Try it

1. Visit `/` — marketing landing page.
2. Click **Start free trial** → enter email → check inbox for magic link.
3. Click magic link → land on `/onboarding`, enter brand name.
4. Sample data seeds; you land on `/app/pipeline` with 12 retailer accounts pre-populated.

## Stack

- Next.js 15 (App Router, Server Components, Server Actions)
- TypeScript
- Tailwind CSS v4 (CSS-first `@theme` tokens)
- shadcn/ui (base-nova preset, Base UI primitives)
- Supabase (Postgres + Auth magic link + Storage)
- `@dnd-kit/core` for the pipeline drag-and-drop
- Zod for input validation
- date-fns for relative dates

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Marketing landing |
| `/login`, `/signup` | Magic-link auth |
| `/auth/callback` | OAuth code exchange |
| `/onboarding` | First-time brand name + seed |
| `/app/pipeline` | Kanban board (5 stages, drag-and-drop) |
| `/app/accounts` | Flat list of accounts |
| `/app/accounts/[id]` | Account detail (Overview / Buyers / History tabs) |
| `/app/radar` | Reorder Radar — cadence-aware reorder tracking |
| `/app/buyers` | All buyers across accounts; "Buyer changed jobs" flow |
| `/app/settings` | Brand profile + billing placeholder |

## Reorder Radar status rules

For each `on_shelf` / `reordering` account, we compute:

- **cadence** = average days between historical reorders
- **days_since** = days since the most recent reorder
- **ratio** = days_since / cadence

| Ratio | Status |
| --- | --- |
| < 1.2 | On track |
| 1.2 – 1.5 | Slipping |
| 1.5 – 2.0 | At risk |
| > 2.0 | Drifting |

Most-urgent rows surface first.

## Scripts

- `npm run dev` — Turbopack dev server (port 3737 if `PORT=3737` is set; otherwise 3000)
- `npm run build` — Production build
- `npm run start` — Run the production build
- `npm run lint` — ESLint

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import into Vercel.
3. Set the three env vars in the project settings.
4. Update **Site URL** and **Redirect URLs** in Supabase to your production URL.
