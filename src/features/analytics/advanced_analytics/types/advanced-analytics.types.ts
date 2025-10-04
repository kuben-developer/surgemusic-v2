import type { Id } from "../../../../../convex/_generated/dataModel";

export interface AdvancedVideoMetric {
  id: string;
  videoId: string;
  campaignId: string;
  campaignName: string;
  videoUrl: string;
  thumbnailUrl: string;
  postedAt: number;
  platform: "tiktok" | "instagram" | "youtube";

  // Basic metrics
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  averageTimeWatched?: number;

  // Advanced analytics arrays
  videoViewRetention?: Array<{ second: string; percentage: number }>;
  engagementLikes?: Array<{ second: string; percentage: number }>;
  audienceCountries?: Array<{ country: string; percentage: number }>;
  audienceGenders?: Array<{ gender: string; percentage: number }>;
  audienceCities?: Array<{ city: string; percentage: number }>;
  audienceTypes?: Array<{ type: string; percentage: number }>;

  // Additional metrics
  fullVideoWatchedRate?: number;
  newFollowers?: number;
  profileViews?: number;
  videoDuration?: number;

  // Generated video data
  slot0Id?: string;
  caption?: string;
  playbook?: string;

  // Computed metrics
  hookScore: number | null;
  engagementRate: number;
}

export interface AdvancedAnalyticsResponse {
  videos: AdvancedVideoMetric[];
  metadata: {
    totalVideos: number;
    lastUpdatedAt: number;
  };
}

export type ChartType = "retention" | "engagement" | "countries" | "genders";

export interface ChartData {
  name: string;
  value: number;
}
