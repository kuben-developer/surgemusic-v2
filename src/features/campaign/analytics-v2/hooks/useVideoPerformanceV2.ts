"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { ViewsFilter, SortOrder, VideoPerformanceRow, PlatformFilter } from "../types/analytics-v2.types";

const BACKEND_PAGE_SIZE = 100;
const FRONTEND_PAGE_SIZE = 5;

interface UseVideoPerformanceV2Options {
  campaignId: string;
  dateFrom?: number;
  dateTo?: number;
  platform?: PlatformFilter;
}

export function useVideoPerformanceV2({ campaignId, dateFrom, dateTo, platform = "all" }: UseVideoPerformanceV2Options) {
  const [currentPage, setCurrentPage] = useState(1);
  const [backendOffset, setBackendOffset] = useState(0);
  const [viewsFilter, setViewsFilter] = useState<ViewsFilter>({});
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Fetch a batch of 100 items from the backend
  const data = useQuery(api.app.analyticsV2.getVideoPerformanceV2, {
    campaignId,
    offset: backendOffset,
    limit: BACKEND_PAGE_SIZE,
    minViews: viewsFilter.minViews,
    maxViews: viewsFilter.maxViews,
    sortOrder,
    isManualOnly: viewsFilter.isManualOnly,
    dateFrom,
    dateTo,
    platform,
  });

  const allVideos = (data?.videos ?? []) as VideoPerformanceRow[];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / FRONTEND_PAGE_SIZE));
  const isLoading = data === undefined;

  // Slice the current 5-item page from the preloaded 100-item batch
  const videos: VideoPerformanceRow[] = useMemo(() => {
    const globalStartIndex = (currentPage - 1) * FRONTEND_PAGE_SIZE;
    const localStartIndex = globalStartIndex - backendOffset;
    const localEndIndex = localStartIndex + FRONTEND_PAGE_SIZE;

    if (localStartIndex >= 0 && localStartIndex < allVideos.length) {
      return allVideos.slice(localStartIndex, Math.min(localEndIndex, allVideos.length));
    }
    return [];
  }, [allVideos, currentPage, backendOffset]);

  const hasActiveFilters =
    viewsFilter.minViews !== undefined ||
    viewsFilter.maxViews !== undefined ||
    viewsFilter.isManualOnly === true;

  const goToPage = useCallback((page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clamped);

    // Check if the requested page falls outside the current backend batch
    const globalStartIndex = (clamped - 1) * FRONTEND_PAGE_SIZE;
    const requiredBatchStart = Math.floor(globalStartIndex / BACKEND_PAGE_SIZE) * BACKEND_PAGE_SIZE;

    if (requiredBatchStart !== backendOffset) {
      setBackendOffset(requiredBatchStart);
    }
  }, [totalPages, backendOffset]);

  const updateViewsFilter = useCallback((filter: ViewsFilter) => {
    setViewsFilter(filter);
    setCurrentPage(1);
    setBackendOffset(0);
  }, []);

  const clearFilters = useCallback(() => {
    setViewsFilter({});
    setCurrentPage(1);
    setBackendOffset(0);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
    setBackendOffset(0);
  }, []);

  return {
    videos,
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage: FRONTEND_PAGE_SIZE,
    isLoading,
    viewsFilter,
    sortOrder,
    hasActiveFilters,
    goToPage,
    updateViewsFilter,
    clearFilters,
    toggleSortOrder,
  };
}
