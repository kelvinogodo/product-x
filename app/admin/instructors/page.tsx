import Link from "next/link";
import { Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar } from "@/components/site/avatar";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteInstructor } from "@/lib/actions/admin";
import { getAllInstructors } from "@/lib/data/admin";

export default async function AdminInstructorsPage() {
  const instructors = await getAllInstructors();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Instructors</h1>
        <Button asChild>
          <Link href="/admin/instructors/new" className="gap-1">
            <Plus className="h-4 w-4" /> New instructor
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {instructors.map((instructor) => (
            <TableRow key={instructor.id}>
              <TableCell className="font-medium">
                <span className="flex items-center gap-3">
                  <Avatar name={instructor.name} src={instructor.avatar_url} size={28} />
                  {instructor.name}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{instructor.slug}</TableCell>
              <TableCell className="flex gap-1">
                <Button variant="ghost" size="icon" asChild aria-label={`Edit ${instructor.name}`}>
                  <Link href={`/admin/instructors/${instructor.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <DeleteButton
                  onDelete={deleteInstructor.bind(null, instructor.id)}
                  confirmMessage={`Delete instructor "${instructor.name}"? Their courses will be left without an instructor.`}
                />
              </TableCell>
            </TableRow>
          ))}
          {instructors.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No instructors yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
