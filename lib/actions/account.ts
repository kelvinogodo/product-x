"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data/profile";
import { changePasswordSchema, profileSchema } from "@/lib/validation/auth";

export type AccountState = { error?: string; notice?: string } | undefined;

export async function updateProfile(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await requireUser();
  const avatar = formData.get("avatarUrl");
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    avatarUrl: typeof avatar === "string" && avatar !== "" ? avatar : null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (parsed.data.avatarUrl && !new URL(parsed.data.avatarUrl).pathname.includes(`/avatars/${user.id}/`)) {
    return { error: "Please upload your photo with the Upload button." };
  }

  const supabase = createClient();
  // RLS restricts this to the caller's own row, and a trigger stops role changes.
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, avatar_url: parsed.data.avatarUrl ?? null })
    .eq("id", user.id);
  if (error) {
    console.error("updateProfile error:", error.message);
    return { error: "Couldn't save your profile. Check the photo URL and try again." };
  }

  revalidatePath("/", "layout");
  return { notice: "Profile updated." };
}

export async function changePassword(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!user.email) return { error: "Your account has no email address on file." };

  const supabase = createClient();
  // Re-authenticate: a stolen session cookie alone shouldn't be enough to take over the account.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (verifyError) return { error: "Your current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    console.error("changePassword error:", error.message);
    return { error: "We couldn't update your password. Please try again." };
  }
  return { notice: "Password updated." };
}

/** Invalidates every session for this account (all devices), then returns to the home page. */
export async function signOutEverywhere() {
  const supabase = createClient();
  await supabase.auth.signOut({ scope: "global" });
  revalidatePath("/", "layout");
  redirect("/");
}
