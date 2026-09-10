import Link from "next/link";
import { Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteTrack } from "@/lib/actions/admin";
import { getAllTracks } from "@/lib/data/admin";

export default async function AdminTracksPage() {
  const tracks = await getAllTracks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tracks</h1>
        <Button asChild>
          <Link href="/admin/tracks/new" className="gap-1">
            <Plus className="h-4 w-4" /> New track
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.map((track) => (
            <TableRow key={track.id}>
              <TableCell className="font-medium">{track.name}</TableCell>
              <TableCell className="text-muted-foreground">{track.category?.name ?? "—"}</TableCell>
              <TableCell className="flex gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/tracks/${track.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <DeleteButton onDelete={deleteTrack.bind(null, track.id)} confirmMessage={`Delete track "${track.name}"?`} />
              </TableCell>
            </TableRow>
          ))}
          {tracks.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No tracks yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
