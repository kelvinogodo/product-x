import { InstructorForm } from "@/components/admin/instructor-form";

export default function NewInstructorPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">New instructor</h1>
      <InstructorForm />
    </div>
  );
}
