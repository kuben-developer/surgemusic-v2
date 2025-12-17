"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import type { VideoMetric, ViewsFilter, SortOrder } from "../types/analytics.types";

interface UseVideoPerformanceProps {
  campaignId: string;
  dates?: string[];
}

const BACKEND_PAGE_SIZE = 100;
const FRONTEND_PAGE_SIZE = 5;

export function useVideoPerformance({ campaignId, dates }: UseVideoPerformanceProps) {
  // Backend pagination state
  const [backendOffset, setBackendOffset] = useState(0);

  // Frontend (UI) pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Views filter state
  const [viewsFilter, setViewsFilter] = useState<ViewsFilter>({});

  // Sort order state
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Reset pagination when dates change
  useEffect(() => {
    setCurrentPage(1);
    setBackendOffset(0);
  }, [dates]);

  // Query the backend with current pagination and filters
  const queryResult = useQuery(api.app.analytics.getTopVideosByPostDatePaginated, {
    campaignId,
    dates,
    offset: backendOffset,
    limit: BACKEND_PAGE_SIZE,
    minViews: viewsFilter.minViews,
    maxViews: viewsFilter.maxViews,
    sortOrder,
    isManualOnly: viewsFilter.isManualOnly,
  });

  const isLoading = queryResult === undefined;
  const videos = (queryResult?.videos ?? []) as VideoMetric[];
  const totalCount = queryResult?.totalCount ?? 0;
  const hasMoreBackend = queryResult?.hasMore ?? false;

  // Calculate total pages based on total count
  const totalPages = Math.ceil(totalCount / FRONTEND_PAGE_SIZE);

  // Calculate which videos to show for the current frontend page
  const paginatedVideos = useMemo(() => {
    const globalStartIndex = (currentPage - 1) * FRONTEND_PAGE_SIZE;
    const localStartIndex = globalStartIndex - backendOffset;
    const localEndIndex = localStartIndex + FRONTEND_PAGE_SIZE;

    if (localStartIndex >= 0 && localStartIndex < videos.length) {
      return videos.slice(localStartIndex, Math.min(localEndIndex, videos.length));
    }

    return [];
  }, [videos, currentPage, backendOffset]);

  // Handle page change with auto-load-more
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;

      setCurrentPage(page);

      const globalStartIndex = (page - 1) * FRONTEND_PAGE_SIZE;
      const requiredBatchStart = Math.floor(globalStartIndex / BACKEND_PAGE_SIZE) * BACKEND_PAGE_SIZE;

      if (requiredBatchStart !== backendOffset) {
        setBackendOffset(requiredBatchStart);
      }
    },
    [totalPages, backendOffset]
  );

  // Update views filter (resets pagination)
  const updateViewsFilter = useCallback((filter: ViewsFilter) => {
    setViewsFilter(filter);
    setCurrentPage(1);
    setBackendOffset(0);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setViewsFilter({});
    setCurrentPage(1);
    setBackendOffset(0);
  }, []);

  // Toggle sort order
  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
    setBackendOffset(0);
  }, []);

  return {
    // Data
    videos: paginatedVideos,

    // Pagination state
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage: FRONTEND_PAGE_SIZE,

    // Pagination actions
    goToPage: handlePageChange,
    goToNextPage: () => handlePageChange(currentPage + 1),
    goToPrevPage: () => handlePageChange(currentPage - 1),

    // Filter state
    viewsFilter,
    updateViewsFilter,
    clearFilters,
    hasActiveFilters: viewsFilter.minViews !== undefined || viewsFilter.maxViews !== undefined || viewsFilter.isManualOnly === true,

    // Sort state
    sortOrder,
    toggleSortOrder,

    // Loading state
    isLoading,
    hasMore: hasMoreBackend,
  };
}
