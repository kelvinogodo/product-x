"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { safeRedirectPath } from "@/lib/security";
import { forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from "@/lib/validation/auth";

export type ActionState = { error?: string; notice?: string } | undefined;
export type MessageState = { error?: string; success?: boolean } | undefined;

export async function signUp(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
    },
  });
  if (error) {
    console.error("signUp error:", error.message);
    return { error: "We couldn't create your account. Try a different email or a stronger password." };
  }

  // With email confirmation enabled there's no session yet — tell the user instead of bouncing
  // them to a login redirect. (Supabase also returns an obfuscated user for already-registered
  // emails, so this response doesn't reveal whether an account exists.)
  if (!data.session) {
    return { notice: "Check your inbox — we sent you a link to confirm your email and finish signing up." };
  }

  redirect("/dashboard");
}

export async function signIn(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Invalid email or password" };

  redirect(safeRedirectPath(formData.get("next")));
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordReset(_prevState: MessageState, formData: FormData): Promise<MessageState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const siteUrl = getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });
  // Don't reveal whether the email exists — always report success.
  if (error) console.error("resetPasswordForEmail error:", error.message);

  return { success: true };
}

export async function updatePassword(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your password reset link has expired. Please request a new one." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    console.error("updateUser error:", error.message);
    return { error: "We couldn't update your password. Please try again." };
  }

  redirect("/dashboard");
}
