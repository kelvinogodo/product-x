"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const { toast } = useToast();

  if (isEnrolled) {
    return (
      <Button size="lg" variant="secondary" className="w-full" asChild>
        <a href={`/dashboard/courses/${courseSlug}/learn`} className="gap-2">
          <CheckCircle2 className="h-4 w-4" /> Continue learning
        </a>
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={pending}
      onClick={() => {
        if (!isAuthenticated) {
          router.push(`/login?next=/courses/${courseSlug}`);
          return;
        }
        startTransition(async () => {
          await enrollInCourse(courseId, courseSlug);
          toast({ title: "You're enrolled!", description: "Head to your dashboard to start learning." });
          router.refresh();
        });
      }}
    >
      {pending ? "Enrolling..." : "Enroll now — it's free"}
    </Button>
  );
}
