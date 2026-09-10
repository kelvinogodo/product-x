import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { CourseCard } from "@/components/site/course-card";
import { Button } from "@/components/ui/button";
import { getFeaturedCourses } from "@/lib/data/catalog";

export default async function HomePage() {
  const courses = await getFeaturedCourses(6);

  return (
    <>
      <Hero />
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured courses</h2>
            <p className="text-muted-foreground">Hand-picked courses to help you get started.</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/courses" className="gap-1">
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {courses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
            No courses published yet — check back soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
