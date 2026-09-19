-- Atomic admin helpers. Both run as the caller (SECURITY INVOKER), so the existing admin-only RLS
-- policies apply on top of the explicit is_admin() guard.

-- Reorder a course's lessons: p_ids is the desired order; positions become 1..n.
create or replace function public.reorder_lessons(p_course_id uuid, p_ids uuid[])
returns void
language plpgsql
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can reorder lessons' using errcode = '42501';
  end if;

  if (select count(*) from public.lessons where course_id = p_course_id) <> coalesce(array_length(p_ids, 1), 0)
     or exists (select 1 from unnest(p_ids) as given(pid) where not exists (
          select 1 from public.lessons l where l.id = given.pid and l.course_id = p_course_id)) then
    raise exception 'Lesson list does not match this course' using errcode = '22023';
  end if;

  update public.lessons l
  set "position" = o.ord
  from unnest(p_ids) with ordinality as o(id, ord)
  where l.id = o.id and l.course_id = p_course_id;
end;
$$;

-- Replace a lesson's whole quiz in one transaction.
-- p_questions: [{ "prompt": "...", "options": ["a","b"], "correct_index": 0, "explanation": "..." }, ...]
create or replace function public.save_quiz(p_lesson_id uuid, p_questions jsonb)
returns void
language plpgsql
set search_path = public
as $$
declare
  q jsonb;
  v_id uuid;
  v_opts text[];
  i int := 0;
begin
  if not public.is_admin() then
    raise exception 'Only admins can edit quizzes' using errcode = '42501';
  end if;
  if not exists (select 1 from public.lessons where id = p_lesson_id) then
    raise exception 'Lesson not found' using errcode = '22023';
  end if;
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) > 20 then
    raise exception 'A quiz has between 0 and 20 questions' using errcode = '22023';
  end if;

  delete from public.quiz_questions where lesson_id = p_lesson_id;

  for q in select * from jsonb_array_elements(p_questions) loop
    i := i + 1;
    select array_agg(x) into v_opts from jsonb_array_elements_text(q -> 'options') x;

    if v_opts is null
       or cardinality(v_opts) not between 2 and 6
       or (q ->> 'correct_index') is null
       or (q ->> 'correct_index')::int not between 0 and cardinality(v_opts) - 1 then
      raise exception 'Question % needs 2-6 options and a valid correct answer', i using errcode = '22023';
    end if;

    insert into public.quiz_questions (lesson_id, "position", prompt, options, explanation)
    values (p_lesson_id, i, q ->> 'prompt', v_opts, nullif(q ->> 'explanation', ''))
    returning id into v_id;

    insert into public.quiz_answers (question_id, correct_index)
    values (v_id, (q ->> 'correct_index')::int);
  end loop;
end;
$$;

revoke all on function public.reorder_lessons(uuid, uuid[]) from public;
revoke all on function public.save_quiz(uuid, jsonb) from public;
grant execute on function public.reorder_lessons(uuid, uuid[]) to authenticated;
grant execute on function public.save_quiz(uuid, jsonb) to authenticated;

-- Avatar URLs must be https (they are user-writable via the API).
alter table public.profiles
  add constraint profiles_avatar_https check (avatar_url is null or avatar_url ~* '^https://') not valid;
