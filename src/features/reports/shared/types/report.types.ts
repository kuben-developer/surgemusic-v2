import type { Doc } from "../../../../../convex/_generated/dataModel";

export type Report = Doc<"reports"> & {
    campaigns: { id: string; campaignName: string }[];
};

export type ReportFormValues = {
    name: string;
    campaignIds: string[];
};

export type ReportAnalyticsData = {
    dailyData: DailyData[];
    totals: Totals;
    avgEngagementRate: string;
    videoMetrics: VideoMetric[];
    hiddenVideoIds: string[];
    lastUpdatedAt: string | null;
};

export type DailyData = {
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement?: number;
};

export type Totals = {
    views: number;
    likes: number;
    comments: number;
    shares: number;
};

export type VideoMetric = {
    id: string;
    videoInfo: {
        id: string;
        postId: string | null;
        videoUrl: string;
        videoName: string;
        videoType: string;
        tiktokUrl: string;
        createdAt: Date;
        campaign: {
            id: number;
            campaignName: string;
        };
    };
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: string;
};

export type GrowthData = {
    value: number;
    isPositive: boolean;
};

export type MetricKey = "views" | "likes" | "comments" | "shares";

export type MetricInfo = {
    label: string;
    icon: React.ReactNode;
    color: string;
    description: string;
};