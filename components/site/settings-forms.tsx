"use client";

import { useFormState } from "react-dom";
import { LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image-upload";
import { changePassword, signOutEverywhere, updateProfile } from "@/lib/actions/account";

const card = "rounded-2xl border border-border bg-card p-6 shadow-sm";

export function ProfileForm({
  userId,
  email,
  fullName,
  avatarUrl,
}: {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string;
}) {
  const [state, formAction] = useFormState(updateProfile, undefined);

  return (
    <form action={formAction} className={`${card} space-y-4`}>
      <div>
        <h2 className="text-lg font-bold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">How you appear on your dashboard and certificates.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} readOnly disabled aria-describedby="email-note" />
        <p id="email-note" className="text-xs text-muted-foreground">
          Your email is used to sign in and can&apos;t be changed here.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={fullName} required maxLength={100} autoComplete="name" />
        <p className="text-xs text-muted-foreground">
          New certificates use this name. Certificates you&apos;ve already earned keep the name they were issued with.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Photo</Label>
        <ImageUpload name="avatarUrl" bucket="avatars" folder={userId} defaultValue={avatarUrl} maxBytes={1024 * 1024} />
      </div>
      <FormMessage error={state?.error} notice={state?.notice} />
      <SubmitButton pendingText="Saving...">Save profile</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useFormState(changePassword, undefined);

  return (
    <form action={formAction} className={`${card} space-y-4`}>
      <div>
        <h2 className="text-lg font-bold tracking-tight">Password</h2>
        <p className="text-sm text-muted-foreground">Use at least 8 characters, including a letter and a number.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <PasswordInput id="currentPassword" name="currentPassword" required autoComplete="current-password" maxLength={72} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <PasswordInput id="newPassword" name="password" required autoComplete="new-password" minLength={8} maxLength={72} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmNewPassword">Confirm new password</Label>
          <PasswordInput
            id="confirmNewPassword"
            name="confirmPassword"
            required
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
          />
        </div>
      </div>
      <FormMessage error={state?.error} notice={state?.notice} />
      <SubmitButton pendingText="Updating...">Update password</SubmitButton>
    </form>
  );
}

export function SessionsCard() {
  return (
    <form action={signOutEverywhere} className={`${card} flex flex-wrap items-center justify-between gap-4`}>
      <div>
        <h2 className="text-lg font-bold tracking-tight">Sessions</h2>
        <p className="text-sm text-muted-foreground">
          Signed in on a shared or lost device? Sign out everywhere to end all active sessions.
        </p>
      </div>
      <Button type="submit" variant="outline" className="gap-2">
        <LogOut className="h-4 w-4" /> Sign out everywhere
      </Button>
    </form>
  );
}
