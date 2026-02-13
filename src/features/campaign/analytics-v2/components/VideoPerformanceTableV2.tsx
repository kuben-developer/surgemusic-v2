"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { VideoPerformanceRowV2 } from "./VideoPerformanceRowV2";
import { ViewsRangeFilter } from "../../analytics/components/ViewsRangeFilter";
import type {
  VideoPerformanceRow,
  ViewsFilter,
  SortOrder,
} from "../types/analytics-v2.types";

interface VideoPerformanceTableV2Props {
  videos: VideoPerformanceRow[];
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
}

export function VideoPerformanceTableV2({
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
}: VideoPerformanceTableV2Props) {
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <Card className="p-4 sm:p-6 border border-primary/10">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Content Performance</h3>
          <p className="text-sm text-muted-foreground">
            {totalCount.toLocaleString()} videos
          </p>
        </div>
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
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <div className="text-xs sm:text-sm text-muted-foreground">
          {totalCount > 0
            ? `${startIndex}-${endIndex} of ${totalCount.toLocaleString()}`
            : "No videos"}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1 || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
          >
            Prev
          </Button>
          <span className="text-xs sm:text-sm text-muted-foreground px-1 sm:px-2">
            {currentPage}/{totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Video list */}
      {!isLoading && (
        <div className="space-y-3">
          {videos.length > 0 ? (
            videos.map((video) => (
              <VideoPerformanceRowV2 key={video._id} video={video} />
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>
                {hasActiveFilters
                  ? "No videos match your filters"
                  : "No videos found for this campaign"}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
