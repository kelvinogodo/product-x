"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data/profile";
import { categorySchema, courseSchema, instructorSchema, lessonSchema, quizSchema, trackSchema } from "@/lib/validation/catalog";

export type FormState = { error?: string } | undefined;

const uuid = z.string().uuid();

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === null || value === "" ? undefined : value;
}

/** Map database errors to safe, human messages — raw Postgres text never reaches the client. */
function friendlyError(error: { code?: string; message: string }, action: string) {
  console.error(`${action} error:`, error.code, error.message);
  switch (error.code) {
    case "23505":
      return "That slug is already in use — pick a different one.";
    case "23503":
      return "That item is still referenced elsewhere or points to something that no longer exists.";
    case "23514":
      return "One of the values isn't allowed (check lengths and that URLs start with https://).";
    case "42501":
      return "You don't have permission to do that.";
    default:
      return "Something went wrong saving your changes. Please try again.";
  }
}

// Categories
export async function upsertCategory(id: string | null, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (id) uuid.parse(id);
  const parsed = categorySchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const { error } = id
    ? await supabase.from("categories").update(parsed.data).eq("id", id)
    : await supabase.from("categories").insert(parsed.data);
  if (error) return { error: friendlyError(error, "upsertCategory") };

  revalidatePath("/admin/categories");
  revalidatePath("/courses");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  uuid.parse(id);
  const supabase = createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(friendlyError(error, "deleteCategory"));
  revalidatePath("/admin/categories");
  revalidatePath("/courses");
}

// Tracks
export async function upsertTrack(id: string | null, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (id) uuid.parse(id);
  const parsed = trackSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formValue(formData, "description"),
    categoryId: formValue(formData, "categoryId"),
    coverImageUrl: formValue(formData, "coverImageUrl"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const payload = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    category_id: parsed.data.categoryId ?? null,
    cover_image_url: parsed.data.coverImageUrl ?? null,
  };
  const { error } = id
    ? await supabase.from("tracks").update(payload).eq("id", id)
    : await supabase.from("tracks").insert(payload);
  if (error) return { error: friendlyError(error, "upsertTrack") };

  revalidatePath("/admin/tracks");
  revalidatePath("/tracks", "layout");
  redirect("/admin/tracks");
}

export async function deleteTrack(id: string) {
  await requireAdmin();
  uuid.parse(id);
  const supabase = createClient();
  const { error } = await supabase.from("tracks").delete().eq("id", id);
  if (error) throw new Error(friendlyError(error, "deleteTrack"));
  revalidatePath("/admin/tracks");
}

// Instructors
export async function upsertInstructor(id: string | null, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (id) uuid.parse(id);
  const parsed = instructorSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    bio: formValue(formData, "bio"),
    avatarUrl: formValue(formData, "avatarUrl"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const payload = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    bio: parsed.data.bio ?? null,
    avatar_url: parsed.data.avatarUrl ?? null,
  };
  const { error } = id
    ? await supabase.from("instructors").update(payload).eq("id", id)
    : await supabase.from("instructors").insert(payload);
  if (error) return { error: friendlyError(error, "upsertInstructor") };

  revalidatePath("/admin/instructors");
  revalidatePath("/courses", "layout");
  redirect("/admin/instructors");
}

export async function deleteInstructor(id: string) {
  await requireAdmin();
  uuid.parse(id);
  const supabase = createClient();
  const { error } = await supabase.from("instructors").delete().eq("id", id);
  if (error) throw new Error(friendlyError(error, "deleteInstructor"));
  revalidatePath("/admin/instructors");
  revalidatePath("/courses", "layout");
}

// Courses
export async function upsertCourse(id: string | null, _prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await requireAdmin();
  if (id) uuid.parse(id);
  const outcomes = String(formData.get("outcomes") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const parsed = courseSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formValue(formData, "description"),
    categoryId: formValue(formData, "categoryId"),
    trackId: formValue(formData, "trackId"),
    coverImageUrl: formValue(formData, "coverImageUrl"),
    level: formData.get("level"),
    durationMinutes: formData.get("durationMinutes"),
    instructorId: formValue(formData, "instructorId"),
    outcomes,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const payload = {
    slug: parsed.data.slug,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    category_id: parsed.data.categoryId ?? null,
    track_id: parsed.data.trackId ?? null,
    cover_image_url: parsed.data.coverImageUrl ?? null,
    level: parsed.data.level,
    duration_minutes: parsed.data.durationMinutes,
    instructor_id: parsed.data.instructorId ?? null,
    outcomes: parsed.data.outcomes,
    featured: parsed.data.featured,
    published: parsed.data.published,
    ...(id ? {} : { created_by: user.id }),
  };
  const { error } = id
    ? await supabase.from("courses").update(payload).eq("id", id)
    : await supabase.from("courses").insert(payload);
  if (error) return { error: friendlyError(error, "upsertCourse") };

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath("/");
  redirect("/admin/courses");
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  uuid.parse(id);
  const supabase = createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(friendlyError(error, "deleteCourse"));
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  revalidatePath("/");
}

// Lessons
export async function upsertLesson(
  id: string | null,
  courseId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  if (id) uuid.parse(id);
  const parsed = lessonSchema.safeParse({
    courseId,
    title: formData.get("title"),
    content: formValue(formData, "content"),
    videoUrl: formValue(formData, "videoUrl"),
    position: formData.get("position"),
    durationMinutes: formData.get("durationMinutes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const payload = {
    course_id: parsed.data.courseId,
    title: parsed.data.title,
    content: parsed.data.content ?? null,
    video_url: parsed.data.videoUrl ?? null,
    position: parsed.data.position,
    duration_minutes: parsed.data.durationMinutes,
  };
  const { error } = id
    ? await supabase.from("lessons").update(payload).eq("id", id)
    : await supabase.from("lessons").insert(payload);
  if (error) return { error: friendlyError(error, "upsertLesson") };

  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

export async function deleteLesson(id: string, courseId: string) {
  await requireAdmin();
  uuid.parse(id);
  uuid.parse(courseId);
  const supabase = createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw new Error(friendlyError(error, "deleteLesson"));
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function reorderLessons(courseId: string, orderedIds: string[]): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = z.object({ courseId: uuid, ids: z.array(uuid).max(500) }).safeParse({ courseId, ids: orderedIds });
  if (!parsed.success) return { error: "Invalid lesson order." };

  const supabase = createClient();
  const { error } = await supabase.rpc("reorder_lessons", { p_course_id: parsed.data.courseId, p_ids: parsed.data.ids });
  if (error) return { error: friendlyError(error, "reorderLessons") };
  revalidatePath(`/admin/courses/${parsed.data.courseId}`);
  revalidatePath("/courses", "layout");
  return {};
}

// Quizzes
export async function saveQuiz(lessonId: string, courseId: string, questionsJson: string): Promise<FormState> {
  await requireAdmin();
  uuid.parse(lessonId);
  uuid.parse(courseId);

  let raw: unknown;
  try {
    raw = JSON.parse(questionsJson);
  } catch {
    return { error: "Couldn't read the quiz. Please try again." };
  }
  const parsed = quizSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const { error } = await supabase.rpc("save_quiz", { p_lesson_id: lessonId, p_questions: parsed.data });
  if (error) return { error: friendlyError(error, "saveQuiz") };

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/courses", "layout");
  redirect(`/admin/courses/${courseId}`);
}

// Resource requests
export async function setRequestHandled(id: string, handled: boolean) {
  await requireAdmin();
  uuid.parse(id);
  const supabase = createClient();
  const { error } = await supabase
    .from("resource_requests")
    .update({ handled_at: handled ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw new Error(friendlyError(error, "setRequestHandled"));
  revalidatePath("/admin/resource-requests");
}

export async function deleteRequest(id: string) {
  await requireAdmin();
  uuid.parse(id);
  const supabase = createClient();
  const { error } = await supabase.from("resource_requests").delete().eq("id", id);
  if (error) throw new Error(friendlyError(error, "deleteRequest"));
  revalidatePath("/admin/resource-requests");
}
