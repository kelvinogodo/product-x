import Link from "next/link";
import { ArrowRight, Award, BookMarked, CheckCircle2, Clock, Compass, Flame, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CourseCover } from "@/components/site/course-cover";
import { ProgressBar, ProgressRing } from "@/components/site/progress-bar";
import { getCurrentUser } from "@/lib/data/profile";
import { getDashboardData } from "@/lib/data/dashboard";
import { getUserCertificates } from "@/lib/data/learning";
import { formatDuration } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [{ courses, resume, totals, streak }, certificates] = await Promise.all([
    getDashboardData(user.id),
    getUserCertificates(user.id),
  ]);
  const firstName = user.profile.full_name?.split(" ")[0];

  const stats = [
    { label: "Courses enrolled", value: totals.enrolled, icon: BookMarked },
    { label: "Lessons completed", value: totals.lessonsCompleted, icon: CheckCircle2 },
    { label: streak.best > streak.current ? `Day streak (best ${streak.best})` : "Day streak", value: streak.current, icon: Flame },
    { label: "Minutes learned", value: totals.minutesLearned, icon: Clock },
  ];

  return (
    <div className="space-y-10">
      <Reveal direction="none">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome back{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <p className="text-muted-foreground">
          {resume ? "Pick up right where you left off." : "Ready to start something new?"}
        </p>
      </Reveal>

      {courses.length > 0 && (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" immediate>
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <stat.icon className="h-5 w-5" />
                </span>
                <div>
                  <CountUp value={stat.value} className="font-display text-2xl font-extrabold" />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {resume && (
        <Reveal>
          <Link
            href={`/dashboard/courses/${resume.slug}/learn`}
            className="group grid overflow-hidden rounded-3xl border border-border bg-card shadow-lg shadow-primary/5 transition-all hover:shadow-xl hover:shadow-primary/10 md:grid-cols-[18rem_1fr]"
          >
            <CourseCover
              slug={resume.slug}
              title={resume.title}
              coverUrl={resume.cover_image_url}
              categorySlug={resume.category?.slug}
              className="h-44 w-full md:h-full"
            />
            <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
              <div className="flex items-center gap-2">
                <Badge>Continue learning</Badge>
                {resume.category && <Badge variant="secondary">{resume.category.name}</Badge>}
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{resume.title}</h2>
              <div className="space-y-2">
                <ProgressBar percent={resume.progress.percent} />
                <p className="text-sm text-muted-foreground">
                  {resume.progress.completed} of {resume.progress.total} lessons &middot; {resume.progress.percent}% complete
                </p>
              </div>
              <span className="inline-flex items-center gap-2 font-medium text-primary">
                <PlayCircle className="h-5 w-5" /> Resume
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </Reveal>
      )}

      {certificates.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-xl font-bold tracking-tight">Your certificates</h2>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" immediate>
            {certificates.map((cert) => (
              <StaggerItem key={cert.id}>
                <Link
                  href={`/certificates/${cert.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                    <Award className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-semibold">{cert.course_title}</p>
                    <p className="text-xs text-muted-foreground">
                      Issued {new Date(cert.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <section className="space-y-5">
        <h2 className="text-xl font-bold tracking-tight">Your courses</h2>
        {courses.length === 0 ? (
          <Reveal>
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card/50 p-14 text-center">
              <span className="grid h-16 w-16 animate-float place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-primary/30">
                <Compass className="h-8 w-8" />
              </span>
              <div>
                <p className="text-lg font-semibold">Your learning journey starts here</p>
                <p className="text-sm text-muted-foreground">You haven&apos;t enrolled in any courses yet.</p>
              </div>
              <Button asChild className="rounded-full px-6">
                <Link href="/courses">Browse courses</Link>
              </Button>
            </div>
          </Reveal>
        ) : (
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" immediate>
            {courses.map((course) => (
              <StaggerItem key={course.slug}>
                <Link
                  href={`/dashboard/courses/${course.slug}/learn`}
                  className="group block h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
                >
                  <CourseCover
                    slug={course.slug}
                    title={course.title}
                    coverUrl={course.cover_image_url}
                    categorySlug={course.category?.slug}
                    className="aspect-[16/9] w-full"
                  />
                  <div className="flex items-center gap-4 p-5">
                    <div className="relative shrink-0">
                      <ProgressRing percent={course.progress.percent} />
                      <span className="absolute inset-0 grid place-items-center text-xs font-bold tabular-nums">
                        {course.progress.percent}%
                      </span>
                    </div>
                    <div className="min-w-0">
                      {course.category && <p className="text-xs font-medium text-primary">{course.category.name}</p>}
                      <h3 className="line-clamp-1 font-semibold tracking-tight">{course.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {course.progress.completed}/{course.progress.total} lessons &middot;{" "}
                        {formatDuration(course.duration_minutes)}
                      </p>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </div>
  );
}
