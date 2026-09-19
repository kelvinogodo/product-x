import { z } from "zod";
import { IMAGE_URL_MESSAGE, isAllowedImageUrl } from "@/lib/image-url";
import { isSupportedVideoUrl } from "@/lib/video";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slug = z
  .string()
  .max(100, "Slug is too long")
  .regex(slugRegex, "Use lowercase letters, numbers, and hyphens only");

// https only — rejects javascript:, data:, http:, etc.
const httpsUrl = z
  .string()
  .max(2048)
  .url("Enter a valid URL")
  .refine((value) => value.startsWith("https://"), "URL must start with https://");

const imageUrl = httpsUrl.refine(isAllowedImageUrl, IMAGE_URL_MESSAGE);

export const categorySchema = z.object({
  slug,
  name: z.string().trim().min(2, "Name is required").max(60, "Name is too long"),
});

export const trackSchema = z.object({
  slug,
  name: z.string().trim().min(2, "Name is required").max(100, "Name is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  categoryId: z.string().uuid().nullable().optional(),
  coverImageUrl: imageUrl.nullable().optional(),
});

export const courseSchema = z.object({
  slug,
  title: z.string().trim().min(2, "Title is required").max(200, "Title is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
  categoryId: z.string().uuid().nullable().optional(),
  trackId: z.string().uuid().nullable().optional(),
  coverImageUrl: imageUrl.nullable().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  durationMinutes: z.coerce.number().int().min(0).max(100_000),
  instructorId: z.string().uuid().nullable().optional(),
  outcomes: z.array(z.string().trim().min(1).max(200, "Each outcome must be 200 characters or fewer")).max(8, "Up to 8 outcomes"),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

export const instructorSchema = z.object({
  slug,
  name: z.string().trim().min(2, "Name is required").max(100, "Name is too long"),
  bio: z.string().trim().max(1000, "Bio is too long (1,000 characters max)").optional(),
  avatarUrl: imageUrl.nullable().optional(),
});

export const lessonSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(2, "Title is required").max(200, "Title is too long"),
  content: z.string().max(50_000, "Content is too long (50,000 characters max)").optional(),
  videoUrl: httpsUrl
    .refine(isSupportedVideoUrl, "Only YouTube and Vimeo links are supported")
    .nullable()
    .optional(),
  position: z.coerce.number().int().min(0).max(10_000),
  durationMinutes: z.coerce.number().int().min(0).max(100_000),
});

export const quizSchema = z
  .array(
    z
      .object({
        prompt: z.string().trim().min(1, "Every question needs a prompt").max(500, "Question prompts are limited to 500 characters"),
        options: z
          .array(z.string().trim().min(1, "Options can't be empty").max(200, "Options are limited to 200 characters"))
          .min(2, "Each question needs at least 2 options")
          .max(6, "Each question can have at most 6 options"),
        correct_index: z.number().int().min(0),
        explanation: z.string().trim().max(500, "Explanations are limited to 500 characters").optional(),
      })
      .refine((q) => q.correct_index < q.options.length, "Pick which option is correct")
  )
  .max(20, "A quiz can have at most 20 questions");

export const resourceRequestSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100, "Name is too long"),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  courseId: z.string().uuid().nullable().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type TrackInput = z.infer<typeof trackSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type InstructorInput = z.infer<typeof instructorSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type ResourceRequestInput = z.infer<typeof resourceRequestSchema>;
