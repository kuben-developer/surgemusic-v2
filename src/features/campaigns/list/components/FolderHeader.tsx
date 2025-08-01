"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, Edit, Trash2, Check, X, Loader2 } from "lucide-react";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface FolderHeaderProps {
  selectedFolder?: Doc<"folders">;
  folderCampaignsCount: number;
  
  // Rename state
  showRenameForm: boolean;
  setShowRenameForm: (show: boolean) => void;
  renameFolderName: string;
  setRenameFolderName: (name: string) => void;
  isRenaming: boolean;
  onRenameFolder: () => Promise<void>;
  
  // Actions
  onDeleteFolder: () => void;
}

export function FolderHeader({
  selectedFolder,
  folderCampaignsCount,
  showRenameForm,
  setShowRenameForm,
  renameFolderName,
  setRenameFolderName,
  isRenaming,
  onRenameFolder,
  onDeleteFolder,
}: FolderHeaderProps) {
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
                    onRenameFolder();
                  } else if (e.key === 'Escape') {
                    setShowRenameForm(false);
                    setRenameFolderName(selectedFolder?.name || "");
                  }
                }}
                autoFocus
              />
              <Button
                onClick={onRenameFolder}
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
                  setRenameFolderName(selectedFolder?.name || "");
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