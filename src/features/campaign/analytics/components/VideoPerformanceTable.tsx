"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Heart, MessageCircle, Share2, ExternalLink, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { ViewsRangeFilter } from "./ViewsRangeFilter";
import type { VideoMetric, ViewsFilter, SortOrder } from "../types/analytics.types";

interface VideoPerformanceTableProps {
  videos: VideoMetric[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  viewsFilter: ViewsFilter;
  onViewsFilterChange: (filter: ViewsFilter) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  sortOrder: SortOrder;
  onToggleSortOrder: () => void;
  isLoading: boolean;
  isPublic?: boolean;
}

export function VideoPerformanceTable({
  videos,
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  onPageChange,
  viewsFilter,
  onViewsFilterChange,
  onClearFilters,
  hasActiveFilters,
  sortOrder,
  onToggleSortOrder,
  isLoading,
  isPublic = false,
}: VideoPerformanceTableProps) {
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <Card className="p-6 border border-primary/10">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Content Performance</h3>
          <p className="text-sm text-muted-foreground">
            {isPublic ? "Top 100 videos by views" : `${totalCount.toLocaleString()} videos`}
          </p>
        </div>
        {!isPublic && (
          <div className="flex items-center gap-2">
            <ViewsRangeFilter
              minViews={viewsFilter.minViews}
              maxViews={viewsFilter.maxViews}
              isManualOnly={viewsFilter.isManualOnly}
              onFilterChange={onViewsFilterChange}
              onClear={onClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSortOrder}
              className="h-8 gap-1.5"
            >
              {sortOrder === "desc" ? (
                <ArrowDown className="h-3.5 w-3.5" />
              ) : (
                <ArrowUp className="h-3.5 w-3.5" />
              )}
              <span className="text-xs">Views</span>
            </Button>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {totalCount > 0 ? (
            isPublic
              ? `Showing ${startIndex} - ${Math.min(endIndex, 100)} of ${Math.min(totalCount, 100)}`
              : `Showing ${startIndex} - ${endIndex} of ${totalCount.toLocaleString()}`
          ) : (
            "No videos found"
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1 || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {currentPage} / {isPublic ? Math.min(totalPages, Math.ceil(100 / itemsPerPage)) : totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={isPublic
              ? currentPage >= Math.ceil(100 / itemsPerPage) || isLoading
              : currentPage >= totalPages || isLoading
            }
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Video list */}
      {!isLoading && (
        <div className="overflow-auto space-y-4">
          {videos.length > 0 ? (
            videos.map((video) => (
              <div
                key={video.postId}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                {video.mediaUrl && (
                  <div className="relative h-16 aspect-[9/16] rounded overflow-hidden bg-muted">
                    <video src={video.mediaUrl} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{video.videoId}</h4>
                    {video.isManual && (
                      <Badge variant="secondary" className="text-xs">
                        Manual
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(video.postedAt * 1000).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {video.videoUrl && (
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open on TikTok
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 min-w-[60px]">
                    <Eye className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    <span>{video.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 min-w-[60px]">
                    <Heart className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                    <span>{video.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 min-w-[60px]">
                    <Share2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{video.shares.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 min-w-[60px]">
                    <MessageCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                    <span>{video.comments.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>{hasActiveFilters ? "No videos match your filters" : "No videos found for this campaign"}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
