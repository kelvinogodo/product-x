import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EnrollButton } from "@/components/site/enroll-button";
import { ResourceRequestDialog } from "@/components/site/resource-request-dialog";
import { getCourseBySlug } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/data/profile";
import { isEnrolled } from "@/lib/data/dashboard";
import { formatDuration } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  return { title: course?.title ?? "Course" };
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  const enrolled = user ? await isEnrolled(user.id, course.id) : false;

  return (
    <div className="container grid gap-10 py-12 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-muted">
          {course.cover_image_url ? (
            <Image src={course.cover_image_url} alt="" fill className="object-cover" priority />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent text-5xl font-bold text-primary/40">
              {course.title.slice(0, 1)}
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {course.category && <Badge variant="secondary">{course.category.name}</Badge>}
          <Badge variant="outline" className="capitalize">{course.level}</Badge>
          {course.track && (
            <Link href={`/tracks/${course.track.slug}`} className="text-sm text-primary hover:underline">
              Part of {course.track.name}
            </Link>
          )}
        </div>

        <h1 className="mb-3 text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="mb-8 text-muted-foreground">{course.description}</p>

        <h2 className="mb-4 text-xl font-semibold">Curriculum</h2>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {(course.lessons ?? []).map((lesson, i) => (
            <li key={lesson.id} className="flex items-center gap-3 p-4">
              <PlayCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">
                {i + 1}. {lesson.title}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(lesson.duration_minutes)}
              </span>
            </li>
          ))}
          {(course.lessons ?? []).length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">Curriculum coming soon.</li>
          )}
        </ul>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-border p-6">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> {formatDuration(course.duration_minutes)} total
          </div>
          <EnrollButton
            courseId={course.id}
            courseSlug={course.slug}
            isEnrolled={enrolled}
            isAuthenticated={Boolean(user)}
          />
          <div className="mt-3">
            <ResourceRequestDialog courseId={course.id} courseTitle={course.title} />
          </div>
        </div>
      </aside>
    </div>
  );
}
