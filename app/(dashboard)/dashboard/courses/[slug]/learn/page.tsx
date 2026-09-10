import { notFound, redirect } from "next/navigation";
import { LessonViewer } from "@/components/site/lesson-viewer";
import { getCourseBySlug } from "@/lib/data/catalog";
import { getCurrentUser } from "@/lib/data/profile";
import { getCompletedLessonIds, isEnrolled } from "@/lib/data/dashboard";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  return { title: course ? `Learn — ${course.title}` : "Learn" };
}

export default async function LearnPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/courses/${params.slug}`);

  const enrolled = await isEnrolled(user.id, course.id);
  if (!enrolled) redirect(`/courses/${params.slug}`);

  const completedIds = await getCompletedLessonIds(user.id, course.id);
  const lessons = (course.lessons ?? []).sort(
    (a: { position: number }, b: { position: number }) => a.position - b.position
  );

  return (
    <LessonViewer
      courseSlug={course.slug}
      courseTitle={course.title}
      lessons={lessons}
      completedLessonIds={[...completedIds]}
    />
  );
}
