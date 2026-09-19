"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/image-upload";
import { upsertTrack, type FormState } from "@/lib/actions/admin";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save track"}
    </Button>
  );
}

export function TrackForm({
  track,
  categories,
}: {
  track?: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category_id: string | null;
    cover_image_url: string | null;
  };
  categories: { id: string; name: string }[];
}) {
  const action = upsertTrack.bind(null, track?.id ?? null);
  const [state, formAction] = useFormState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={track?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={track?.slug} placeholder="e.g. frontend-development" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={track?.description ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select id="categoryId" name="categoryId" defaultValue={track?.category_id ?? ""}>
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="coverImageUrl">Cover image</Label>
        <ImageUpload name="coverImageUrl" bucket="covers" defaultValue={track?.cover_image_url ?? ""} />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
