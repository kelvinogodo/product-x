import Link from "next/link";
import { notFound } from "next/navigation";
import { QuizEditor } from "@/components/admin/quiz-editor";
import { getCourseById, getLessonById, getLessonQuiz } from "@/lib/data/admin";

export default async function LessonQuizPage({ params }: { params: { id: string; lessonId: string } }) {
  const [course, lesson] = await Promise.all([getCourseById(params.id), getLessonById(params.lessonId)]);
  if (!course || !lesson || lesson.course_id !== course.id) notFound();
  const quiz = await getLessonQuiz(lesson.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href={`/admin/courses/${course.id}`} className="hover:underline">
            {course.title}
          </Link>{" "}
          / {lesson.title}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Quiz</h1>
      </div>
      <QuizEditor lessonId={lesson.id} courseId={course.id} initial={quiz} />
    </div>
  );
}
