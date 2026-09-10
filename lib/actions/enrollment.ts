"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/profile";

export async function enrollInCourse(courseId: string, courseSlug: string) {
  const user = await requireUser();
  const supabase = createClient();
  const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: courseId });
  if (error && error.code !== "23505") throw error; // ignore "already enrolled"
  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath("/dashboard");
}

export async function markLessonComplete(lessonId: string, courseSlug: string) {
  const user = await requireUser();
  const supabase = createClient();
  const { error } = await supabase.from("lesson_progress").insert({ user_id: user.id, lesson_id: lessonId });
  if (error && error.code !== "23505") throw error;
  revalidatePath(`/dashboard/courses/${courseSlug}/learn`);
  revalidatePath("/dashboard");
}

export async function markLessonIncomplete(lessonId: string, courseSlug: string) {
  const user = await requireUser();
  const supabase = createClient();
  const { error } = await supabase
    .from("lesson_progress")
    .delete()
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId);
  if (error) throw error;
  revalidatePath(`/dashboard/courses/${courseSlug}/learn`);
  revalidatePath("/dashboard");
}

export async function submitResourceRequest(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const { resourceRequestSchema } = await import("@/lib/validation/catalog");
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
  if (error) return { error: "Something went wrong, please try again." };

  return { success: true };
}
