import type { Metadata } from "next";
import { CategoryTabs } from "@/components/site/category-tabs";
import { CourseGrid } from "@/components/site/course-grid";
import { CourseSearch } from "@/components/site/course-search";
import { getCategories, getPublishedCourses } from "@/lib/data/catalog";
import { sanitizeSearch } from "@/lib/security";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const category = searchParams.category ?? "all";
  const q = sanitizeSearch(searchParams.q);
  const [categories, courses] = await Promise.all([
    getCategories(),
    getPublishedCourses({ categorySlug: category, search: q }),
  ]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-accent/60 to-transparent" />
      <div className="container py-12">
        <div className="mb-10 space-y-5">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">Explore courses</h1>
            <p className="text-muted-foreground">Pick a topic and start learning at your own pace.</p>
          </div>
          <CourseSearch key={q} defaultValue={q} category={category} />
          <CategoryTabs categories={categories} active={category} query={q} />
        </div>
        <CourseGrid courses={courses} filterKey={`${category}|${q}`} />
      </div>
    </div>
  );
}
