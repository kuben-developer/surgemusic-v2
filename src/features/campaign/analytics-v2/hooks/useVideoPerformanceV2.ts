"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { ViewsFilter, SortOrder, VideoPerformanceRow } from "../types/analytics-v2.types";

const ITEMS_PER_PAGE = 5;

interface UseVideoPerformanceV2Options {
  campaignId: string;
}

export function useVideoPerformanceV2({ campaignId }: UseVideoPerformanceV2Options) {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewsFilter, setViewsFilter] = useState<ViewsFilter>({});
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const data = useQuery(api.app.analyticsV2.getVideoPerformanceV2, {
    campaignId,
    offset,
    limit: ITEMS_PER_PAGE,
    minViews: viewsFilter.minViews,
    maxViews: viewsFilter.maxViews,
    sortOrder,
    isManualOnly: viewsFilter.isManualOnly,
  });

  const videos: VideoPerformanceRow[] = useMemo(() => {
    return (data?.videos ?? []) as VideoPerformanceRow[];
  }, [data]);

  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const isLoading = data === undefined;

  const hasActiveFilters =
    viewsFilter.minViews !== undefined ||
    viewsFilter.maxViews !== undefined ||
    viewsFilter.isManualOnly === true;

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const updateViewsFilter = useCallback((filter: ViewsFilter) => {
    setViewsFilter(filter);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setViewsFilter({});
    setCurrentPage(1);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
  }, []);

  return {
    videos,
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage: ITEMS_PER_PAGE,
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
