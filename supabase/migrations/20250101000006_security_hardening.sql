-- Security hardening.
--
-- 1. Privilege escalation: the original "profiles are editable by their owner" policy let any
--    signed-in user run `update profiles set role = 'admin'` on themselves through the public API.
-- 2. Lesson content was readable by anyone for every published course, so "enroll to learn" was
--    only enforced by the UI. Lessons are now readable by enrolled learners and admins only; the
--    public curriculum (titles/durations) is exposed through a narrow security-definer function.
-- 3. Enrollment / progress inserts now verify the course is published / the user is enrolled.
-- 4. The public "get resources" form gets length/format constraints and a rate limit.
-- 5. Defence-in-depth constraints on URLs and text sizes.

-- 1. profiles ---------------------------------------------------------------------------------
drop policy if exists "profiles are editable by their owner" on public.profiles;

create policy "profiles are editable by their owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles are editable by admins"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Only an admin (or a direct DB connection such as the SQL editor) may change a role. Runs as the
-- invoking role on purpose: current_user is 'authenticated'/'anon' for API calls.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and current_user in ('anon', 'authenticated')
     and not public.is_admin() then
    raise exception 'Only admins can change a role' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute procedure public.protect_profile_role();

-- 2. lessons: enrolled learners + admins only --------------------------------------------------
drop policy if exists "lessons are readable when their course is" on public.lessons;

create policy "lessons are readable by enrolled learners and admins"
  on public.lessons for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.enrollments e
      where e.course_id = lessons.course_id and e.user_id = auth.uid()
    )
  );

-- Public curriculum outline (no content / video), published courses only.
create or replace function public.course_outline(p_course_id uuid)
returns table (id uuid, title text, "position" int, duration_minutes int)
language sql
stable
security definer
set search_path = public
as $$
  select l.id, l.title, l."position", l.duration_minutes
  from public.lessons l
  join public.courses c on c.id = l.course_id
  where l.course_id = p_course_id and c.published
  order by l."position";
$$;

-- Aggregate counts for cards and the landing page (no per-user data leaves the database).
create or replace function public.course_stats()
returns table (course_id uuid, lesson_count int, learner_count int)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    (select count(*)::int from public.lessons l where l.course_id = c.id),
    (select count(*)::int from public.enrollments e where e.course_id = c.id)
  from public.courses c
  where c.published;
$$;

revoke all on function public.course_outline(uuid) from public;
revoke all on function public.course_stats() from public;
grant execute on function public.course_outline(uuid) to anon, authenticated;
grant execute on function public.course_stats() to anon, authenticated;

-- 3. enrollments / progress --------------------------------------------------------------------
drop policy if exists "users can enroll themselves" on public.enrollments;
create policy "users can enroll in published courses"
  on public.enrollments for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.courses c where c.id = enrollments.course_id and c.published)
  );

drop policy if exists "users can record their own lesson progress" on public.lesson_progress;
create policy "users can record progress on lessons they are enrolled in"
  on public.lesson_progress for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.lessons l
      join public.enrollments e on e.course_id = l.course_id
      where l.id = lesson_progress.lesson_id and e.user_id = auth.uid()
    )
  );

-- 4. resource_requests: validation + rate limit ------------------------------------------------
alter table public.resource_requests
  add constraint resource_requests_name_len check (char_length(name) between 2 and 100) not valid,
  add constraint resource_requests_email_format
    check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') not valid;

create or replace function public.limit_resource_requests()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    select count(*) from public.resource_requests
    where lower(email) = lower(new.email) and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Too many requests, please try again later' using errcode = 'P0001';
  end if;

  if (
    select count(*) from public.resource_requests where created_at > now() - interval '1 hour'
  ) >= 300 then
    raise exception 'Too many requests, please try again later' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists limit_resource_requests on public.resource_requests;
create trigger limit_resource_requests
  before insert on public.resource_requests
  for each row execute procedure public.limit_resource_requests();

-- 5. defence-in-depth constraints (NOT VALID: enforced for new/updated rows, existing rows untouched)
alter table public.courses
  add constraint courses_title_len check (char_length(title) <= 200) not valid,
  add constraint courses_description_len check (char_length(description) <= 2000) not valid,
  add constraint courses_cover_https check (cover_image_url is null or cover_image_url ~* '^https://') not valid;

alter table public.tracks
  add constraint tracks_cover_https check (cover_image_url is null or cover_image_url ~* '^https://') not valid;

alter table public.lessons
  add constraint lessons_title_len check (char_length(title) <= 200) not valid,
  add constraint lessons_content_len check (char_length(content) <= 50000) not valid,
  add constraint lessons_video_https check (video_url is null or video_url ~* '^https://') not valid;
