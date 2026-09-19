"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, Edit, GripVertical, HelpCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteLesson, reorderLessons } from "@/lib/actions/admin";
import { useToast } from "@/hooks/use-toast";
import { formatDuration } from "@/lib/utils";

export type AdminLessonRow = { id: string; title: string; duration_minutes: number; quiz_questions: number };

function Row({
  lesson,
  index,
  total,
  courseId,
  onMove,
}: {
  lesson: AdminLessonRow;
  index: number;
  total: number;
  courseId: string;
  onMove: (from: number, to: number) => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={lesson}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
      whileDrag={{ scale: 1.02, boxShadow: "0 12px 32px rgba(0,0,0,0.15)", zIndex: 10 }}
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label={`Drag to reorder ${lesson.title}`}
        className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-sm tabular-nums text-muted-foreground">{index + 1}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{lesson.title}</p>
        <p className="text-xs text-muted-foreground">{formatDuration(lesson.duration_minutes)}</p>
      </div>
      {lesson.quiz_questions > 0 && (
        <span className="hidden items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground sm:inline-flex">
          <HelpCircle className="h-3 w-3" /> {lesson.quiz_questions}
        </span>
      )}
      <div className="flex items-center">
        <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label="Move up">
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={index === total - 1}
          onClick={() => onMove(index, index + 1)}
          aria-label="Move down"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" asChild aria-label="Edit quiz" title="Edit quiz">
          <Link href={`/admin/courses/${courseId}/lessons/${lesson.id}/quiz`}>
            <HelpCircle className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" asChild aria-label="Edit lesson">
          <Link href={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}>
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
        <DeleteButton onDelete={deleteLesson.bind(null, lesson.id, courseId)} confirmMessage={`Delete lesson "${lesson.title}"?`} />
      </div>
    </Reorder.Item>
  );
}

export function LessonList({ courseId, initial }: { courseId: string; initial: AdminLessonRow[] }) {
  const [items, setItems] = useState(initial);
  const [savedOrder, setSavedOrder] = useState(initial.map((l) => l.id).join());
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const dirty = items.map((l) => l.id).join() !== savedOrder;

  function move(from: number, to: number) {
    setItems((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      const res = await reorderLessons(courseId, items.map((l) => l.id));
      if (res.error) {
        toast({ variant: "destructive", title: "Couldn't save the order", description: res.error });
        return;
      }
      setSavedOrder(items.map((l) => l.id).join());
      toast({ title: "Lesson order saved" });
      router.refresh();
    });
  }

  if (items.length === 0) {
    return <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No lessons yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Drag the handle (or use the arrows) to reorder, then save.</p>
        <Button size="sm" onClick={save} disabled={!dirty || pending} className="gap-2">
          <Save className="h-4 w-4" /> {pending ? "Saving..." : "Save order"}
        </Button>
      </div>
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
        {items.map((lesson, i) => (
          <Row key={lesson.id} lesson={lesson} index={i} total={items.length} courseId={courseId} onMove={move} />
        ))}
      </Reorder.Group>
    </div>
  );
}
