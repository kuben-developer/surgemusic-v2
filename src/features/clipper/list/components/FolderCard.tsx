"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Video, Film, Trash2 } from "lucide-react";
import type { ClipperFolder, FolderId } from "../types/clipper.types";

interface FolderCardProps {
  folder: ClipperFolder;
  onDeleteClick: (e: React.MouseEvent, folderId: FolderId) => void;
}

export function FolderCard({ folder, onDeleteClick }: FolderCardProps) {
  // Fetch counts separately to avoid byte limit issues
  const counts = useQuery(api.app.clipperDb.getFolderCounts, { folderId: folder._id });

  const videoCount = counts?.videoCount ?? 0;
  const clipCount = counts?.clipCount ?? 0;
  const isLoadingCounts = counts === undefined;

  return (
    <Link href={`/clipper/${folder._id}`}>
      <Card className="cursor-pointer hover:border-primary transition-colors group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              <CardTitle className="text-base truncate">{folder.folderName}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => onDeleteClick(e, folder._id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Video className="h-4 w-4" />
              {isLoadingCounts ? (
                <span className="w-6 h-4 bg-muted animate-pulse rounded" />
              ) : (
                `${videoCount} ${videoCount === 1 ? "video" : "videos"}`
              )}
            </span>
            <span className="flex items-center gap-1">
              <Film className="h-4 w-4" />
              {isLoadingCounts ? (
                <span className="w-6 h-4 bg-muted animate-pulse rounded" />
              ) : (
                `${clipCount} ${clipCount === 1 ? "clip" : "clips"}`
              )}
            </span>
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
