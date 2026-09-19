"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Sticky header that gains a blurred background and shadow once the page scrolls. */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-300",
        scrolled ? "border-border bg-background/80 shadow-sm backdrop-blur-xl" : "border-transparent bg-background/0"
      )}
    >
      {children}
    </header>
  );
}
