import { createClient } from "@/lib/supabase/server";
import { computeStreak } from "@/lib/streak";
import type { Database } from "@/lib/supabase/types";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];

export type EnrolledCourse = CourseRow & {
  category: { id: string; slug: string; name: string } | null;
  enrolled_at: string;
  progress: { completed: number; total: number; percent: number };
  last_activity: string;
};

export type DashboardData = {
  courses: EnrolledCourse[];
  /** The in-progress course the learner touched most recently, if any. */
  resume: EnrolledCourse | null;
  totals: { enrolled: number; lessonsCompleted: number; completedCourses: number; minutesLearned: number };
  streak: { current: number; best: number; activeDays: number };
};

/** Two queries total (enrollments + progress) regardless of how many courses the learner has. */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = createClient();
  const [{ data: enrollments, error }, { data: progress, error: progressError }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("enrolled_at, course:courses(*, category:categories(id, slug, name), lessons(id, duration_minutes))")
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false }),
    supabase.from("lesson_progress").select("lesson_id, completed_at").eq("user_id", userId),
  ]);
  if (error) throw error;
  if (progressError) throw progressError;

  const completedAt = new Map((progress ?? []).map((p) => [p.lesson_id, p.completed_at]));

  type Raw = {
    enrolled_at: string;
    course: (CourseRow & { category: EnrolledCourse["category"]; lessons: { id: string; duration_minutes: number }[] }) | null;
  };

  let minutesLearned = 0;
  const courses: EnrolledCourse[] = (enrollments as unknown as Raw[])
    .filter((e): e is Raw & { course: NonNullable<Raw["course"]> } => Boolean(e.course))
    .map(({ enrolled_at, course }) => {
      const { lessons, ...rest } = course;
      const done = lessons.filter((l) => completedAt.has(l.id));
      minutesLearned += done.reduce((sum, l) => sum + l.duration_minutes, 0);
      const last = done.map((l) => completedAt.get(l.id) as string).sort().pop() ?? enrolled_at;
      return {
        ...rest,
        enrolled_at,
        last_activity: last,
        progress: {
          completed: done.length,
          total: lessons.length,
          percent: lessons.length === 0 ? 0 : Math.round((done.length / lessons.length) * 100),
        },
      };
    });

  const inProgress = courses
    .filter((c) => c.progress.total > 0 && c.progress.percent < 100)
    .sort((a, b) => b.last_activity.localeCompare(a.last_activity));

  return {
    courses,
    streak: computeStreak((progress ?? []).map((p) => p.completed_at)),
    resume: inProgress[0] ?? null,
    totals: {
      enrolled: courses.length,
      lessonsCompleted: courses.reduce((sum, c) => sum + c.progress.completed, 0),
      completedCourses: courses.filter((c) => c.progress.total > 0 && c.progress.percent === 100).length,
      minutesLearned,
    },
  };
}

export async function getCompletedLessonIds(userId: string, courseId: string) {
  const supabase = createClient();
  const { data: lessons } = await supabase.from("lessons").select("id").eq("course_id", courseId);
  const lessonIds = (lessons ?? []).map((l) => l.id);
  if (lessonIds.length === 0) return new Set<string>();

  const { data } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  return new Set((data ?? []).map((p) => p.lesson_id));
}

export async function isEnrolled(userId: string, courseId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  return Boolean(data);
}
