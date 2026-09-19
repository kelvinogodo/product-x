import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { CourseCard } from "@/components/site/course-card";
import { SectionHeading } from "@/components/site/section-heading";
import { Benefits, CategoryGrid, CtaBanner, HowItWorks, TracksSection } from "@/components/site/home-sections";
import { Faq } from "@/components/site/faq";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getCatalogSummary, getCategories, getFeaturedCourses, getPublishedCourses, getTracks } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/data/profile";

export default async function HomePage() {
  const [featured, allCourses, categories, tracks, summary, user] = await Promise.all([
    getFeaturedCourses(6),
    getPublishedCourses(),
    getCategories(),
    getTracks(),
    getCatalogSummary(),
    getCurrentUser(),
  ]);

  const categoryCounts = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    count: allCourses.filter((course) => course.category?.slug === category.slug).length,
  }));

  return (
    <>
      <Hero
        categories={categories}
        stats={
          summary.courses === 0
            ? []
            : [
                { label: "Courses", value: summary.courses },
                { label: "Lessons", value: summary.lessons },
                { label: "Hours of content", value: summary.hours, suffix: "+" },
                { label: "Learning tracks", value: summary.tracks },
              ]
        }
      />

      <CategoryGrid categories={categoryCounts} />

      <section className="container py-12">
        <SectionHeading
          eyebrow="Featured"
          title="Start with a fan favourite"
          description="Hand-picked courses to help you get going."
          action={
            <Button variant="ghost" asChild>
              <Link href="/courses" className="gap-1">
                Browse all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />
        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No courses published yet — check back soon.
          </div>
        ) : (
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <StaggerItem key={course.slug}>
                <CourseCard course={course} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <TracksSection tracks={tracks} />
      <HowItWorks />
      <Benefits />
      <Faq />
      <CtaBanner isAuthenticated={Boolean(user)} />
    </>
  );
}
