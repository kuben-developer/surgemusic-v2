"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFolderDialog({ open, onOpenChange }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const folders = useQuery(api.folders.list, {});
  const createFolderMutation = useMutation(api.folders.create);

  const validateFolderName = (name: string): string | null => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return "Folder name cannot be empty.";
    }
    if (trimmedName.length > 100) {
      return "Folder name must be less than 100 characters.";
    }
    return null;
  };

  const isDuplicateName = (name: string): boolean => {
    if (!folders) return false;
    return folders.some(folder => 
      folder.name.toLowerCase() === name.toLowerCase()
    );
  };

  const handleCreate = async () => {
    const validationError = validateFolderName(folderName);
    if (validationError) {
      toast.error("Invalid folder name", {
        description: validationError,
      });
      return;
    }

    if (isDuplicateName(folderName.trim())) {
      toast.error("Duplicate folder name", {
        description: "A folder with this name already exists.",
      });
      return;
    }
    
    setIsCreating(true);
    try {
      await createFolderMutation({ name: folderName.trim() });
      setFolderName("");
      onOpenChange(false);
      toast.success("✅ Folder created successfully");
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("❌ Failed to create folder");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create New Folder
          </DialogTitle>
          <DialogDescription>
            Create a new folder to organize your campaigns.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="Enter folder name..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              maxLength={100}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && folderName.trim() && !isCreating) {
                  handleCreate();
                }
              }}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {folderName.length}/100 characters
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setFolderName("");
              onOpenChange(false);
            }}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!folderName.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Folder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}