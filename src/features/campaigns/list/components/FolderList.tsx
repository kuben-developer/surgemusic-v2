"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderItem } from "./FolderItem";
import { FolderEmptyState } from "./FolderEmptyState";
import type { Folder } from "../types/folder-sidebar.types";

interface FolderListProps {
  folders?: Folder[];
  isLoading: boolean;
  selectedFolderId: string | null;
  hasNoFolders: boolean;
  onFolderSelect: (folderId: string) => void;
}

export function FolderList({
  folders,
  isLoading,
  selectedFolderId,
  hasNoFolders,
  onFolderSelect,
}: FolderListProps) {
  const renderLoadingSkeleton = () => (
    Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg mb-2">
        <Skeleton className="h-4 w-4" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))
  );

  const renderFolders = () => (
    folders?.map((folder) => (
      <FolderItem
        key={folder._id}
        folder={folder}
        isSelected={selectedFolderId === folder._id}
        onSelect={onFolderSelect}
      />
    ))
  );

  return (
    <ScrollArea className="h-[500px]">
      <div className="p-2">
        {isLoading && renderLoadingSkeleton()}
        {!isLoading && hasNoFolders && <FolderEmptyState />}
        {!isLoading && !hasNoFolders && renderFolders()}
      </div>
    </ScrollArea>
  );
}