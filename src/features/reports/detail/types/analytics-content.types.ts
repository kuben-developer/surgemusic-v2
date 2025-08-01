import type { MetricKey, ReportCampaign, VideoMetric, GrowthData, DailyData } from "../../shared/types/report.types";

export interface AnalyticsContentReport {
    name: string;
    campaigns: ReportCampaign[];
}

export interface AnalyticsContentData {
    dailyData: DailyData[];
    avgEngagementRate: string;
    videoMetrics: VideoMetric[];
    hiddenVideoIds: string[];
    lastUpdatedAt?: string;
    totals: {
        views: number;
        likes: number;
        comments: number;
        shares: number;
    };
}

export interface AnalyticsContentGrowth {
    viewsGrowth: GrowthData;
    likesGrowth: GrowthData;
    commentsGrowth: GrowthData;
    sharesGrowth: GrowthData;
    engagementGrowth: GrowthData;
}

export interface AnalyticsContentState {
    dateRange: string;
    activeMetric: MetricKey;
    currentPage: number;
    selectedCampaigns: string[];
    itemsPerPage: number;
    isRefreshing: boolean;
}

export interface AnalyticsContentHandlers {
    onDateRangeChange: (value: string) => void;
    onCampaignChange: (campaignId: string, isChecked: boolean) => void;
    onResetCampaigns: () => void;
    onRefresh: () => void;
    onActiveMetricChange: (metric: MetricKey) => void;
    onPageChange: (page: number) => void;
}