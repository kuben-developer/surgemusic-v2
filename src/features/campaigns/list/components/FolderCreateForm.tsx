"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Loader2 } from "lucide-react";

interface FolderCreateFormProps {
  newFolderName: string;
  isCreating: boolean;
  canCreateFolder: boolean;
  onNewFolderNameChange: (name: string) => void;
  onCreateFolder: () => Promise<void>;
  onHideCreateForm: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function FolderCreateForm({
  newFolderName,
  isCreating,
  canCreateFolder,
  onNewFolderNameChange,
  onCreateFolder,
  onHideCreateForm,
  onKeyDown,
}: FolderCreateFormProps) {
  return (
    <div className="p-4 border-b bg-background/50">
      <div className="space-y-2">
        <Input
          placeholder="Folder name..."
          value={newFolderName}
          onChange={(e) => onNewFolderNameChange(e.target.value)}
          maxLength={100}
          onKeyDown={onKeyDown}
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            onClick={onCreateFolder}
            disabled={!canCreateFolder}
            size="sm"
            className="flex-1"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={onHideCreateForm}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}