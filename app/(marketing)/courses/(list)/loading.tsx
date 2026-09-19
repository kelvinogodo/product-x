import { CourseCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function CoursesLoading() {
  return (
    <div className="container py-12">
      <div className="mb-8 space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-11 w-full max-w-md rounded-full" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
