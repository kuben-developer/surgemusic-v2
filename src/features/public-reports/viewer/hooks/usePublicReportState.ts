'use client';

import { useState } from 'react';
import type { MetricKey } from '../types';
import { usePagination } from './usePagination';
import { useShareIdValidation } from './useShareIdValidation';
import { useReportNavigation } from './useReportNavigation';
import { ITEMS_PER_PAGE } from '../constants/metrics.constants';

/**
 * Consolidated state management hook for public report content
 * Combines all state and navigation logic in one place
 */
export function usePublicReportState(shareId: string) {
  // Core component state
  const [dateRange, setDateRange] = useState<string>("30");
  const [retryCount, setRetryCount] = useState(0);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("views");
  
  // Pagination state
  const { currentPage, setCurrentPage, itemsPerPage } = usePagination(ITEMS_PER_PAGE);
  
  // Validation and navigation hooks
  useShareIdValidation(shareId);
  const { handleBack, handleRetry } = useReportNavigation();

  // Retry handler with count tracking
  const handleRetryWithCount = (refetchFn: () => void) => {
    setRetryCount(prev => prev + 1);
    handleRetry(refetchFn);
  };

  // Reset retry count when date range changes
  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    setRetryCount(0); // Reset retry count on new data request
  };

  return {
    // State values
    dateRange,
    retryCount,
    activeMetric,
    currentPage,
    itemsPerPage,
    
    // State setters
    setActiveMetric,
    setCurrentPage,
    handleDateRangeChange,
    
    // Action handlers
    handleBack,
    handleRetryWithCount
  };
}