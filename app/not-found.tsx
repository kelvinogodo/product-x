import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-5 overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="absolute left-1/4 top-1/4 h-72 w-72 animate-blob-drift rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 animate-blob-drift rounded-full bg-fuchsia-500/20 blur-3xl [animation-delay:-8s]" />
      </div>
      <span className="grid h-16 w-16 animate-float place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-primary/30">
        <Compass className="h-8 w-8" />
      </span>
      <h1 className="text-gradient font-display text-7xl font-extrabold">404</h1>
      <p className="max-w-sm text-muted-foreground">
        We couldn&apos;t find the page you were looking for. It may have moved, or the link might be wrong.
      </p>
      <div className="flex gap-3">
        <Button asChild className="rounded-full px-6">
          <Link href="/">Back home</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>
    </div>
  );
}
