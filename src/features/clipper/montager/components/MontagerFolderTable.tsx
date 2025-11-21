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
import { Badge } from "@/components/ui/badge";
import { Folder, Trash2, Film, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { MontagerFolderDb, MontagerFolderId } from "../../shared/types/common.types";

interface MontagerFolderTableProps {
  folders: MontagerFolderDb[];
  onDeleteFolder: (folderId: MontagerFolderId, folderName: string) => void;
}

export function MontagerFolderTable({
  folders,
  onDeleteFolder,
}: MontagerFolderTableProps) {
  const router = useRouter();
  if (folders.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <Folder className="size-12 mx-auto mb-3 opacity-30" />
        <h3 className="text-base font-semibold mb-1">No Folders Yet</h3>
        <p className="text-sm">Create your first folder to get started organizing your montages.</p>
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
            <TableHead className="text-center">Montages</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {folders.map((folder) => (
            <TableRow
              key={folder._id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/clipper/montager/${folder._id}`)}
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
                  <Film className="size-3.5" />
                  <span>{folder.videoCount}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {folder.pendingConfigs > 0 ? (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="size-3" />
                    {folder.pendingConfigs} pending
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
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
