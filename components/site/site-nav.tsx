"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/site/user-menu";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
];

export function SiteNav({
  user,
}: {
  user: { name: string; role: "student" | "admin" } | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-6 md:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground/80 hover:text-foreground">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        {user ? (
          <UserMenu name={user.name} role={user.role} />
        ) : (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </>
        )}
      </div>

      <button
        className="inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
        aria-label="Toggle menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-40 border-b border-border bg-background p-4 shadow-md md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="text-sm font-medium" onClick={() => setOpen(false)}>
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link href="/signup" className="text-sm font-medium" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
