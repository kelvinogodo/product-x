import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/site/progress-bar";
import { getCurrentUser } from "@/lib/data/profile";
import { getCourseProgress, getEnrolledCourses } from "@/lib/data/dashboard";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const enrollments = await getEnrolledCourses(user.id);
  const withProgress = await Promise.all(
    enrollments
      .filter((e) => e.course)
      .map(async (e) => ({
        ...e,
        progress: await getCourseProgress(user.id, e.course!.id),
      }))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back{user.profile.full_name ? `, ${user.profile.full_name}` : ""}
        </h1>
        <p className="text-muted-foreground">Pick up where you left off.</p>
      </div>

      {withProgress.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <p className="text-muted-foreground">You haven&apos;t enrolled in any courses yet.</p>
            <Link href="/courses" className="text-primary hover:underline">
              Browse courses
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {withProgress.map(({ course, progress }) => (
            <Link key={course!.slug} href={`/dashboard/courses/${course!.slug}/learn`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                  {course!.cover_image_url ? (
                    <Image src={course!.cover_image_url} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent text-2xl font-bold text-primary/40">
                      {course!.title.slice(0, 1)}
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  {course!.category && <Badge variant="secondary">{course!.category.name}</Badge>}
                  <CardTitle className="line-clamp-1">{course!.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ProgressBar percent={progress.percent} />
                  <p className="text-xs text-muted-foreground">
                    {progress.completed} of {progress.total} lessons complete
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
