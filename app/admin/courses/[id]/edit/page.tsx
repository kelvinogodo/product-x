import { notFound } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";
import { getAllCategories, getAllTracks, getCourseById } from "@/lib/data/admin";

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const [course, categories, tracks] = await Promise.all([
    getCourseById(params.id),
    getAllCategories(),
    getAllTracks(),
  ]);
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit course</h1>
      <CourseForm course={course} categories={categories} tracks={tracks} />
    </div>
  );
}
