"use client";

import type { AdvancedVideoMetric } from "../types/advanced-analytics.types";
import { TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { countriesCodeName } from "../../../../../public/countries.js";

interface VideoTableRowProps {
  video: AdvancedVideoMetric;
  isSelected: boolean;
  onClick: () => void;
}

export function VideoTableRow({ video, isSelected, onClick }: VideoTableRowProps) {
  // Format average watch time
  const formatWatchTime = (seconds: number | undefined): string => {
    if (!seconds) return "—";
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format views with K/M notation
  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  // Get top country (excluding "Others")
  const getTopCountry = (): string => {
    if (!video.audienceCountries || video.audienceCountries.length === 0) {
      return "—";
    }

    const topCountry = video.audienceCountries
      .filter((c) => c.country.toLowerCase() !== "others")
      .sort((a, b) => b.percentage - a.percentage)[0];

    if (!topCountry) return "—";

    const countryName = (countriesCodeName as Record<string, string>)[topCountry.country] || topCountry.country;
    return `${countryName} · ${Math.round(topCountry.percentage*100)}%`;
  };

  return (
    <TableRow
      onClick={onClick}
      className={cn(
        "cursor-pointer",
        isSelected && "bg-primary/5"
      )}
      data-state={isSelected ? "selected" : undefined}
    >
      {/* Video ID Column */}
      <TableCell className="px-3 py-2">
        <div className="space-y-0.5">
          <div className="text-xs font-medium tabular-nums">{video.videoId}</div>
          <div className="text-xs text-muted-foreground truncate">{video.campaignName}</div>
        </div>
      </TableCell>

      {/* Views Column */}
      <TableCell className="px-3 py-2 text-right">
        <span className="text-xs tabular-nums">
          {formatViews(video.views)}
        </span>
      </TableCell>

      {/* Engagement Rate Column */}
      <TableCell className="px-3 py-2 text-right">
        <span className="text-xs tabular-nums">
          {video.engagementRate.toFixed(1)}%
        </span>
      </TableCell>

      {/* Hook Score Column */}
      <TableCell className="px-3 py-2 text-right">
        <span className="text-xs font-medium tabular-nums">
          {video.hookScore !== null ? `${Math.round(video.hookScore * 100)}%` : "—"}
        </span>
      </TableCell>

      {/* Watch Time Column */}
      <TableCell className="px-3 py-2 text-right">
        <span className="text-xs tabular-nums">
          {formatWatchTime(video.averageTimeWatched)}
        </span>
      </TableCell>

      {/* Top Country Column */}
      <TableCell className="px-3 py-2 text-right">
        <span className="text-xs tabular-nums">
          {getTopCountry()}
        </span>
      </TableCell>
    </TableRow>
  );
}
