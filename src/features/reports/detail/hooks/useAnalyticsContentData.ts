"use client";

import { useMemo } from "react";
import type { VideoMetric } from "../../shared/types/report.types";
import type { 
    AnalyticsContentReport, 
    AnalyticsContentData, 
    AnalyticsContentGrowth 
} from "../types/analytics-content.types";

interface UseAnalyticsContentDataProps {
    report: AnalyticsContentReport;
    analyticsData: AnalyticsContentData;
    growthData: AnalyticsContentGrowth;
}

export function useAnalyticsContentData({
    report,
    analyticsData,
    growthData,
}: UseAnalyticsContentDataProps) {
    
    const processedData = useMemo(() => {
        const { videoMetrics, hiddenVideoIds } = analyticsData;
        
        // Filter out hidden videos from videoMetrics for display
        const visibleVideoMetrics = videoMetrics.filter(
            (vm: VideoMetric) => !hiddenVideoIds.includes(vm.videoInfo.id)
        );

        const totalVideos = visibleVideoMetrics.length;
        const campaignCount = report.campaigns.length || 0;

        // Transform campaigns for header
        const transformedCampaigns = report.campaigns.map(c => ({
            id: c.id,
            campaignName: c.campaignName
        }));

        // Transform campaign IDs for comments section
        const campaignIds = report.campaigns.map(c => c.id);

        return {
            visibleVideoMetrics,
            totalVideos,
            campaignCount,
            transformedCampaigns,
            campaignIds,
        };
    }, [report, analyticsData]);

    return processedData;
}