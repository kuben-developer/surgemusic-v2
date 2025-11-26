"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import { CLIPS_PER_PAGE } from "../constants/clips.constants";

interface UseClipsPaginationProps {
  totalItems: number;
}

export function useClipsPagination({ totalItems }: UseClipsPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(totalItems / CLIPS_PER_PAGE);

  const paginatedRange = useMemo(() => {
    const startIndex = (currentPage - 1) * CLIPS_PER_PAGE;
    const endIndex = startIndex + CLIPS_PER_PAGE;
    return { startIndex, endIndex };
  }, [currentPage]);

  const handlePageChange = useCallback((page: number) => {
    // Use transition to keep UI responsive during page change
    startTransition(() => {
      setCurrentPage(page);
    });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return {
    currentPage,
    totalPages,
    paginatedRange,
    handlePageChange,
    isPending,
  };
}
