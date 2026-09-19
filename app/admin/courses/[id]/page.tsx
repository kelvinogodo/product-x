import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonList } from "@/components/admin/lesson-list";
import { getCourseById, getQuizCounts } from "@/lib/data/admin";

export default async function AdminCourseLessonsPage({ params }: { params: { id: string } }) {
  const course = await getCourseById(params.id);
  if (!course) notFound();
  const quizCounts = await getQuizCounts((course.lessons ?? []).map((l) => l.id));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/courses" className="hover:underline">Courses</Link> / {course.title}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{course.title} — lessons</h1>
          <Button asChild>
            <Link href={`/admin/courses/${course.id}/lessons/new`} className="gap-1">
              <Plus className="h-4 w-4" /> New lesson
            </Link>
          </Button>
        </div>
      </div>

      <LessonList
        courseId={course.id}
        initial={(course.lessons ?? []).map((l) => ({
          id: l.id,
          title: l.title,
          duration_minutes: l.duration_minutes,
          quiz_questions: quizCounts[l.id] ?? 0,
        }))}
      />

      {!course.published && (
        <Badge variant="outline">This course is a draft and won&apos;t appear publicly until published.</Badge>
      )}
    </div>
  );
}
