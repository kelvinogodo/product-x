import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "@/components/site/logo";

// Placeholder social icons: add real profile URLs here and switch the <span> to an <a> when you have them.
const social = [
  { label: "Instagram", icon: Instagram },
  { label: "Twitter", icon: Twitter },
  { label: "LinkedIn", icon: Linkedin },
  { label: "Facebook", icon: Facebook },
];

const columns = [
  {
    title: "Learn",
    links: [
      { href: "/courses", label: "All courses" },
      { href: "/tracks", label: "Learning tracks" },
      { href: "/courses?category=programming", label: "Programming" },
      { href: "/courses?category=design", label: "Design" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/courses?category=data", label: "Data" },
      { href: "/courses?category=marketing", label: "Marketing" },
      { href: "/courses?category=management", label: "Management" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Sign up" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-secondary/40">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Interactive courses and learning tracks to help you build real, job-ready skills.
          </p>
          <div className="flex gap-2 pt-1">
            {social.map(({ label, icon: Icon }) => (
              <span
                key={label}
                aria-hidden
                title={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>
        {columns.map((column) => (
          <div key={column.title} className="space-y-3 text-sm">
            <h3 className="font-semibold text-foreground">{column.title}</h3>
            <ul className="space-y-2 text-muted-foreground">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} product x. All rights reserved.
      </div>
    </footer>
  );
}
