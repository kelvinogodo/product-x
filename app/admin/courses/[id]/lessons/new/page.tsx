import { notFound } from "next/navigation";
import { LessonForm } from "@/components/admin/lesson-form";
import { getCourseById } from "@/lib/data/admin";

export default async function NewLessonPage({ params }: { params: { id: string } }) {
  const course = await getCourseById(params.id);
  if (!course) notFound();

  const nextPosition = (course.lessons ?? []).length + 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">New lesson — {course.title}</h1>
      <LessonForm courseId={course.id} nextPosition={nextPosition} />
    </div>
  );
}
