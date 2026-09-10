import Link from "next/link";
import { Edit, ListTree, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCourse } from "@/lib/actions/admin";
import { getAllCourses } from "@/lib/data/admin";

export default async function AdminCoursesPage() {
  const courses = await getAllCourses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
        <Button asChild>
          <Link href="/admin/courses/new" className="gap-1">
            <Plus className="h-4 w-4" /> New course
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">{course.title}</TableCell>
              <TableCell className="text-muted-foreground">{course.category?.name ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={course.published ? "success" : "outline"}>
                  {course.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell className="flex gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/courses/${course.id}`} title="Manage lessons">
                    <ListTree className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/courses/${course.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <DeleteButton onDelete={deleteCourse.bind(null, course.id)} confirmMessage={`Delete course "${course.title}"?`} />
              </TableCell>
            </TableRow>
          ))}
          {courses.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No courses yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
