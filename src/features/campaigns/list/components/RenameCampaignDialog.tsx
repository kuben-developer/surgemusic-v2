"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface RenameCampaignDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: Id<"campaigns"> | null;
  currentName: string;
}

export function RenameCampaignDialog({
  isOpen,
  onOpenChange,
  campaignId,
  currentName,
}: RenameCampaignDialogProps) {
  const [newName, setNewName] = React.useState(currentName);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const renameCampaign = useMutation(api.app.campaigns.renameCampaign);

  React.useEffect(() => {
    setNewName(currentName);
  }, [currentName]);

  const handleRename = async () => {
    if (!campaignId) return;
    
    const trimmedName = newName.trim();
    
    if (!trimmedName) {
      toast.error("Campaign name cannot be empty");
      return;
    }
    
    if (trimmedName === currentName) {
      toast.error("Please enter a different name");
      return;
    }
    
    setIsRenaming(true);
    try {
      await renameCampaign({ campaignId, newName: trimmedName });
      toast.success("Campaign renamed successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to rename campaign");
      console.error("Rename campaign error:", error);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isRenaming) {
      handleRename();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Campaign</DialogTitle>
          <DialogDescription>
            Enter a new name for your campaign.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter campaign name"
              disabled={isRenaming}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRenaming}
          >
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={isRenaming}>
            {isRenaming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Renaming...
              </>
            ) : (
              "Rename"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}