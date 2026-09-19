"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutGrid, Rows3, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard, type CourseCardData } from "@/components/site/course-card";
import { pluralize } from "@/lib/course-ui";

export function CourseGrid({ courses, filterKey }: { courses: CourseCardData[]; filterKey: string }) {
  const [view, setView] = useState<"grid" | "row">("grid");

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {pluralize(courses.length, "course")}
        </p>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "row" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView("row")}
            aria-label="List view"
            aria-pressed={view === "row"}
          >
            <Rows3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-14 text-center"
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <SearchX className="h-6 w-6" />
          </span>
          <p className="font-medium">No courses match your filters</p>
          <p className="text-sm text-muted-foreground">Try a different search term or category.</p>
          <Button variant="outline" asChild className="mt-2 rounded-full">
            <Link href="/courses">Clear filters</Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key={`${filterKey}-${view}`}
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className={view === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}
        >
          {courses.map((course) => (
            <motion.div
              key={course.slug}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <CourseCard course={course} layout={view} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
