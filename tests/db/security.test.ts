import { beforeAll, describe, expect, it } from "vitest";
import { createDb, IDS } from "./harness";

type H = Awaited<ReturnType<typeof createDb>>;
let h: H;
let htmlCourse: string;
let jsLesson: string;

beforeAll(async () => {
  h = await createDb();
  await h.seed();
  await h.seed(); // idempotent
  await h.createUser(IDS.alice, "Alice");
  await h.createUser(IDS.admin, "Admin", "admin");
  htmlCourse = (await h.rows<{ id: string }>(`select id from courses where slug='html-css-fundamentals'`))[0].id;
  jsLesson = (
    await h.rows<{ id: string }>(
      `select l.id from lessons l join courses c on c.id=l.course_id where c.slug='javascript-essentials' limit 1`
    )
  )[0].id;
});

describe("seed data", () => {
  it("has the expected catalog", async () => {
    const [c] = await h.rows<{ c: number; t: number; co: number; l: number; i: number }>(
      `select (select count(*) from categories)::int c, (select count(*) from tracks)::int t,
              (select count(*) from courses where published)::int co, (select count(*) from lessons)::int l,
              (select count(*) from instructors)::int i`
    );
    expect(c).toMatchObject({ c: 5, t: 5, co: 14, i: 1 });
    expect(c.l).toBeGreaterThanOrEqual(40);
  });

  it("keeps course durations in sync with lessons", async () => {
    const [r] = await h.rows<{ n: number }>(
      `select count(*)::int n from courses c
       where duration_minutes <> coalesce((select sum(duration_minutes) from lessons where course_id=c.id),0)`
    );
    expect(r.n).toBe(0);
  });

  it("gives every lesson real content and every course outcomes + an instructor", async () => {
    const [a] = await h.rows<{ n: number }>(`select count(*)::int n from lessons where content is null or length(content) < 200`);
    const [b] = await h.rows<{ n: number }>(`select count(*)::int n from courses where cardinality(outcomes)=0 or instructor_id is null`);
    expect(a.n).toBe(0);
    expect(b.n).toBe(0);
  });

  it("seeds quizzes with exactly one answer per question", async () => {
    const [r] = await h.rows<{ q: number; a: number }>(
      `select (select count(*) from quiz_questions)::int q, (select count(*) from quiz_answers)::int a`
    );
    expect(r.q).toBeGreaterThanOrEqual(30);
    expect(r.a).toBe(r.q);
    const [bad] = await h.rows<{ n: number }>(
      `select count(*)::int n from quiz_answers a join quiz_questions q on q.id=a.question_id where a.correct_index >= cardinality(q.options)`
    );
    expect(bad.n).toBe(0);
  });
});

describe("profiles / privilege escalation", () => {
  it("lets SQL-editor sessions promote admins (README flow)", async () => {
    const [r] = await h.rows<{ role: string }>(`select role from profiles where id='${IDS.admin}'`);
    expect(r.role).toBe("admin");
  });
  it("blocks a student from making themselves admin", async () => {
    const r = await h.as("authenticated", IDS.alice, () => h.attempt(`update profiles set role='admin' where id='${IDS.alice}' returning role`));
    expect(r.error).toMatch(/Only admins can change a role/);
  });
  it("still lets students edit their own name", async () => {
    const r = await h.as("authenticated", IDS.alice, () => h.attempt(`update profiles set full_name='Alice B' where id='${IDS.alice}' returning full_name`));
    expect(r.rows[0]?.full_name).toBe("Alice B");
  });
  it("blocks editing someone else's profile", async () => {
    const r = await h.as("authenticated", IDS.alice, () => h.attempt(`update profiles set full_name='hax' where id='${IDS.admin}' returning id`));
    expect(r.rows).toHaveLength(0);
  });
  it("lets admins change roles", async () => {
    const r = await h.as("authenticated", IDS.admin, () => h.attempt(`update profiles set role='student' where id='${IDS.alice}' returning role`));
    expect(r.rows[0]?.role).toBe("student");
  });
  it("blocks students inserting profiles", async () => {
    const r = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into profiles (id, role) values (gen_random_uuid(), 'admin')`));
    expect(r.error).toBeTruthy();
  });
});

describe("lesson content gating", () => {
  it("hides lessons from anon and un-enrolled students", async () => {
    expect((await h.as("anon", null, () => h.attempt(`select id from lessons`))).rows).toHaveLength(0);
    expect((await h.as("authenticated", IDS.alice, () => h.attempt(`select id from lessons`))).rows).toHaveLength(0);
  });
  it("exposes only the outline (no content) publicly", async () => {
    const r = await h.as("anon", null, () => h.attempt(`select * from course_outline('${htmlCourse}')`));
    expect(r.rows).toHaveLength(4);
    expect(Object.keys(r.rows[0])).toEqual(["id", "title", "position", "duration_minutes"]);
  });
  it("hides outlines of unpublished courses", async () => {
    await h.db.exec(`update courses set published=false where slug='seo-fundamentals'`);
    const seo = (await h.rows<{ id: string }>(`select id from courses where slug='seo-fundamentals'`))[0].id;
    const r = await h.as("anon", null, () => h.attempt(`select * from course_outline('${seo}')`));
    await h.db.exec(`update courses set published=true where slug='seo-fundamentals'`);
    expect(r.rows).toHaveLength(0);
  });
  it("publishes aggregate course_stats", async () => {
    const r = await h.as("anon", null, () => h.attempt(`select * from course_stats()`));
    expect(r.rows).toHaveLength(14);
  });
});

describe("enrollment + progress", () => {
  it("cannot enroll someone else or in unpublished courses", async () => {
    const other = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into enrollments (user_id, course_id) values ('${IDS.admin}', '${htmlCourse}')`));
    expect(other.error).toBeTruthy();
    await h.db.exec(`update courses set published=false where slug='seo-fundamentals'`);
    const seo = (await h.rows<{ id: string }>(`select id from courses where slug='seo-fundamentals'`))[0].id;
    const unpub = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into enrollments (user_id, course_id) values ('${IDS.alice}', '${seo}')`));
    await h.db.exec(`update courses set published=true where slug='seo-fundamentals'`);
    expect(unpub.error).toBeTruthy();
  });
  it("blocks progress before enrolling", async () => {
    const r = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into lesson_progress (user_id, lesson_id) values ('${IDS.alice}', '${jsLesson}')`));
    expect(r.error).toBeTruthy();
  });
  it("enrolls, then reveals only that course's lessons", async () => {
    const e = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into enrollments (user_id, course_id) values ('${IDS.alice}', '${htmlCourse}') returning id`));
    expect(e.rows).toHaveLength(1);
    const l = await h.as("authenticated", IDS.alice, () => h.attempt(`select id from lessons`));
    expect(l.rows).toHaveLength(4);
  });
  it("blocks progress in a course you're not enrolled in", async () => {
    const r = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into lesson_progress (user_id, lesson_id) values ('${IDS.alice}', '${jsLesson}')`));
    expect(r.error).toBeTruthy();
  });
});

describe("resource requests", () => {
  it("accepts valid anon submissions but hides them from anon", async () => {
    expect((await h.as("anon", null, () => h.attempt(`insert into resource_requests (name, email) values ('Bob','bob@example.com')`))).error).toBeUndefined();
    expect((await h.as("anon", null, () => h.attempt(`select * from resource_requests`))).rows).toHaveLength(0);
  });
  it("rejects bad emails and oversize names", async () => {
    expect((await h.as("anon", null, () => h.attempt(`insert into resource_requests (name, email) values ('Bob','nope')`))).error).toMatch(/email_format/);
    expect((await h.as("anon", null, () => h.attempt(`insert into resource_requests (name, email) values ('${"x".repeat(200)}','a@b.co')`))).error).toBeTruthy();
  });
  it("rate-limits per email", async () => {
    let blockedAt = -1;
    for (let i = 0; i < 7; i++) {
      const r = await h.as("anon", null, () => h.attempt(`insert into resource_requests (name, email) values ('Spam','spam@example.com')`));
      if (r.error) { blockedAt = i; break; }
    }
    expect(blockedAt).toBeGreaterThan(-1);
    expect(blockedAt).toBeLessThanOrEqual(5);
  });
  it("only admins can mark requests handled", async () => {
    const student = await h.as("authenticated", IDS.alice, () => h.attempt(`update resource_requests set handled_at=now() returning id`));
    expect(student.rows).toHaveLength(0);
    const admin = await h.as("authenticated", IDS.admin, () => h.attempt(`update resource_requests set handled_at=now() returning id`));
    expect(admin.rows.length).toBeGreaterThan(0);
  });
});

describe("url / size constraints", () => {
  it("rejects non-https cover and video URLs", async () => {
    expect((await h.attempt(`update courses set cover_image_url='javascript:alert(1)' where slug='seo-fundamentals'`)).error).toMatch(/courses_cover_https/);
    expect((await h.attempt(`update lessons set video_url='http://x.example/v' where id='${jsLesson}'`)).error).toMatch(/lessons_video_https/);
    expect((await h.attempt(`insert into instructors (slug, name, avatar_url) values ('x','Xavier','http://x.example/a.png')`)).error).toBeTruthy();
  });
});
