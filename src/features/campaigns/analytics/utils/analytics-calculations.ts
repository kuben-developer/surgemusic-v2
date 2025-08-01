interface DailyData {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  date: string;
}

export function calculateGrowthMetrics(dailyData: DailyData[], metric: string): number {
  if (!dailyData || dailyData.length < 2) return 0;
  
  const sortedData = [...dailyData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (sortedData.length < 2) return 0;
  
  const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
  const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
  
  const firstHalfTotal = firstHalf.reduce((sum, day) => sum + (day[metric as keyof DailyData] as number || 0), 0);
  const secondHalfTotal = secondHalf.reduce((sum, day) => sum + (day[metric as keyof DailyData] as number || 0), 0);
  
  if (firstHalfTotal === 0) return secondHalfTotal > 0 ? 100 : 0;
  
  return ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
}

export function calculateEngagementGrowth(dailyData: DailyData[]): number {
  const engagementData = dailyData.map((day) => ({
    ...day,
    engagement: ((day.likes + day.comments + day.shares) / Math.max(day.views, 1)) * 100
  }));
  
  return calculateGrowthMetrics(engagementData, 'engagement');
}

export function processAnalyticsData(analyticsData: any) {
  if (!analyticsData) {
    return {
      totals: { views: 0, likes: 0, comments: 0, shares: 0 },
      dailyData: [],
      avgEngagementRate: '0',
      lastUpdatedAt: null,
      videoMetrics: []
    };
  }

  return {
    totals: analyticsData.totals || { views: 0, likes: 0, comments: 0, shares: 0 },
    dailyData: analyticsData.dailyData || [],
    avgEngagementRate: analyticsData.avgEngagementRate || '0',
    lastUpdatedAt: analyticsData.lastUpdatedAt,
    videoMetrics: analyticsData.videoMetrics || []
  };
}