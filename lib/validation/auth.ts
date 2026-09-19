import { z } from "zod";
import { IMAGE_URL_MESSAGE, isAllowedImageUrl } from "@/lib/image-url";

const email = z.string().trim().toLowerCase().min(1, "Enter your email").max(254).email("Enter a valid email");

// bcrypt (used by Supabase Auth) ignores everything past 72 bytes, so cap it explicitly.
const newPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/\d/, "Password must include a number");

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100, "Name is too long"),
  email,
  password: newPassword,
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(72),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(72),
    password: newPassword,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.password !== data.currentPassword, {
    message: "Choose a password different from your current one",
    path: ["password"],
  });

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100, "Name is too long"),
  avatarUrl: z
    .string()
    .max(2048)
    .url("Enter a valid image URL")
    .refine(isAllowedImageUrl, IMAGE_URL_MESSAGE)
    .nullable()
    .optional(),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
