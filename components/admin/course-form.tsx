"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/image-upload";
import { upsertCourse, type FormState } from "@/lib/actions/admin";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save course"}
    </Button>
  );
}

export function CourseForm({
  course,
  categories,
  tracks,
  instructors,
}: {
  course?: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    category_id: string | null;
    track_id: string | null;
    cover_image_url: string | null;
    level: string;
    duration_minutes: number;
    published: boolean;
    outcomes: string[];
    instructor_id: string | null;
    featured: boolean;
  };
  categories: { id: string; name: string }[];
  tracks: { id: string; name: string }[];
  instructors: { id: string; name: string }[];
}) {
  const action = upsertCourse.bind(null, course?.id ?? null);
  const [state, formAction] = useFormState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={course?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={course?.slug} placeholder="e.g. react-in-depth" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={course?.description ?? ""} rows={4} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select id="categoryId" name="categoryId" defaultValue={course?.category_id ?? ""}>
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="trackId">Track</Label>
          <Select id="trackId" name="trackId" defaultValue={course?.track_id ?? ""}>
            <option value="">No track</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select id="level" name="level" defaultValue={course?.level ?? "beginner"}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={0}
            defaultValue={course?.duration_minutes ?? 0}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="coverImageUrl">Cover image</Label>
        <ImageUpload name="coverImageUrl" bucket="covers" defaultValue={course?.cover_image_url ?? ""} placeholder="https://... or upload (empty = generated cover)" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="instructorId">Instructor</Label>
        <Select id="instructorId" name="instructorId" defaultValue={course?.instructor_id ?? ""}>
          <option value="">No instructor</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="outcomes">What learners will get (one per line, up to 8)</Label>
        <Textarea
          id="outcomes"
          name="outcomes"
          defaultValue={(course?.outcomes ?? []).join("\n")}
          rows={5}
          placeholder={"Build a responsive layout\nUnderstand the box model"}
        />
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <input
            id="published"
            name="published"
            type="checkbox"
            defaultChecked={course?.published ?? false}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor="published">Published</Label>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            defaultChecked={course?.featured ?? false}
            className="h-4 w-4 rounded border-input"
          />
          <Label htmlFor="featured">Featured on the home page</Label>
        </div>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
