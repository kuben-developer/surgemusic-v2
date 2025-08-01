"use client";

import { Folder } from "lucide-react";

export function FolderEmptyState() {
  return (
    <div className="text-center py-12 px-4">
      <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground mb-2">No folders yet</p>
      <p className="text-xs text-muted-foreground">
        Create your first folder to organize campaigns
      </p>
    </div>
  );
}