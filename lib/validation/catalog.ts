import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slug = z.string().regex(slugRegex, "Use lowercase letters, numbers, and hyphens only");

export const categorySchema = z.object({
  slug,
  name: z.string().min(2, "Name is required"),
});

export const trackSchema = z.object({
  slug,
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
});

export const courseSchema = z.object({
  slug,
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  trackId: z.string().uuid().nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  durationMinutes: z.coerce.number().int().min(0),
  published: z.coerce.boolean().default(false),
});

export const lessonSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(2, "Title is required"),
  content: z.string().optional(),
  videoUrl: z.string().url().nullable().optional(),
  position: z.coerce.number().int().min(0),
  durationMinutes: z.coerce.number().int().min(0),
});

export const resourceRequestSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  courseId: z.string().uuid().nullable().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type TrackInput = z.infer<typeof trackSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type ResourceRequestInput = z.infer<typeof resourceRequestSchema>;
