# product x

A fullstack e-learning platform: learners browse tracks and courses, enroll, and track lesson-by-lesson progress; admins manage the entire catalog from a built-in CMS. Built on Next.js (App Router) and Supabase.

## Features

- **Course catalog** — categories, learning tracks, and courses with a searchable, filterable `/courses` page.
- **Auth** — email/password sign up and log in via Supabase Auth, with session-aware navigation.
- **Enrollment & progress** — enroll in a course, work through its lessons, and see live completion progress on your dashboard.
- **Admin CMS** — role-gated `/admin` area to create/edit/delete categories, tracks, courses, and lessons, plus an inbox for the "get resources" lead-capture form.
- **Row Level Security** — every table is protected by Postgres RLS policies; there is no server-side "trust me" layer bypassing the database.

## Tech stack

- [Next.js](https://nextjs.org/) 14 (App Router) + TypeScript
- [Supabase](https://supabase.com/) — Postgres database, Auth, Row Level Security
- [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) primitives for the component layer
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for form validation
- Server Actions for all mutations (no REST `pages/api` layer)

## Getting started

### 1. Create a Supabase project

Create a free project at [supabase.com](https://supabase.com/dashboard). You'll need its **Project URL** and **anon public key** from Project Settings → API.

### 2. Apply the database schema

Either:

- **Supabase CLI** (recommended): `supabase link --project-ref <your-project-ref>` then `supabase db push`, or
- **SQL editor**: open the Supabase dashboard's SQL editor and run each file in [`supabase/migrations/`](supabase/migrations/) in order (they're timestamp-prefixed).

Then optionally seed sample data: add `SUPABASE_DB_URL` to `.env.local` (Project Settings → Database → Connection string, direct connection) and run `pnpm db:seed`.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from step 1.

### 4. Install dependencies and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Create an admin user

Sign up through the app (`/signup`) — every new user starts with the `student` role. To grant yourself admin access, run this in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where id = '<your-user-uuid>';
```

(Find your user's UUID under Authentication → Users in the dashboard.) Admin tools then appear at `/admin`.

## Project structure

```
app/
  (marketing)/    Public site — landing page, /courses, /courses/[slug], /tracks/[slug]
  (auth)/         /login, /signup
  (dashboard)/    Authenticated student area — enrolled courses, lesson viewer, progress
  admin/          Role-gated CMS — categories, tracks, courses, lessons, resource requests
components/
  ui/             Reusable primitives (button, input, dialog, table, toast, ...)
  site/           Public-facing composed components (header, course card, lesson viewer, ...)
  admin/          Admin form/table components
lib/
  supabase/       Browser/server Supabase clients, session middleware, hand-written DB types
  actions/        Server Actions (auth, enrollment, resource requests, admin CRUD)
  data/           Server-side read helpers used by pages
  validation/     Zod schemas shared by forms and actions
supabase/
  migrations/     SQL schema + RLS policies, applied in order
  seed.sql        Sample categories/tracks/courses/lessons
```

## Available scripts

- `dev` — start the Next.js development server
- `build` — build the app for production
- `start` — start the production server
- `lint` — run ESLint
- `db:seed` — run `supabase/seed.sql` against `SUPABASE_DB_URL` (from `.env.local`)

## Deployment

Deploy to [Vercel](https://vercel.com/new); set the two `NEXT_PUBLIC_SUPABASE_*` environment variables in the project settings. Apply migrations to your production Supabase project the same way as step 2 above before going live.
