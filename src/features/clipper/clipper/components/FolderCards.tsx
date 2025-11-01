"use client";

import { Folder, Film, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import type { ClipperFolder } from "../../shared/types/common.types";

interface FolderCardsProps {
  folders: ClipperFolder[];
  onSelectFolder: (folderName: string) => void;
}

export function FolderCards({ folders, onSelectFolder }: FolderCardsProps) {
  if (folders.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground col-span-full">
        <Folder className="size-16 mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-semibold mb-2">No Folders Yet</h3>
        <p>Create your first folder to get started organizing your videos.</p>
      </div>
    );
  }

  return (
    <>
      {folders.map((folder) => (
        <Card
          key={folder.name}
          className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 hover:bg-muted/50"
          onClick={() => onSelectFolder(folder.name)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Folder className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {folder.name}
                </h3>
                {folder.lastModified > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(folder.lastModified, {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Video className="size-4" />
                <span>
                  {folder.videoCount}{" "}
                  {folder.videoCount === 1 ? "video" : "videos"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Film className="size-4" />
                <span>
                  {folder.clipCount} {folder.clipCount === 1 ? "clip" : "clips"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
