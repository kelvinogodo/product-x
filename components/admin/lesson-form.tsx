"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertLesson, type FormState } from "@/lib/actions/admin";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save lesson"}
    </Button>
  );
}

export function LessonForm({
  courseId,
  lesson,
  nextPosition,
}: {
  courseId: string;
  lesson?: {
    id: string;
    title: string;
    content: string | null;
    video_url: string | null;
    position: number;
    duration_minutes: number;
  };
  nextPosition: number;
}) {
  const action = upsertLesson.bind(null, lesson?.id ?? null, courseId);
  const [state, formAction] = useFormState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={lesson?.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" name="content" defaultValue={lesson?.content ?? ""} rows={6} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="videoUrl">Video embed URL</Label>
        <Input id="videoUrl" name="videoUrl" type="url" defaultValue={lesson?.video_url ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            name="position"
            type="number"
            min={0}
            defaultValue={lesson?.position ?? nextPosition}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={0}
            defaultValue={lesson?.duration_minutes ?? 15}
            required
          />
        </div>
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
