"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState } from "react-dom";
import { Check, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { signUp } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const rules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "Contains a letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "Contains a number", test: (v: string) => /\d/.test(v) },
];

export default function SignupPage() {
  const [state, formAction] = useFormState(signUp, undefined);
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start learning for free.</p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required autoComplete="name" maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" maxLength={254} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ul className="space-y-1 pt-1">
            {rules.map((rule) => {
              const ok = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={cn(
                    "flex items-center gap-2 text-xs transition-colors",
                    ok ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"
                  )}
                >
                  {ok ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>
        <FormMessage error={state?.error} notice={state?.notice} />
        <SubmitButton pendingText="Creating account..." className="w-full">
          Sign up
        </SubmitButton>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
