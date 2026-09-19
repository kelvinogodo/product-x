import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronRight, Clock, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/site/course-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { getPublishedCourses, getTrackBySlug } from "@/lib/data/catalog";
import { pluralize } from "@/lib/course-ui";
import { formatDuration } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const track = await getTrackBySlug(params.slug);
  return { title: track?.name ?? "Track", description: track?.description ?? undefined };
}

export default async function TrackDetailPage({ params }: { params: { slug: string } }) {
  const track = await getTrackBySlug(params.slug);
  if (!track) notFound();

  // Reuse the catalog query so cards get lesson/learner counts and category slugs.
  const publishedIds = new Set((track.courses ?? []).filter((c) => c.published).map((c) => c.id));
  const courses = (await getPublishedCourses()).filter((c) => publishedIds.has(c.id));
  // Beginner → advanced, then by title, gives a sensible default learning order.
  const order = { beginner: 0, intermediate: 1, advanced: 2 } as const;
  courses.sort((a, b) => order[a.level] - order[b.level] || a.title.localeCompare(b.title));

  const totalMinutes = courses.reduce((sum, c) => sum + c.duration_minutes, 0);
  const totalLessons = courses.reduce((sum, c) => sum + (c.lesson_count ?? 0), 0);

  return (
    <div>
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/70 to-background">
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 animate-blob-drift rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="container relative py-14">
          <Reveal direction="none" duration={0.4}>
            <nav className="mb-5 flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/tracks" className="hover:text-foreground">
                Tracks
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground">{track.name}</span>
            </nav>
          </Reveal>
          <Reveal delay={0.05} className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Route className="h-4 w-4" />
              </span>
              {track.category && <Badge variant="secondary">{track.category.name}</Badge>}
            </div>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">{track.name}</h1>
            <p className="text-lg text-muted-foreground">{track.description}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Route className="h-4 w-4" /> {pluralize(courses.length, "course")}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> {pluralize(totalLessons, "lesson")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {formatDuration(totalMinutes)}
              </span>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="container py-12">
        <h2 className="mb-8 text-2xl font-bold tracking-tight">Your learning path</h2>
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No published courses in this track yet.
          </div>
        ) : (
          <Stagger className="relative space-y-6" stagger={0.12}>
            <div className="absolute bottom-6 left-[19px] top-6 hidden w-px bg-gradient-to-b from-primary/60 via-primary/25 to-transparent sm:block" />
            {courses.map((course, i) => (
              <StaggerItem key={course.slug} className="relative sm:pl-14">
                <span className="absolute left-0 top-6 hidden h-10 w-10 place-items-center rounded-full border-4 border-background bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/30 sm:grid">
                  {i + 1}
                </span>
                <CourseCard course={course} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
