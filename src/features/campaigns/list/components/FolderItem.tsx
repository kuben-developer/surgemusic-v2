"use client";

import { Folder, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Folder as FolderType } from "../types/folder-sidebar.types";

interface FolderItemProps {
  folder: FolderType;
  isSelected: boolean;
  onSelect: (folderId: string) => void;
}

export function FolderItem({
  folder,
  isSelected,
  onSelect,
}: FolderItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        isSelected 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "text-muted-foreground hover:text-foreground"
      )}
      onClick={() => onSelect(folder._id)}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Folder className="h-4 w-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {folder.name}
          </p>
          <p className="text-xs opacity-70">
            {folder.campaignCount} campaign{folder.campaignCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      {isSelected && (
        <ChevronRight className="h-4 w-4 flex-shrink-0" />
      )}
    </div>
  );
}