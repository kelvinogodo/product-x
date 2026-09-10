import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/site/course-card";
import { getTrackBySlug } from "@/lib/data/catalog";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const track = await getTrackBySlug(params.slug);
  return { title: track?.name ?? "Track" };
}

export default async function TrackDetailPage({ params }: { params: { slug: string } }) {
  const track = await getTrackBySlug(params.slug);
  if (!track) notFound();

  const publishedCourses = (track.courses ?? []).filter((c) => c.published);

  return (
    <div className="container py-12">
      <div className="mb-10 max-w-2xl">
        {track.category && <Badge variant="secondary">{track.category.name}</Badge>}
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{track.name}</h1>
        <p className="mt-3 text-muted-foreground">{track.description}</p>
      </div>

      <h2 className="mb-4 text-xl font-semibold">Courses in this track</h2>
      {publishedCourses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          No published courses in this track yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {publishedCourses.map((course) => (
            <CourseCard key={course.slug} course={{ ...course, category: track.category }} />
          ))}
        </div>
      )}
    </div>
  );
}
