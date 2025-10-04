"use client";

import { ExternalLink } from "lucide-react";
import type { AdvancedVideoMetric } from "../types/advanced-analytics.types";
import { cn } from "@/lib/utils";

interface VideoTableRowProps {
  video: AdvancedVideoMetric;
  isSelected: boolean;
  onClick: () => void;
}

export function VideoTableRow({ video, isSelected, onClick }: VideoTableRowProps) {
  // Format average watch time
  const formatWatchTime = (seconds: number | undefined): string => {
    if (!seconds) return "N/A";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <tr
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-colors hover:bg-muted/50",
        isSelected && "bg-primary/10 hover:bg-primary/15"
      )}
    >
      {/* Video Info Column */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="relative h-16 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
            <video
              src={video.videoUrl}
              className="h-full w-full object-cover"
              poster={video.thumbnailUrl}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate text-sm">{video.campaignName}</h4>
            <p className="text-xs text-muted-foreground">
              Posted{" "}
              {new Date(video.postedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            {video.platform === "tiktok" && video.videoUrl && (
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                Open on TikTok
              </a>
            )}
          </div>
        </div>
      </td>

      {/* Views Column */}
      <td className="p-4 text-right">
        <span className="font-medium">{video.views.toLocaleString()}</span>
      </td>

      {/* Avg Watch Time Column */}
      <td className="p-4 text-right">
        <span>{formatWatchTime(video.averageTimeWatched)}</span>
      </td>

      {/* Hook Score Column */}
      <td className="p-4 text-right">
        {video.hookScore !== null ? (
          <span className="font-medium">{Math.round(video.hookScore * 100)}%</span>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )}
      </td>

      {/* Engagement Rate Column */}
      <td className="p-4 text-right">
        <span className="font-medium">{video.engagementRate.toFixed(1)}%</span>
      </td>
    </tr>
  );
}
