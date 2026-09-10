import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";

export type CourseCardData = {
  slug: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  level: string;
  duration_minutes: number;
  category: { name: string } | null;
};

export function CourseCard({ course, layout = "grid" }: { course: CourseCardData; layout?: "grid" | "row" }) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <Card
        className={
          layout === "grid"
            ? "group h-full overflow-hidden transition-shadow hover:shadow-md"
            : "group flex items-center gap-4 overflow-hidden p-3 transition-shadow hover:shadow-md"
        }
      >
        <div
          className={
            layout === "grid"
              ? "relative aspect-video w-full overflow-hidden bg-muted"
              : "relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-muted"
          }
        >
          {course.cover_image_url ? (
            <Image
              src={course.cover_image_url}
              alt=""
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent text-2xl font-bold text-primary/40">
              {course.title.slice(0, 1)}
            </div>
          )}
        </div>
        <CardContent className={layout === "grid" ? "space-y-2 p-4" : "flex-1 space-y-1 p-0"}>
          <div className="flex items-center gap-2">
            {course.category && <Badge variant="secondary">{course.category.name}</Badge>}
            <Badge variant="outline" className="capitalize">
              {course.level}
            </Badge>
          </div>
          <h3 className="line-clamp-1 font-semibold">{course.title}</h3>
          {layout === "grid" && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(course.duration_minutes)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
