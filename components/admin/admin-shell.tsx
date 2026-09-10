"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderTree, LayoutList, Mail, Route } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutList, exact: true },
  { href: "/admin/courses", label: "Courses", icon: LayoutList },
  { href: "/admin/tracks", label: "Tracks", icon: Route },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/resource-requests", label: "Resource requests", icon: Mail },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
              active ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-muted"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
