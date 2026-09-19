"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function CourseSearch({ defaultValue = "", category }: { defaultValue?: string; category: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function go(next: string) {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    const q = next.trim().slice(0, 80);
    if (q) params.set("q", q);
    const qs = params.toString();
    router.push(qs ? `/courses?${qs}` : "/courses", { scroll: false });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(value);
      }}
      className="relative w-full max-w-md"
      role="search"
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={80}
        placeholder="Search courses..."
        aria-label="Search courses"
        className="h-11 rounded-full pl-10 pr-10"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            go("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
