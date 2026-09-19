"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock, PartyPopper, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/motion/confetti";
import { LessonContent } from "@/components/site/lesson-content";
import { LessonNotes } from "@/components/site/lesson-notes";
import { LessonQuiz } from "@/components/site/lesson-quiz";
import { ProgressBar } from "@/components/site/progress-bar";
import { markLessonComplete, markLessonIncomplete } from "@/lib/actions/enrollment";
import { useToast } from "@/hooks/use-toast";
import type { QuizQuestion } from "@/lib/data/learning";
import { toEmbedUrl } from "@/lib/video";
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
  quizzes,
  notes,
}: {
  courseSlug: string;
  courseTitle: string;
  lessons: Lesson[];
  completedLessonIds: string[];
  quizzes: Record<string, QuizQuestion[]>;
  notes: Record<string, string>;
}) {
  // Resume at the first lesson that isn't finished yet.
  const [activeId, setActiveId] = useState(
    () => lessons.find((l) => !completedLessonIds.includes(l.id))?.id ?? lessons[0]?.id
  );
  const [completed, setCompleted] = useState(() => new Set(completedLessonIds));
  const [celebrate, setCelebrate] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const topRef = useRef<HTMLDivElement>(null);

  const index = Math.max(0, lessons.findIndex((l) => l.id === activeId));
  const active = lessons[index];
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const percent = lessons.length === 0 ? 0 : Math.round((completed.size / lessons.length) * 100);
  const embedUrl = toEmbedUrl(active?.video_url);
  const quiz = active ? quizzes[active.id] : undefined;
  const hasQuiz = Boolean(quiz?.length);

  function select(id: string) {
    setActiveId(id);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Left/right arrow keys move between lessons (ignored while typing in a field).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" && next) setActiveId(next.id);
      if (e.key === "ArrowLeft" && prev) setActiveId(prev.id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  function toggle(lessonId: string) {
    const wasComplete = completed.has(lessonId);
    const apply = (set: Set<string>, complete: boolean) => {
      const copy = new Set(set);
      if (complete) copy.add(lessonId);
      else copy.delete(lessonId);
      return copy;
    };

    setCompleted((prevSet) => apply(prevSet, !wasComplete));

    startTransition(async () => {
      try {
        if (wasComplete) await markLessonIncomplete(lessonId, courseSlug);
        else await markLessonComplete(lessonId, courseSlug);
        router.refresh();

        if (!wasComplete) {
          const allDone = lessons.every((l) => l.id === lessonId || completed.has(l.id));
          if (allDone) {
            setCelebrate(true);
          } else if (next && lessonId === active?.id) {
            toast({ title: "Lesson complete", description: `Up next: ${next.title}` });
            setTimeout(() => select(next.id), 700);
          }
        }
      } catch {
        // Roll the optimistic update back.
        setCompleted((prevSet) => apply(prevSet, wasComplete));
        toast({ variant: "destructive", title: "Couldn't save progress", description: "Please try again." });
      }
    });
  }

  // A passed quiz completes the lesson server-side; mirror that here.
  function handlePassed(lessonId: string) {
    const allDone = lessons.every((l) => l.id === lessonId || completed.has(l.id));
    setCompleted((prevSet) => new Set(prevSet).add(lessonId));
    router.refresh();
    if (allDone) setCelebrate(true);
    else toast({ title: "Quiz passed!", description: "Lesson marked complete." });
  }

  if (!active) {
    return <p className="text-muted-foreground">This course has no lessons yet.</p>;
  }

  const isComplete = completed.has(active.id);

  return (
    <div ref={topRef} className="scroll-mt-24 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-3 gap-1.5">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Lesson {index + 1} of {lessons.length}
        </p>
      </div>

      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative overflow-hidden rounded-2xl border border-emerald-300/50 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-teal-500/10"
          >
            <Confetti pieces={48} />
            <Trophy className="mx-auto mb-2 h-9 w-9 text-amber-500" />
            <h2 className="text-xl font-bold">Course complete!</h2>
            <p className="mb-4 text-sm text-muted-foreground">You finished every lesson in {courseTitle}. Fantastic work.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="sm">
                <Link href="/courses">Find your next course</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCelebrate(false)}>
                Keep reviewing
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={active.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-1 text-sm font-medium text-primary">{courseTitle}</p>
              <h1 className="mb-6 text-3xl font-extrabold tracking-tight">{active.title}</h1>

              {embedUrl && (
                <div className="mb-8 aspect-video overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
                  <iframe
                    src={embedUrl}
                    className="h-full w-full"
                    title={active.title}
                    loading="lazy"
                    allow="fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                  />
                </div>
              )}

              {active.content ? (
                <LessonContent content={active.content} />
              ) : (
                <p className="text-muted-foreground">No written content for this lesson yet.</p>
              )}
            </motion.article>
          </AnimatePresence>

          {hasQuiz && quiz && (
            <LessonQuiz
              key={`quiz-${active.id}`}
              lessonId={active.id}
              courseSlug={courseSlug}
              questions={quiz}
              completed={isComplete}
              onPassed={() => handlePassed(active.id)}
            />
          )}
          <LessonNotes key={`notes-${active.id}`} lessonId={active.id} initial={notes[active.id] ?? ""} />

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <Button variant="outline" disabled={!prev} onClick={() => prev && select(prev.id)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>

            {hasQuiz && !isComplete ? (
              <p className="max-w-[16rem] text-center text-xs text-muted-foreground">Pass the quiz above to complete this lesson.</p>
            ) : (
              <motion.div whileTap={{ scale: 0.96 }}>
                <Button
                  variant={isComplete ? "secondary" : "default"}
                  disabled={pending}
                  onClick={() => toggle(active.id)}
                  className={cn("gap-2", !isComplete && "shadow-lg shadow-primary/25")}
                >
                  {isComplete ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Completed &mdash; undo
                    </>
                  ) : (
                    <>
                      <PartyPopper className="h-4 w-4" /> Mark as complete
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            <Button variant="outline" disabled={!next} onClick={() => next && select(next.id)} className="gap-2">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 hidden text-center text-xs text-muted-foreground lg:block">
            Tip: use the &larr; and &rarr; arrow keys to move between lessons.
          </p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center justify-between text-sm font-medium">
              <span>Your progress</span>
              <span className="tabular-nums">{percent}%</span>
            </div>
            <ProgressBar percent={percent} />
            <p className="mt-2 text-xs text-muted-foreground">
              {completed.size} of {lessons.length} lessons complete
            </p>
          </div>

          <ul className="max-h-[28rem] divide-y divide-border overflow-y-auto rounded-2xl border border-border bg-card">
            {lessons.map((lesson, i) => {
              const done = completed.has(lesson.id);
              const current = lesson.id === active.id;
              return (
                <li key={lesson.id}>
                  <button
                    onClick={() => select(lesson.id)}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "relative flex w-full items-center gap-3 p-4 text-left text-sm transition-colors hover:bg-accent/50",
                      current && "bg-accent/70"
                    )}
                  >
                    {current && (
                      <motion.span
                        layoutId="lesson-marker"
                        className="absolute inset-y-0 left-0 w-1 rounded-r bg-primary"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={done ? "done" : "todo"}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="flex"
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                      </motion.span>
                    </AnimatePresence>
                    <span className={cn("flex-1", current && "font-medium")}>
                      {i + 1}. {lesson.title}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDuration(lesson.duration_minutes)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}
