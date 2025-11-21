"use client";

import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";

interface CreateFolderCardProps {
  onFolderCreated: () => void;
}

export function CreateFolderCard({ onFolderCreated }: CreateFolderCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const createFolderAction = useAction(api.app.clipperS3.createFolder);

  const handleCreate = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createFolderAction({ folderName: folderName.trim() });

      if (result.success) {
        toast.success(result.message);
        setFolderName("");
        setIsDialogOpen(false);
        onFolderCreated();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create folder"
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Card
        className="cursor-pointer border-dashed transition-all hover:shadow-lg hover:border-primary/50 hover:bg-muted/50"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 h-full">
          <div className="rounded-full bg-primary/10 p-4 mb-3">
            <Plus className="size-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">New Folder</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Create a folder to organize your videos
          </p>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your folder. You can use letters, numbers,
              hyphens, and underscores.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                placeholder="e.g., Summer2025, Eminem, Ariana"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isCreating) {
                    handleCreate();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
