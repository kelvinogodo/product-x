import { beforeAll, describe, expect, it } from "vitest";
import { createDb, IDS } from "./harness";

type H = Awaited<ReturnType<typeof createDb>>;
let h: H;
let course: string;
let lessons: string[];

beforeAll(async () => {
  h = await createDb();
  await h.seed();
  await h.createUser(IDS.alice, "Alice");
  await h.createUser(IDS.admin, "Admin", "admin");
  course = (await h.rows<{ id: string }>(`select id from courses where slug='sql-and-databases'`))[0].id;
  lessons = (await h.rows<{ id: string }>(`select id from lessons where course_id='${course}' order by "position"`)).map((r) => r.id);
});

describe("reorder_lessons", () => {
  const call = (uid: string, ids: string[]) =>
    h.as("authenticated", uid, () => h.attempt(`select reorder_lessons('${course}', array[${ids.map((i) => `'${i}'::uuid`).join(",")}])`));

  it("is admin-only", async () => {
    expect((await call(IDS.alice, [...lessons].reverse())).error).toMatch(/Only admins/);
  });
  it("reorders atomically for admins", async () => {
    const reversed = [...lessons].reverse();
    expect((await call(IDS.admin, reversed)).error).toBeUndefined();
    const now = (await h.rows<{ id: string }>(`select id from lessons where course_id='${course}' order by "position"`)).map((r) => r.id);
    expect(now).toEqual(reversed);
  });
  it("rejects lists that don't match the course", async () => {
    expect((await call(IDS.admin, lessons.slice(1))).error).toMatch(/does not match/);
    expect((await call(IDS.admin, [...lessons.slice(1), "00000000-0000-0000-0000-000000000000"])).error).toMatch(/does not match/);
  });
});

describe("save_quiz", () => {
  const payload = (q: unknown) => JSON.stringify(q).replace(/'/g, "''");
  const save = (uid: string, lessonId: string, q: unknown) =>
    h.as("authenticated", uid, () => h.attempt(`select save_quiz('${lessonId}', '${payload(q)}'::jsonb)`));

  it("is admin-only", async () => {
    const r = await save(IDS.alice, lessons[0], [{ prompt: "q", options: ["a", "b"], correct_index: 0 }]);
    expect(r.error).toMatch(/Only admins/);
  });
  it("replaces a quiz and its answers", async () => {
    const r = await save(IDS.admin, lessons[0], [
      { prompt: "Two plus two?", options: ["3", "4"], correct_index: 1, explanation: "Maths" },
      { prompt: "Capital of France?", options: ["Paris", "Rome", "Oslo"], correct_index: 0 },
    ]);
    expect(r.error).toBeUndefined();
    const qs = await h.rows<{ prompt: string; correct_index: number }>(
      `select q.prompt, a.correct_index from quiz_questions q join quiz_answers a on a.question_id=q.id where q.lesson_id='${lessons[0]}' order by q."position"`
    );
    expect(qs).toEqual([
      { prompt: "Two plus two?", correct_index: 1 },
      { prompt: "Capital of France?", correct_index: 0 },
    ]);
    await save(IDS.admin, lessons[0], [{ prompt: "Only one", options: ["x", "y"], correct_index: 0 }]);
    expect(await h.rows(`select 1 from quiz_questions where lesson_id='${lessons[0]}'`)).toHaveLength(1);
  });
  it("rejects invalid questions and leaves the old quiz intact (atomic)", async () => {
    const before = await h.rows(`select id from quiz_questions where lesson_id='${lessons[0]}'`);
    const bad = await save(IDS.admin, lessons[0], [
      { prompt: "ok", options: ["a", "b"], correct_index: 0 },
      { prompt: "bad", options: ["a", "b"], correct_index: 5 },
    ]);
    expect(bad.error).toMatch(/valid correct answer/);
    const after = await h.rows(`select id from quiz_questions where lesson_id='${lessons[0]}'`);
    expect(after).toEqual(before);
    expect((await save(IDS.admin, lessons[0], [{ prompt: "x", options: ["only"], correct_index: 0 }])).error).toBeTruthy();
  });
  it("clears a quiz with an empty list", async () => {
    expect((await save(IDS.admin, lessons[0], [])).error).toBeUndefined();
    expect(await h.rows(`select 1 from quiz_questions where lesson_id='${lessons[0]}'`)).toHaveLength(0);
  });
});

describe("profiles.avatar_url", () => {
  it("must be https", async () => {
    const r = await h.as("authenticated", IDS.alice, () => h.attempt(`update profiles set avatar_url='javascript:alert(1)' where id='${IDS.alice}'`));
    expect(r.error).toMatch(/profiles_avatar_https/);
  });
});
