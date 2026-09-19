import { BarChart3, BookOpenCheck, Layers } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { AuthCard } from "@/components/site/auth-card";

const highlights = [
  { icon: BookOpenCheck, text: "Bite-sized lessons with real, practical content" },
  { icon: Layers, text: "Guided tracks that tell you what to learn next" },
  { icon: BarChart3, text: "A dashboard that shows your progress grow" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="bg-grid absolute inset-0 opacity-20" />
        <div className="absolute -left-16 top-1/4 h-72 w-72 animate-blob-drift rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-80 w-80 animate-blob-drift rounded-full bg-fuchsia-300/25 blur-3xl [animation-delay:-7s]" />
        <div className="relative">
          <Logo className="text-white" />
        </div>
        <div className="relative max-w-md space-y-8">
          <h2 className="text-balance font-display text-4xl font-extrabold leading-tight">
            Learn something new. Every lesson counts.
          </h2>
          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/80">&copy; {new Date().getFullYear()} product x</p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col items-center justify-center bg-background px-4 py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <AuthCard>{children}</AuthCard>
      </div>
    </div>
  );
}
