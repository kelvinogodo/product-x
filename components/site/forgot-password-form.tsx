"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { requestPasswordReset } from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordReset, undefined);

  if (state?.success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
          className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground"
        >
          <MailCheck className="h-7 w-7" />
        </motion.span>
        <h1 className="text-2xl font-extrabold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" maxLength={254} />
        </div>
        <FormMessage error={state?.error} />
        <SubmitButton pendingText="Sending..." className="w-full">
          Send reset link
        </SubmitButton>
      </form>
      <p className="text-center text-sm">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
