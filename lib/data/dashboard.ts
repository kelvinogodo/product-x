import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type EnrolledCourse = {
  enrolled_at: string;
  course:
    | (Database["public"]["Tables"]["courses"]["Row"] & {
        category: { id: string; slug: string; name: string } | null;
        lessons: { id: string }[];
      })
    | null;
};

export async function getEnrolledCourses(userId: string): Promise<EnrolledCourse[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("enrolled_at, course:courses(*, category:categories(id, slug, name), lessons(id))")
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });
  if (error) throw error;
  return data as unknown as EnrolledCourse[];
}

export async function getCourseProgress(userId: string, courseId: string) {
  const supabase = createClient();
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);
  if (lessonsError) throw lessonsError;

  const lessonIds = lessons.map((l) => l.id);
  if (lessonIds.length === 0) return { completed: 0, total: 0, percent: 0 };

  const { count, error: progressError } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  if (progressError) throw progressError;

  const completed = count ?? 0;
  return { completed, total: lessonIds.length, percent: Math.round((completed / lessonIds.length) * 100) };
}

export async function getCompletedLessonIds(userId: string, courseId: string) {
  const supabase = createClient();
  const { data: lessons } = await supabase.from("lessons").select("id").eq("course_id", courseId);
  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return new Set<string>();

  const { data } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  return new Set((data ?? []).map((p) => p.lesson_id));
}

export async function isEnrolled(userId: string, courseId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  return Boolean(data);
}
