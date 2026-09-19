"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CourseCover } from "@/components/site/course-cover";
import { levelClasses, pluralize } from "@/lib/course-ui";
import { cn, formatDuration } from "@/lib/utils";

export type CourseCardData = {
  slug: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  level: string;
  duration_minutes: number;
  category: { name: string; slug?: string } | null;
  lesson_count?: number;
  learner_count?: number;
};

export function CourseCard({ course, layout = "grid" }: { course: CourseCardData; layout?: "grid" | "row" }) {
  const isGrid = layout === "grid";

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 320, damping: 22 }} className="h-full">
      <Link
        href={`/courses/${course.slug}`}
        className={cn(
          "group relative block h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !isGrid && "flex items-center gap-4 p-3"
        )}
      >
        <CourseCover
          slug={course.slug}
          title={course.title}
          coverUrl={course.cover_image_url}
          categorySlug={course.category?.slug}
          className={isGrid ? "aspect-[16/9] w-full" : "h-24 w-36 shrink-0 rounded-xl"}
          iconClassName={isGrid ? undefined : "h-10 w-10 bottom-2 right-3"}
        />

        <div className={cn("space-y-2.5", isGrid ? "p-5" : "min-w-0 flex-1")}>
          <div className="flex flex-wrap items-center gap-2">
            {course.category && <Badge variant="secondary">{course.category.name}</Badge>}
            <Badge variant="outline" className={cn("capitalize", levelClasses[course.level])}>
              {course.level}
            </Badge>
          </div>

          <h3 className="line-clamp-1 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
            {course.title}
          </h3>

          {isGrid && <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">{course.description}</p>}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(course.duration_minutes)}
            </span>
            {course.lesson_count !== undefined && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {pluralize(course.lesson_count, "lesson")}
              </span>
            )}
            {!!course.learner_count && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {course.learner_count.toLocaleString()} enrolled
              </span>
            )}
          </div>
        </div>

        <ArrowUpRight
          className={cn(
            "absolute h-5 w-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary group-hover:opacity-100",
            isGrid ? "right-4 top-4 rounded-full bg-background/90 p-1 text-foreground shadow" : "right-4 top-4"
          )}
        />
      </Link>
    </motion.div>
  );
}
