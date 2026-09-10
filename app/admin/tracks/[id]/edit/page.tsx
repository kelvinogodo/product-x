import { notFound } from "next/navigation";
import { TrackForm } from "@/components/admin/track-form";
import { getAllCategories, getTrackById } from "@/lib/data/admin";

export default async function EditTrackPage({ params }: { params: { id: string } }) {
  const [track, categories] = await Promise.all([getTrackById(params.id), getAllCategories()]);
  if (!track) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Edit track</h1>
      <TrackForm track={track} categories={categories} />
    </div>
  );
}
