-- Richer course pages: what learners will get out of a course, who teaches it, and a hand-picked flag.
alter table public.courses
  add column if not exists outcomes text[] not null default '{}',
  add column if not exists instructor text,
  add column if not exists featured boolean not null default false;

alter table public.courses
  add constraint courses_instructor_len check (char_length(instructor) <= 100) not valid;
