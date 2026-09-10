import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Shield } from "lucide-react";
import { getCurrentUser } from "@/lib/data/profile";
import { UserMenu } from "@/components/site/user-menu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            product x
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-foreground/80 hover:text-foreground">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            {user.profile.role === "admin" && (
              <Link href="/admin" className="flex items-center gap-1.5 text-foreground/80 hover:text-foreground">
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
          </nav>
          <UserMenu name={user.profile.full_name || user.email || "Account"} role={user.profile.role} />
        </div>
      </header>
      <main className="container py-10">{children}</main>
    </div>
  );
}
