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
      resource_requests: {
        Row: { id: string; name: string; email: string; course_id: string | null; created_at: string };
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
  };
}
