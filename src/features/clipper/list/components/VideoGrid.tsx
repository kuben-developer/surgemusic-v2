"use client";

import { Video } from "lucide-react";
import { VideoCard } from "./VideoCard";
import type { ClippedVideo, VideoId, FolderId } from "../types/clipper.types";

interface VideoGridProps {
  videos: ClippedVideo[];
  folderId: FolderId;
  onDeleteVideo: (videoId: VideoId) => Promise<unknown>;
}

export function VideoGrid({ videos, folderId, onDeleteVideo }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No videos yet</h3>
        <p className="text-muted-foreground">Upload a video to start generating clips.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} folderId={folderId} onDeleteVideo={onDeleteVideo} />
      ))}
    </div>
  );
}
