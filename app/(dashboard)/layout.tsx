import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, LayoutDashboard, Shield } from "lucide-react";
import { getCurrentUser } from "@/lib/data/profile";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { UserMenu } from "@/components/site/user-menu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const navLink =
    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-1 text-sm font-medium sm:flex">
            <Link href="/dashboard" className={navLink}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link href="/courses" className={navLink}>
              <Compass className="h-4 w-4" /> Explore
            </Link>
            {user.profile.role === "admin" && (
              <Link href="/admin" className={navLink}>
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu
              name={user.profile.full_name || user.email || "Account"}
              role={user.profile.role}
              avatarUrl={user.profile.avatar_url}
            />
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="container py-10 outline-none">{children}</main>
    </div>
  );
}
