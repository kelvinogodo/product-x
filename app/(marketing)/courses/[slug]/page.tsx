import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3, BookOpen, CheckCircle2, ChevronRight, Clock, HelpCircle, Lock, PlayCircle, Users } from "lucide-react";
import { Avatar } from "@/components/site/avatar";
import { getSiteUrl } from "@/lib/site-url";
import { Badge } from "@/components/ui/badge";
import { EnrollButton } from "@/components/site/enroll-button";
import { CourseCard } from "@/components/site/course-card";
import { CourseCover } from "@/components/site/course-cover";
import { ResourceRequestDialog } from "@/components/site/resource-request-dialog";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { getCourseBySlug, getRelatedCourses } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/data/profile";
import { isEnrolled } from "@/lib/data/dashboard";
import { levelClasses, pluralize } from "@/lib/course-ui";
import { cn, formatDuration } from "@/lib/utils";

/** Serialise JSON-LD so a "</script>" inside a course title can never break out of the tag. */
function safeJsonLd(data: unknown) {
  return JSON.stringify(data).split("<").join(String.fromCharCode(92) + "u003c");
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  return {
    title: course?.title ?? "Course",
    description: course?.description ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const [user, related] = await Promise.all([getCurrentUser(), getRelatedCourses(course)]);
  const enrolled = user ? await isEnrolled(user.id, course.id) : false;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description ?? undefined,
    url: `${getSiteUrl()}/courses/${course.slug}`,
    educationalLevel: course.level,
    provider: { "@type": "Organization", name: "product x", url: getSiteUrl() },
    ...(course.instructor ? { instructor: { "@type": "Person", name: course.instructor.name } } : {}),
    ...(course.learner_count > 0 ? { numberOfEnrolledStudents: course.learner_count } : {}),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }} />
      {/* Header band */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/70 to-background">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 animate-blob-drift rounded-full bg-primary/15 blur-3xl" />
        <div className="container relative py-12">
          <Reveal direction="none" duration={0.4}>
            <nav className="mb-5 flex flex-wrap items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/courses" className="hover:text-foreground">
                Courses
              </Link>
              {course.category && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <Link href={`/courses?category=${course.category.slug}`} className="hover:text-foreground">
                    {course.category.name}
                  </Link>
                </>
              )}
            </nav>
          </Reveal>

          <Reveal delay={0.05} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {course.category && <Badge variant="secondary">{course.category.name}</Badge>}
              <Badge variant="outline" className={cn("capitalize", levelClasses[course.level])}>
                {course.level}
              </Badge>
              {course.track && (
                <Link href={`/tracks/${course.track.slug}`} className="text-sm font-medium text-primary hover:underline">
                  Part of {course.track.name}
                </Link>
              )}
            </div>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">{course.title}</h1>
            <p className="max-w-2xl text-lg text-muted-foreground">{course.description}</p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {formatDuration(course.duration_minutes)}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> {pluralize(course.lesson_count, "lesson")}
              </span>
              <span className="flex items-center gap-1.5 capitalize">
                <BarChart3 className="h-4 w-4" /> {course.level}
              </span>
              {course.learner_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {course.learner_count.toLocaleString()} enrolled
                </span>
              )}
            </div>
            {course.instructor && (
              <p className="text-sm text-muted-foreground">
                Created by <span className="font-medium text-foreground">{course.instructor.name}</span>
              </p>
            )}
          </Reveal>
        </div>
      </div>

      <div className="container grid gap-10 py-12 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-12">
          {course.outcomes.length > 0 && (
            <section>
              <h2 className="mb-5 text-2xl font-bold tracking-tight">What you&apos;ll learn</h2>
              <Stagger className="grid gap-3 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2" stagger={0.06}>
                {course.outcomes.map((outcome) => (
                  <StaggerItem key={outcome} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                    <span>{outcome}</span>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          )}

          <section>
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Curriculum</h2>
              <p className="text-sm text-muted-foreground">
                {pluralize(course.lessons.length, "lesson")} &middot; {formatDuration(course.duration_minutes)}
              </p>
            </div>
            <Stagger className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card" stagger={0.05}>
              {course.lessons.map((lesson, i) => (
                <StaggerItem key={lesson.id}>
                  <div className="group flex items-center gap-4 p-4 transition-colors hover:bg-accent/50">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      {lesson.title}
                      {lesson.quiz_questions > 0 && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                          <HelpCircle className="h-3 w-3" /> Quiz
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(lesson.duration_minutes)}
                    </span>
                    {enrolled ? (
                      <PlayCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground/60" />
                    )}
                  </div>
                </StaggerItem>
              ))}
              {course.lessons.length === 0 && (
                <div className="p-6 text-sm text-muted-foreground">Curriculum coming soon.</div>
              )}
            </Stagger>
          </section>

          {course.instructor && (
            <section>
              <h2 className="mb-5 text-2xl font-bold tracking-tight">Your instructor</h2>
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
                <Avatar name={course.instructor.name} src={course.instructor.avatar_url} size={56} />
                <div>
                  <p className="font-semibold">{course.instructor.name}</p>
                  {course.instructor.bio && <p className="mt-1 text-sm text-muted-foreground">{course.instructor.bio}</p>}
                </div>
              </div>
            </section>
          )}
        </div>

        <aside>
          <Reveal delay={0.15} className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-primary/5">
              <CourseCover
                slug={course.slug}
                title={course.title}
                coverUrl={course.cover_image_url}
                categorySlug={course.category?.slug}
                className="aspect-video w-full"
                priority
              />
              <div className="space-y-4 p-6">
                <EnrollButton
                  courseId={course.id}
                  courseSlug={course.slug}
                  isEnrolled={enrolled}
                  isAuthenticated={Boolean(user)}
                />
                <ResourceRequestDialog courseId={course.id} courseTitle={course.title} />
                <ul className="space-y-2.5 border-t border-border pt-4 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> {formatDuration(course.duration_minutes)} of content
                  </li>
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> {pluralize(course.lesson_count, "lesson")}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Track your progress
                  </li>
                </ul>
              </div>
            </div>
          </Reveal>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container pb-8">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">More in {course.category?.name}</h2>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <StaggerItem key={item.slug}>
                <CourseCard course={item} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </div>
  );
}
