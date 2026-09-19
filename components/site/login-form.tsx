"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { signIn } from "@/lib/actions/auth";
import { safeRedirectPath } from "@/lib/security";

export function LoginForm() {
  const [state, formAction] = useFormState(signIn, undefined);
  const searchParams = useSearchParams();
  const next = safeRedirectPath(searchParams.get("next"), "");
  const callbackFailed = searchParams.get("error") === "auth-callback-failed";

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to continue learning.</p>
      </div>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" maxLength={254} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="password" name="password" required autoComplete="current-password" maxLength={72} />
        </div>
        <FormMessage
          error={state?.error ?? (callbackFailed ? "That link has expired or is invalid. Please try again." : undefined)}
        />
        <SubmitButton pendingText="Signing in..." className="w-full">
          Log in
        </SubmitButton>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
