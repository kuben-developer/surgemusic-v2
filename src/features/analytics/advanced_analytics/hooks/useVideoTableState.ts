"use client";

import { useState, useMemo } from "react";
import type { AdvancedVideoMetric } from "../types/advanced-analytics.types";

export type SortField = "views" | "engagementRate" | "hookScore" | "averageTimeWatched";
export type SortDirection = "asc" | "desc" | null;

interface VideoTableState {
  // Filter state
  minViews: number | null;
  minEngRate: number | null;
  minHookScore: number | null;
  minWatchTime: number | null;

  // Sort state
  sortField: SortField | null;
  sortDirection: SortDirection;

  // Filtered and sorted videos
  processedVideos: AdvancedVideoMetric[];

  // Filter actions
  setMinViews: (value: number | null) => void;
  setMinEngRate: (value: number | null) => void;
  setMinHookScore: (value: number | null) => void;
  setMinWatchTime: (value: number | null) => void;
  clearFilters: () => void;

  // Sort actions
  toggleSort: (field: SortField) => void;

  // Active filter count
  activeFilterCount: number;
}

export function useVideoTableState(videos: AdvancedVideoMetric[]): VideoTableState {
  // Filter state
  const [minViews, setMinViews] = useState<number | null>(null);
  const [minEngRate, setMinEngRate] = useState<number | null>(null);
  const [minHookScore, setMinHookScore] = useState<number | null>(null);
  const [minWatchTime, setMinWatchTime] = useState<number | null>(null);

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (minViews !== null) count++;
    if (minEngRate !== null) count++;
    if (minHookScore !== null) count++;
    if (minWatchTime !== null) count++;
    return count;
  }, [minViews, minEngRate, minHookScore, minWatchTime]);

  // Clear all filters
  const clearFilters = () => {
    setMinViews(null);
    setMinEngRate(null);
    setMinHookScore(null);
    setMinWatchTime(null);
  };

  // Toggle sort: null -> desc -> asc -> null
  const toggleSort = (field: SortField) => {
    if (sortField !== field) {
      // New field - start with descending
      setSortField(field);
      setSortDirection("desc");
    } else {
      // Same field - cycle through states
      if (sortDirection === "desc") {
        setSortDirection("asc");
      } else if (sortDirection === "asc") {
        setSortField(null);
        setSortDirection(null);
      }
    }
  };

  // Process videos: filter then sort
  const processedVideos = useMemo(() => {
    let result = [...videos];

    // Apply filters (all conditions must pass)
    if (minViews !== null) {
      result = result.filter(v => v.views >= minViews);
    }

    if (minEngRate !== null) {
      result = result.filter(v => v.engagementRate >= minEngRate);
    }

    if (minHookScore !== null) {
      result = result.filter(v => {
        if (v.hookScore === null) return false;
        return (v.hookScore * 100) >= minHookScore;
      });
    }

    if (minWatchTime !== null) {
      result = result.filter(v => {
        if (!v.averageTimeWatched) return false;
        return v.averageTimeWatched >= minWatchTime;
      });
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: number;
        let bValue: number;

        switch (sortField) {
          case "views":
            aValue = a.views;
            bValue = b.views;
            break;
          case "engagementRate":
            aValue = a.engagementRate;
            bValue = b.engagementRate;
            break;
          case "hookScore":
            aValue = a.hookScore ?? -1;
            bValue = b.hookScore ?? -1;
            break;
          case "averageTimeWatched":
            aValue = a.averageTimeWatched ?? -1;
            bValue = b.averageTimeWatched ?? -1;
            break;
          default:
            return 0;
        }

        const comparison = aValue - bValue;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [videos, minViews, minEngRate, minHookScore, minWatchTime, sortField, sortDirection]);

  return {
    // State
    minViews,
    minEngRate,
    minHookScore,
    minWatchTime,
    sortField,
    sortDirection,
    processedVideos,

    // Filter actions
    setMinViews,
    setMinEngRate,
    setMinHookScore,
    setMinWatchTime,
    clearFilters,

    // Sort actions
    toggleSort,

    // Meta
    activeFilterCount,
  };
}
