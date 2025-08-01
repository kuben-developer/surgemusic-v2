import { calculateGrowth } from "../../shared/utils/report.utils";

/**
 * Calculate all growth metrics for the analytics dashboard
 */
export const calculateAllGrowthMetrics = (dailyData: Array<Record<string, number>>) => {
    return {
        viewsGrowth: calculateGrowth(dailyData, 'views'),
        likesGrowth: calculateGrowth(dailyData, 'likes'),
        commentsGrowth: calculateGrowth(dailyData, 'comments'),
        sharesGrowth: calculateGrowth(dailyData, 'shares'),
        engagementGrowth: calculateGrowth(dailyData, 'engagement'),
    };
};

/**
 * Filter video metrics to exclude hidden videos
 */
export const filterVisibleVideos = (videoMetrics: any[], hiddenVideoIds: string[]) => {
    return videoMetrics.filter(
        (vm: any) => !hiddenVideoIds.includes(vm.videoInfo.id)
    );
};

/**
 * Process analytics data for display
 */
export const processAnalyticsData = (analyticsData: any) => {
    const { 
        dailyData = [], 
        avgEngagementRate = "0", 
        videoMetrics = [], 
        hiddenVideoIds = [], 
        lastUpdatedAt, 
        totals = { views: 0, likes: 0, comments: 0, shares: 0 } 
    } = analyticsData ?? {};
    
    return {
        dailyData,
        avgEngagementRate,
        videoMetrics,
        hiddenVideoIds,
        lastUpdatedAt,
        totals,
        allVideoMetrics: [...videoMetrics],
        visibleVideoMetrics: filterVisibleVideos(videoMetrics, hiddenVideoIds),
    };
};