import { CourseForm } from "@/components/admin/course-form";
import { getAllCategories, getAllTracks } from "@/lib/data/admin";

export default async function NewCoursePage() {
  const [categories, tracks] = await Promise.all([getAllCategories(), getAllTracks()]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">New course</h1>
      <CourseForm categories={categories} tracks={tracks} />
    </div>
  );
}
