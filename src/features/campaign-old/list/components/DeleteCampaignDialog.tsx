"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface DeleteCampaignDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: Id<"campaigns"> | null;
  campaignName: string;
}

export function DeleteCampaignDialog({
  isOpen,
  onOpenChange,
  campaignId,
  campaignName,
}: DeleteCampaignDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const deleteCampaign = useMutation(api.app.campaigns.deleteCampaign);

  const handleDelete = async () => {
    if (!campaignId) return;
    
    setIsDeleting(true);
    try {
      await deleteCampaign({ campaignId });
      toast.success("Campaign deleted successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete campaign");
      console.error("Delete campaign error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the campaign
            named &quot;<span className="font-semibold">{campaignName}</span>&quot; and all
            associated videos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Campaign"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}