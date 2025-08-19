"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Edit, 
  Trash2, 
  Loader2, 
  X,
  Check,
  Folder
} from "lucide-react";
import { toast } from "sonner";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

interface FolderHeaderProps {
  selectedFolder: Doc<"folders"> | undefined;
  folderCampaignsCount: number;
  folders: Doc<"folders">[] | undefined;
  onDeleteFolder: () => void;
}

export function FolderHeader({ 
  selectedFolder, 
  folderCampaignsCount, 
  folders,
  onDeleteFolder 
}: FolderHeaderProps) {
  const [showRenameForm, setShowRenameForm] = useState(false);
  const [renameFolderName, setRenameFolderName] = useState(selectedFolder?.name || "");
  const [isRenaming, setIsRenaming] = useState(false);

  const updateFolderMutation = useMutation(api.app.folders.update);

  // Validation helper
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

  // Check for duplicate folder names
  const isDuplicateName = (name: string, excludeId?: string): boolean => {
    if (!folders) return false;
    return folders.some(folder => 
      folder.name.toLowerCase() === name.toLowerCase() && 
      folder._id !== excludeId
    );
  };

  // Handle folder renaming
  const handleRenameFolder = async () => {
    if (!selectedFolder) return;

    const validationError = validateFolderName(renameFolderName);
    if (validationError) {
      toast.error("Invalid folder name", {
        description: validationError,
      });
      return;
    }

    if (isDuplicateName(renameFolderName.trim(), selectedFolder._id)) {
      toast.error("Duplicate folder name", {
        description: "A folder with this name already exists.",
      });
      return;
    }
    
    setIsRenaming(true);
    try {
      await updateFolderMutation({ 
        id: selectedFolder._id as Id<"folders">, 
        name: renameFolderName.trim() 
      });
      setRenameFolderName("");
      setIsRenaming(false);
      setShowRenameForm(false);
      toast.success("✅ Folder renamed successfully");
    } catch (error) {
      console.error("Failed to update folder:", error);
      setIsRenaming(false);
      toast.error("❌ Failed to rename folder");
    }
  };

  // Update rename input when folder changes
  if (selectedFolder && renameFolderName !== selectedFolder.name && !showRenameForm) {
    setRenameFolderName(selectedFolder.name);
  }

  if (!selectedFolder) return null;

  return (
    <div className="p-6 border-b bg-background/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Folder className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{selectedFolder.name}</h2>
            <p className="text-sm text-muted-foreground">
              {folderCampaignsCount} campaign{folderCampaignsCount !== 1 ? 's' : ''} in this folder
            </p>
          </div>
        </div>
        
        {/* Folder Actions */}
        <div className="flex items-center gap-2">
          {!showRenameForm ? (
            <Button
              onClick={() => setShowRenameForm(true)}
              variant="outline"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                value={renameFolderName}
                onChange={(e) => setRenameFolderName(e.target.value)}
                className="w-40"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && renameFolderName.trim()) {
                    handleRenameFolder();
                  } else if (e.key === 'Escape') {
                    setShowRenameForm(false);
                    setRenameFolderName(selectedFolder.name);
                  }
                }}
                autoFocus
              />
              <Button
                onClick={handleRenameFolder}
                disabled={!renameFolderName.trim() || isRenaming}
                size="sm"
              >
                {isRenaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowRenameForm(false);
                  setRenameFolderName(selectedFolder.name);
                }}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <Button
            onClick={onDeleteFolder}
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}