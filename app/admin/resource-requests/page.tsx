import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RequestActions } from "@/components/admin/request-actions";
import { getResourceRequests } from "@/lib/data/admin";

export default async function AdminResourceRequestsPage() {
  const requests = await getResourceRequests();
  const open = requests.filter((r) => !r.handled_at).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resource requests</h1>
        <p className="text-sm text-muted-foreground">
          {open} open &middot; {requests.length - open} handled
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-48" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.name}</TableCell>
              <TableCell>
                <a href={`mailto:${request.email}`} className="text-primary hover:underline">
                  {request.email}
                </a>
              </TableCell>
              <TableCell className="text-muted-foreground">{request.course?.title ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={request.handled_at ? "success" : "outline"}>{request.handled_at ? "Handled" : "Open"}</Badge>
              </TableCell>
              <TableCell>
                <RequestActions id={request.id} handled={Boolean(request.handled_at)} />
              </TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No requests yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
