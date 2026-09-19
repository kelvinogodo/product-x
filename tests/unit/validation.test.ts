import { describe, expect, it } from "vitest";
import { changePasswordSchema, signUpSchema } from "@/lib/validation/auth";
import { courseSchema, lessonSchema, quizSchema } from "@/lib/validation/catalog";

const IMG = "https://project-ref.supabase.co/storage/v1/object/public/covers/a.png";
const baseCourse = { slug: "a-b", title: "Course", level: "beginner", durationMinutes: "10", outcomes: [], featured: false, published: false };
const baseLesson = { courseId: "11111111-1111-4111-8111-111111111111", title: "Hello", position: "1", durationMinutes: "5" };

describe("signUpSchema", () => {
  it("normalises email and accepts a decent password", () => {
    const r = signUpSchema.safeParse({ fullName: "Al Ada", email: " A@B.co ", password: "abcdefg1" });
    expect(r.success && r.data.email).toBe("a@b.co");
  });
  it.each([
    ["no digit", "abcdefghij"],
    ["no letter", "12345678"],
    ["too short", "ab1"],
    ["over 72 chars", `a1${"x".repeat(80)}`],
  ])("rejects a password with %s", (_n, password) => {
    expect(signUpSchema.safeParse({ fullName: "Al", email: "a@b.co", password }).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const ok = { currentPassword: "oldpass1", password: "newpass12", confirmPassword: "newpass12" };
  it("accepts a valid change", () => expect(changePasswordSchema.safeParse(ok).success).toBe(true));
  it("rejects mismatch and reuse", () => {
    expect(changePasswordSchema.safeParse({ ...ok, confirmPassword: "different1" }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ ...ok, password: "oldpass1", confirmPassword: "oldpass1" }).success).toBe(false);
  });
});

describe("courseSchema", () => {
  it("accepts allowed image hosts only", () => {
    expect(courseSchema.safeParse({ ...baseCourse, coverImageUrl: IMG }).success).toBe(true);
    expect(courseSchema.safeParse({ ...baseCourse, coverImageUrl: "https://evil.com/a.png" }).success).toBe(false);
    expect(courseSchema.safeParse({ ...baseCourse, coverImageUrl: "javascript:alert(1)" }).success).toBe(false);
  });
  it("limits outcomes to 8", () => {
    expect(courseSchema.safeParse({ ...baseCourse, outcomes: Array(9).fill("x") }).success).toBe(false);
  });
  it("rejects bad slugs", () => {
    expect(courseSchema.safeParse({ ...baseCourse, slug: "Bad Slug!" }).success).toBe(false);
  });
});

describe("lessonSchema", () => {
  it("only accepts YouTube/Vimeo videos", () => {
    expect(lessonSchema.safeParse({ ...baseLesson, videoUrl: "https://youtu.be/dQw4w9WgXcQ" }).success).toBe(true);
    expect(lessonSchema.safeParse({ ...baseLesson, videoUrl: "https://evil.com/x" }).success).toBe(false);
  });
  it("caps content at 50,000 characters", () => {
    expect(lessonSchema.safeParse({ ...baseLesson, content: "x".repeat(50_001) }).success).toBe(false);
  });
});

describe("quizSchema", () => {
  const q = { prompt: "Q?", options: ["a", "b"], correct_index: 1 };
  it("accepts a valid quiz and an empty one", () => {
    expect(quizSchema.safeParse([q]).success).toBe(true);
    expect(quizSchema.safeParse([]).success).toBe(true);
  });
  it("rejects out-of-range answers, too few/many options and huge quizzes", () => {
    expect(quizSchema.safeParse([{ ...q, correct_index: 2 }]).success).toBe(false);
    expect(quizSchema.safeParse([{ ...q, options: ["only"] }]).success).toBe(false);
    expect(quizSchema.safeParse([{ ...q, options: Array(7).fill("x") }]).success).toBe(false);
    expect(quizSchema.safeParse(Array(21).fill(q)).success).toBe(false);
  });
});
