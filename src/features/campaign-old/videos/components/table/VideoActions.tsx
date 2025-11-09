"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

interface VideoActionsProps {
  video: Doc<"generatedVideos">;
  downloadingVideos: { [key: string]: boolean };
  onDownload: (videoUrl: string, videoName: string, videoId: string) => void;
}

export function VideoActions({ 
  video, 
  downloadingVideos, 
  onDownload 
}: VideoActionsProps) {
  const isDownloading = downloadingVideos[String(video._id)];

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(video.video.url, video.video.name, String(video._id));
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={handleDownload}
      disabled={isDownloading}
      title="Download video"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}