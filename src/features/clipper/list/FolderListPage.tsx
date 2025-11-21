"use client";

import { useFolders } from "./hooks/useFolders";
import { FolderGrid } from "./components/FolderGrid";
import { CreateFolderDialog } from "./components/CreateFolderDialog";
import { Skeleton } from "@/components/ui/skeleton";

export function FolderListPage() {
  const { folders, isLoading, createFolder, deleteFolder } = useFolders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clipper Folders</h2>
          <p className="text-muted-foreground">
            Create folders and upload videos to generate clips
          </p>
        </div>
        <CreateFolderDialog onCreateFolder={createFolder} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : folders ? (
        <FolderGrid folders={folders} onDeleteFolder={deleteFolder} />
      ) : null}
    </div>
  );
}
