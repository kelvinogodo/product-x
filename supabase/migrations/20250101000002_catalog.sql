-- Catalog: categories, tracks (learning paths), courses, lessons.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  cover_image_url text,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  track_id uuid references public.tracks (id) on delete set null,
  cover_image_url text,
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  duration_minutes int not null default 0,
  published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  content text,
  video_url text,
  position int not null default 0,
  duration_minutes int not null default 0,
  created_at timestamptz not null default now()
);

create index lessons_course_id_position_idx on public.lessons (course_id, position);
create index courses_category_id_idx on public.courses (category_id);
create index courses_track_id_idx on public.courses (track_id);
create index tracks_category_id_idx on public.tracks (category_id);

alter table public.categories enable row level security;
alter table public.tracks enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;

create trigger set_courses_updated_at
  before update on public.courses
  for each row execute procedure extensions.moddatetime(updated_at);
