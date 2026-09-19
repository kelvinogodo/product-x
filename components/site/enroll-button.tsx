"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/motion/confetti";
import { enrollInCourse } from "@/lib/actions/enrollment";
import { useToast } from "@/hooks/use-toast";

export function EnrollButton({
  courseId,
  courseSlug,
  isEnrolled,
  isAuthenticated,
}: {
  courseId: string;
  courseSlug: string;
  isEnrolled: boolean;
  isAuthenticated: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [celebrate, setCelebrate] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  if (isEnrolled) {
    return (
      <div className="relative">
        {celebrate && <Confetti />}
        <Button size="lg" className="group w-full gap-2 shadow-lg shadow-primary/25" asChild>
          <Link href={`/dashboard/courses/${courseSlug}/learn`}>
            <CheckCircle2 className="h-4 w-4" /> Continue learning
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full shadow-lg shadow-primary/25"
      disabled={pending}
      onClick={() => {
        if (!isAuthenticated) {
          router.push(`/login?next=/courses/${courseSlug}`);
          return;
        }
        startTransition(async () => {
          try {
            await enrollInCourse(courseId, courseSlug);
            setCelebrate(true);
            toast({ title: "You're enrolled!", description: "Your first lesson is ready when you are." });
            router.refresh();
          } catch {
            toast({
              variant: "destructive",
              title: "Couldn't enroll",
              description: "Something went wrong. Please try again.",
            });
          }
        });
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={pending ? "pending" : "idle"}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enrolling...
            </>
          ) : (
            <>Enroll now &mdash; it&apos;s free</>
          )}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
