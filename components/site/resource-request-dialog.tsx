"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { submitResourceRequest } from "@/lib/actions/enrollment";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Sending..." : "Get resources"}
    </Button>
  );
}

export function ResourceRequestDialog({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(submitResourceRequest, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="w-full gap-2">
          <Download className="h-4 w-4" /> Get resources
        </Button>
      </DialogTrigger>
      <DialogContent>
        {state?.success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
              className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"
            >
              <CheckCircle2 className="h-7 w-7" />
            </motion.span>
            <DialogTitle>Thanks!</DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll send the resources for {courseTitle} to your inbox shortly.
            </p>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Get resources for {courseTitle}</DialogTitle>
              <DialogDescription>Leave your details and we&apos;ll send you the course materials.</DialogDescription>
            </DialogHeader>
            <form ref={formRef} action={formAction} className="space-y-4">
              <input type="hidden" name="courseId" value={courseId} />
              {/* Honeypot: hidden from people, irresistible to bots. */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Enter your name" required maxLength={100} autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  maxLength={254}
                  autoComplete="email"
                />
              </div>
              {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
              <SubmitButton />
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
