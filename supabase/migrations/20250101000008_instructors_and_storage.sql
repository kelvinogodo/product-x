-- Instructors as first-class records + image storage buckets.

-- Instructors -----------------------------------------------------------------------------------
create table public.instructors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (char_length(name) between 2 and 100),
  bio text check (char_length(bio) <= 1000),
  avatar_url text check (avatar_url is null or avatar_url ~* '^https://'),
  created_at timestamptz not null default now()
);

alter table public.instructors enable row level security;

create policy "instructors are publicly readable"
  on public.instructors for select using (true);

create policy "instructors are writable by admins"
  on public.instructors for all
  using (public.is_admin()) with check (public.is_admin());

alter table public.courses
  add column instructor_id uuid references public.instructors (id) on delete set null;

create index courses_instructor_id_idx on public.courses (instructor_id);

-- Carry over the free-text instructor names added in migration 000007.
insert into public.instructors (slug, name)
select distinct on (slug) slug, name
from (
  select regexp_replace(lower(instructor), '[^a-z0-9]+', '-', 'g') as slug, instructor as name
  from public.courses
  where instructor is not null and instructor <> ''
) src
on conflict (slug) do nothing;

update public.courses c
set instructor_id = i.id
from public.instructors i
where c.instructor is not null and c.instructor <> ''
  and i.slug = regexp_replace(lower(c.instructor), '[^a-z0-9]+', '-', 'g');

alter table public.courses drop column instructor;

-- Storage buckets --------------------------------------------------------------------------------
-- Raster images only (no SVG: it can carry script). Size limits are enforced by Storage itself.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('covers', 'covers', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/avif']),
  ('avatars', 'avatars', true, 1048576, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "covers are publicly readable"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "admins manage covers"
  on storage.objects for all
  using (bucket_id = 'covers' and public.is_admin())
  with check (bucket_id = 'covers' and public.is_admin());

create policy "avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Users may only write inside a folder named after their own user id: avatars/<uid>/...
create policy "users manage their own avatar"
  on storage.objects for all
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
