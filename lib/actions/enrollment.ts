"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/profile";
import { adminNewRequestEmail, certificateEmail, resourceReceiptEmail, sendEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";
import { resourceRequestSchema } from "@/lib/validation/catalog";
import type { QuizResult } from "@/lib/supabase/types";

const uuid = z.string().uuid();
const slug = z.string().min(1).max(100);

type Supabase = ReturnType<typeof createClient>;

async function hasCertificate(supabase: Supabase, userId: string, courseId: string) {
  const { data } = await supabase
    .from("certificates")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  return data?.id ?? null;
}

async function courseIdForLesson(supabase: Supabase, lessonId: string) {
  const { data } = await supabase.from("lessons").select("course_id").eq("id", lessonId).maybeSingle();
  return data?.course_id ?? null;
}

/** The database issues the certificate (trigger); we only email the learner the first time. */
async function emailIfCertificateIssued(
  supabase: Supabase,
  user: { id: string; email?: string | null; profile: { full_name: string | null } },
  courseId: string | null,
  hadCertificateBefore: boolean
) {
  if (!courseId || hadCertificateBefore || !user.email) return;
  const { data } = await supabase
    .from("certificates")
    .select("id, holder_name, course_title")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!data) return;
  await sendEmail(certificateEmail(user.email, data.holder_name, data.course_title, `${getSiteUrl()}/certificates/${data.id}`));
}

export async function enrollInCourse(courseId: string, courseSlug: string) {
  const user = await requireUser();
  const ids = z.object({ courseId: uuid, courseSlug: slug }).parse({ courseId, courseSlug });
  const supabase = createClient();
  // RLS also verifies that the course is published and that user_id is the caller.
  const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: ids.courseId });
  if (error && error.code !== "23505") {
    console.error("enroll error:", error.message);
    throw new Error("Couldn't enroll you in this course.");
  }
  revalidatePath(`/courses/${ids.courseSlug}`);
  revalidatePath("/dashboard");
}

export async function markLessonComplete(lessonId: string, courseSlug: string) {
  const user = await requireUser();
  const ids = z.object({ lessonId: uuid, courseSlug: slug }).parse({ lessonId, courseSlug });
  const supabase = createClient();

  const courseId = await courseIdForLesson(supabase, ids.lessonId);
  const hadCertificate = courseId ? Boolean(await hasCertificate(supabase, user.id, courseId)) : true;

  // RLS verifies enrollment, and refuses lessons that have a quiz (those complete via submitQuiz).
  const { error } = await supabase.from("lesson_progress").insert({ user_id: user.id, lesson_id: ids.lessonId });
  if (error && error.code !== "23505") {
    console.error("markLessonComplete error:", error.message);
    throw new Error("Couldn't save your progress.");
  }

  await emailIfCertificateIssued(supabase, user, courseId, hadCertificate);
  revalidatePath(`/dashboard/courses/${ids.courseSlug}/learn`);
  revalidatePath("/dashboard");
}

export async function markLessonIncomplete(lessonId: string, courseSlug: string) {
  const user = await requireUser();
  const ids = z.object({ lessonId: uuid, courseSlug: slug }).parse({ lessonId, courseSlug });
  const supabase = createClient();
  const { error } = await supabase
    .from("lesson_progress")
    .delete()
    .eq("user_id", user.id)
    .eq("lesson_id", ids.lessonId);
  if (error) {
    console.error("markLessonIncomplete error:", error.message);
    throw new Error("Couldn't save your progress.");
  }
  revalidatePath(`/dashboard/courses/${ids.courseSlug}/learn`);
  revalidatePath("/dashboard");
}

/** Grades a quiz in the database (answers never leave it). A pass also completes the lesson. */
export async function submitQuiz(
  lessonId: string,
  courseSlug: string,
  answers: number[]
): Promise<{ result?: QuizResult; error?: string }> {
  const user = await requireUser();
  const parsed = z
    .object({ lessonId: uuid, courseSlug: slug, answers: z.array(z.number().int().min(0).max(5)).min(1).max(50) })
    .safeParse({ lessonId, courseSlug, answers });
  if (!parsed.success) return { error: "Please answer every question." };

  const supabase = createClient();
  const courseId = await courseIdForLesson(supabase, parsed.data.lessonId);
  const hadCertificate = courseId ? Boolean(await hasCertificate(supabase, user.id, courseId)) : true;

  const { data, error } = await supabase.rpc("submit_quiz", {
    p_lesson_id: parsed.data.lessonId,
    p_answers: parsed.data.answers,
  });
  if (error) {
    console.error("submitQuiz error:", error.code, error.message);
    // 22023 = "answer every question" / no quiz; 42501 = not enrolled. Both are safe to describe generically.
    return { error: error.code === "22023" ? "Please answer every question." : "We couldn't grade that quiz. Please try again." };
  }

  if (data.passed) await emailIfCertificateIssued(supabase, user, courseId, hadCertificate);
  revalidatePath(`/dashboard/courses/${parsed.data.courseSlug}/learn`);
  revalidatePath("/dashboard");
  return { result: data };
}

export async function saveNote(lessonId: string, body: string): Promise<{ error?: string }> {
  const user = await requireUser();
  const parsed = z.object({ lessonId: uuid, body: z.string().max(5000, "Notes are limited to 5,000 characters.") }).safeParse({ lessonId, body });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const text = parsed.data.body.trim();
  const { error } = text
    ? await supabase
        .from("lesson_notes")
        .upsert({ user_id: user.id, lesson_id: parsed.data.lessonId, body: text }, { onConflict: "user_id,lesson_id" })
    : await supabase.from("lesson_notes").delete().eq("user_id", user.id).eq("lesson_id", parsed.data.lessonId);
  if (error) {
    console.error("saveNote error:", error.message);
    return { error: "Couldn't save your note." };
  }
  return {};
}

export async function submitResourceRequest(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  // Honeypot: real users never see or fill this field. Pretend success so bots learn nothing.
  if (formData.get("website")) return { success: true };

  const parsed = resourceRequestSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    courseId: formData.get("courseId") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const { error } = await supabase.from("resource_requests").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    course_id: parsed.data.courseId ?? null,
  });
  if (error) {
    // P0001 = rate limit raised by the limit_resource_requests trigger.
    if (error.code === "P0001") return { error: "Too many requests — please try again in a little while." };
    console.error("submitResourceRequest error:", error.message);
    return { error: "Something went wrong, please try again." };
  }

  // Best-effort notifications (skipped silently when email isn't configured).
  let courseTitle: string | null = null;
  if (parsed.data.courseId) {
    const { data } = await supabase.from("courses").select("title").eq("id", parsed.data.courseId).maybeSingle();
    courseTitle = data?.title ?? null;
  }
  const site = getSiteUrl();
  const emails = [resourceReceiptEmail(parsed.data.email, parsed.data.name, courseTitle, `${site}/courses`)];
  if (process.env.ADMIN_NOTIFY_EMAIL) {
    emails.push(
      adminNewRequestEmail(process.env.ADMIN_NOTIFY_EMAIL, parsed.data.name, parsed.data.email, courseTitle, `${site}/admin/resource-requests`)
    );
  }
  await Promise.allSettled(emails.map(sendEmail));

  return { success: true };
}
