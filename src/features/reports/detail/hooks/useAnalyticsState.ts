"use client";

import { useState } from "react";
import type { MetricKey } from "../../shared/types/report.types";
import { ITEMS_PER_PAGE } from "../constants/analytics.constants";

export function useAnalyticsState() {
    const [dateRange, setDateRange] = useState<string>("30");
    const [activeMetric, setActiveMetric] = useState<MetricKey>("views");
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

    const handleDateRangeChange = (value: string) => {
        setDateRange(value);
    };

    const handleCampaignChange = (campaignId: string, isChecked: boolean) => {
        // This function is just a placeholder since we're not implementing campaign filtering
        // in this report view. The component requires it, but it won't actually filter
        console.log("Campaign change:", campaignId, isChecked);
    };

    const handleResetCampaigns = () => {
        // This function is just a placeholder since we're not implementing campaign filtering
        // in this report view. The component requires it, but it won't actually reset
        console.log("Reset campaigns");
    };

    return {
        // State
        dateRange,
        activeMetric,
        currentPage,
        selectedCampaigns,
        itemsPerPage: ITEMS_PER_PAGE,
        
        // Actions
        setActiveMetric,
        setCurrentPage,
        handleDateRangeChange,
        handleCampaignChange,
        handleResetCampaigns,
    };
}