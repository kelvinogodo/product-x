"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Full details go to the console/server logs only — the UI never shows the raw message.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="h-7 w-7" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        An unexpected error occurred. You can try again, or head back to the home page.
        {error.digest && <span className="mt-1 block text-xs">Reference: {error.digest}</span>}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="gap-2 rounded-full px-6">
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
