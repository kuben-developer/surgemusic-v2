import { v } from "convex/values";
import { action, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TikTokPostInput {
  video_id: string;
  desc: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  postedAt: number;
  username: string;
  campaign_name: string;
}

interface CampaignLookup {
  campaignId: string;
  campaignName: string;
}

// ============================================================================
// INTERNAL QUERIES
// ============================================================================

/**
 * Get all campaigns from airtableCampaigns table
 */
export const getAllCampaigns = internalQuery({
  args: {},
  handler: async (ctx): Promise<CampaignLookup[]> => {
    const campaigns = await ctx.db.query("airtableCampaigns").collect();
    return campaigns.map((c: { campaignId: string; campaignName: string; }) => ({
      campaignId: c.campaignId,
      campaignName: c.campaignName,
    }));
  },
});

/**
 * Get all existing videoIds from bundleSocialPostedVideos table
 */
export const getAllExistingVideoIds = internalQuery({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    const posts = await ctx.db.query("bundleSocialPostedVideos").collect();
    return posts.map((p: { videoId: string; }) => p.videoId);
  },
});

// ============================================================================
// MAIN ACTION
// ============================================================================

/**
 * Insert TikTok posts from JSON into bundleSocialPostedVideos table
 *
 * Usage:
 * 1. Copy the entire JSON array from tiktok-posts.json
 * 2. Paste it as the 'posts' parameter
 * 3. Run the action
 *
 * The action will:
 * - Skip posts without campaign_name
 * - Skip posts with videoId that already exists
 * - Skip posts where campaign is not found in airtableCampaigns
 * - Bulk insert all valid posts
 */
export const insertTiktokPostsFromJson = action({
  args: {
    posts: v.array(v.object({
      video_id: v.string(),
      desc: v.string(),
      views: v.number(),
      likes: v.number(),
      comments: v.number(),
      shares: v.number(),
      saves: v.number(),
      postedAt: v.number(),
      username: v.string(),
      campaign_name: v.string(),
    })),
  },
  handler: async (ctx, { posts }): Promise<{
    total: number;
    skipped_no_campaign: number;
    skipped_exists: number;
    skipped_campaign_not_found: number;
    inserted: number;
    errors: string[];
    duration_ms: number;
  }> => {
    try {
      const startTime = Date.now();
      const totalPosts = posts.length;

      console.log(`[insertTiktokPosts] Starting import of ${totalPosts} posts...`);

      // Step 1: Filter out posts without campaign_name
      const postsWithCampaign = posts.filter((p: TikTokPostInput) => p.campaign_name && p.campaign_name.trim() !== '');
      const skippedNoCampaign: number = totalPosts - postsWithCampaign.length;

      if (skippedNoCampaign > 0) {
        console.log(`[insertTiktokPosts] Skipped ${skippedNoCampaign} posts without campaign_name`);
      }

      if (postsWithCampaign.length === 0) {
        return {
          total: totalPosts,
          skipped_no_campaign: skippedNoCampaign,
          skipped_exists: 0,
          skipped_campaign_not_found: 0,
          inserted: 0,
          errors: [],
          duration_ms: Date.now() - startTime,
        };
      }

      // Step 2: Get all campaigns from airtableCampaigns (single query)
      console.log(`[insertTiktokPosts] Fetching campaigns from airtableCampaigns...`);
      const campaigns = await ctx.runQuery(internal.app.insertTiktokPosts.getAllCampaigns, {});

      // Create campaign name lookup map (case-insensitive)
      const campaignMap = new Map<string, string>();
      campaigns.forEach((c: CampaignLookup) => {
        const normalizedName = c.campaignName.toLowerCase().trim();
        campaignMap.set(normalizedName, c.campaignId);
      });

      console.log(`[insertTiktokPosts] Loaded ${campaigns.length} campaigns`);

      // Step 3: Get all existing videoIds (single query)
      console.log(`[insertTiktokPosts] Fetching existing videoIds...`);
      const existingVideoIds: string[] = await ctx.runQuery(internal.app.insertTiktokPosts.getAllExistingVideoIds, {});
      const existingVideoIdsSet: Set<string> = new Set(existingVideoIds);

      console.log(`[insertTiktokPosts] Found ${existingVideoIds.length} existing videos`);

      // Step 4: Filter out posts that already exist
      const newPosts: TikTokPostInput[] = postsWithCampaign.filter((p: TikTokPostInput) => !existingVideoIdsSet.has(p.video_id));
      const skippedExists: number = postsWithCampaign.length - newPosts.length;

      if (skippedExists > 0) {
        console.log(`[insertTiktokPosts] Skipped ${skippedExists} posts that already exist`);
      }

      if (newPosts.length === 0) {
        return {
          total: totalPosts,
          skipped_no_campaign: skippedNoCampaign,
          skipped_exists: skippedExists,
          skipped_campaign_not_found: 0,
          inserted: 0,
          errors: [],
          duration_ms: Date.now() - startTime,
        };
      }

      // Step 5: Map campaign_name to campaignId and filter out posts without matching campaign
      const postsToInsert: Array<{
        campaignId: string;
        postId: string;
        videoId: string;
        postedAt: number;
        videoUrl: string;
        mediaUrl: string | undefined;
        views: number;
        likes: number;
        comments: number;
        shares: number;
        saves: number;
      }> = [];

      const errors: string[] = [];
      let skippedCampaignNotFound = 0;

      for (const post of newPosts) {
        const normalizedCampaignName = post.campaign_name.toLowerCase().trim();
        const campaignId = campaignMap.get(normalizedCampaignName);

        if (!campaignId) {
          skippedCampaignNotFound++;
          errors.push(`Campaign not found: "${post.campaign_name}" (video_id: ${post.video_id})`);
          continue;
        }

        // Build the post object
        postsToInsert.push({
          campaignId,
          postId: post.video_id,
          videoId: post.video_id,
          postedAt: post.postedAt,
          videoUrl: `https://www.tiktok.com/@/video/${post.video_id}`,
          mediaUrl: undefined,
          views: post.views,
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
          saves: post.saves,
        });
      }

      console.log(`[insertTiktokPosts] Prepared ${postsToInsert.length} posts for insertion`);

      if (skippedCampaignNotFound > 0) {
        console.log(`[insertTiktokPosts] Skipped ${skippedCampaignNotFound} posts with campaign not found`);
      }

      // Step 6: Bulk insert using existing mutation from bundle.ts
      let inserted = 0;
      if (postsToInsert.length > 0) {
        console.log(`[insertTiktokPosts] Bulk inserting ${postsToInsert.length} posts...`);
        const result = await ctx.runMutation(internal.app.bundle.bulkInsertPostedVideos, {
          posts: postsToInsert,
        });
        inserted = result.inserted;
        console.log(`[insertTiktokPosts] Successfully inserted ${inserted} posts`);
      }

      const totalTime = Date.now() - startTime;

      // Return summary
      const summary = {
        total: totalPosts,
        skipped_no_campaign: skippedNoCampaign,
        skipped_exists: skippedExists,
        skipped_campaign_not_found: skippedCampaignNotFound,
        inserted,
        errors: errors.slice(0, 10), // Only return first 10 errors to avoid large response
        duration_ms: totalTime,
      };

      console.log(`[insertTiktokPosts] Summary:`, summary);

      return summary;
    } catch (error) {
      console.error(`[insertTiktokPosts] Error:`, error);
      throw error;
    }
  },
});
