"use client";

import { useState } from 'react';
import { 
  DEFAULT_CURRENT_PAGE,
  DEFAULT_ITEMS_PER_PAGE
} from '../constants/filters.constants';

interface UsePaginationReturn {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  resetPagination: () => void;
}

/**
 * Hook for managing pagination state
 * Provides a reset function that can be called when filters change
 */
export function usePagination(): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  const resetPagination = () => {
    setCurrentPage(DEFAULT_CURRENT_PAGE);
  };

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    resetPagination,
  };
}