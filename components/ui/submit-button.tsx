"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Submit button that disables itself and shows a spinner while its parent <form> action runs. */
export function SubmitButton({
  children,
  pendingText,
  ...props
}: Omit<ButtonProps, "type"> & { pendingText: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
