import { notFound } from "next/navigation";
import { CourseForm } from "@/components/admin/course-form";
import { getAllCategories, getAllInstructors, getAllTracks, getCourseById } from "@/lib/data/admin";

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const [course, categories, tracks, instructors] = await Promise.all([
    getCourseById(params.id),
    getAllCategories(),
    getAllTracks(),
    getAllInstructors(),
  ]);
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit course</h1>
      <CourseForm course={course} categories={categories} tracks={tracks} instructors={instructors} />
    </div>
  );
}
