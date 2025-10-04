"use client";

import type { AdvancedVideoMetric } from "../types/advanced-analytics.types";
import { TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { countriesCodeName } from "../../../../../public/countries.js";
import { TrendingUp, Clock } from "lucide-react";

interface VideoTableRowProps {
  video: AdvancedVideoMetric;
  isSelected: boolean;
  onClick: () => void;
}

export function VideoTableRow({ video, isSelected, onClick }: VideoTableRowProps) {

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
  const getTopCountry = (): { name: string; percentage: number } | null => {
    if (!video.audienceCountries || video.audienceCountries.length === 0) {
      return null;
    }

    const topCountry = video.audienceCountries
      .filter((c) => c.country.toLowerCase() !== "others")
      .sort((a, b) => b.percentage - a.percentage)[0];

    if (!topCountry) return null;

    const countryName = (countriesCodeName as Record<string, string>)[topCountry.country] || topCountry.country;
    return { name: countryName, percentage: Math.round(topCountry.percentage * 100) };
  };

  // Get view size class
  const getViewsSize = (views: number): string => {
    if (views >= 10000) return "text-lg font-black";
    if (views >= 5000) return "text-base font-bold";
    if (views >= 1000) return "text-sm font-semibold";
    return "text-sm font-medium";
  };

  // Get engagement indicator bars (full bar at 15%)
  const getEngagementBars = (rate: number): number => {
    if (rate >= 12) return 5;
    if (rate >= 9) return 4;
    if (rate >= 6) return 3;
    if (rate >= 3) return 2;
    return 1;
  };

  // Get hook score bars (full bar at 25%)
  const getHookScoreBars = (score: number | null): number => {
    if (score === null) return 0;
    const percentage = score * 100;
    if (percentage >= 20) return 5;
    if (percentage >= 15) return 4;
    if (percentage >= 10) return 3;
    if (percentage >= 5) return 2;
    return 1;
  };

  // Get bar color based on count
  const getBarColor = (index: number, filledBars: number): string => {
    if (index >= filledBars) return "bg-muted/40";

    if (filledBars === 5) return "bg-emerald-500";
    if (filledBars === 4) return "bg-blue-500";
    if (filledBars === 3) return "bg-amber-500";
    if (filledBars === 2) return "bg-orange-500";
    return "bg-red-500";
  };

  const topCountry = getTopCountry();

  return (
    <TableRow
      onClick={onClick}
      className={cn(
        "cursor-pointer group transition-all duration-200",
        "hover:bg-muted/50 hover:shadow-sm",
        isSelected && "bg-primary/10 border-l-2 border-l-primary shadow-md",
        !isSelected && "border-l-2 border-l-transparent"
      )}
      data-state={isSelected ? "selected" : undefined}
    >
      {/* Video ID Column */}
      <TableCell className="px-4 py-3">
        <div className="space-y-1">
          {/* <div className="text-xs font-medium">{video.campaignName}</div> */}
          <div className="text-[11px] font-mono text-muted-foreground/60 truncate max-w-[200px]">
            {video.videoId.slice(0, 14)}
          </div>
        </div>
      </TableCell>

      {/* Views Column */}
      <TableCell className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          {video.views >= 1000 && (
            <TrendingUp className="h-3.5 w-3.5 opacity-40" />
          )}
          <span className={cn("font-mono tabular-nums", getViewsSize(video.views))}>
            {formatViews(video.views)}
          </span>
        </div>
      </TableCell>

      {/* Engagement Rate Column */}
      <TableCell className="px-4 py-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-mono font-semibold tabular-nums">
            {video.engagementRate.toFixed(1)}%
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 w-3 rounded-full",
                  getBarColor(i, getEngagementBars(video.engagementRate))
                )}
              />
            ))}
          </div>
        </div>
      </TableCell>

      {/* Hook Score Column */}
      <TableCell className="px-4 py-3 text-center">
        {video.hookScore !== null && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-mono font-semibold tabular-nums">
              {Math.round(video.hookScore * 100)}%
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 w-3 rounded-full",
                    getBarColor(i, getHookScoreBars(video.hookScore))
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </TableCell>

      {/* Watch Time Column */}
      <TableCell className="px-4 py-3 text-center">
        {video.averageTimeWatched ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/30">
            <Clock className="h-3 w-3 opacity-50" />
            <span className="text-sm font-mono font-medium tabular-nums">
              {video.averageTimeWatched}s
            </span>
          </div>
        ) : null}
      </TableCell>

      {/* Top Country Column */}
      <TableCell className="px-4 py-3 text-left">
        {topCountry && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/40 bg-muted/20">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold opacity-60">{topCountry.percentage}%</span>
              <span className="text-xs font-medium">{topCountry.name}</span>

            </div>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
