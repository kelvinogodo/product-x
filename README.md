# product x

A fullstack e-learning platform: learners browse tracks and courses, enroll, work through lessons with quizzes and notes, and earn certificates. Admins run the whole catalog from a built-in CMS. Built on Next.js (App Router) and Supabase.

## Features

**Learners**
- **Catalog** — categories, guided tracks, and courses with search, filters, related courses, and a public curriculum outline.
- **Lessons** — Markdown content (headings, tables, code blocks), optional YouTube/Vimeo video, per-lesson **quizzes** (graded in the database), private **notes** with autosave, resume-where-you-left-off, keyboard navigation.
- **Progress** — dashboard with stats, a **day streak**, per-course progress rings, and a "resume" card.
- **Certificates** — issued automatically when every lesson in a course is complete; public, printable, verifiable by link.
- **Account** — profile name and photo, change password (re-authenticates), sign out of all devices.
- **Polish** — scroll reveals, page transitions, dark mode, generated course covers. All motion respects the OS "reduce motion" setting.

**Admins** (`/admin`)
- CRUD for categories, tracks, courses, lessons, and **instructors**; **image upload** to Supabase Storage.
- **Drag-to-reorder** lessons (with keyboard-accessible arrows), Markdown editor with **live preview**, **quiz editor**.
- Resource-request inbox with "mark handled".

**Platform**
- Row Level Security on every table; sensitive logic (grading, certificates, ordering) lives in the database — see [Security](#security).
- SEO: sitemap, robots, Open Graph images, JSON-LD `Course` markup.
- Optional transactional email (Resend).
- Automated tests + CI.

## Tech stack

- [Next.js](https://nextjs.org/) 14 (App Router) + TypeScript, Server Actions for all mutations
- [Supabase](https://supabase.com/) — Postgres, Auth, Storage, Row Level Security
- Tailwind CSS + Radix UI primitives + framer-motion
- Zod validation on the server for every mutation
- Vitest + [PGlite](https://pglite.dev/) (real Postgres in memory) for tests

## Getting started

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com/dashboard). You'll need its **Project URL** and **anon key** (Project Settings → API) and the **database password**.

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_DB_URL`.

> **`SUPABASE_DB_URL` must be a pooler connection string** (Project Settings → Database → Connection string → *Session pooler* or *Transaction pooler*). The direct host `db.<ref>.supabase.co` is IPv6-only and fails on most home/office networks.

### 3. Apply the database schema and seed data

```bash
pnpm install
pnpm db:migrate   # applies supabase/migrations/*.sql in order, tracking what's applied
pnpm db:seed      # 14 courses, 5 tracks, ~46 lessons, 42 quiz questions (safe to re-run)
```

Prefer the dashboard? Run each file in [`supabase/migrations/`](supabase/migrations/) in order in the SQL editor, then `seed.sql` and `seed_quizzes.sql`.

### 4. Supabase dashboard settings (Authentication)

These live in the dashboard, not in code — check them before going live:

- **URL Configuration → Site URL**: your production URL. **Redirect URLs**: add `http://localhost:3000/auth/callback` and `https://yourapp.com/auth/callback`. Without this, confirmation and password-reset links won't return to the app.
- **Sign In / Providers → Email**: keep *Confirm email* on (the app handles the "check your inbox" state).
- **Attack Protection**: enable CAPTCHA for sign-ups and consider leaked-password protection.
- **Emails → SMTP Settings**: Supabase's built-in mailer is heavily rate-limited; configure your own SMTP for production.

### 5. Run it

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Create an admin user

Sign up at `/signup` — everyone starts as a `student`. Promote yourself in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where id = '<your-user-uuid>';
```

(Find your UUID under Authentication → Users.) Admin tools then appear at `/admin`. Role changes are blocked for everyone except admins and direct database sessions like this one.

## Email (optional)

Set `RESEND_API_KEY`, `EMAIL_FROM` (a verified sender), and optionally `ADMIN_NOTIFY_EMAIL`. The app then emails: a receipt to people who submit the "get resources" form, a notification to the admin, and a certificate link to learners who finish a course. Without these variables, email is skipped and everything else works.

## Security

- **Roles can't be self-assigned.** A trigger blocks any non-admin API call that changes `profiles.role`.
- **Lesson content is gated by enrollment in the database.** The public curriculum comes from the narrow `course_outline()` function; `lessons` rows are readable only by enrolled learners and admins.
- **Quizzes can't be cheated from the browser.** Correct answers live in an admin-only table and are compared inside `submit_quiz()`; lessons with a quiz can only be completed by passing it (RLS blocks direct progress inserts).
- **Certificates can't be forged.** They're created only by a trigger when every lesson is complete, with the holder's name snapshotted.
- **Enrollment/progress/notes inserts are validated** by RLS (published course; caller enrolled; own rows only).
- **Storage:** raster images only (no SVG), size limits enforced by the bucket, covers writable by admins only, avatars only inside your own folder.
- **The public "get resources" form** has length/format constraints, a honeypot, and a database rate limit (5/email/hour, 300/hour total).
- **Open-redirect protection** on `?next=` and the auth callback; **PostgREST filter injection** blocked in search.
- **Untrusted content is rendered safely:** Markdown never renders raw HTML; videos are limited to YouTube/Vimeo in a sandboxed iframe; image URLs must be `https://` from this project's Storage or Unsplash.
- **Password changes re-authenticate**, and "sign out everywhere" revokes all sessions.
- **Headers:** CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy. Authenticated pages send `Cache-Control: private, no-store`.
- **Errors are sanitized:** raw database messages are logged server-side, never returned to the browser.

Known trade-offs: the CSP allows `'unsafe-inline'` scripts (Next.js inline bootstrap) — per-request nonces are the upgrade path. Auth rate limiting relies on Supabase's built-in limits (add CAPTCHA, above). The resource-request form emails whatever address is submitted; the per-email and global rate limits bound abuse, but keep an eye on it.

## Testing

```bash
pnpm test        # unit tests + database tests (runs every migration and seed in an embedded Postgres)
pnpm typecheck
pnpm lint
```

The database suite checks RLS, the role-escalation trigger, lesson gating, quiz grading, certificates, storage policies, and constraints. CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, and a production build on every push and pull request.

## Project structure

```
app/
  (marketing)/    Public site — home, /courses, /courses/[slug], /tracks, /tracks/[slug]
  (auth)/         /login, /signup, password reset
  (dashboard)/    Learner area — dashboard, lesson viewer, settings
  admin/          Role-gated CMS
  certificates/   Public certificate pages
components/
  ui/  motion/  site/  admin/
lib/
  supabase/       Browser/server/public clients, session middleware, DB types
  actions/        Server Actions (auth, enrollment, quizzes, notes, account, admin)
  data/           Server-side read helpers
  validation/     Zod schemas
supabase/
  migrations/     Schema + RLS + functions, applied in order
  seed.sql, seed_quizzes.sql
tests/            Unit + database tests
```

## Scripts

- `dev` / `build` / `start` — Next.js
- `lint`, `typecheck`, `test`
- `db:migrate` — apply pending migrations from `supabase/migrations/`
- `db:seed` — load sample data (idempotent)

## Deployment

Deploy to [Vercel](https://vercel.com/new) and set the environment variables from `.env.local.example` (at minimum the two `NEXT_PUBLIC_SUPABASE_*` values and `NEXT_PUBLIC_SITE_URL`). Run `pnpm db:migrate` against the production project before going live, and complete the [dashboard settings](#4-supabase-dashboard-settings-authentication).
