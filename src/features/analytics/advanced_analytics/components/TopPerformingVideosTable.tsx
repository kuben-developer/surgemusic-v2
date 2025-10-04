"use client";

import { useState, useEffect, useRef } from "react";
import { Hash, Eye, TrendingUp, Target, Clock, Globe, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { VideoTableRow } from "./VideoTableRow";
import { VideoMetricFilters } from "./VideoMetricFilters";
import { useVideoTableState } from "../hooks/useVideoTableState";
import type { AdvancedVideoMetric } from "../types/advanced-analytics.types";
import type { SortField } from "../hooks/useVideoTableState";
import { cn } from "@/lib/utils";

interface TopPerformingVideosTableProps {
  videos: AdvancedVideoMetric[];
  selectedVideoId: string | null;
  onVideoSelect: (videoId: string) => void;
}

const INITIAL_LOAD = 20;
const LOAD_MORE_COUNT = 20;

export function TopPerformingVideosTable({
  videos,
  selectedVideoId,
  onVideoSelect,
}: TopPerformingVideosTableProps) {
  const {
    minViews,
    minEngRate,
    minHookScore,
    minWatchTime,
    sortField,
    sortDirection,
    processedVideos,
    setMinViews,
    setMinEngRate,
    setMinHookScore,
    setMinWatchTime,
    toggleSort,
    activeFilterCount,
  } = useVideoTableState(videos);

  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreTriggerRef = useRef<HTMLTableRowElement>(null);

  const displayedVideos = processedVideos.slice(0, displayCount);
  const hasMore = displayCount < processedVideos.length;

  // Reset display count when filters or sort change
  useEffect(() => {
    setDisplayCount(INITIAL_LOAD);
  }, [minViews, minEngRate, minHookScore, minWatchTime, sortField, sortDirection]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreTriggerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !isLoadingMore && hasMore) {
          setIsLoadingMore(true);

          // Simulate async loading
          setTimeout(() => {
            setDisplayCount((prev) => Math.min(prev + LOAD_MORE_COUNT, processedVideos.length));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(loadMoreTriggerRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, processedVideos.length]);

  // Helper to render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 opacity-100" />
    ) : (
      <ArrowDown className="h-3 w-3 opacity-100" />
    );
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Filter Section */}
      <VideoMetricFilters
        minViews={minViews}
        minEngRate={minEngRate}
        minHookScore={minHookScore}
        minWatchTime={minWatchTime}
        onMinViewsChange={setMinViews}
        onMinEngRateChange={setMinEngRate}
        onMinHookScoreChange={setMinHookScore}
        onMinWatchTimeChange={setMinWatchTime}
      />

      {/* Enhanced Table */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/5">
        <div className="overflow-auto max-h-[700px]">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
              <tr className="border-b border-border/40">
                {/* Video Column - Not Sortable */}
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Hash className="h-3 w-3" />
                    <span>Video</span>
                  </div>
                </th>

                {/* Views Column - Sortable */}
                <th
                  className="px-3 py-2.5 text-center text-xs font-medium tracking-wider cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => toggleSort("views")}
                >
                  <div className={cn(
                    "flex items-center justify-center gap-1.5",
                    sortField === "views" ? "text-foreground" : "text-muted-foreground"
                  )}>
                    <Eye className="h-3 w-3" />
                    <span>Views</span>
                    {renderSortIcon("views")}
                  </div>
                </th>

                {/* Eng Rate Column - Sortable */}
                <th
                  className="px-3 py-2.5 text-center text-xs font-medium tracking-wider cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => toggleSort("engagementRate")}
                >
                  <div className={cn(
                    "flex items-center justify-center gap-1.5",
                    sortField === "engagementRate" ? "text-foreground" : "text-muted-foreground"
                  )}>
                    <TrendingUp className="h-3 w-3" />
                    <span>Eng Rate</span>
                    {renderSortIcon("engagementRate")}
                  </div>
                </th>

                {/* Hook Score Column - Sortable */}
                <th
                  className="px-3 py-2.5 text-center text-xs font-medium tracking-wider cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => toggleSort("hookScore")}
                >
                  <div className={cn(
                    "flex items-center justify-center gap-1.5",
                    sortField === "hookScore" ? "text-foreground" : "text-muted-foreground"
                  )}>
                    <Target className="h-3 w-3" />
                    <span>Hook Score</span>
                    {renderSortIcon("hookScore")}
                  </div>
                </th>

                {/* Watch Time Column - Sortable */}
                <th
                  className="px-3 py-2.5 text-center text-xs font-medium tracking-wider cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => toggleSort("averageTimeWatched")}
                >
                  <div className={cn(
                    "flex items-center justify-center gap-1.5",
                    sortField === "averageTimeWatched" ? "text-foreground" : "text-muted-foreground"
                  )}>
                    <Clock className="h-3 w-3" />
                    <span>Watch Time</span>
                    {renderSortIcon("averageTimeWatched")}
                  </div>
                </th>

                {/* Top Country Column - Not Sortable */}
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground tracking-wider">
                  <div className="flex items-center justify-start gap-1.5">
                    <Globe className="h-3 w-3" />
                    <span>Top Country</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className={cn(
              "divide-y divide-border/30",
              displayedVideos.length === 0 && "divide-y-0"
            )}>
              {displayedVideos.length > 0 ? (
                <>
                  {displayedVideos.map((video) => (
                    <VideoTableRow
                      key={video.id}
                      video={video}
                      isSelected={selectedVideoId === video.id}
                      onClick={() => onVideoSelect(video.id)}
                    />
                  ))}

                  {/* Infinite Scroll Trigger */}
                  {hasMore && (
                    <tr ref={loadMoreTriggerRef}>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">
                            Loading more videos...
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* All Loaded Message */}
                  {!hasMore && processedVideos.length > INITIAL_LOAD && (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center">
                        <span className="text-xs text-muted-foreground">
                          All {processedVideos.length} videos loaded
                        </span>
                      </td>
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-primary/70"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-foreground">
                          No videos found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activeFilterCount > 0
                            ? "Try adjusting your filters"
                            : "Try selecting different campaigns or date ranges"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
