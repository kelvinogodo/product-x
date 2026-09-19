import Link from "next/link";
import { ArrowRight, BarChart3, Compass, GraduationCap, Layers, Rocket, Smartphone, Target, Zap } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { categoryIcon, CourseCover } from "@/components/site/course-cover";
import { SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import { pluralize } from "@/lib/course-ui";

export function CategoryGrid({ categories }: { categories: { slug: string; name: string; count: number }[] }) {
  return (
    <section className="container py-16">
      <SectionHeading
        eyebrow="Categories"
        title="Find your focus"
        description="Whether you're building, designing, or analysing, there's a path for you."
      />
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {categories.map((category) => {
          const Icon = categoryIcon(category.slug);
          return (
            <StaggerItem key={category.slug}>
              <Link
                href={`/courses?category=${category.slug}`}
                className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{pluralize(category.count, "course")}</p>
                </div>
                <ArrowRight className="absolute right-4 top-5 h-4 w-4 -translate-x-2 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

type Track = {
  slug: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  course_count: number;
  category: { slug: string; name: string } | null;
};

export function TrackCard({ track }: { track: Track }) {
  return (
    <Link
      href={`/tracks/${track.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
    >
      <CourseCover
        slug={track.slug}
        title={track.name}
        coverUrl={track.cover_image_url}
        categorySlug={track.category?.slug}
        className="h-28 w-full"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {track.category?.name ?? "Track"} &middot; {pluralize(track.course_count, "course")}
        </p>
        <h3 className="text-lg font-semibold tracking-tight">{track.name}</h3>
        <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">{track.description}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
          View track
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function TracksSection({ tracks }: { tracks: Track[] }) {
  if (tracks.length === 0) return null;
  return (
    <section className="relative border-y border-border bg-secondary/30 py-20">
      <div className="container">
        <SectionHeading
          eyebrow="Learning tracks"
          title="Follow a guided path"
          description="Tracks group courses in the right order so you always know what to learn next."
          action={
            <Button variant="ghost" asChild>
              <Link href="/tracks" className="gap-1">
                All tracks <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        />
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <StaggerItem key={track.slug}>
              <TrackCard track={track} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

const steps = [
  { icon: Compass, title: "Pick a path", body: "Browse courses or follow a track built around a goal." },
  { icon: Rocket, title: "Enroll in one click", body: "Every course is free to start — no forms, no friction." },
  { icon: Target, title: "Learn and track", body: "Work through short lessons and watch your progress climb." },
];

export function HowItWorks() {
  return (
    <section className="container py-20">
      <SectionHeading eyebrow="How it works" title="From curious to capable in three steps" align="center" />
      <Stagger className="relative grid gap-8 md:grid-cols-3" stagger={0.15}>
        <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
        {steps.map((step, i) => (
          <StaggerItem key={step.title} className="relative text-center">
            <div className="relative mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-primary/30">
              <step.icon className="h-7 w-7" />
              <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-xs font-bold text-foreground">
                {i + 1}
              </span>
            </div>
            <h3 className="mb-1.5 text-lg font-semibold">{step.title}</h3>
            <p className="mx-auto max-w-[16rem] text-sm text-muted-foreground">{step.body}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

const benefits = [
  { icon: Zap, title: "Bite-sized lessons", body: "15–50 minute lessons you can finish in a single sitting." },
  { icon: BarChart3, title: "Visible progress", body: "Mark lessons complete and see your dashboard fill up." },
  { icon: Layers, title: "Structured tracks", body: "Courses sequenced so each one builds on the last." },
  { icon: Smartphone, title: "Learn anywhere", body: "A fully responsive experience on phone, tablet, or laptop." },
];

export function Benefits() {
  return (
    <section className="border-y border-border bg-secondary/30 py-20">
      <div className="container">
        <SectionHeading eyebrow="Why product x" title="Built to help you actually finish" align="center" />
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <StaggerItem key={benefit.title}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <benefit.icon className="h-5 w-5" />
                </span>
                <h3 className="mb-1 font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function CtaBanner({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="container py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-16 text-center text-white shadow-2xl shadow-primary/30 sm:px-12">
          <div className="absolute -left-10 -top-10 h-56 w-56 animate-blob-drift rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-16 -right-10 h-64 w-64 animate-blob-drift rounded-full bg-fuchsia-300/25 blur-3xl [animation-delay:-8s]" />
          <div className="relative mx-auto max-w-xl space-y-5">
            <GraduationCap className="mx-auto h-10 w-10 opacity-90" />
            <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your next skill is one lesson away
            </h2>
            <p className="text-white/90">
              Join for free, enroll in a course, and start building momentum today.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button size="lg" asChild className="group rounded-full bg-white px-7 text-indigo-700 hover:bg-white/90">
                <Link href={isAuthenticated ? "/courses" : "/signup"}>
                  {isAuthenticated ? "Find a course" : "Create your free account"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
