"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function DeleteButton({ onDelete, confirmMessage }: { onDelete: () => Promise<void>; confirmMessage: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={pending}
      aria-label="Delete"
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          try {
            await onDelete();
            toast({ title: "Deleted" });
            router.refresh();
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Couldn't delete",
              description: error instanceof Error ? error.message : "Please try again.",
            });
          }
        });
      }}
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
