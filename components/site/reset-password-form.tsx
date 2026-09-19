"use client";

import { useFormState } from "react-dom";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { updatePassword } from "@/lib/actions/auth";

export function ResetPasswordForm() {
  const [state, formAction] = useFormState(updatePassword, undefined);

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Use at least 8 characters, including a letter and a number.
        </p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <PasswordInput id="password" name="password" required autoComplete="new-password" minLength={8} maxLength={72} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            required
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
          />
        </div>
        <FormMessage error={state?.error} />
        <SubmitButton pendingText="Updating..." className="w-full">
          Update password
        </SubmitButton>
      </form>
    </div>
  );
}
