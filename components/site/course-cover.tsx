import Image from "next/image";
import { BarChart3, Code2, KanbanSquare, Megaphone, Palette, Sparkles, type LucideIcon } from "lucide-react";
import { isAllowedImageUrl } from "@/lib/image-url";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  programming: Code2,
  design: Palette,
  data: BarChart3,
  marketing: Megaphone,
  management: KanbanSquare,
};

export function categoryIcon(slug?: string | null): LucideIcon {
  return (slug && ICONS[slug]) || Sparkles;
}

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * A course's cover: the uploaded image if there is one, otherwise a generated, deterministic
 * gradient artwork (per-slug hue + category icon) — so every course looks designed with no assets.
 */
export function CourseCover({
  slug,
  title,
  coverUrl,
  categorySlug,
  className,
  iconClassName,
  priority = false,
}: {
  slug: string;
  title: string;
  coverUrl?: string | null;
  categorySlug?: string | null;
  className?: string;
  iconClassName?: string;
  priority?: boolean;
}) {
  if (coverUrl && isAllowedImageUrl(coverUrl)) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image
          src={coverUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
      </div>
    );
  }

  const h = hash(slug);
  const hue = h % 360;
  const Icon = categoryIcon(categorySlug);

  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 80% 58%) 0%, hsl(${(hue + 48) % 360} 85% 48%) 100%)`,
      }}
      role="img"
      aria-label={`${title} cover`}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.65) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
      <div
        className="absolute -right-8 -top-10 h-40 w-40 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-125"
        style={{ background: `hsl(${(hue + 100) % 360} 90% 70% / 0.55)` }}
      />
      <div
        className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full blur-2xl"
        style={{ background: `hsl(${(hue + 300) % 360} 90% 60% / 0.45)` }}
      />
      <Icon
        className={cn(
          "absolute bottom-3 right-4 h-16 w-16 text-white/85 drop-shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110",
          iconClassName
        )}
        strokeWidth={1.4}
      />
      <span className="absolute left-4 top-3 font-display text-4xl font-extrabold text-white/25">
        {title.slice(0, 1).toUpperCase()}
      </span>
    </div>
  );
}
