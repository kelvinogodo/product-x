import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getResourceRequests } from "@/lib/data/admin";

export default async function AdminResourceRequestsPage() {
  const requests = await getResourceRequests();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Resource requests</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.name}</TableCell>
              <TableCell>{request.email}</TableCell>
              <TableCell className="text-muted-foreground">{request.course?.title ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(request.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No requests yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
