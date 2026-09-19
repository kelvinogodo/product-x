import type { Metadata } from "next";
import { CategoryTabs } from "@/components/site/category-tabs";
import { CourseGrid } from "@/components/site/course-grid";
import { getCategories, getPublishedCourses } from "@/lib/data/catalog";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const category = searchParams.category ?? "all";
  const [categories, courses] = await Promise.all([
    getCategories(),
    getPublishedCourses({ categorySlug: category, search: searchParams.q }),
  ]);

  return (
    <div className="container py-12">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Explore courses</h1>
        {searchParams.q && (
          <p className="text-muted-foreground">
            Showing results for &ldquo;{searchParams.q}&rdquo;
          </p>
        )}
        <CategoryTabs categories={categories} active={category} />
      </div>
      <CourseGrid courses={courses} />
    </div>
  );
}
