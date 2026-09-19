import { createClient } from "@/lib/supabase/server";

export type QuizQuestion = { id: string; prompt: string; options: string[] };

/** Questions for every quiz in a course, keyed by lesson. Correct answers are never selected here. */
export async function getCourseQuizzes(lessonIds: string[]): Promise<Record<string, QuizQuestion[]>> {
  if (lessonIds.length === 0) return {};
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("id, lesson_id, prompt, options")
    .in("lesson_id", lessonIds)
    .order("position", { ascending: true })
    .order("id", { ascending: true }); // must match the ordering used by submit_quiz()
  if (error) throw error;

  const byLesson: Record<string, QuizQuestion[]> = {};
  for (const row of data) {
    (byLesson[row.lesson_id] ??= []).push({ id: row.id, prompt: row.prompt, options: row.options });
  }
  return byLesson;
}

export async function getCourseNotes(userId: string, lessonIds: string[]): Promise<Record<string, string>> {
  if (lessonIds.length === 0) return {};
  const supabase = createClient();
  const { data } = await supabase
    .from("lesson_notes")
    .select("lesson_id, body")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  return Object.fromEntries((data ?? []).map((n) => [n.lesson_id, n.body]));
}

export type CertificateSummary = {
  id: string;
  course_title: string;
  issued_at: string;
  course_slug: string | null;
};

export async function getUserCertificates(userId: string): Promise<CertificateSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("certificates")
    .select("id, course_title, issued_at, course:courses(slug)")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as (Omit<CertificateSummary, "course_slug"> & { course: { slug: string } | null })[]).map(
    ({ course, ...rest }) => ({ ...rest, course_slug: course?.slug ?? null })
  );
}

/** Public verification lookup (the certificate id is an unguessable UUID). */
export async function getCertificatePublic(id: string) {
  const supabase = createClient();
  const { data } = await supabase.rpc("get_certificate", { p_id: id });
  return data?.[0] ?? null;
}
