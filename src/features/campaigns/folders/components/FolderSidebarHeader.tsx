"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface FolderSidebarHeaderProps {
  folderCount: number;
  showCreateForm: boolean;
  onShowCreateForm: () => void;
}

export function FolderSidebarHeader({
  folderCount,
  showCreateForm,
  onShowCreateForm,
}: FolderSidebarHeaderProps) {
  return (
    <div className="p-4 border-b bg-background/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Folders</h3>
        <Badge variant="outline" className="text-xs">
          {folderCount}
        </Badge>
      </div>
      
      {!showCreateForm && (
        <Button
          onClick={onShowCreateForm}
          size="sm"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      )}
    </div>
  );
}