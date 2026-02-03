"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import type { CommentSortBy, CommentSortOrder } from "../types/comment.types";
import { toast } from "sonner";

export type CommentFilterBy = "all" | "selected" | "unselected";

interface UseCommentCurationOptions {
  campaignId: string;
  limit?: number;
}

export function useCommentCuration({ campaignId, limit = 50 }: UseCommentCurationOptions) {
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState<CommentSortBy>("likes");
  const [sortOrder, setSortOrder] = useState<CommentSortOrder>("desc");
  const [filterBy, setFilterBy] = useState<CommentFilterBy>("all");
  const [selectedIds, setSelectedIds] = useState<Set<Id<"tiktokComments">>>(new Set());

  // Fetch comments
  const commentsData = useQuery(api.app.comments.getCommentsForCuration, {
    campaignId,
    offset,
    limit,
    sortBy,
    sortOrder,
    filterBy,
  });

  // Mutations
  const updateSelectionsMutation = useMutation(api.app.comments.updateCommentSelections);
  const selectTopByLikesMutation = useMutation(api.app.comments.selectTopCommentsByLikes);

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    setOffset((page - 1) * limit);
  }, [limit]);

  const totalPages = useMemo(() => {
    if (!commentsData) return 0;
    return Math.ceil(commentsData.totalCount / limit);
  }, [commentsData, limit]);

  const currentPage = useMemo(() => {
    return Math.floor(offset / limit) + 1;
  }, [offset, limit]);

  // Sorting handlers
  const handleSortChange = useCallback((newSortBy: CommentSortBy) => {
    if (newSortBy === sortBy) {
      // Toggle order
      setSortOrder(prev => prev === "desc" ? "asc" : "desc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc"); // Default to desc for new sort field
    }
    setOffset(0); // Reset to first page
  }, [sortBy]);

  // Filter handler
  const handleFilterChange = useCallback((newFilter: CommentFilterBy) => {
    setFilterBy(newFilter);
    setOffset(0); // Reset to first page
    setSelectedIds(new Set()); // Clear local selection
  }, []);

  // Selection handlers
  const toggleSelection = useCallback((commentId: Id<"tiktokComments">) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!commentsData) return;
    const allIds = new Set(commentsData.comments.map(c => c._id));
    setSelectedIds(allIds);
  }, [commentsData]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Save selections to database
  const saveSelections = useCallback(async (isSelected: boolean) => {
    if (selectedIds.size === 0) {
      toast.error("No comments selected");
      return;
    }

    try {
      await updateSelectionsMutation({
        commentIds: Array.from(selectedIds),
        isSelected,
      });
      toast.success(`${selectedIds.size} comment(s) ${isSelected ? "selected for display" : "removed from display"}`);
      setSelectedIds(new Set()); // Clear local selection after save
    } catch (error) {
      console.error("Failed to update selections:", error);
      toast.error("Failed to update selections");
    }
  }, [selectedIds, updateSelectionsMutation]);

  // Select top N by likes
  const selectTopByLikes = useCallback(async (count: number, clearExisting = true) => {
    try {
      const result = await selectTopByLikesMutation({
        campaignId,
        count,
        clearExisting,
      });
      toast.success(`Selected top ${result.selectedCount} comments by likes`);
      setSelectedIds(new Set()); // Clear local selection
    } catch (error) {
      console.error("Failed to select top comments:", error);
      toast.error("Failed to select top comments");
    }
  }, [campaignId, selectTopByLikesMutation]);

  return {
    // Data
    comments: commentsData?.comments ?? [],
    totalCount: commentsData?.totalCount ?? 0,
    selectedCount: commentsData?.selectedCount ?? 0,
    unselectedCount: commentsData?.unselectedCount ?? 0,
    isLoading: commentsData === undefined,
    hasMore: commentsData?.hasMore ?? false,

    // Pagination
    currentPage,
    totalPages,
    goToPage,

    // Sorting
    sortBy,
    sortOrder,
    handleSortChange,

    // Filtering
    filterBy,
    handleFilterChange,

    // Local selection (for bulk operations)
    selectedIds,
    toggleSelection,
    selectAll,
    deselectAll,

    // Actions
    saveSelections,
    selectTopByLikes,
  };
}
