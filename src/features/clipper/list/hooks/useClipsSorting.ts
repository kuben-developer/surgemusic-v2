"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  ClipWithIndex,
  SortField,
  SortOrder,
  SortOptions,
} from "../types/clipper.types";

export function useClipsSorting(clips: ClipWithIndex[]) {
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: "chronological",
    order: "asc",
  });

  const sortedClips = useMemo(() => {
    const sorted = [...clips];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortOptions.field) {
        case "chronological":
          comparison = a.clipNumber - b.clipNumber;
          break;
        case "clarity":
          comparison = a.clarity - b.clarity;
          break;
        case "brightness":
          comparison = a.brightness - b.brightness;
          break;
      }

      return sortOptions.order === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [clips, sortOptions]);

  const setSortField = useCallback((field: SortField) => {
    setSortOptions((prev) => ({
      field,
      // Toggle order if clicking the same field, otherwise default to desc
      order: prev.field === field && prev.order === "desc" ? "asc" : "desc",
    }));
  }, []);

  const setSortOrder = useCallback((order: SortOrder) => {
    setSortOptions((prev) => ({ ...prev, order }));
  }, []);

  return {
    sortedClips,
    sortOptions,
    setSortField,
    setSortOrder,
  };
}
