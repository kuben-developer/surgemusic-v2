import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { action, internalQuery } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";

// ==================== TYPE DEFINITIONS ====================

interface AdvancedVideoMetric {
  id: string;
  videoId: string;
  campaignId: string;
  campaignName: string;
  videoUrl: string;
  thumbnailUrl: string;
  postedAt: number;
  platform: "tiktok" | "instagram" | "youtube";

  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  averageTimeWatched?: number;

  videoViewRetention?: Array<{ second: string; percentage: number }>;
  engagementLikes?: Array<{ second: string; percentage: number }>;
  audienceCountries?: Array<{ country: string; percentage: number }>;
  audienceGenders?: Array<{ gender: string; percentage: number }>;
  audienceCities?: Array<{ city: string; percentage: number }>;
  audienceTypes?: Array<{ type: string; percentage: number }>;

  fullVideoWatchedRate?: number;
  newFollowers?: number;
  profileViews?: number;
  videoDuration?: number;

  slot0Id?: string;
  caption?: string;
  playbook?: string;

  hookScore: number | null;
  engagementRate: number;
}

interface AdvancedAnalyticsResult {
  videos: AdvancedVideoMetric[];
  metadata: {
    totalVideos: number;
    lastUpdatedAt: number;
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate hook score from video view retention data
 * Hook score is the retention percentage at 3 seconds
 */
function calculateHookScore(
  videoViewRetention?: Array<{ second: string; percentage: number }>
): number | null {
  if (!videoViewRetention || videoViewRetention.length === 0) {
    return null;
  }

  const retention3s = videoViewRetention.find(
    (r) => r.second === "3" || r.second === "3.0"
  );

  return retention3s ? retention3s.percentage : null;
}

/**
 * Calculate engagement rate from video metrics
 * Formula: (likes + comments + shares) / views * 100
 */
function calculateEngagementRate(video: {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}): number {
  if (video.views === 0) {
    return 0;
  }

  return ((video.likes + video.comments + video.shares) / video.views) * 100;
}

/**
 * Match ayrshare video with generated video by URL
 */
function matchGeneratedVideo(
  mediaUrl: string | undefined,
  videoUrl: string,
  generatedVideosMap: Map<string, Doc<"generatedVideos">>
): Doc<"generatedVideos"> | undefined {
  return (
    generatedVideosMap.get(mediaUrl || "") ||
    generatedVideosMap.get(videoUrl)
  );
}

/**
 * Process raw video data into advanced metric format
 */
function processVideoData(
  video: Doc<"ayrsharePostedVideos">,
  campaign: Doc<"campaigns"> | undefined,
  generatedVideo: Doc<"generatedVideos"> | undefined
): AdvancedVideoMetric {
  const hookScore = calculateHookScore(video.videoViewRetention);
  const engagementRate = calculateEngagementRate(video);

  return {
    id: video._id,
    videoId: video.videoId,
    campaignId: video.campaignId,
    campaignName: campaign?.campaignName || "",
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl,
    postedAt: video.postedAt * 1000, // Convert seconds to milliseconds
    platform: video.socialPlatform,

    // Basic metrics
    views: video.views,
    likes: video.likes,
    comments: video.comments,
    shares: video.shares,
    saves: video.saves,
    averageTimeWatched: video.averageTimeWatched,

    // Advanced analytics arrays
    videoViewRetention: video.videoViewRetention,
    engagementLikes: video.engagementLikes,
    audienceCountries: video.audienceCountries,
    audienceGenders: video.audienceGenders,
    audienceCities: video.audienceCities,
    audienceTypes: video.audienceTypes,

    // Additional metrics
    fullVideoWatchedRate: video.fullVideoWatchedRate,
    newFollowers: video.newFollowers,
    profileViews: video.profileViews,
    videoDuration: video.videoDuration,

    // Generated video data (from matched generatedVideo)
    slot0Id: generatedVideo?.video.slot0Id,
    caption: generatedVideo?.video.caption,
    playbook: generatedVideo?.video.playbook,

    // Computed metrics
    hookScore,
    engagementRate,
  };
}

// ==================== INTERNAL QUERY ====================

export const fetchAdvancedAnalytics = internalQuery({
  args: {
    campaignIds: v.array(v.id("campaigns")),
  },
  handler: async (ctx, args): Promise<AdvancedAnalyticsResult> => {
    // STEP 1: Fetch all campaigns in parallel
    const campaignPromises = args.campaignIds.map((id) => ctx.db.get(id));
    const campaigns = await Promise.all(campaignPromises);

    // Build campaign lookup map
    const campaignsMap = new Map<Id<"campaigns">, Doc<"campaigns">>();
    campaigns.forEach((campaign) => {
      if (campaign) {
        campaignsMap.set(campaign._id, campaign);
      }
    });

    // STEP 2: Fetch all ayrsharePostedVideos in parallel
    const ayrsharePromises = args.campaignIds.map((campaignId) =>
      ctx.db
        .query("ayrsharePostedVideos")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .collect()
    );
    const ayrshareResults = await Promise.all(ayrsharePromises);
    const allAyrshareVideos = ayrshareResults.flat();

    // STEP 3: Fetch all generatedVideos in parallel
    const generatedPromises = args.campaignIds.map((campaignId) =>
      ctx.db
        .query("generatedVideos")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .collect()
    );
    const generatedResults = await Promise.all(generatedPromises);

    // Build generated video lookup map (indexed by video URL)
    const generatedVideosMap = new Map<string, Doc<"generatedVideos">>();
    generatedResults.flat().forEach((gv) => {
      if (gv.video.url) {
        generatedVideosMap.set(gv.video.url, gv);
      }
    });

    // STEP 4: Process all videos (in-memory transformation)
    const processedVideos = allAyrshareVideos.map((video) => {
      const campaign = campaignsMap.get(video.campaignId);
      const generatedVideo = matchGeneratedVideo(
        video.mediaUrl,
        video.videoUrl,
        generatedVideosMap
      );

      return processVideoData(video, campaign, generatedVideo);
    });

    // Sort by views descending (highest performing first)
    processedVideos.sort((a, b) => b.views - a.views);

    return {
      videos: processedVideos,
      metadata: {
        totalVideos: processedVideos.length,
        lastUpdatedAt: 0, // Will be set by action layer
      },
    };
  },
});

// ==================== PUBLIC ACTION ====================

export const getAdvancedAnalytics = action({
  args: {
    campaignIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<AdvancedAnalyticsResult> => {
    // Authenticate user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(internal.app.users.getByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Resolve campaign IDs (use provided or fetch all user campaigns)
    let campaignIds = args.campaignIds;
    if (!campaignIds || campaignIds.length === 0) {
      const userCampaigns: Doc<"campaigns">[] = await ctx.runQuery(
        api.app.campaigns.getAll,
        {}
      );
      campaignIds = userCampaigns.map((c) => c._id);
    }

    // Handle empty campaigns case
    if (!campaignIds || campaignIds.length === 0) {
      return {
        videos: [],
        metadata: {
          totalVideos: 0,
          lastUpdatedAt: Date.now(),
        },
      };
    }

    // Fetch and process analytics data from internal query
    const result = await ctx.runQuery(
      internal.app.advanced_analytics.fetchAdvancedAnalytics,
      {
        campaignIds: campaignIds as Id<"campaigns">[],
      }
    );

    // Add timestamp (non-deterministic operation in action layer)
    return {
      ...result,
      metadata: {
        ...result.metadata,
        lastUpdatedAt: Date.now(),
      },
    };
  },
});
