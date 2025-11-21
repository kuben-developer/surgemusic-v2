"use client";

import { Video } from "lucide-react";
import type { AirtableContent } from "../../shared/types/campaign.types";
import { VideoGridItem } from "./VideoGridItem";

interface VideoGridProps {
  videos: AirtableContent[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function VideoGrid({ videos }: VideoGridProps) {
  // Filter to only show videos with URLs
  const videosWithUrls = videos.filter((v) => v.video_url);

  if (videosWithUrls.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <Video className="size-12 mx-auto mb-3 opacity-30" />
        <h3 className="text-base font-semibold mb-1">No Videos Available</h3>
        <p className="text-sm">No videos with URLs found for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videosWithUrls.map((video) => (
        <VideoGridItem key={video.id} video={video} />
      ))}
    </div>
  );
}
