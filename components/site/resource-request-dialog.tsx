"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
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
        <Button size="lg" variant="outline" className="w-full">
          Get resources
        </Button>
      </DialogTrigger>
      <DialogContent>
        {state?.success ? (
          <div className="py-6 text-center">
            <DialogTitle>Thanks!</DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll send the resources for {courseTitle} to your inbox shortly.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Get resources for {courseTitle}</DialogTitle>
              <DialogDescription>Leave your details and we&apos;ll send you the course materials.</DialogDescription>
            </DialogHeader>
            <form ref={formRef} action={formAction} className="space-y-4">
              <input type="hidden" name="courseId" value={courseId} />
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Enter your name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="Enter your email" required />
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
