"use client";

import React from "react";
import { Play } from "lucide-react";
import { useTikTokThumbnail } from "../hooks/useTikTokThumbnail";

interface TikTokThumbnailProps {
  tiktokVideoId: string;
}

function TikTokThumbnailInner({ tiktokVideoId }: TikTokThumbnailProps) {
  const { thumbnailUrl, isLoading } = useTikTokThumbnail(tiktokVideoId);

  return (
    <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
      {isLoading ? (
        <div className="w-full h-full animate-pulse bg-muted" />
      ) : thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Play className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export const TikTokThumbnail = React.memo(TikTokThumbnailInner);
