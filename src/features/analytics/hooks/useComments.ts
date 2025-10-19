"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { CommentsResponse, UseCommentsOptions, CommentWithVideo } from "../types/analytics.types";

interface UseCommentsReturn {
  // Data
  data: CommentWithVideo[];
  groupedComments: Map<string, CommentWithVideo[]>;
  isLoading: boolean;
  error: Error | null;
  
  // Pagination
  page: number;
  pageSize: number;
  totalPages: number;
  totalComments: number;
  
  // Actions
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  
  // State
  isRefreshing: boolean;
}

export function useComments(options: UseCommentsOptions): UseCommentsReturn {
  const [data, setData] = useState<CommentWithVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const pageSize = options.pageSize || 20;
  const getComments = useAction(api.app.analytics.getComments);

  // Group comments by video
  const groupedComments = useMemo(() => {
    const groups = new Map<string, CommentWithVideo[]>();
    
    data.forEach(comment => {
      const key = comment.videoId;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(comment);
    });
    
    return groups;
  }, [data]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalComments / pageSize);
  }, [totalComments, pageSize]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result: CommentsResponse = await getComments({
        campaignIds: options.campaignIds,
        limit: pageSize,
        offset: page * pageSize
      });

      setData(result.comments);
      setTotalComments(result.metadata.totalComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch comments"));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.campaignIds, page, pageSize]);

  // Refresh function
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchComments();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchComments]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    // Data
    data,
    groupedComments,
    isLoading,
    error,
    
    // Pagination
    page,
    pageSize,
    totalPages,
    totalComments,
    
    // Actions
    setPage,
    refresh,
    
    // State
    isRefreshing
  };
}