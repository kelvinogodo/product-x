"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function CategoryTabs({
  categories,
  active,
  query,
}: {
  categories: { slug: string; name: string }[];
  active: string;
  query?: string;
}) {
  const all = [{ slug: "all", name: "All" }, ...categories];

  function hrefFor(slug: string) {
    const params = new URLSearchParams();
    if (slug !== "all") params.set("category", slug);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/courses?${qs}` : "/courses";
  }

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Course categories">
      {all.map((category) => {
        const isActive = active === category.slug;
        return (
          <Link
            key={category.slug}
            href={hrefFor(category.slug)}
            aria-current={isActive ? "page" : undefined}
            scroll={false}
            className={cn(
              "relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-transparent text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 -z-10 rounded-full bg-primary shadow-md shadow-primary/30"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
