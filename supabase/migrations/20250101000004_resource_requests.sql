-- Lead-capture form ("get resources" modal on a course page).
create table public.resource_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  course_id uuid references public.courses (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.resource_requests enable row level security;
