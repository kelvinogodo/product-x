import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/profile";
import { AdminNav } from "@/components/admin/admin-shell";
import { UserMenu } from "@/components/site/user-menu";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.profile.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            product x <span className="text-sm font-normal text-muted-foreground">/ admin</span>
          </Link>
          <UserMenu name={user.profile.full_name || user.email || "Account"} role={user.profile.role} />
        </div>
      </header>
      <div className="container grid gap-8 py-10 md:grid-cols-[200px_1fr]">
        <AdminNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
