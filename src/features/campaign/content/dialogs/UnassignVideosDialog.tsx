"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface UnassignVideosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedVideoIds: Set<string>;
  onSuccess?: () => void;
}

export function UnassignVideosDialog({
  open,
  onOpenChange,
  selectedVideoIds,
  onSuccess,
}: UnassignVideosDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const unassignVideos = useMutation(api.app.montagerDb.unassignVideosFromAirtable);

  const count = selectedVideoIds.size;

  const handleUnassign = async () => {
    if (count === 0) return;

    setIsLoading(true);
    try {
      const videoIds = Array.from(selectedVideoIds) as Id<"montagerVideos">[];
      const result = await unassignVideos({ videoIds });

      if (result.success) {
        toast.success(
          `Successfully unassigned ${result.count} video${result.count === 1 ? "" : "s"}`
        );
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to unassign videos:", error);
      toast.error("Failed to unassign videos. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Unassign {count} Video{count === 1 ? "" : "s"}?
          </DialogTitle>
          <DialogDescription>
            These videos will be returned to the Montager folder as pending and
            can be reassigned to other content.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-100">
          <strong>Note:</strong> The processed video files will be cleared. You
          will need to re-process these videos after reassigning them.
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleUnassign}
            disabled={isLoading || count === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Unassigning...
              </>
            ) : (
              `Unassign ${count} Video${count === 1 ? "" : "s"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
