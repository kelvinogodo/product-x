import { notFound } from "next/navigation";
import { InstructorForm } from "@/components/admin/instructor-form";
import { getInstructorById } from "@/lib/data/admin";

export default async function EditInstructorPage({ params }: { params: { id: string } }) {
  const instructor = await getInstructorById(params.id);
  if (!instructor) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit instructor</h1>
      <InstructorForm instructor={instructor} />
    </div>
  );
}
