-- Learning features: quizzes, notes, certificates, and resource-request handling.

-- Quizzes ---------------------------------------------------------------------------------------
-- Questions/options are readable by enrolled learners. The CORRECT ANSWERS live in a separate,
-- admin-only table and are only ever compared server-side by submit_quiz(), so a learner can't
-- read them from the API.
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  "position" int not null default 0,
  prompt text not null check (char_length(prompt) between 1 and 500),
  options text[] not null check (cardinality(options) between 2 and 6),
  explanation text check (char_length(explanation) <= 500)
);

create table public.quiz_answers (
  question_id uuid primary key references public.quiz_questions (id) on delete cascade,
  correct_index int not null check (correct_index >= 0 and correct_index < 6)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  score int not null,
  total int not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);

create index quiz_questions_lesson_idx on public.quiz_questions (lesson_id, "position");
create index quiz_attempts_user_lesson_idx on public.quiz_attempts (user_id, lesson_id);

alter table public.quiz_questions enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.quiz_attempts enable row level security;

create policy "quiz questions are readable by enrolled learners and admins"
  on public.quiz_questions for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.lessons l
      join public.enrollments e on e.course_id = l.course_id
      where l.id = quiz_questions.lesson_id and e.user_id = auth.uid()
    )
  );

create policy "quiz questions are writable by admins"
  on public.quiz_questions for all
  using (public.is_admin()) with check (public.is_admin());

create policy "quiz answers are admin only"
  on public.quiz_answers for all
  using (public.is_admin()) with check (public.is_admin());

create policy "users can read their own quiz attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id or public.is_admin());

-- Attempts are written only by submit_quiz() below (no insert policy on purpose).

-- Grades a quiz server-side. p_answers[i] is the chosen option index for the i-th question when
-- ordered by (position, id). Passing = 60%+; a pass also marks the lesson complete.
create or replace function public.submit_quiz(p_lesson_id uuid, p_answers int[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_course uuid;
  v_total int := 0;
  v_score int := 0;
  v_passed boolean;
  v_results jsonb := '[]'::jsonb;
  q record;
  i int := 0;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select course_id into v_course from public.lessons where id = p_lesson_id;
  if v_course is null
     or not exists (select 1 from public.enrollments where user_id = v_uid and course_id = v_course) then
    raise exception 'You must be enrolled to take this quiz' using errcode = '42501';
  end if;

  select count(*) into v_total
  from public.quiz_questions qq
  join public.quiz_answers qa on qa.question_id = qq.id
  where qq.lesson_id = p_lesson_id;

  if v_total = 0 then
    raise exception 'This lesson has no quiz' using errcode = '22023';
  end if;
  if coalesce(array_length(p_answers, 1), 0) <> v_total then
    raise exception 'Answer every question before submitting' using errcode = '22023';
  end if;

  for q in
    select qq.id, qq.explanation, qa.correct_index
    from public.quiz_questions qq
    join public.quiz_answers qa on qa.question_id = qq.id
    where qq.lesson_id = p_lesson_id
    order by qq."position", qq.id
  loop
    i := i + 1;
    if p_answers[i] = q.correct_index then
      v_score := v_score + 1;
    end if;
    v_results := v_results || jsonb_build_object(
      'question_id', q.id,
      'chosen', p_answers[i],
      'correct_index', q.correct_index,
      'correct', p_answers[i] = q.correct_index,
      'explanation', q.explanation
    );
  end loop;

  v_passed := v_score * 100 >= v_total * 60;

  insert into public.quiz_attempts (user_id, lesson_id, score, total, passed)
  values (v_uid, p_lesson_id, v_score, v_total, v_passed);

  if v_passed then
    insert into public.lesson_progress (user_id, lesson_id)
    values (v_uid, p_lesson_id)
    on conflict (user_id, lesson_id) do nothing;
  end if;

  return jsonb_build_object('score', v_score, 'total', v_total, 'passed', v_passed, 'results', v_results);
end;
$$;

revoke all on function public.submit_quiz(uuid, int[]) from public;
grant execute on function public.submit_quiz(uuid, int[]) to authenticated;

-- Which lessons have a quiz (public curriculum can show a quiz badge). No answers exposed.
create or replace function public.lessons_with_quiz(p_course_id uuid)
returns table (lesson_id uuid, question_count int)
language sql
stable
security definer
set search_path = public
as $$
  select l.id, count(qq.id)::int
  from public.lessons l
  join public.courses c on c.id = l.course_id
  join public.quiz_questions qq on qq.lesson_id = l.id
  where l.course_id = p_course_id and c.published
  group by l.id;
$$;

revoke all on function public.lessons_with_quiz(uuid) from public;
grant execute on function public.lessons_with_quiz(uuid) to anon, authenticated;

-- Notes -----------------------------------------------------------------------------------------
create table public.lesson_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  body text not null check (char_length(body) <= 5000),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.lesson_notes enable row level security;

create policy "users read their own notes"
  on public.lesson_notes for select using (auth.uid() = user_id);

create policy "users write notes on lessons they are enrolled in"
  on public.lesson_notes for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.lessons l
      join public.enrollments e on e.course_id = l.course_id
      where l.id = lesson_notes.lesson_id and e.user_id = auth.uid()
    )
  );

create policy "users update their own notes"
  on public.lesson_notes for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users delete their own notes"
  on public.lesson_notes for delete using (auth.uid() = user_id);

create trigger set_lesson_notes_updated_at
  before update on public.lesson_notes
  for each row execute procedure extensions.moddatetime(updated_at);

-- Certificates ----------------------------------------------------------------------------------
-- Issued automatically (by trigger) when a learner completes every lesson in a course. The holder
-- name and course title are snapshotted so the certificate never changes retroactively.
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  holder_name text not null,
  course_title text not null,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table public.certificates enable row level security;

create policy "users read their own certificates"
  on public.certificates for select
  using (auth.uid() = user_id or public.is_admin());

-- No insert/update/delete policies: only the trigger below (security definer) can issue one.

create or replace function public.issue_certificate_if_complete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course uuid;
begin
  select course_id into v_course from public.lessons where id = new.lesson_id;
  if v_course is null then
    return new;
  end if;

  -- Any lesson in the course this learner hasn't completed?
  if exists (
    select 1
    from public.lessons l
    where l.course_id = v_course
      and not exists (
        select 1 from public.lesson_progress p
        where p.lesson_id = l.id and p.user_id = new.user_id
      )
  ) then
    return new;
  end if;

  insert into public.certificates (user_id, course_id, holder_name, course_title)
  select new.user_id,
         v_course,
         coalesce(nullif(trim(pr.full_name), ''), 'Learner'),
         c.title
  from public.courses c
  left join public.profiles pr on pr.id = new.user_id
  where c.id = v_course
  on conflict (user_id, course_id) do nothing;

  return new;
end;
$$;

create trigger issue_certificate_after_progress
  after insert on public.lesson_progress
  for each row execute procedure public.issue_certificate_if_complete();

-- Public verification: anyone holding the (unguessable) certificate id can verify it.
create or replace function public.get_certificate(p_id uuid)
returns table (holder_name text, course_title text, course_slug text, issued_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select ce.holder_name, ce.course_title, co.slug, ce.issued_at
  from public.certificates ce
  left join public.courses co on co.id = ce.course_id
  where ce.id = p_id;
$$;

revoke all on function public.get_certificate(uuid) from public;
grant execute on function public.get_certificate(uuid) to anon, authenticated;

-- Resource requests: let admins mark them handled ----------------------------------------------
alter table public.resource_requests
  add column handled_at timestamptz;

create policy "admins can update resource requests"
  on public.resource_requests for update
  using (public.is_admin()) with check (public.is_admin());

create policy "admins can delete resource requests"
  on public.resource_requests for delete
  using (public.is_admin());
