import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { action, internalAction, internalMutation, internalQuery } from "../_generated/server";

const BUNDLE_SOCIAL_API_KEY = process.env.BUNDLE_SOCIAL_API_KEY!;
const CONCURRENT_LIMIT = 50;

// Error handling constants
const PERMANENT_ERRORS = ["Post not found", "Team does not have a Tiktok account"];
const ERROR_RETRY_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

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
      // Check for permanent errors that should be thrown
      if (response.status === 404) {
        if (errorData.includes("Post not found")) {
          throw new Error("Post not found");
        }
      }
      if (errorData.includes("Team does not have a Tiktok account")) {
        throw new Error("Team does not have a Tiktok account");
      }
      // All other errors: return null silently (will be counted in summary)
      return null;
    }

    return await response.json();
  } catch (error) {
    // Re-throw permanent errors
    if (error instanceof Error && PERMANENT_ERRORS.includes(error.message)) {
      throw error;
    }
    // All other errors: return null silently
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

// Get airtable contents for a campaign, with smart error retry logic
export const getAirtableContentsByCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const allContents = await ctx.db
      .query("airtableContents")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    const now = Date.now();

    // Filter logic:
    // - Must have postId
    // - No error = include
    // - Permanent error = exclude forever
    // - Temporary error = retry after 6 hours
    return allContents.filter(content => {
      if (!content.postId) return false;
      if (!content.error) return true;

      // Never retry permanent errors
      if (PERMANENT_ERRORS.includes(content.error)) return false;

      // Retry temporary errors after 6 hours
      if (content.errorAt) {
        return now - content.errorAt > ERROR_RETRY_INTERVAL;
      }

      // Legacy errors without errorAt: include for retry (will get errorAt on next failure)
      return true;
    });
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

// Get posts to skip based on tiered monitoring schedule:
// - 0-30 days: monitor daily (skip if updated within 12 hours)
// - 30-90 days: monitor every 3 days
// - 90-180 days: monitor weekly
// - 180+ days: monitor monthly
export const getPostsToSkip = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const allPosts = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    const now = Date.now();
    const nowSeconds = Math.floor(now / 1000);

    // Time constants in seconds (for post age calculation)
    const DAY_SECONDS = 24 * 60 * 60;
    const HOURS_48 = 2 * DAY_SECONDS;
    const DAYS_30 = 30 * DAY_SECONDS;
    const DAYS_90 = 90 * DAY_SECONDS;
    const DAYS_180 = 180 * DAY_SECONDS;

    // Monitoring intervals in milliseconds (for update recency check)
    const HOURS_12 = 12 * 60 * 60 * 1000;
    const DAYS_3_MS = 3 * 24 * 60 * 60 * 1000;
    const DAYS_7_MS = 7 * 24 * 60 * 60 * 1000;
    const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

    const postsToSkip = allPosts.filter(post => {
      const postAgeSeconds = nowSeconds - post.postedAt;
      const timeSinceUpdate = now - post.updatedAt;

      // For 0-view posts within 48 hours, retry but with a minimum interval
      // to avoid hammering APIs for posts that legitimately have 0 views
      if (postAgeSeconds <= HOURS_48 && post.views === 0) {
        const MIN_RETRY_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
        return timeSinceUpdate < MIN_RETRY_INTERVAL; // Skip if checked within 2 hours
      }

      // Determine required update interval based on post age
      let requiredInterval: number;

      if (postAgeSeconds <= DAYS_30) {
        // 0-30 days: monitor daily, skip if updated within 12 hours
        requiredInterval = HOURS_12;
      } else if (postAgeSeconds <= DAYS_90) {
        // 30-90 days: monitor every 3 days
        requiredInterval = DAYS_3_MS;
      } else if (postAgeSeconds <= DAYS_180) {
        // 90-180 days: monitor weekly
        requiredInterval = DAYS_7_MS;
      } else {
        // 180+ days: monitor monthly
        requiredInterval = DAYS_30_MS;
      }

      // Skip if updated within the required interval
      return timeSinceUpdate < requiredInterval;
    });

    // Return just the postIds for efficient Set creation
    return postsToSkip.map(post => post.postId);
  },
});

// ============================================================================
// INTERNAL MUTATIONS
// ============================================================================

// Update error field in airtableContents (with timestamp for retry logic)
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
      await ctx.db.patch(content._id, {
        error,
        errorAt: Date.now(), // Timestamp for retry logic
      });
    }
  },
});

// Clear error from airtableContents (called on successful processing)
export const clearAirtableContentError = internalMutation({
  args: {
    campaignId: v.string(),
    postId: v.string(),
  },
  handler: async (ctx, { campaignId, postId }) => {
    const content = await ctx.db
      .query("airtableContents")
      .withIndex("by_postId", (q) => q.eq("postId", postId))
      .filter((q) => q.eq(q.field("campaignId"), campaignId))
      .first();

    if (content && content.error) {
      await ctx.db.patch(content._id, {
        error: undefined,
        errorAt: undefined,
      });
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
      videoUrl: v.optional(v.string()),
      mediaUrl: v.optional(v.string()),
      views: v.number(),
      likes: v.number(),
      comments: v.number(),
      shares: v.number(),
      saves: v.number(),
      isManual: v.optional(v.boolean()),
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
// Skips API calls based on tiered monitoring schedule:
// - 0-30 days: monitor daily (skip if updated within 12 hours)
// - 30-90 days: monitor every 3 days
// - 90-180 days: monitor weekly
// - 180+ days: monitor monthly
export const refreshTiktokStatsByCampaign = internalAction({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, { campaignId }) => {
    try {
      const startTime = Date.now();

      // Get today's date in DD-MM-YYYY format
      const today = new Date();
      const date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

      // Get all airtable contents for this campaign (filtered by error retry logic)
      const allContents = await ctx.runQuery(internal.app.bundle.getAirtableContentsByCampaign, { campaignId });

      // Filter to UUID format postIds (Bundle Social) OR manual posts with tiktokId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const contents = allContents.filter((content: { postId: string; campaignId: string; isManual?: boolean; tiktokId?: string; }) =>
        uuidRegex.test(content.postId) || (content.isManual && content.tiktokId)
      );

      // Fetch posts to skip based on tiered monitoring schedule
      const postsToSkipIds = await ctx.runQuery(internal.app.bundle.getPostsToSkip, { campaignId });
      const postsToSkipSet = new Set(postsToSkipIds);

      // Fetch ALL existing posted videos to check if we should insert or update
      const existingPostIds = await ctx.runQuery(internal.app.bundle.getExistingPostedVideos, { campaignId });
      const existingPostIdsSet = new Set(existingPostIds);

      // Filter out posts to skip BEFORE batching
      const BATCH_LIMIT = 300;
      const contentsNeedingUpdate = contents.filter((c: { postId: string }) => !postsToSkipSet.has(c.postId));
      const contentsToProcess = contentsNeedingUpdate.slice(0, BATCH_LIMIT);

      // Calculate stats for logging (all relative to eligible posts)
      const totalEligible = contents.length;
      const newPosts = contents.filter((c: { postId: string }) => !existingPostIdsSet.has(c.postId)).length;
      const recentlyUpdated = contents.filter((c: { postId: string }) => postsToSkipSet.has(c.postId)).length;
      const needsUpdate = contentsNeedingUpdate.length;
      const remaining = needsUpdate - contentsToProcess.length;

      // Clear progress logging
      console.log(`\n========== Campaign ${campaignId} ==========`);
      console.log(`📊 TOTAL: ${totalEligible} eligible posts`);
      console.log(`   ├─ 🆕 ${newPosts} never scraped`);
      console.log(`   ├─ ⏭️  ${recentlyUpdated} recently updated (skip)`);
      console.log(`   └─ 🔄 ${needsUpdate} need update now`);
      console.log(`📋 THIS RUN: ${contentsToProcess.length} posts | ${remaining} remaining after`);
      console.log(`================================================\n`);

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
        isManual?: boolean;
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
      const processContent = async (content: { postId: string; campaignId: string; isManual?: boolean; tiktokId?: string }) => {
        try {
          // Safety check: Skip if somehow a skipped post made it through (shouldn't happen after filtering above)
          if (postsToSkipSet.has(content.postId)) {
            console.warn(`[refreshTiktokStats] WARNING: Post ${content.postId} was in skip set but made it to processing - this shouldn't happen!`);
            return {
              postId: content.postId,
              success: false,
              error: 'Post skipped (tiered monitoring schedule) - saved API call',
              skipped: true,
            };
          }

          // Handle MANUAL posts - fetch directly from TikTok API (skip Bundle Social)
          if (content.isManual && content.tiktokId) {
            console.log(`[refreshTiktokStats] Processing manual post ${content.postId} with TikTok ID: ${content.tiktokId}`);

            const tiktokResult = await ctx.runAction(internal.app.tiktok.getTikTokVideoById, {
              videoId: content.tiktokId,
            });

            if (!tiktokResult.success || !tiktokResult.video) {
              return {
                postId: content.postId,
                success: false,
                error: `TikTok API error: ${tiktokResult.error || 'Unknown error'}`,
              };
            }

            const stats = tiktokResult.video;

            // For manual posts, use current time as posted date (TikTok API doesn't return createTime)
            const postedAtSeconds = Math.floor(Date.now() / 1000);

            // Check if post already exists
            const exists = existingPostIdsSet.has(content.postId);

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
              postsToInsert.push({
                campaignId: content.campaignId,
                postId: content.postId,
                videoId: content.tiktokId,
                postedAt: postedAtSeconds,
                videoUrl: `https://www.tiktok.com/@/video/${content.tiktokId}`,
                mediaUrl: undefined,
                views: stats.views,
                likes: stats.likes,
                comments: stats.comments,
                shares: stats.shares,
                saves: stats.saves,
                isManual: true,
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

            console.log(`[refreshTiktokStats] Successfully processed manual post ${content.postId}: ${stats.views} views`);

            // Clear any previous error on successful processing
            await ctx.runMutation(internal.app.bundle.clearAirtableContentError, {
              campaignId: content.campaignId,
              postId: content.postId,
            });

            return {
              postId: content.postId,
              success: true,
            };
          }

          // NON-MANUAL posts - Fetch data from Bundle Social
          const bundleData = await fetchBundleSocialPost(content.postId);

          if (!bundleData || !bundleData.items || bundleData.items.length === 0) {
            // Mark this error so it's retried after 6 hours (not every run)
            await ctx.runMutation(internal.app.bundle.updateAirtableContentError, {
              campaignId: content.campaignId,
              postId: content.postId,
              error: 'Bundle Social API error',
            });

            return {
              postId: content.postId,
              success: false,
              error: 'No data from Bundle Social',
            };
          }

          const stats = bundleData.items[0];
          if (!stats) {
            // Mark this error so it's retried after 6 hours (not every run)
            await ctx.runMutation(internal.app.bundle.updateAirtableContentError, {
              campaignId: content.campaignId,
              postId: content.postId,
              error: 'Bundle Social API error',
            });

            return {
              postId: content.postId,
              success: false,
              error: 'No stats data',
            };
          }

          // Fallback to TikTok API when Bundle Social returns zero views
          let finalStats = stats;
          if (stats.views === 0 && bundleData.post.externalData.TIKTOK?.id) {
            const tiktokVideoId = bundleData.post.externalData.TIKTOK.id;

            const tiktokResult = await ctx.runAction(internal.app.tiktok.getTikTokVideoById, {
              videoId: tiktokVideoId,
            });

            if (tiktokResult.success && tiktokResult.video) {
              finalStats = {
                views: tiktokResult.video.views,
                likes: tiktokResult.video.likes,
                comments: tiktokResult.video.comments,
                shares: tiktokResult.video.shares,
                saves: tiktokResult.video.saves,
              };
            }
            // Silently fall back to Bundle Social's zero stats if TikTok API fails
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
              views: finalStats.views,
              likes: finalStats.likes,
              comments: finalStats.comments,
              shares: finalStats.shares,
              saves: finalStats.saves,
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
              views: finalStats.views,
              likes: finalStats.likes,
              comments: finalStats.comments,
              shares: finalStats.shares,
              saves: finalStats.saves,
            });
          }

          // Collect snapshot data
          snapshotsToUpsert.push({
            postId: content.postId,
            views: finalStats.views,
            likes: finalStats.likes,
            comments: finalStats.comments,
            shares: finalStats.shares,
            saves: finalStats.saves,
          });

          // Clear any previous error on successful processing
          await ctx.runMutation(internal.app.bundle.clearAirtableContentError, {
            campaignId: content.campaignId,
            postId: content.postId,
          });

          return {
            postId: content.postId,
            success: true,
          };
        } catch (error) {
          // Check for permanent errors that should never be retried
          if (error instanceof Error && PERMANENT_ERRORS.includes(error.message)) {
            await ctx.runMutation(internal.app.bundle.updateAirtableContentError, {
              campaignId: content.campaignId,
              postId: content.postId,
              error: error.message,
            });

            return {
              postId: content.postId,
              success: false,
              error: `${error.message} - marked as permanent error`,
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

      const totalBatches = Math.ceil(contentsToProcess.length / CONCURRENT_LIMIT);

      // Process in batches (API calls only, no DB writes yet)
      for (let i = 0; i < contentsToProcess.length; i += CONCURRENT_LIMIT) {
        const batch = contentsToProcess.slice(i, i + CONCURRENT_LIMIT);
        const batchNum = Math.floor(i / CONCURRENT_LIMIT) + 1;
        const batchStartTime = Date.now();
        const processed = i;
        const progressPct = Math.round((processed / contentsToProcess.length) * 100);

        console.log(`⏳ Batch ${batchNum}/${totalBatches} | Progress: ${processed}/${contentsToProcess.length} (${progressPct}%)`);

        const batchResults = await Promise.allSettled(
          batch.map((content: { postId: string; campaignId: string; isManual?: boolean; tiktokId?: string; }) => processContent(content))
        );

        batchResults.forEach((result: PromiseSettledResult<{ postId: string; success: boolean; error?: string; skipped?: boolean; }>) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.error(`❌ Unexpected error:`, result.reason);
            results.push({
              postId: 'unknown',
              success: false,
              error: 'Unexpected error during processing',
            });
          }
        });

        const batchTime = ((Date.now() - batchStartTime) / 1000).toFixed(1);
        console.log(`✅ Batch ${batchNum} done in ${batchTime}s`);
      }

      // Bulk database operations
      console.log(`\n💾 Saving to database...`);

      // Bulk insert new posts (single mutation)
      if (postsToInsert.length > 0) {
        await ctx.runMutation(internal.app.bundle.bulkInsertPostedVideos, {
          posts: postsToInsert,
        });
      }

      // Bulk update existing posts (single mutation)
      if (postsToUpdate.length > 0) {
        await ctx.runMutation(internal.app.bundle.bulkUpdatePostedVideoStats, {
          updates: postsToUpdate,
        });
      }

      // Bulk upsert snapshots (single mutation)
      if (snapshotsToUpsert.length > 0) {
        await ctx.runMutation(internal.app.bundle.bulkUpsertDailySnapshots, {
          campaignId,
          date,
          snapshots: snapshotsToUpsert,
        });
      }

      // Calculate final stats
      const totalTime = Date.now() - startTime;
      const totalTimeSec = (totalTime / 1000).toFixed(1);
      const successCount = results.filter(r => r.success).length;
      const errorResults = results.filter(r => !r.success);
      const permanentErrors = errorResults.filter(r => PERMANENT_ERRORS.some(e => r.error?.includes(e))).length;
      const temporaryErrors = errorResults.length - permanentErrors;

      // Final summary
      console.log(`\n========== COMPLETE ==========`);
      console.log(`✅ Success: ${successCount} posts (${postsToInsert.length} new, ${postsToUpdate.length} updated)`);
      if (errorResults.length > 0) {
        console.log(`❌ Errors: ${errorResults.length} (${permanentErrors} permanent, ${temporaryErrors} temporary - will retry in 6h)`);
      }
      console.log(`⏱️  Time: ${totalTimeSec}s`);
      console.log(`📋 Remaining: ${remaining} posts to process in next run`);
      console.log(`================================\n`);
    } catch (error) {
      console.error(`Error refreshing TikTok stats for campaign ${campaignId}:`, error);
      throw error;
    }
  },
});

// Refresh TikTok stats - Orchestrator
// Schedules refresh jobs for each campaign
// Uses tiered monitoring: daily for new posts, less frequently for older posts
export const refreshTiktokStats = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      // Get unique campaign IDs from airtableCampaigns
      const campaignIds = await ctx.runQuery(internal.app.bundle.getUniqueCampaignIdsFromAirtable, {});
      let scheduledCount = 0;
      let offset = 0;

      for (const campaignId of campaignIds) {
        // Schedule background job for this campaign
        await ctx.scheduler.runAfter(offset, internal.app.bundle.refreshTiktokStatsByCampaign, {
          campaignId,
        });

        scheduledCount++;
        offset += 5 * 60 * 1000;
      }

      console.log(`Refresh TikTok stats scheduler: ${scheduledCount} campaigns scheduled for processing`);
      return { scheduledCount };
    } catch (error) {
      console.error('Error scheduling TikTok stats refresh:', error);
      throw error;
    }
  },
});