"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteRequest, setRequestHandled } from "@/lib/actions/admin";
import { useToast } from "@/hooks/use-toast";

export function RequestActions({ id, handled }: { id: string; handled: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        className="gap-1"
        onClick={() =>
          startTransition(async () => {
            try {
              await setRequestHandled(id, !handled);
              router.refresh();
            } catch {
              toast({ variant: "destructive", title: "Couldn't update the request" });
            }
          })
        }
      >
        {handled ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        {handled ? "Reopen" : "Mark handled"}
      </Button>
      <DeleteButton onDelete={deleteRequest.bind(null, id)} confirmMessage="Delete this request?" />
    </div>
  );
}
