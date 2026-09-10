import { TrackForm } from "@/components/admin/track-form";
import { getAllCategories } from "@/lib/data/admin";

export default async function NewTrackPage() {
  const categories = await getAllCategories();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">New track</h1>
      <TrackForm categories={categories} />
    </div>
  );
}
