"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FolderTree, Gauge, GraduationCap, Mail, Route, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: Gauge, exact: true },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/tracks", label: "Tracks", icon: Route },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/instructors", label: "Instructors", icon: UserRound },
  { href: "/admin/resource-requests", label: "Resource requests", icon: Mail },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "text-primary-foreground" : "text-foreground/70 hover:bg-muted"
            )}
          >
            {active && (
              <motion.span
                layoutId="admin-nav-pill"
                className="absolute inset-0 -z-10 rounded-lg bg-primary shadow-md shadow-primary/25"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
