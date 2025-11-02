"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Folder, Trash2, Film } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { MontagerFolder } from "../../shared/types/common.types";

interface MontagerFolderTableProps {
  folders: MontagerFolder[];
  onSelectFolder: (folderName: string) => void;
  onDeleteFolder: (folderName: string) => void;
}

export function MontagerFolderTable({
  folders,
  onSelectFolder,
  onDeleteFolder,
}: MontagerFolderTableProps) {
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
            <TableHead>Last Modified</TableHead>
            <TableHead className="text-center">Montages</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {folders.map((folder) => (
            <TableRow
              key={folder.name}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSelectFolder(folder.name)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Folder className="size-4 text-primary" />
                  <span>{folder.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {folder.lastModified > 0
                  ? formatDistanceToNow(folder.lastModified, { addSuffix: true })
                  : "—"}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Film className="size-3.5" />
                  <span>{folder.montageCount}</span>
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.name);
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
