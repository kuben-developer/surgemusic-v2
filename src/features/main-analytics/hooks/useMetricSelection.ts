"use client";

import { useState } from 'react';
import type { MetricKey } from '@/components/analytics/types';
import { DEFAULT_ACTIVE_METRIC } from '../constants/filters.constants';

interface UseMetricSelectionReturn {
  activeMetric: MetricKey;
  setActiveMetric: (metric: MetricKey) => void;
}

/**
 * Hook for managing active metric selection
 * Isolated for better reusability and testing
 */
export function useMetricSelection(): UseMetricSelectionReturn {
  const [activeMetric, setActiveMetric] = useState<MetricKey>(DEFAULT_ACTIVE_METRIC);

  return {
    activeMetric,
    setActiveMetric,
  };
}