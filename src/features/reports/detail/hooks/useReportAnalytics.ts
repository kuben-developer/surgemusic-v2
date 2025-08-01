"use client";

import { useState, useEffect } from 'react';
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { ReportAnalyticsData } from '../../shared/types/report.types';

export function useReportAnalytics(reportId: string | null, dateRange: string) {
    const getReportAnalytics = useAction(api.analytics.getReportAnalytics);
    const [analyticsData, setAnalyticsData] = useState<ReportAnalyticsData | null>(null);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
    
    const refetchAnalytics = async () => {
        if (!reportId) return;
        setIsLoadingAnalytics(true);
        try {
            const data = await getReportAnalytics({ 
                id: reportId as Id<"reports">, 
                days: parseInt(dateRange) 
            });
            setAnalyticsData(data);
        } finally {
            setIsLoadingAnalytics(false);
        }
    };
    
    useEffect(() => {
        void refetchAnalytics();
    }, [reportId, dateRange, refetchAnalytics]);

    return {
        analyticsData,
        isLoadingAnalytics,
        refetchAnalytics
    };
}