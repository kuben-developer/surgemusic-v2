"use client";

import { ExternalLink, TrendingUp, Clock } from "lucide-react";
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

  // Get performance indicator color
  const getEngagementColor = (rate: number) => {
    if (rate >= 8) return "text-emerald-600 dark:text-emerald-400";
    if (rate >= 5) return "text-blue-600 dark:text-blue-400";
    if (rate >= 3) return "text-amber-600 dark:text-amber-400";
    return "text-muted-foreground";
  };

  const getHookScoreColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 0.6) return "text-blue-600 dark:text-blue-400";
    if (score >= 0.4) return "text-amber-600 dark:text-amber-400";
    return "text-muted-foreground";
  };

  return (
    <tr
      onClick={onClick}
      className={cn(
        "group cursor-pointer transition-all duration-200 relative",
        "hover:bg-muted/30",
        isSelected && "bg-primary/5 hover:bg-primary/10",
        "after:absolute after:inset-x-6 after:bottom-0 after:h-px after:bg-border/0 hover:after:bg-primary/20 after:transition-colors"
      )}
    >
      {/* Video Info Column */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Thumbnail with overlay effect */}
          <div className="relative h-16 w-[72px] rounded-lg overflow-hidden bg-muted/50 flex-shrink-0 ring-1 ring-border/20 group-hover:ring-primary/30 transition-all">
            <video
              src={video.videoUrl}
              className="h-full w-full object-cover"
              poster={video.thumbnailUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {video.campaignName}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {new Date(video.postedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {video.platform === "tiktok" && video.videoUrl && (
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                <span>View on TikTok</span>
              </a>
            )}
          </div>
        </div>
      </td>

      {/* Views Column */}
      <td className="px-6 py-4 text-right">
        <div className="inline-flex items-center gap-1.5">
          <span className="font-semibold tabular-nums text-sm">
            {video.views.toLocaleString()}
          </span>
        </div>
      </td>

      {/* Avg Watch Time Column */}
      <td className="px-6 py-4 text-right">
        <span className="text-sm font-medium tabular-nums">
          {formatWatchTime(video.averageTimeWatched)}
        </span>
      </td>

      {/* Hook Score Column */}
      <td className="px-6 py-4 text-right">
        {video.hookScore !== null ? (
          <div className="inline-flex items-center gap-1.5">
            <span className={cn(
              "font-semibold text-sm tabular-nums",
              getHookScoreColor(video.hookScore)
            )}>
              {Math.round(video.hookScore * 100)}%
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground/50">—</span>
        )}
      </td>

      {/* Engagement Rate Column */}
      <td className="px-6 py-4 text-right">
        <div className="inline-flex items-center gap-1.5">
          <TrendingUp className={cn(
            "h-3.5 w-3.5",
            getEngagementColor(video.engagementRate)
          )} />
          <span className={cn(
            "font-semibold text-sm tabular-nums",
            getEngagementColor(video.engagementRate)
          )}>
            {video.engagementRate.toFixed(1)}%
          </span>
        </div>
      </td>
    </tr>
  );
}
