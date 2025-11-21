"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Film, Trash2, Loader2, ChevronRight } from "lucide-react";
import type { ClippedVideo, VideoId, FolderId } from "../types/clipper.types";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface VideoCardProps {
  video: ClippedVideo;
  folderId: FolderId;
  onDeleteVideo: (videoId: VideoId) => Promise<unknown>;
}

export function VideoCard({ video, folderId, onDeleteVideo }: VideoCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isProcessing = video.outputUrls.length === 0;
  const activeClips = video.outputUrls.filter((c) => !c.isDeleted).length;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteVideo(video._id);
      toast.success("Video deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete video";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Link href={`/clipper/${folderId}/${video.inputVideoName}`}>
        <Card className="group cursor-pointer hover:border-primary transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Video className="h-5 w-5 text-primary flex-shrink-0" />
                <CardTitle className="text-base truncate" title={video.inputVideoName}>
                  {video.inputVideoName}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isProcessing ? (
                  <Badge variant="secondary" className="animate-pulse">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Processing
                  </Badge>
                ) : (
                  <Badge variant="default">
                    <Film className="h-3 w-3 mr-1" />
                    {activeClips} clips
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Preview thumbnails */}
            {!isProcessing && video.outputUrls.length > 0 && (
              <div className="mb-3">
                <div className="grid grid-cols-3 gap-2">
                  {video.outputUrls.slice(0, 3).map((output, index) => (
                    <div
                      key={index}
                      className="relative aspect-[9/16] bg-muted rounded overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={output.thumbnailUrl}
                        alt={`Clip ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded">
                        #{output.clipNumber}
                      </div>
                    </div>
                  ))}
                </div>
                {video.outputUrls.length > 3 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    +{video.outputUrls.length - 3} more clips
                  </p>
                )}
              </div>
            )}

            {/* Processing placeholder */}
            {isProcessing && (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Generating clips...</span>
              </div>
            )}

            {/* View clips prompt */}
            {!isProcessing && (
              <div className="flex items-center justify-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                <span>View all clips</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{video.inputVideoName}&quot;?
              This will permanently delete the video and all generated clips.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
