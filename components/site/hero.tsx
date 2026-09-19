"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/motion/count-up";

const EASE = [0.22, 1, 0.36, 1] as const;

const headline = ["Experience", "interactive", "learning."];

type Stat = { label: string; value: number; suffix?: string };

export function Hero({
  stats,
  categories,
}: {
  stats: Stat[];
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim().slice(0, 80);
    router.push(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses");
  }

  return (
    <section className="relative overflow-hidden">
      {/* Decorative backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="absolute -left-24 top-0 h-[26rem] w-[26rem] animate-blob-drift rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -right-20 top-24 h-[24rem] w-[24rem] animate-blob-drift rounded-full bg-fuchsia-500/20 blur-3xl [animation-delay:-6s]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-blob-drift rounded-full bg-sky-400/20 blur-3xl [animation-delay:-12s]" />
      </div>

      {/* Floating progress cards (decorative) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
        className="absolute left-[4%] top-48 hidden xl:block"
        aria-hidden
      >
        <div className="glass animate-float rounded-2xl p-4 shadow-xl">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Lesson complete
          </div>
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "72%" }}
              transition={{ delay: 1.4, duration: 1.2, ease: EASE }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">72% of the course</p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.7, ease: EASE }}
        className="absolute right-[5%] top-64 hidden xl:block"
        aria-hidden
      >
        <div className="glass animate-float rounded-2xl p-4 shadow-xl [animation-delay:-3s]">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">Learn by doing</p>
              <p className="text-[11px] text-muted-foreground">Bite-sized, hands-on lessons</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container flex flex-col items-center gap-7 pb-16 pt-20 text-center sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Free to start &middot; learn at your own pace
        </motion.div>

        <h1 className="max-w-3xl text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          {headline.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: EASE }}
              className={`mr-3 inline-block ${i === 1 ? "text-gradient" : ""}`}
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.55, duration: 0.7, ease: EASE }}
            className="inline-block"
          >
            Every lesson counts.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: EASE }}
          className="max-w-xl text-lg text-muted-foreground"
        >
          Real courses, structured tracks, and progress you can actually see — pick a path and start building skills
          today.
        </motion.p>

        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6, ease: EASE }}
          className="glass flex w-full max-w-lg items-center gap-2 rounded-full p-1.5 shadow-lg shadow-primary/10 transition-shadow focus-within:shadow-xl focus-within:shadow-primary/20"
        >
          <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={80}
            placeholder="What do you want to learn?"
            aria-label="Search courses"
            className="h-10 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button type="submit" className="rounded-full px-5">
            Search
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs text-muted-foreground">Popular:</span>
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.slug}
              href={`/courses?category=${category.slug}`}
              className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
            >
              {category.name}
            </Link>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: EASE }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <Button size="lg" asChild className="group rounded-full px-7 shadow-lg shadow-primary/30">
            <Link href="/courses">
              Browse courses
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="rounded-full px-7">
            <Link href="/tracks">Explore tracks</Link>
          </Button>
        </motion.div>
      </div>

      {stats.length > 0 && (
        <div className="container pb-14">
          <dl className="glass mx-auto grid max-w-3xl grid-cols-2 gap-6 rounded-3xl p-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <CountUp value={stat.value} suffix={stat.suffix} className="font-display text-3xl font-extrabold" />
                  <p aria-hidden className="mt-0.5 text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}
