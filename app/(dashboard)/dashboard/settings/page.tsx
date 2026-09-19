import { PasswordForm, ProfileForm, SessionsCard } from "@/components/site/settings-forms";
import { Reveal } from "@/components/motion/reveal";
import { getCurrentUser } from "@/lib/data/profile";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Reveal direction="none">
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and account security.</p>
      </Reveal>
      <Reveal>
        <ProfileForm
          userId={user.id}
          email={user.email ?? ""}
          fullName={user.profile.full_name ?? ""}
          avatarUrl={user.profile.avatar_url ?? ""}
        />
      </Reveal>
      <Reveal>
        <PasswordForm />
      </Reveal>
      <Reveal>
        <SessionsCard />
      </Reveal>
    </div>
  );
}
