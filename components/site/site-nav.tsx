"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { UserMenu } from "@/components/site/user-menu";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/tracks", label: "Tracks" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteNav({ user }: { user: { name: string; role: "student" | "admin"; avatarUrl?: string | null } | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  const mobileLinks = [
    ...links,
    ...(user
      ? [{ href: "/dashboard", label: "Dashboard" }, ...(user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : [])]
      : [
          { href: "/login", label: "Log in" },
          { href: "/signup", label: "Get started" },
        ]),
  ];

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden items-center gap-2 md:flex">
        <ThemeToggle />
        {user ? (
          <UserMenu name={user.name} role={user.role} avatarUrl={user.avatarUrl} />
        ) : (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild className="shadow-md shadow-primary/25">
              <Link href="/signup">Get started</Link>
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-1 md:hidden">
        <ThemeToggle />
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-16 z-40 border-b border-border bg-background/95 p-4 shadow-lg backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1">
              {mobileLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent",
                      isActive(pathname, link.href) && "bg-accent"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
