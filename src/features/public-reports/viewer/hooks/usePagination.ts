import { useState, useCallback } from 'react';

export const usePagination = (itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(0);

  const resetPage = useCallback(() => {
    setCurrentPage(0);
  }, []);

  return {
    currentPage,
    setCurrentPage,
    resetPage,
    itemsPerPage
  };
};