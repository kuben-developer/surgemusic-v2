"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { CommentSortBy, CommentSortOrder } from "../types/comment.types";

interface UseSelectedCommentsOptions {
  campaignId: string;
}

export function useSelectedComments({ campaignId }: UseSelectedCommentsOptions) {
  const [sortBy, setSortBy] = useState<CommentSortBy>("likes");
  const [sortOrder, setSortOrder] = useState<CommentSortOrder>("desc");

  // Fetch only selected comments
  const comments = useQuery(api.app.comments.getSelectedComments, {
    campaignId,
    sortBy,
    sortOrder,
  });

  // Sorting handlers
  const handleSortChange = useCallback((newSortBy: CommentSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(prev => prev === "desc" ? "asc" : "desc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  }, [sortBy]);

  return {
    comments: comments ?? [],
    totalCount: comments?.length ?? 0,
    isLoading: comments === undefined,
    sortBy,
    sortOrder,
    handleSortChange,
  };
}
