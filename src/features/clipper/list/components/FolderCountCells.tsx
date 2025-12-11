"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Video, Film } from "lucide-react";
import { TableCell } from "@/components/ui/table";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface FolderCountCellsProps {
  folderId: Id<"clipperFolders">;
}

export function FolderCountCells({ folderId }: FolderCountCellsProps) {
  const counts = useQuery(api.app.clipperDb.getFolderCounts, { folderId });

  // Show loading state while counts are being fetched
  if (counts === undefined) {
    return (
      <>
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Video className="size-3.5" />
            <span className="w-4 h-4 bg-muted animate-pulse rounded" />
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Film className="size-3.5" />
            <span className="w-4 h-4 bg-muted animate-pulse rounded" />
          </div>
        </TableCell>
      </>
    );
  }

  return (
    <>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <Video className="size-3.5" />
          <span>{counts.videoCount}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <Film className="size-3.5" />
          <span>{counts.clipCount}</span>
        </div>
      </TableCell>
    </>
  );
}
