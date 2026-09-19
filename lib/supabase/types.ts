export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type ProfileRole = "student" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: ProfileRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      categories: {
        Row: { id: string; slug: string; name: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & { slug: string; name: string };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      tracks: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          category_id: string | null;
          cover_image_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tracks"]["Row"]> & { slug: string; name: string };
        Update: Partial<Database["public"]["Tables"]["tracks"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "tracks_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          category_id: string | null;
          track_id: string | null;
          cover_image_url: string | null;
          level: CourseLevel;
          duration_minutes: number;
          published: boolean;
          outcomes: string[];
          instructor_id: string | null;
          featured: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["courses"]["Row"]> & { slug: string; title: string };
        Update: Partial<Database["public"]["Tables"]["courses"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "courses_track_id_fkey";
            columns: ["track_id"];
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          }
        ];
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          content: string | null;
          video_url: string | null;
          position: number;
          duration_minutes: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["lessons"]["Row"]> & { course_id: string; title: string };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      enrollments: {
        Row: { id: string; user_id: string; course_id: string; enrolled_at: string };
        Insert: Partial<Database["public"]["Tables"]["enrollments"]["Row"]> & { user_id: string; course_id: string };
        Update: Partial<Database["public"]["Tables"]["enrollments"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
      lesson_progress: {
        Row: { id: string; user_id: string; lesson_id: string; completed_at: string };
        Insert: Partial<Database["public"]["Tables"]["lesson_progress"]["Row"]> & {
          user_id: string;
          lesson_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_progress"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          }
        ];
      };
      instructors: {
        Row: { id: string; slug: string; name: string; bio: string | null; avatar_url: string | null; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["instructors"]["Row"]> & { slug: string; name: string };
        Update: Partial<Database["public"]["Tables"]["instructors"]["Row"]>;
        Relationships: [];
      };
      quiz_questions: {
        Row: { id: string; lesson_id: string; position: number; prompt: string; options: string[]; explanation: string | null };
        Insert: Partial<Database["public"]["Tables"]["quiz_questions"]["Row"]> & {
          lesson_id: string;
          prompt: string;
          options: string[];
        };
        Update: Partial<Database["public"]["Tables"]["quiz_questions"]["Row"]>;
        Relationships: [];
      };
      quiz_answers: {
        Row: { question_id: string; correct_index: number };
        Insert: { question_id: string; correct_index: number };
        Update: Partial<{ question_id: string; correct_index: number }>;
        Relationships: [];
      };
      quiz_attempts: {
        Row: { id: string; user_id: string; lesson_id: string; score: number; total: number; passed: boolean; created_at: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      lesson_notes: {
        Row: { id: string; user_id: string; lesson_id: string; body: string; updated_at: string };
        Insert: { user_id: string; lesson_id: string; body: string };
        Update: Partial<{ body: string }>;
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          holder_name: string;
          course_title: string;
          issued_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      resource_requests: {
        Row: { id: string; name: string; email: string; course_id: string | null; created_at: string; handled_at: string | null };
        Insert: Partial<Database["public"]["Tables"]["resource_requests"]["Row"]> & { name: string; email: string };
        Update: Partial<Database["public"]["Tables"]["resource_requests"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "resource_requests_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      reorder_lessons: { Args: { p_course_id: string; p_ids: string[] }; Returns: undefined };
      save_quiz: { Args: { p_lesson_id: string; p_questions: unknown }; Returns: undefined };
      submit_quiz: {
        Args: { p_lesson_id: string; p_answers: number[] };
        Returns: QuizResult;
      };
      lessons_with_quiz: {
        Args: { p_course_id: string };
        Returns: { lesson_id: string; question_count: number }[];
      };
      get_certificate: {
        Args: { p_id: string };
        Returns: { holder_name: string; course_title: string; course_slug: string | null; issued_at: string }[];
      };
      course_outline: {
        Args: { p_course_id: string };
        Returns: { id: string; title: string; position: number; duration_minutes: number }[];
      };
      course_stats: {
        Args: Record<PropertyKey, never>;
        Returns: { course_id: string; lesson_count: number; learner_count: number }[];
      };
    };
  };
}

export type QuizResult = {
  score: number;
  total: number;
  passed: boolean;
  results: {
    question_id: string;
    chosen: number;
    correct_index: number;
    correct: boolean;
    explanation: string | null;
  }[];
};
