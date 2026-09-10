"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/site/progress-bar";
import { markLessonComplete, markLessonIncomplete } from "@/lib/actions/enrollment";
import { cn, formatDuration } from "@/lib/utils";

type Lesson = {
  id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
};

export function LessonViewer({
  courseSlug,
  courseTitle,
  lessons,
  completedLessonIds,
}: {
  courseSlug: string;
  courseTitle: string;
  lessons: Lesson[];
  completedLessonIds: string[];
}) {
  const [activeId, setActiveId] = useState(lessons[0]?.id);
  const [completed, setCompleted] = useState(new Set(completedLessonIds));
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const active = lessons.find((l) => l.id === activeId) ?? lessons[0];
  const percent = lessons.length === 0 ? 0 : Math.round((completed.size / lessons.length) * 100);

  function toggle(lessonId: string) {
    const isComplete = completed.has(lessonId);
    setCompleted((prev) => {
      const next = new Set(prev);
      isComplete ? next.delete(lessonId) : next.add(lessonId);
      return next;
    });
    startTransition(async () => {
      if (isComplete) await markLessonIncomplete(lessonId, courseSlug);
      else await markLessonComplete(lessonId, courseSlug);
      router.refresh();
    });
  }

  if (!active) {
    return <p className="text-muted-foreground">This course has no lessons yet.</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-1 text-2xl font-bold tracking-tight">{active.title}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{courseTitle}</p>

        {active.video_url && (
          <div className="mb-6 aspect-video overflow-hidden rounded-lg bg-black">
            <iframe src={active.video_url} className="h-full w-full" allowFullScreen title={active.title} />
          </div>
        )}

        <div className="prose prose-neutral max-w-none whitespace-pre-wrap text-sm leading-relaxed">
          {active.content || "No written content for this lesson yet."}
        </div>

        <Button
          className="mt-8"
          variant={completed.has(active.id) ? "secondary" : "default"}
          disabled={pending}
          onClick={() => toggle(active.id)}
        >
          {completed.has(active.id) ? "Mark as incomplete" : "Mark as complete"}
        </Button>
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-medium">
            <span>Your progress</span>
            <span>{percent}%</span>
          </div>
          <ProgressBar percent={percent} />
        </div>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {lessons.map((lesson, i) => (
            <li key={lesson.id}>
              <button
                onClick={() => setActiveId(lesson.id)}
                className={cn(
                  "flex w-full items-center gap-3 p-4 text-left text-sm hover:bg-muted/50",
                  lesson.id === active.id && "bg-muted"
                )}
              >
                {completed.has(lesson.id) ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="flex-1">
                  {i + 1}. {lesson.title}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(lesson.duration_minutes)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
