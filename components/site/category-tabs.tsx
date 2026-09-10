import Link from "next/link";
import { cn } from "@/lib/utils";

export function CategoryTabs({
  categories,
  active,
}: {
  categories: { slug: string; name: string }[];
  active: string;
}) {
  const all = [{ slug: "all", name: "All" }, ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {all.map((category) => (
        <Link
          key={category.slug}
          href={category.slug === "all" ? "/courses" : `/courses?category=${category.slug}`}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors",
            active === category.slug
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground/70 hover:text-foreground"
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
