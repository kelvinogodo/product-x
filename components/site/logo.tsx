import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, suffix }: { className?: string; suffix?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2 font-display text-lg font-bold tracking-tight", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-md shadow-primary/30 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
        <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
          <path d="M9.6 9.6 22.4 22.4M22.4 9.6 9.6 22.4" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        </svg>
      </span>
      <span>
        product x
        {suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
      </span>
    </Link>
  );
}
