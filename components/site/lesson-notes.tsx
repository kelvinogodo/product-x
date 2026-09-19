"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, NotebookPen } from "lucide-react";
import { saveNote } from "@/lib/actions/enrollment";

type Status = "idle" | "saving" | "saved" | "error";

/** Private per-lesson notes that autosave shortly after you stop typing. */
export function LessonNotes({ lessonId, initial }: { lessonId: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<Status>("idle");
  const lastSaved = useRef(initial);
  const latest = useRef(initial);
  latest.current = value;

  useEffect(() => {
    if (value === lastSaved.current) return;
    setStatus("saving");
    const timer = setTimeout(async () => {
      const res = await saveNote(lessonId, value);
      if (res.error) return setStatus("error");
      lastSaved.current = value;
      setStatus("saved");
    }, 900);
    return () => clearTimeout(timer);
  }, [value, lessonId]);

  // Flush an unsaved note if the learner navigates to another lesson right away.
  useEffect(() => {
    return () => {
      if (latest.current !== lastSaved.current) void saveNote(lessonId, latest.current);
    };
  }, [lessonId]);

  return (
    <section aria-labelledby="notes-heading" className="mt-8 rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="notes-heading" className="flex items-center gap-2 text-sm font-semibold">
          <NotebookPen className="h-4 w-4 text-primary" /> Your notes
          <span className="text-xs font-normal text-muted-foreground">(only you can see these)</span>
        </h2>
        <span role="status" aria-live="polite" className="flex items-center gap-1 text-xs text-muted-foreground">
          {status === "saving" && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </>
          )}
          {status === "saved" && (
            <>
              <Check className="h-3 w-3 text-emerald-500" /> Saved
            </>
          )}
          {status === "error" && <span className="text-destructive">Couldn&apos;t save — will retry on your next edit</span>}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={5000}
        rows={4}
        aria-label="Your notes for this lesson"
        placeholder="Jot down anything you want to remember..."
        className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </section>
  );
}
