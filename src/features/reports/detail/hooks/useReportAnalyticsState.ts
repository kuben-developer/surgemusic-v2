"use client";

import type { 
    AnalyticsContentState, 
    AnalyticsContentHandlers 
} from "../types/analytics-content.types";

interface UseReportAnalyticsStateProps {
    analyticsState: any; // This should be the return type of useAnalyticsState
    refreshAnalytics: () => void;
    isRefreshing: boolean;
}

export function useReportAnalyticsState({
    analyticsState,
    refreshAnalytics,
    isRefreshing,
}: UseReportAnalyticsStateProps): {
    state: AnalyticsContentState;
    handlers: AnalyticsContentHandlers;
} {
    const state: AnalyticsContentState = {
        dateRange: analyticsState.dateRange,
        activeMetric: analyticsState.activeMetric,
        currentPage: analyticsState.currentPage,
        selectedCampaigns: analyticsState.selectedCampaigns,
        itemsPerPage: analyticsState.itemsPerPage,
        isRefreshing,
    };

    const handlers: AnalyticsContentHandlers = {
        onDateRangeChange: analyticsState.handleDateRangeChange,
        onCampaignChange: analyticsState.handleCampaignChange,
        onResetCampaigns: analyticsState.handleResetCampaigns,
        onRefresh: refreshAnalytics,
        onActiveMetricChange: analyticsState.setActiveMetric,
        onPageChange: analyticsState.setCurrentPage,
    };

    return { state, handlers };
}