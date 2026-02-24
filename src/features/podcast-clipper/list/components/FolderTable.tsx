"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Folder, Trash2, Video } from "lucide-react";
import { CalibrationStatusBadge } from "../../shared/components/StatusBadge";
import type { PodcastClipperFolder, PodcastFolderId } from "../../shared/types/podcast-clipper.types";

interface FolderTableProps {
  folders: PodcastClipperFolder[];
  onDeleteFolder: (folderId: PodcastFolderId, folderName: string) => void;
}

export function FolderTable({ folders, onDeleteFolder }: FolderTableProps) {
  const router = useRouter();

  if (folders.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No folders yet</h3>
        <p className="text-muted-foreground">
          Create a folder to get started with podcast reframing.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Folder Name</TableHead>
          <TableHead className="text-center">Videos</TableHead>
          <TableHead className="text-center">Reframed</TableHead>
          <TableHead className="text-center">Calibration</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {folders.map((folder) => (
          <TableRow
            key={folder._id}
            className="cursor-pointer"
            onClick={() => router.push(`/podcast-clipper/${folder._id}`)}
          >
            <TableCell>
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-primary" />
                <span className="font-medium">{folder.folderName}</span>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Video className="h-3.5 w-3.5 text-muted-foreground" />
                {folder.videoCount}
              </div>
            </TableCell>
            <TableCell className="text-center">{folder.reframedCount}</TableCell>
            <TableCell className="text-center">
              <CalibrationStatusBadge status={folder.calibrationStatus} />
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder._id, folder.folderName);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
