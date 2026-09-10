import { notFound } from "next/navigation";
import { LessonForm } from "@/components/admin/lesson-form";
import { getCourseById, getLessonById } from "@/lib/data/admin";

export default async function EditLessonPage({ params }: { params: { id: string; lessonId: string } }) {
  const [course, lesson] = await Promise.all([getCourseById(params.id), getLessonById(params.lessonId)]);
  if (!course || !lesson) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit lesson — {course.title}</h1>
      <LessonForm courseId={course.id} lesson={lesson} nextPosition={lesson.position} />
    </div>
  );
}
