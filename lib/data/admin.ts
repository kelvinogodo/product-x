import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];

export type AdminCourse = CourseRow & {
  category: { name: string } | null;
  track: { name: string } | null;
};
export type AdminTrack = Database["public"]["Tables"]["tracks"]["Row"] & { category: { name: string } | null };
export type AdminResourceRequest = Database["public"]["Tables"]["resource_requests"]["Row"] & {
  course: { title: string } | null;
};
export type AdminCourseDetail = CourseRow & { lessons: LessonRow[] };

export async function getAdminStats() {
  const supabase = createClient();
  const [{ count: courses }, { count: published }, { count: students }, { count: requests }] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("resource_requests").select("id", { count: "exact", head: true }),
  ]);

  return {
    courses: courses ?? 0,
    published: published ?? 0,
    students: students ?? 0,
    requests: requests ?? 0,
  };
}

export async function getAllCourses(): Promise<AdminCourse[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, category:categories(name), track:tracks(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as AdminCourse[];
}

export async function getAllTracks(): Promise<AdminTrack[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("*, category:categories(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as AdminTrack[];
}

export async function getAllCategories() {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getResourceRequests(): Promise<AdminResourceRequest[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("resource_requests")
    .select("*, course:courses(title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as AdminResourceRequest[];
}

export async function getCourseById(id: string): Promise<AdminCourseDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("courses").select("*, lessons(*)").eq("id", id).single();
  if (error) return null;
  const course = data as unknown as AdminCourseDetail;
  course.lessons?.sort((a, b) => a.position - b.position);
  return course;
}

export async function getTrackById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("tracks").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getCategoryById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getLessonById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("lessons").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export type AdminQuizQuestion = { prompt: string; options: string[]; correct_index: number; explanation: string };

/** Full quiz including the correct answers — admin only (RLS blocks everyone else). */
export async function getLessonQuiz(lessonId: string): Promise<AdminQuizQuestion[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("prompt, options, explanation, position, id, answer:quiz_answers(correct_index)")
    .eq("lesson_id", lessonId)
    .order("position", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw error;
  return (data as unknown as { prompt: string; options: string[]; explanation: string | null; answer: { correct_index: number } | { correct_index: number }[] | null }[]).map((q) => {
    const answer = Array.isArray(q.answer) ? q.answer[0] : q.answer;
    return { prompt: q.prompt, options: q.options, explanation: q.explanation ?? "", correct_index: answer?.correct_index ?? 0 };
  });
}

export async function getAllInstructors() {
  const supabase = createClient();
  const { data, error } = await supabase.from("instructors").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getInstructorById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase.from("instructors").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getQuizCounts(lessonIds: string[]): Promise<Record<string, number>> {
  if (lessonIds.length === 0) return {};
  const supabase = createClient();
  const { data, error } = await supabase.from("quiz_questions").select("lesson_id").in("lesson_id", lessonIds);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data) counts[row.lesson_id] = (counts[row.lesson_id] ?? 0) + 1;
  return counts;
}
