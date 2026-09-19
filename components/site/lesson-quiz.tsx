"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { submitQuiz } from "@/lib/actions/enrollment";
import type { QuizQuestion } from "@/lib/data/learning";
import type { QuizResult } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

/**
 * Multiple-choice quiz. Answers are graded in the database (submit_quiz), so the correct answers are
 * never sent to the browser until after you submit. Scoring 60%+ completes the lesson.
 */
export function LessonQuiz({
  lessonId,
  courseSlug,
  questions,
  completed,
  onPassed,
}: {
  lessonId: string;
  courseSlug: string;
  questions: QuizQuestion[];
  completed: boolean;
  onPassed: () => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [result, setResult] = useState<QuizResult>();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const answered = answers.every((a) => a !== null);
  const locked = Boolean(result);

  function submit() {
    setError(undefined);
    startTransition(async () => {
      const res = await submitQuiz(lessonId, courseSlug, answers as number[]);
      if (res.error || !res.result) return setError(res.error ?? "Something went wrong.");
      setResult(res.result);
      if (res.result.passed) onPassed();
    });
  }

  function retry() {
    setAnswers(questions.map(() => null));
    setResult(undefined);
    setError(undefined);
  }

  return (
    <section aria-labelledby="quiz-heading" className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
          <HelpCircle className="h-5 w-5" />
        </span>
        <div>
          <h2 id="quiz-heading" className="text-lg font-bold tracking-tight">
            Check your understanding
          </h2>
          <p className="text-sm text-muted-foreground">
            {completed && !result ? "You've passed this quiz — feel free to retake it." : "Score 60% or more to complete this lesson."}
          </p>
        </div>
      </div>

      <ol className="space-y-6">
        {questions.map((q, qi) => {
          const r = result?.results[qi];
          return (
            <li key={q.id}>
              <fieldset disabled={locked}>
                <legend className="mb-3 text-sm font-semibold">
                  {qi + 1}. {q.prompt}
                </legend>
                <div className="grid gap-2">
                  {q.options.map((option, oi) => {
                    const selected = answers[qi] === oi;
                    const isCorrect = r && oi === r.correct_index;
                    const isWrongPick = r && selected && !r.correct;
                    return (
                      <label
                        key={oi}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-all",
                          !locked && "hover:border-primary/50 hover:bg-accent/40",
                          selected && !locked && "border-primary bg-accent/60 ring-1 ring-primary",
                          isCorrect && "border-emerald-500 bg-emerald-500/10",
                          isWrongPick && "border-destructive bg-destructive/10",
                          locked && !isCorrect && !isWrongPick && "opacity-60"
                        )}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={selected}
                          onChange={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                          className="h-4 w-4 accent-[hsl(var(--primary))]"
                        />
                        <span className="flex-1">{option}</span>
                        {isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="Correct answer" />}
                        {isWrongPick && <XCircle className="h-4 w-4 text-destructive" aria-label="Your answer was incorrect" />}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <AnimatePresence>
                {r?.explanation && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 overflow-hidden rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground"
                  >
                    {r.explanation}
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 space-y-3">
        <FormMessage error={error} />
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              role="status"
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4",
                result.passed ? "border-emerald-500/40 bg-emerald-500/10" : "border-amber-500/40 bg-amber-500/10"
              )}
            >
              <p className="font-semibold">
                {result.passed ? "Nice work! " : "Not quite. "}
                You scored {result.score} of {result.total}.
                {result.passed ? " Lesson complete." : " Review the explanations and try again."}
              </p>
              {!result.passed && (
                <Button variant="outline" size="sm" onClick={retry} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Try again
                </Button>
              )}
              {result.passed && (
                <Button variant="ghost" size="sm" onClick={retry} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Retake
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button onClick={submit} disabled={!answered || pending}>
                {pending ? "Grading..." : "Submit answers"}
              </Button>
              {!answered && <span className="ml-3 text-xs text-muted-foreground">Answer every question to submit.</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
