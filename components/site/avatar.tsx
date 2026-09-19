import Image from "next/image";
import { isAllowedImageUrl } from "@/lib/image-url";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

/** Circular avatar: the uploaded image if any, otherwise gradient initials. */
export function Avatar({
  name,
  src,
  size = 32,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  if (src && isAllowedImageUrl(src)) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 font-bold text-white",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
    >
      {initials(name)}
    </span>
  );
}
