import Link from "next/link";
import { BookCheck, GraduationCap, Inbox, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { getAdminStats } from "@/lib/data/admin";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Total courses", value: stats.courses, icon: GraduationCap, href: "/admin/courses" },
    { label: "Published courses", value: stats.published, icon: BookCheck, href: "/admin/courses" },
    { label: "Students", value: stats.students, icon: Users, href: null },
    { label: "Resource requests", value: stats.requests, icon: Inbox, href: "/admin/resource-requests" },
  ];

  return (
    <div className="space-y-8">
      <Reveal direction="none" className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">A snapshot of your catalog and learners.</p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/admin/courses/new">
            <Plus className="h-4 w-4" /> New course
          </Link>
        </Button>
      </Reveal>
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" immediate>
        {cards.map((card) => {
          const body = (
            <div className="flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <card.icon className="h-5 w-5" />
              </span>
              <div>
                <CountUp value={card.value} className="font-display text-3xl font-extrabold" />
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          );
          return (
            <StaggerItem key={card.label}>{card.href ? <Link href={card.href}>{body}</Link> : body}</StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
