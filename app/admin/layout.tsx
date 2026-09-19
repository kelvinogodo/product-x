import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/profile";
import { AdminNav } from "@/components/admin/admin-shell";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { UserMenu } from "@/components/site/user-menu";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Logo suffix="/ admin" />
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
      <div className="container grid gap-8 py-10 md:grid-cols-[210px_1fr]">
        <AdminNav />
        <main id="main-content" tabIndex={-1} className="min-w-0 outline-none">{children}</main>
      </div>
    </div>
  );
}
