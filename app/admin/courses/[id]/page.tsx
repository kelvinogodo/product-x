import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteLesson } from "@/lib/actions/admin";
import { getCourseById } from "@/lib/data/admin";
import { formatDuration } from "@/lib/utils";

export default async function AdminCourseLessonsPage({ params }: { params: { id: string } }) {
  const course = await getCourseById(params.id);
  if (!course) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/admin/courses" className="hover:underline">Courses</Link> / {course.title}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{course.title} — lessons</h1>
          <Button asChild>
            <Link href={`/admin/courses/${course.id}/lessons/new`} className="gap-1">
              <Plus className="h-4 w-4" /> New lesson
            </Link>
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(course.lessons ?? []).map((lesson) => (
            <TableRow key={lesson.id}>
              <TableCell>{lesson.position}</TableCell>
              <TableCell className="font-medium">{lesson.title}</TableCell>
              <TableCell className="text-muted-foreground">{formatDuration(lesson.duration_minutes)}</TableCell>
              <TableCell className="flex gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/courses/${course.id}/lessons/${lesson.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <DeleteButton
                  onDelete={deleteLesson.bind(null, lesson.id, course.id)}
                  confirmMessage={`Delete lesson "${lesson.title}"?`}
                />
              </TableCell>
            </TableRow>
          ))}
          {(course.lessons ?? []).length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No lessons yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!course.published && (
        <Badge variant="outline">This course is a draft and won&apos;t appear publicly until published.</Badge>
      )}
    </div>
  );
}
