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
import { Folder, Trash2, Video, Film } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ClipperFolder, FolderId } from "../types/clipper.types";

interface ClipperFolderTableProps {
  folders: ClipperFolder[];
  onDeleteFolder: (folderId: FolderId, folderName: string) => void;
}

export function ClipperFolderTable({
  folders,
  onDeleteFolder,
}: ClipperFolderTableProps) {
  const router = useRouter();

  if (folders.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <Folder className="size-12 mx-auto mb-3 opacity-30" />
        <h3 className="text-base font-semibold mb-1">No Folders Yet</h3>
        <p className="text-sm">Create your first folder to start uploading videos.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-center">Videos</TableHead>
            <TableHead className="text-center">Clips</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {folders.map((folder) => (
            <TableRow
              key={folder._id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/clipper/${folder._id}`)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Folder className="size-4 text-primary" />
                  <span>{folder.folderName}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatDistanceToNow(folder._creationTime, { addSuffix: true })}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Video className="size-3.5" />
                  <span>{folder.videoCount}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Film className="size-3.5" />
                  <span>{folder.clipCount}</span>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder._id, folder.folderName);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
