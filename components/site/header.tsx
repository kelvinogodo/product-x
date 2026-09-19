import { getCurrentUser } from "@/lib/data/profile";
import { HeaderShell } from "@/components/site/header-shell";
import { Logo } from "@/components/site/logo";
import { SiteNav } from "@/components/site/site-nav";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <HeaderShell>
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <SiteNav
          user={
            user
              ? {
                  name: user.profile.full_name || user.email || "Account",
                  role: user.profile.role,
                  avatarUrl: user.profile.avatar_url,
                }
              : null
          }
        />
      </div>
    </HeaderShell>
  );
}
