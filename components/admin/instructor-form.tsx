"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { ImageUpload } from "@/components/admin/image-upload";
import { upsertInstructor, type FormState } from "@/lib/actions/admin";

export function InstructorForm({
  instructor,
}: {
  instructor?: { id: string; slug: string; name: string; bio: string | null; avatar_url: string | null };
}) {
  const action = upsertInstructor.bind(null, instructor?.id ?? null);
  const [state, formAction] = useFormState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={instructor?.name} required maxLength={100} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={instructor?.slug} placeholder="e.g. jane-doe" required maxLength={100} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={instructor?.bio ?? ""} rows={4} maxLength={1000} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Photo</Label>
        <ImageUpload name="avatarUrl" bucket="covers" folder="instructors" defaultValue={instructor?.avatar_url ?? ""} />
      </div>
      <FormMessage error={state?.error} />
      <SubmitButton pendingText="Saving...">Save instructor</SubmitButton>
    </form>
  );
}
