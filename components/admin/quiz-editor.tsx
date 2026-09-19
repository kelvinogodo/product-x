"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { saveQuiz } from "@/lib/actions/admin";
import type { AdminQuizQuestion } from "@/lib/data/admin";

const blank = (): AdminQuizQuestion => ({ prompt: "", options: ["", ""], correct_index: 0, explanation: "" });

export function QuizEditor({
  lessonId,
  courseId,
  initial,
}: {
  lessonId: string;
  courseId: string;
  initial: AdminQuizQuestion[];
}) {
  const [questions, setQuestions] = useState<AdminQuizQuestion[]>(initial.length ? initial : [blank()]);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const update = (i: number, patch: Partial<AdminQuizQuestion>) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  function submit(clear = false) {
    setError(undefined);
    startTransition(async () => {
      const payload = clear
        ? []
        : questions.map((q) => ({ ...q, explanation: q.explanation || undefined }));
      const res = await saveQuiz(lessonId, courseId, JSON.stringify(payload));
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      {questions.map((q, i) => (
        <fieldset key={i} className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold">Question {i + 1}</legend>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove question ${i + 1}`}
              onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`prompt-${i}`}>Prompt</Label>
            <Input id={`prompt-${i}`} value={q.prompt} maxLength={500} onChange={(e) => update(i, { prompt: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Options (select the correct one)</Label>
            {q.options.map((option, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${i}`}
                  checked={q.correct_index === oi}
                  onChange={() => update(i, { correct_index: oi })}
                  aria-label={`Option ${oi + 1} is correct`}
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                />
                <Input
                  value={option}
                  maxLength={200}
                  aria-label={`Option ${oi + 1}`}
                  onChange={(e) => update(i, { options: q.options.map((o, idx) => (idx === oi ? e.target.value : o)) })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={q.options.length <= 2}
                  aria-label={`Remove option ${oi + 1}`}
                  onClick={() =>
                    update(i, {
                      options: q.options.filter((_, idx) => idx !== oi),
                      correct_index: q.correct_index > oi ? q.correct_index - 1 : Math.min(q.correct_index, q.options.length - 2),
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {q.options.length < 6 && (
              <Button type="button" variant="outline" size="sm" onClick={() => update(i, { options: [...q.options, ""] })} className="gap-1">
                <Plus className="h-4 w-4" /> Add option
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`explanation-${i}`}>Explanation (shown after submitting)</Label>
            <Input
              id={`explanation-${i}`}
              value={q.explanation}
              maxLength={500}
              onChange={(e) => update(i, { explanation: e.target.value })}
            />
          </div>
        </fieldset>
      ))}

      <Button
        type="button"
        variant="outline"
        disabled={questions.length >= 20}
        onClick={() => setQuestions((qs) => [...qs, blank()])}
        className="gap-2"
      >
        <Plus className="h-4 w-4" /> Add question
      </Button>

      <FormMessage error={error} />

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => submit()} disabled={pending || questions.length === 0}>
          {pending ? "Saving..." : "Save quiz"}
        </Button>
        {initial.length > 0 && (
          <Button variant="outline" onClick={() => submit(true)} disabled={pending}>
            Remove quiz
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Learners pass with 60% or more. A lesson with a quiz can only be completed by passing it.
      </p>
    </div>
  );
}
