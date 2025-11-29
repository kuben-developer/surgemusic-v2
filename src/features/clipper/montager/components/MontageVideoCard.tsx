"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Film } from "lucide-react";
import { CLIPS_PER_MONTAGE } from "../constants/montager.constants";
import type { MontagerVideoDb } from "../../shared/types/common.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MontageVideoCardProps {
  video: MontagerVideoDb;
}

export function MontageVideoCard({ video }: MontageVideoCardProps) {
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  const handlePlayClick = () => {
    setIsVideoDialogOpen(true);
  };

  // Extract filename from video URL or use a default name
  const filename = video.videoUrl.split("/").pop() || "montage.mp4";

  return (
    <>
      <Card
        className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer"
        onClick={handlePlayClick}
      >
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="relative aspect-[9/16] bg-muted">
            {video.thumbnailUrl && video.thumbnailUrl !== "manual_upload" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.thumbnailUrl}
                alt={filename}
                className="h-full w-full object-cover"
              />
            ) : video.thumbnailUrl === "manual_upload" ? (
              <video
                src={video.videoUrl}
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Film className="size-12 text-muted-foreground" />
              </div>
            )}

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full bg-white p-3">
                <Play className="size-6 text-black" />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-1 p-3">
            <p className="truncate text-sm font-medium" title={filename}>
              {filename}
            </p>
            <p className="text-xs text-muted-foreground">
              {CLIPS_PER_MONTAGE} clips
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="truncate">{filename}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 bg-black flex items-center justify-center">
            <video
              src={video.videoUrl}
              controls
              autoPlay
              className="max-h-[calc(90vh-8rem)] max-w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
