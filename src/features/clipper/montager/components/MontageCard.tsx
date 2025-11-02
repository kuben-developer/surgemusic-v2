"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Film } from "lucide-react";
import { CLIPS_PER_MONTAGE } from "../constants/montager.constants";
import type { Montage } from "../../shared/types/common.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MontageCardProps {
  montage: Montage;
}

export function MontageCard({ montage }: MontageCardProps) {
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  const getMontageUrlAction = useAction(api.app.montager.getMontageUrl);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handlePlayClick = async () => {
    setIsVideoDialogOpen(true);
    setIsLoadingVideo(true);

    try {
      const url = await getMontageUrlAction({ key: montage.key });
      setVideoUrl(url);
    } catch (error) {
      console.error("Error loading video URL:", error);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  return (
    <>
      <Card
        className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer"
        onClick={handlePlayClick}
      >
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="relative aspect-[9/16] bg-muted">
            {montage.thumbnailUrl ? (
              <img
                src={montage.thumbnailUrl}
                alt={montage.filename}
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
            <p className="truncate text-sm font-medium" title={montage.filename}>
              {montage.filename}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(montage.size)} • {CLIPS_PER_MONTAGE} seconds
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="truncate">{montage.filename}</DialogTitle>
          </DialogHeader>
          <div className="aspect-[9/16] bg-black">
            {isLoadingVideo ? (
              <div className="flex h-full items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white">
                Failed to load video
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
