import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { action, internalAction, internalMutation, internalQuery } from "../_generated/server";

const BUNDLE_SOCIAL_API_KEY = process.env.BUNDLE_SOCIAL_API_KEY!;
const CONCURRENT_LIMIT = 25;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BundleSocialPost {
  post: {
    id: string;
    postedDate: string;
    externalData: {
      TIKTOK: {
        id: string;
        permalink: string;
      };
    };
  };
  items: Array<{
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  }>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Fetch Bundle Social post data
async function fetchBundleSocialPost(postId: string): Promise<BundleSocialPost | null> {
  try {
    const response = await fetch(
      `https://api.bundle.social/api/v1/analytics/post?platformType=TIKTOK&postId=${postId}`,
      {
        headers: {
          'x-api-key': BUNDLE_SOCIAL_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.log(`Bundle Social API error for post ${postId}: ${errorData}`);
      // Check for "Post not found" error
      if (response.status === 404) {
        if (errorData.includes("Post not found")) {
          throw new Error("Post not found");
        }
      }

      // Don't log 400 errors - they're expected for scheduled posts
      if (response.status !== 400) {
        console.error(`Bundle Social API error for post ${postId}: ${response.status}`);
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    // Re-throw "Post not found" errors
    if (error instanceof Error && error.message === "Post not found") {
      throw error;
    }
    console.error(`Error fetching Bundle Social post ${postId}:`, error);
    return null;
  }
}

// ============================================================================
// INTERNAL QUERIES
// ============================================================================

// Get unique campaign IDs from airtableCampaigns
export const getUniqueCampaignIdsFromAirtable = internalQuery({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("airtableCampaigns").collect();
    const uniqueCampaignIds = [...new Set(campaigns.map(content => content.campaignId))];
    return uniqueCampaignIds;
  },
});

// Get airtable contents for a campaign where error is empty
export const getAirtableContentsByCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const allContents = await ctx.db
      .query("airtableContents")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Filter to only those with postId and no error
    return allContents.filter(content => content.postId && !content.error);
  },
});

// Check if posted video exists (single - kept for backward compatibility)
export const checkPostedVideoExists = internalQuery({
  args: { postId: v.string() },
  handler: async (ctx, { postId }): Promise<boolean> => {
    const existing = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_postId", (q) => q.eq("postId", postId))
      .first();
    return existing !== null;
  },
});

// Get all existing posted videos for a campaign (for bulk checking)
export const getExistingPostedVideos = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const posts = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Return just the postIds for efficient Set creation
    return posts.map(post => post.postId);
  },
});

// Get posts to skip (older than 7 days OR updated within last 6 hours) - used to skip API calls
export const getPostsToSkip = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    // Calculate timestamps
    const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000); // 7 days ago (seconds)
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000; // 6 hours ago (milliseconds)

    // Get ALL posts for this campaign
    const allPosts = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Filter posts to skip:
    // 1. Posts older than 7 days (no need to track old content)
    // 2. Posts updated within last 6 hours (recently refreshed, save API calls)
    const postsToSkip = allPosts.filter(post => {
      const isOld = post.postedAt < sevenDaysAgo;
      const recentlyUpdated = post.updatedAt > sixHoursAgo;
      return isOld || recentlyUpdated;
    });

    // Return just the postIds for efficient Set creation
    return postsToSkip.map(post => post.postId);
  },
});

// ============================================================================
// INTERNAL MUTATIONS
// ============================================================================

// Update error field in airtableContents
export const updateAirtableContentError = internalMutation({
  args: {
    campaignId: v.string(),
    postId: v.string(),
    error: v.string(),
  },
  handler: async (ctx, { campaignId, postId, error }) => {
    const content = await ctx.db
      .query("airtableContents")
      .withIndex("by_postId", (q) => q.eq("postId", postId))
      .filter((q) => q.eq(q.field("campaignId"), campaignId))
      .first();

    if (content) {
      await ctx.db.patch(content._id, { error });
    }
  },
});

// Insert new posted video (single)
export const insertPostedVideo = internalMutation({
  args: {
    campaignId: v.string(),
    postId: v.string(),
    videoId: v.string(),
    postedAt: v.number(),
    videoUrl: v.string(),
    mediaUrl: v.optional(v.string()),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("bundleSocialPostedVideos", {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

// Bulk insert new posted videos - much more efficient
export const bulkInsertPostedVideos = internalMutation({
  args: {
    posts: v.array(v.object({
      campaignId: v.string(),
      postId: v.string(),
      videoId: v.string(),
      postedAt: v.number(),
      videoUrl: v.string(),
      mediaUrl: v.optional(v.string()),
      views: v.number(),
      likes: v.number(),
      comments: v.number(),
      shares: v.number(),
      saves: v.number(),
    })),
  },
  handler: async (ctx, { posts }) => {
    const now = Date.now();

    for (const post of posts) {
      await ctx.db.insert("bundleSocialPostedVideos", {
        ...post,
        updatedAt: now,
      });
    }

    return { inserted: posts.length };
  },
});

// Update posted video stats
export const updatePostedVideoStats = internalMutation({
  args: {
    postId: v.string(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
  },
  handler: async (ctx, { postId, views, likes, comments, shares, saves }) => {
    const post = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_postId", (q) => q.eq("postId", postId))
      .first();

    if (!post) return;

    await ctx.db.patch(post._id, {
      views,
      likes,
      comments,
      shares,
      saves,
      updatedAt: Date.now(),
    });
  },
});

// Bulk upsert daily snapshots - much more efficient than individual upserts
export const bulkUpsertDailySnapshots = internalMutation({
  args: {
    campaignId: v.string(),
    date: v.string(),
    snapshots: v.array(v.object({
      postId: v.string(),
      views: v.number(),
      likes: v.number(),
      comments: v.number(),
      shares: v.number(),
      saves: v.number(),
    })),
  },
  handler: async (ctx, { campaignId, date, snapshots }) => {
    // Get all existing snapshots for this campaign and date in one query
    const existingSnapshots = await ctx.db
      .query("bundleSocialSnapshots")
      .withIndex("by_campaignId_date", (q) =>
        q.eq("campaignId", campaignId).eq("date", date)
      )
      .collect();

    // Create a map for quick lookup
    const existingMap = new Map(
      existingSnapshots.map(s => [s.postId, s])
    );

    const now = Date.now();

    // Process all snapshots in bulk
    for (const snapshot of snapshots) {
      const existing = existingMap.get(snapshot.postId);

      const snapshotData = {
        views: snapshot.views,
        likes: snapshot.likes,
        comments: snapshot.comments,
        shares: snapshot.shares,
        saves: snapshot.saves,
        updatedAt: now,
      };

      if (existing) {
        // Update existing snapshot with latest data
        await ctx.db.patch(existing._id, snapshotData);
      } else {
        // Insert new snapshot
        await ctx.db.insert("bundleSocialSnapshots", {
          campaignId,
          postId: snapshot.postId,
          date,
          ...snapshotData,
        });
      }
    }

    return { processed: snapshots.length };
  },
});

// Bulk update posted video stats - more efficient than individual updates
export const bulkUpdatePostedVideoStats = internalMutation({
  args: {
    updates: v.array(v.object({
      postId: v.string(),
      views: v.number(),
      likes: v.number(),
      comments: v.number(),
      shares: v.number(),
      saves: v.number(),
    })),
  },
  handler: async (ctx, { updates }) => {
    const now = Date.now();
    let updatedCount = 0;

    for (const update of updates) {
      const post = await ctx.db
        .query("bundleSocialPostedVideos")
        .withIndex("by_postId", (q) => q.eq("postId", update.postId))
        .first();

      if (post) {
        await ctx.db.patch(post._id, {
          views: update.views,
          likes: update.likes,
          comments: update.comments,
          shares: update.shares,
          saves: update.saves,
          updatedAt: now,
        });
        updatedCount++;
      }
    }

    return { updated: updatedCount };
  },
});

// ============================================================================
// MAIN ACTIONS
// ============================================================================

// Refresh TikTok stats for a single campaign - Worker (processes one campaign)
// Skips API calls for:
// 1. Videos posted more than 7 days ago (old content)
// 2. Videos updated within the last 6 hours (recently refreshed)
export const refreshTiktokStatsByCampaign = action({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, { campaignId }) => {
    try {
      const startTime = Date.now();

      // Get today's date in DD-MM-YYYY format
      const today = new Date();
      const date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

      // Get all airtable contents for this campaign where error is empty and postId exists
      const allContents = await ctx.runQuery(internal.app.bundle.getAirtableContentsByCampaign, { campaignId });

      // Filter to only UUID format postIds
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const contents = allContents.filter((content: { postId: string; campaignId: string; }) => uuidRegex.test(content.postId));

      // Fetch posts to skip (older than 7 days OR updated within 6 hours) ONCE for this campaign
      // We'll skip Bundle Social API calls for these to save API requests
      const postsToSkipIds = await ctx.runQuery(internal.app.bundle.getPostsToSkip, { campaignId });
      const postsToSkipSet = new Set(postsToSkipIds);
      console.log(`[refreshTiktokStats] Found ${postsToSkipSet.size} posts to skip (old posts + recently updated within 6 hours) - will save ${postsToSkipSet.size} API calls`);

      // Also fetch ALL existing posted videos to check if we should insert or update
      const existingPostIds = await ctx.runQuery(internal.app.bundle.getExistingPostedVideos, { campaignId });
      const existingPostIdsSet = new Set(existingPostIds);
      console.log(`[refreshTiktokStats] Found ${existingPostIdsSet.size} total existing posts in database`);

      // Filter out posts to skip BEFORE batching (optimization!)
      const contentsToProcess = contents.filter((content: { postId: string; campaignId: string; }) => !postsToSkipSet.has(content.postId)).slice(0, 400);
      console.log(`[refreshTiktokStats] Filtered to ${contentsToProcess.length} contents to process (skipped ${contents.length - contentsToProcess.length} already tracked posts)`);

      // Collect all successful data for bulk operations
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

      const postsToUpdate: Array<{
        postId: string;
        views: number;
        likes: number;
        comments: number;
        shares: number;
        saves: number;
      }> = [];

      const snapshotsToUpsert: Array<{
        postId: string;
        views: number;
        likes: number;
        comments: number;
        shares: number;
        saves: number;
      }> = [];

      // Process a single content (fetch data only, no DB writes)
      const processContent = async (content: { postId: string; campaignId: string }) => {
        try {
          // Safety check: Skip if somehow a skipped post made it through (shouldn't happen after filtering above)
          if (postsToSkipSet.has(content.postId)) {
            console.warn(`[refreshTiktokStats] WARNING: Post ${content.postId} was in skip set but made it to processing - this shouldn't happen!`);
            return {
              postId: content.postId,
              success: false,
              error: 'Post skipped (old OR recently updated within 6 hours) - saved API call',
              skipped: true,
            };
          }

          // Fetch data from Bundle Social (only for new posts or posts less than 7 days old)
          const bundleData = await fetchBundleSocialPost(content.postId);

          if (!bundleData || !bundleData.items || bundleData.items.length === 0) {
            return {
              postId: content.postId,
              success: false,
              error: 'No data from Bundle Social',
            };
          }

          const stats = bundleData.items[0];
          if (!stats) {
            return {
              postId: content.postId,
              success: false,
              error: 'No stats data',
            };
          }

          // Extract posted date
          const postedAtMs = new Date(bundleData.post.postedDate).getTime();
          const postedAtSeconds = Math.floor(postedAtMs / 1000);

          // Check if post already exists in bundleSocialPostedVideos (using in-memory Set)
          const exists = existingPostIdsSet.has(content.postId);

          // Collect data for bulk operations
          if (exists) {
            postsToUpdate.push({
              postId: content.postId,
              views: stats.views,
              likes: stats.likes,
              comments: stats.comments,
              shares: stats.shares,
              saves: stats.saves,
            });
          } else {
            // Post is new, add to insert list
            postsToInsert.push({
              campaignId: content.campaignId,
              postId: content.postId,
              videoId: bundleData.post.externalData.TIKTOK.id,
              postedAt: postedAtSeconds,
              videoUrl: bundleData.post.externalData.TIKTOK.permalink,
              mediaUrl: undefined,
              views: stats.views,
              likes: stats.likes,
              comments: stats.comments,
              shares: stats.shares,
              saves: stats.saves,
            });
          }

          // Collect snapshot data
          snapshotsToUpsert.push({
            postId: content.postId,
            views: stats.views,
            likes: stats.likes,
            comments: stats.comments,
            shares: stats.shares,
            saves: stats.saves,
          });

          return {
            postId: content.postId,
            success: true,
          };
        } catch (error) {
          // Check if error is "Post not found"
          if (error instanceof Error && error.message === "Post not found") {
            // Update airtableContents with error
            await ctx.runMutation(internal.app.bundle.updateAirtableContentError, {
              campaignId: content.campaignId,
              postId: content.postId,
              error: "Post not found",
            });

            return {
              postId: content.postId,
              success: false,
              error: "Post not found - marked in airtableContents",
            };
          }

          return {
            postId: content.postId,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      };

      const results: Array<{
        postId: string;
        success: boolean;
        error?: string;
      }> = [];

      console.log(`[refreshTiktokStats] Processing ${contentsToProcess.length} contents for campaign ${campaignId} with concurrency limit of ${CONCURRENT_LIMIT}`);

      // Process in batches (API calls only, no DB writes yet)
      for (let i = 0; i < contentsToProcess.length; i += CONCURRENT_LIMIT) {
        const batch = contentsToProcess.slice(i, i + CONCURRENT_LIMIT);
        const batchStartTime = Date.now();
        console.log(`[refreshTiktokStats] Processing batch ${Math.floor(i / CONCURRENT_LIMIT) + 1}/${Math.ceil(contentsToProcess.length / CONCURRENT_LIMIT)} (${batch.length} items)`);

        const batchResults = await Promise.allSettled(
          batch.map((content: { postId: string; campaignId: string; }) => processContent(content))
        );

        batchResults.forEach((result: PromiseSettledResult<{ postId: string; success: boolean; error?: string; skipped?: boolean; }>) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.error(`[refreshTiktokStats] Unexpected error in batch processing:`, result.reason);
            results.push({
              postId: 'unknown',
              success: false,
              error: 'Unexpected error during processing',
            });
          }
        });

        console.log(`[refreshTiktokStats] Batch ${Math.floor(i / CONCURRENT_LIMIT) + 1} completed in ${Date.now() - batchStartTime}ms`);
      }

      // Bulk database operations - much more efficient!
      console.log(`[refreshTiktokStats] Starting bulk database operations...`);

      // Bulk insert new posts (single mutation)
      if (postsToInsert.length > 0) {
        console.log(`[refreshTiktokStats] Bulk inserting ${postsToInsert.length} new posts...`);
        await ctx.runMutation(internal.app.bundle.bulkInsertPostedVideos, {
          posts: postsToInsert,
        });
      }

      // Bulk update existing posts (single mutation)
      if (postsToUpdate.length > 0) {
        console.log(`[refreshTiktokStats] Bulk updating ${postsToUpdate.length} existing posts...`);
        await ctx.runMutation(internal.app.bundle.bulkUpdatePostedVideoStats, {
          updates: postsToUpdate,
        });
      }

      // Bulk upsert snapshots (single mutation)
      if (snapshotsToUpsert.length > 0) {
        console.log(`[refreshTiktokStats] Bulk upserting ${snapshotsToUpsert.length} snapshots...`);
        await ctx.runMutation(internal.app.bundle.bulkUpsertDailySnapshots, {
          campaignId,
          date,
          snapshots: snapshotsToUpsert,
        });
      }

      const totalTime = Date.now() - startTime;
      const updatedCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success && !r.error?.includes("skipped")).length;
      const postNotFoundCount = results.filter(r => r.error?.includes("Post not found")).length;
      const skippedCount = results.filter(r => r.error?.includes("skipped")).length;

      console.log(`Refresh TikTok stats for campaign ${campaignId}: ${updatedCount} posts refreshed (${postsToInsert.length} new, ${postsToUpdate.length} updated), ${skippedCount} skipped (old OR recently updated) - saved ${skippedCount} API calls, ${errorCount} errors (${postNotFoundCount} post not found) in ${totalTime}ms`);
    } catch (error) {
      console.error(`Error refreshing TikTok stats for campaign ${campaignId}:`, error);
      throw error;
    }
  },
});

// Refresh TikTok stats - Orchestrator
// Schedules refresh jobs for each campaign
// Skips: old posts (>7 days) and recently updated posts (<6 hours) to save API calls
export const refreshTiktokStats = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      // Get unique campaign IDs from airtableCampaigns
      const campaignIds = await ctx.runQuery(internal.app.bundle.getUniqueCampaignIdsFromAirtable, {});
      let scheduledCount = 0;

      for (const campaignId of campaignIds) {
        // Schedule background job for this campaign
        await ctx.scheduler.runAfter(0, api.app.bundle.refreshTiktokStatsByCampaign, {
          campaignId,
        });

        scheduledCount++;
      }

      console.log(`Refresh TikTok stats scheduler: ${scheduledCount} campaigns scheduled for processing`);
      return { scheduledCount };
    } catch (error) {
      console.error('Error scheduling TikTok stats refresh:', error);
      throw error;
    }
  },
});