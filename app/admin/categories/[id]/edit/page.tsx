import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { getCategoryById } from "@/lib/data/admin";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await getCategoryById(params.id);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit category</h1>
      <CategoryForm category={category} />
    </div>
  );
}
