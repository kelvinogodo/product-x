import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { sanitizeSearch } from "@/lib/security";
import type { Database } from "@/lib/supabase/types";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];
type CategoryRef = { id: string; slug: string; name: string } | null;

export type CourseStats = { lesson_count: number; learner_count: number };
export type CourseWithCategory = CourseRow & { category: CategoryRef } & Partial<CourseStats>;
export type OutlineLesson = { id: string; title: string; position: number; duration_minutes: number; quiz_questions: number };
export type InstructorRef = { id: string; slug: string; name: string; bio: string | null; avatar_url: string | null };
export type CourseDetail = CourseRow & {
  category: CategoryRef;
  track: { id: string; slug: string; name: string } | null;
  instructor: InstructorRef | null;
} & CourseStats & { lessons: OutlineLesson[] };
export type TrackDetail = Database["public"]["Tables"]["tracks"]["Row"] & {
  category: CategoryRef;
  courses: CourseRow[];
};
export type TrackSummary = Database["public"]["Tables"]["tracks"]["Row"] & {
  category: CategoryRef;
  course_count: number;
};

/** Public aggregate counts per published course (lessons + enrolled learners). */
const getStatsByCourse = cache(async (): Promise<Map<string, CourseStats>> => {
  const supabase = createClient();
  const { data } = await supabase.rpc("course_stats");
  return new Map((data ?? []).map((row) => [row.course_id, { lesson_count: row.lesson_count, learner_count: row.learner_count }]));
});

async function withStats<T extends { id: string }>(courses: T[]): Promise<(T & Partial<CourseStats>)[]> {
  const stats = await getStatsByCourse();
  return courses.map((course) => ({ ...course, ...stats.get(course.id) }));
}

export const getCategories = cache(async () => {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data;
});

export async function getPublishedCourses(
  options: { categorySlug?: string; search?: string } = {}
): Promise<CourseWithCategory[]> {
  const supabase = createClient();
  let query = supabase
    .from("courses")
    .select("*, category:categories(id, slug, name)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (options.categorySlug && options.categorySlug !== "all") {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug.slice(0, 100))
      .maybeSingle();
    // Unknown category slug → empty result, not "everything".
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }

  const search = sanitizeSearch(options.search);
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return withStats(data as unknown as CourseWithCategory[]);
}

/** Memoised per request: generateMetadata and the page both need the course. */
export const getCourseBySlug = cache(async (slug: string): Promise<CourseDetail | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, category:categories(id, slug, name), track:tracks(id, slug, name), instructor:instructors(id, slug, name, bio, avatar_url)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  const course = data as unknown as Omit<CourseDetail, "lessons" | keyof CourseStats>;

  const [{ data: outline }, { data: quizzes }, stats] = await Promise.all([
    supabase.rpc("course_outline", { p_course_id: course.id }),
    supabase.rpc("lessons_with_quiz", { p_course_id: course.id }),
    getStatsByCourse(),
  ]);
  const quizCounts = new Map((quizzes ?? []).map((q) => [q.lesson_id, q.question_count]));
  return {
    ...course,
    lessons: (outline ?? []).map((l) => ({ ...l, quiz_questions: quizCounts.get(l.id) ?? 0 })),
    lesson_count: stats.get(course.id)?.lesson_count ?? outline?.length ?? 0,
    learner_count: stats.get(course.id)?.learner_count ?? 0,
  };
});

/** Full lesson content. Row-level security only returns rows for enrolled learners and admins. */
export async function getCourseLessons(courseId: string): Promise<LessonRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("position", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getRelatedCourses(course: { id: string; category_id: string | null }, limit = 3) {
  if (!course.category_id) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, category:categories(id, slug, name)")
    .eq("published", true)
    .eq("category_id", course.category_id)
    .neq("id", course.id)
    .limit(limit);
  if (error) return [];
  return withStats(data as unknown as CourseWithCategory[]);
}

export const getTrackBySlug = cache(async (slug: string): Promise<TrackDetail | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("*, category:categories(id, slug, name), courses(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as TrackDetail;
});

export async function getTracks(): Promise<TrackSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("*, category:categories(id, slug, name), courses(id, published)")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as unknown as (TrackSummary & { courses: { published: boolean }[] })[]).map(
    ({ courses, ...track }) => ({ ...track, course_count: courses.filter((c) => c.published).length })
  );
}

/** Hand-picked (featured) courses first, then newest. */
export async function getFeaturedCourses(limit = 6): Promise<CourseWithCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, category:categories(id, slug, name)")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return withStats(data as unknown as CourseWithCategory[]);
}

export async function getCatalogSummary() {
  const supabase = createClient();
  const [{ count: courses }, { count: tracks }, { data: stats }, { data: minutes }] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("tracks").select("id", { count: "exact", head: true }),
    supabase.rpc("course_stats"),
    supabase.from("courses").select("duration_minutes").eq("published", true),
  ]);
  return {
    courses: courses ?? 0,
    tracks: tracks ?? 0,
    lessons: (stats ?? []).reduce((sum, row) => sum + row.lesson_count, 0),
    hours: Math.round((minutes ?? []).reduce((sum, row) => sum + row.duration_minutes, 0) / 60),
  };
}
