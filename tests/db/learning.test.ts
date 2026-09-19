import { beforeAll, describe, expect, it } from "vitest";
import { createDb, IDS } from "./harness";

type H = Awaited<ReturnType<typeof createDb>>;
let h: H;
let course: string; // html-css-fundamentals (4 lessons)
let quizLesson: string; // lesson 2 has a 3-question quiz
let lessons: string[];

const enroll = (uid: string) =>
  h.as("authenticated", uid, () => h.attempt(`insert into enrollments (user_id, course_id) values ('${uid}', '${course}')`));

async function correctAnswers(lessonId: string) {
  const r = await h.rows<{ correct_index: number }>(
    `select a.correct_index from quiz_questions q join quiz_answers a on a.question_id=q.id
     where q.lesson_id='${lessonId}' order by q."position", q.id`
  );
  return r.map((x) => x.correct_index);
}

beforeAll(async () => {
  h = await createDb();
  await h.seed();
  await h.createUser(IDS.alice, "Alice Learner");
  await h.createUser(IDS.bob, "Bob Outsider");
  await h.createUser(IDS.admin, "Admin", "admin");
  course = (await h.rows<{ id: string }>(`select id from courses where slug='html-css-fundamentals'`))[0].id;
  lessons = (await h.rows<{ id: string }>(`select id from lessons where course_id='${course}' order by "position"`)).map((r) => r.id);
  quizLesson = lessons[1];
  await enroll(IDS.alice);
});

describe("quizzes", () => {
  it("lets enrolled learners read questions but NOT the answers", async () => {
    const q = await h.as("authenticated", IDS.alice, () => h.attempt(`select id, prompt, options from quiz_questions where lesson_id='${quizLesson}'`));
    expect(q.rows).toHaveLength(3);
    const a = await h.as("authenticated", IDS.alice, () => h.attempt(`select * from quiz_answers`));
    expect(a.rows).toHaveLength(0);
  });

  it("hides questions from un-enrolled users and anon", async () => {
    expect((await h.as("authenticated", IDS.bob, () => h.attempt(`select id from quiz_questions`))).rows).toHaveLength(0);
    expect((await h.as("anon", null, () => h.attempt(`select id from quiz_questions`))).rows).toHaveLength(0);
  });

  it("rejects submissions from un-enrolled users and anon", async () => {
    const bob = await h.as("authenticated", IDS.bob, () => h.attempt(`select submit_quiz('${quizLesson}', array[0,0,0])`));
    expect(bob.error).toMatch(/enrolled/);
    const anon = await h.as("anon", null, () => h.attempt(`select submit_quiz('${quizLesson}', array[0,0,0])`));
    expect(anon.error).toBeTruthy();
  });

  it("requires an answer for every question", async () => {
    const r = await h.as("authenticated", IDS.alice, () => h.attempt(`select submit_quiz('${quizLesson}', array[0])`));
    expect(r.error).toMatch(/Answer every question/);
  });

  it("fails a wrong attempt without completing the lesson", async () => {
    const correct = await correctAnswers(quizLesson);
    const wrong = correct.map((c) => (c + 1) % 4);
    const r = await h.as("authenticated", IDS.alice, () => h.attempt(`select submit_quiz('${quizLesson}', array[${wrong.join(",")}]) as res`));
    const res = r.rows[0].res as { passed: boolean; score: number };
    expect(res.passed).toBe(false);
    expect(res.score).toBe(0);
    const [p] = await h.rows<{ n: number }>(`select count(*)::int n from lesson_progress where lesson_id='${quizLesson}'`);
    expect(p.n).toBe(0);
  });

  it("passes at 2/3 and auto-completes the lesson, returning explanations", async () => {
    const correct = await correctAnswers(quizLesson);
    const mixed = [correct[0], correct[1], (correct[2] + 1) % 4];
    const r = await h.as("authenticated", IDS.alice, () => h.attempt(`select submit_quiz('${quizLesson}', array[${mixed.join(",")}]) as res`));
    const res = r.rows[0].res as { passed: boolean; score: number; results: { correct: boolean; explanation: string }[] };
    expect(res.score).toBe(2);
    expect(res.passed).toBe(true);
    expect(res.results.map((x) => x.correct)).toEqual([true, true, false]);
    expect(res.results[0].explanation).toBeTruthy();
    const [p] = await h.rows<{ n: number }>(`select count(*)::int n from lesson_progress where lesson_id='${quizLesson}' and user_id='${IDS.alice}'`);
    expect(p.n).toBe(1);
  });

  it("records attempts, visible only to their owner", async () => {
    expect((await h.as("authenticated", IDS.alice, () => h.attempt(`select * from quiz_attempts`))).rows).toHaveLength(2);
    expect((await h.as("authenticated", IDS.bob, () => h.attempt(`select * from quiz_attempts`))).rows).toHaveLength(0);
    const forge = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into quiz_attempts (user_id, lesson_id, score, total, passed) values ('${IDS.alice}','${quizLesson}',3,3,true)`));
    expect(forge.error).toBeTruthy();
  });

  it("blocks completing a quiz lesson by inserting progress directly (must pass the quiz)", async () => {
    // Bob enrolls, then tries to skip the quiz via a raw insert.
    await enroll(IDS.bob);
    const r = await h.as("authenticated", IDS.bob, () => h.attempt(`insert into lesson_progress (user_id, lesson_id) values ('${IDS.bob}', '${quizLesson}')`));
    expect(r.error).toMatch(/row-level security/);
    const ok = await h.as("authenticated", IDS.bob, () => h.attempt(`insert into lesson_progress (user_id, lesson_id) values ('${IDS.bob}', '${lessons[0]}') returning id`));
    expect(ok.rows).toHaveLength(1);
    await h.db.exec(`delete from lesson_progress where user_id='${IDS.bob}'; delete from enrollments where user_id='${IDS.bob}'`);
  });

  it("only admins can write quiz content", async () => {
    const student = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into quiz_questions (lesson_id, prompt, options) values ('${quizLesson}','q',array['a','b'])`));
    expect(student.error).toBeTruthy();
    const admin = await h.as("authenticated", IDS.admin, () => h.attempt(`select count(*)::int n from quiz_answers`));
    expect((admin.rows[0].n as number) > 0).toBe(true);
  });

  it("publishes which lessons have quizzes without leaking answers", async () => {
    const r = await h.as("anon", null, () => h.attempt(`select * from lessons_with_quiz('${course}')`));
    expect(r.rows.length).toBe(2);
    expect(Object.keys(r.rows[0])).toEqual(["lesson_id", "question_count"]);
  });
});

describe("notes", () => {
  it("lets an enrolled learner save and update their note", async () => {
    const ins = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into lesson_notes (user_id, lesson_id, body) values ('${IDS.alice}','${lessons[0]}','first') returning id`));
    expect(ins.rows).toHaveLength(1);
    const upd = await h.as("authenticated", IDS.alice, () => h.attempt(`update lesson_notes set body='second' where lesson_id='${lessons[0]}' returning body`));
    expect(upd.rows[0].body).toBe("second");
  });
  it("keeps notes private and enrollment-gated", async () => {
    expect((await h.as("authenticated", IDS.bob, () => h.attempt(`select * from lesson_notes`))).rows).toHaveLength(0);
    const r = await h.as("authenticated", IDS.bob, () => h.attempt(`insert into lesson_notes (user_id, lesson_id, body) values ('${IDS.bob}','${lessons[0]}','x')`));
    expect(r.error).toBeTruthy();
    const big = await h.as("authenticated", IDS.alice, () => h.attempt(`update lesson_notes set body='${"x".repeat(5001)}'`));
    expect(big.error).toBeTruthy();
  });
});

describe("certificates", () => {
  it("are not issued until every lesson is done", async () => {
    expect((await h.rows(`select * from certificates`))).toHaveLength(0);
  });
  it("are issued automatically on completing the last lesson, with a name snapshot", async () => {
    // Lessons 0 has no quiz (direct insert); lesson 2 has a quiz (must pass it); lesson 3 has no quiz.
    for (const id of [lessons[0], lessons[3]]) {
      const r = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into lesson_progress (user_id, lesson_id) values ('${IDS.alice}','${id}') on conflict do nothing`));
      expect(r.error).toBeUndefined();
    }
    expect(await h.rows(`select * from certificates`)).toHaveLength(0);
    const correct = await correctAnswers(lessons[2]);
    await h.as("authenticated", IDS.alice, () => h.attempt(`select submit_quiz('${lessons[2]}', array[${correct.join(",")}])`));
    const certs = await h.rows<{ id: string; holder_name: string; course_title: string }>(`select * from certificates`);
    expect(certs).toHaveLength(1);
    expect(certs[0].holder_name).toBe("Alice Learner");
    expect(certs[0].course_title).toBe("HTML & CSS Fundamentals");
  });
  it("cannot be forged or read by others, but can be verified publicly by id", async () => {
    const forge = await h.as("authenticated", IDS.bob, () => h.attempt(`insert into certificates (user_id, course_id, holder_name, course_title) values ('${IDS.bob}','${course}','Bob','x')`));
    expect(forge.error).toBeTruthy();
    expect((await h.as("authenticated", IDS.bob, () => h.attempt(`select * from certificates`))).rows).toHaveLength(0);
    const [{ id }] = await h.rows<{ id: string }>(`select id from certificates`);
    const pub = await h.as("anon", null, () => h.attempt(`select * from get_certificate('${id}')`));
    expect(pub.rows[0]).toMatchObject({ holder_name: "Alice Learner", course_slug: "html-css-fundamentals" });
    expect((await h.as("anon", null, () => h.attempt(`select * from get_certificate(gen_random_uuid())`))).rows).toHaveLength(0);
  });
  it("is issued only once", async () => {
    await h.as("authenticated", IDS.alice, () => h.attempt(`delete from lesson_progress where lesson_id='${lessons[0]}'`));
    await h.as("authenticated", IDS.alice, () => h.attempt(`insert into lesson_progress (user_id, lesson_id) values ('${IDS.alice}','${lessons[0]}')`));
    expect(await h.rows(`select * from certificates`)).toHaveLength(1);
  });
});

describe("instructors + storage", () => {
  it("are public to read but admin-only to write", async () => {
    expect((await h.as("anon", null, () => h.attempt(`select * from instructors`))).rows.length).toBeGreaterThan(0);
    expect((await h.as("authenticated", IDS.alice, () => h.attempt(`insert into instructors (slug, name) values ('x','Xavier')`))).error).toBeTruthy();
    expect((await h.as("authenticated", IDS.admin, () => h.attempt(`insert into instructors (slug, name) values ('x','Xavier')`))).error).toBeUndefined();
  });
  it("creates raster-only buckets with size limits", async () => {
    const b = await h.rows<{ id: string; allowed_mime_types: string[]; file_size_limit: number }>(`select * from storage.buckets order by id`);
    expect(b.map((x) => x.id)).toEqual(["avatars", "covers"]);
    for (const bucket of b) {
      expect(bucket.allowed_mime_types).not.toContain("image/svg+xml");
      expect(Number(bucket.file_size_limit)).toBeGreaterThan(0);
    }
  });
  it("lets only admins write covers, and users write only inside their own avatar folder", async () => {
    const stud = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into storage.objects (bucket_id, name) values ('covers','x.png')`));
    expect(stud.error).toBeTruthy();
    const adm = await h.as("authenticated", IDS.admin, () => h.attempt(`insert into storage.objects (bucket_id, name) values ('covers','x.png')`));
    expect(adm.error).toBeUndefined();
    const own = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into storage.objects (bucket_id, name) values ('avatars','${IDS.alice}/a.png')`));
    expect(own.error).toBeUndefined();
    const other = await h.as("authenticated", IDS.alice, () => h.attempt(`insert into storage.objects (bucket_id, name) values ('avatars','${IDS.bob}/a.png')`));
    expect(other.error).toBeTruthy();
  });
});
