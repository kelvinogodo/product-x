import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];
type CategoryRef = { id: string; slug: string; name: string } | null;

export type CourseWithCategory = CourseRow & { category: CategoryRef };
export type CourseDetail = CourseRow & {
  category: CategoryRef;
  track: { id: string; slug: string; name: string } | null;
  lessons: LessonRow[];
};
export type TrackDetail = Database["public"]["Tables"]["tracks"]["Row"] & {
  category: CategoryRef;
  courses: CourseRow[];
};

export async function getCategories() {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data;
}

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
      .eq("slug", options.categorySlug)
      .single();
    if (category) query = query.eq("category_id", category.id);
  }

  if (options.search) {
    query = query.ilike("title", `%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as CourseWithCategory[];
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, category:categories(id, slug, name), track:tracks(id, slug, name), lessons(*)")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error) return null;
  const course = data as unknown as CourseDetail;
  course.lessons?.sort((a, b) => a.position - b.position);
  return course;
}

export async function getTrackBySlug(slug: string): Promise<TrackDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tracks")
    .select("*, category:categories(id, slug, name), courses(*)")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as unknown as TrackDetail;
}

export async function getFeaturedCourses(limit = 6): Promise<CourseWithCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, category:categories(id, slug, name)")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as unknown as CourseWithCategory[];
}
