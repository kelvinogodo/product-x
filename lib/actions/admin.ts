"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data/profile";
import { categorySchema, courseSchema, lessonSchema, trackSchema } from "@/lib/validation/catalog";

export type FormState = { error?: string } | undefined;

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === null || value === "" ? undefined : value;
}

// Categories
export async function upsertCategory(id: string | null, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const { error } = id
    ? await supabase.from("categories").update(parsed.data).eq("id", id)
    : await supabase.from("categories").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const supabase = createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

// Tracks
export async function upsertTrack(id: string | null, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
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
  if (error) return { error: error.message };

  revalidatePath("/admin/tracks");
  redirect("/admin/tracks");
}

export async function deleteTrack(id: string) {
  await requireAdmin();
  const supabase = createClient();
  await supabase.from("tracks").delete().eq("id", id);
  revalidatePath("/admin/tracks");
}

// Courses
export async function upsertCourse(id: string | null, _prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = courseSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formValue(formData, "description"),
    categoryId: formValue(formData, "categoryId"),
    trackId: formValue(formData, "trackId"),
    coverImageUrl: formValue(formData, "coverImageUrl"),
    level: formData.get("level"),
    durationMinutes: formData.get("durationMinutes"),
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
    published: parsed.data.published,
    ...(id ? {} : { created_by: user.id }),
  };
  const { error } = id
    ? await supabase.from("courses").update(payload).eq("id", id)
    : await supabase.from("courses").insert(payload);
  if (error) return { error: error.message };

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  redirect("/admin/courses");
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  const supabase = createClient();
  await supabase.from("courses").delete().eq("id", id);
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

// Lessons
export async function upsertLesson(
  id: string | null,
  courseId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
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
  if (error) return { error: error.message };

  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

export async function deleteLesson(id: string, courseId: string) {
  await requireAdmin();
  const supabase = createClient();
  await supabase.from("lessons").delete().eq("id", id);
  revalidatePath(`/admin/courses/${courseId}`);
}
