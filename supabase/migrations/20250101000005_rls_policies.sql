-- Helper: is the current user an admin? security definer so it can read
-- profiles.role without recursing through the profiles RLS policy below.
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
create policy "profiles are viewable by their owner or an admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles are editable by their owner"
  on public.profiles for update
  using (auth.uid() = id);

-- categories (public read, admin write)
create policy "categories are publicly readable"
  on public.categories for select using (true);

create policy "categories are writable by admins"
  on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- tracks (public read, admin write)
create policy "tracks are publicly readable"
  on public.tracks for select using (true);

create policy "tracks are writable by admins"
  on public.tracks for all
  using (public.is_admin()) with check (public.is_admin());

-- courses (published courses are public, admins see/write everything)
create policy "published courses are publicly readable"
  on public.courses for select
  using (published or public.is_admin());

create policy "courses are writable by admins"
  on public.courses for all
  using (public.is_admin()) with check (public.is_admin());

-- lessons (follow the parent course's visibility)
create policy "lessons are readable when their course is"
  on public.lessons for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and (c.published or public.is_admin())
    )
  );

create policy "lessons are writable by admins"
  on public.lessons for all
  using (public.is_admin()) with check (public.is_admin());

-- enrollments (a user sees/creates only their own; admins see all)
create policy "users manage their own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id or public.is_admin());

create policy "users can enroll themselves"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

create policy "users can unenroll themselves"
  on public.enrollments for delete
  using (auth.uid() = user_id);

-- lesson_progress (a user sees/creates only their own; admins see all)
create policy "users manage their own lesson progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id or public.is_admin());

create policy "users can record their own lesson progress"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "users can clear their own lesson progress"
  on public.lesson_progress for delete
  using (auth.uid() = user_id);

-- resource_requests (anyone can submit the lead form, only admins can read it)
create policy "anyone can submit a resource request"
  on public.resource_requests for insert
  with check (true);

create policy "only admins can read resource requests"
  on public.resource_requests for select
  using (public.is_admin());
