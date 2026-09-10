"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard, type CourseCardData } from "@/components/site/course-card";

export function CourseGrid({ courses }: { courses: CourseCardData[] }) {
  const [view, setView] = useState<"grid" | "row">("grid");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {courses.length} course{courses.length === 1 ? "" : "s"}
        </p>
        <div className="flex gap-1">
          <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setView("grid")} aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === "row" ? "secondary" : "ghost"} size="icon" onClick={() => setView("row")} aria-label="List view">
            <Rows3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
          No courses in this category yet.
        </div>
      ) : (
        <motion.div layout className={view === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
          {courses.map((course) => (
            <motion.div key={course.slug} layout>
              <CourseCard course={course} layout={view} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
