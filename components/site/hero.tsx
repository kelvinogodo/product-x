"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query ? `/courses?q=${encodeURIComponent(query)}` : "/courses");
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-accent/60 to-background">
      <div className="container flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <h1 className="max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Experience interactive learning. Your gateway to success, every lesson counts.
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Real courses, real tracks, and progress you can actually see — pick a path and start building skills today.
        </p>
        <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            aria-label="Search courses"
          />
          <Button type="submit" size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </section>
  );
}
