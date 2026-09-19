-- A lesson that has a quiz can only be completed by passing it (through submit_quiz(), which is
-- security definer). Without this, an enrolled learner could insert lesson_progress directly via
-- the API and skip the quiz.
drop policy if exists "users can record progress on lessons they are enrolled in" on public.lesson_progress;

create policy "users can record progress on quiz-free lessons they are enrolled in"
  on public.lesson_progress for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.lessons l
      join public.enrollments e on e.course_id = l.course_id
      where l.id = lesson_progress.lesson_id and e.user_id = auth.uid()
    )
    and not exists (
      select 1 from public.quiz_questions q where q.lesson_id = lesson_progress.lesson_id
    )
  );
