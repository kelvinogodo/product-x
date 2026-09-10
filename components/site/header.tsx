import Link from "next/link";
import { getCurrentUser } from "@/lib/data/profile";
import { SiteNav } from "@/components/site/site-nav";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="relative border-b border-border bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          product x
        </Link>
        <SiteNav
          user={
            user ? { name: user.profile.full_name || user.email || "Account", role: user.profile.role } : null
          }
        />
      </div>
    </header>
  );
}
