"use node";

import { v } from "convex/values";
import { internalAction, action } from "../_generated/server";
import { internal } from "../_generated/api";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_ARTIST_TABLE_ID = "tblGoMJr5XOVFx50O";
const BUNDLE_SOCIAL_API_KEY = process.env.BUNDLE_SOCIAL_API_KEY!;
const CONCURRENT_LIMIT = 10;

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

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
      // Don't log 400 errors - they're expected for scheduled posts
      if (response.status !== 400) {
        console.error(`Bundle Social API error for post ${postId}: ${response.status}`);
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching Bundle Social post ${postId}:`, error);
    return null;
  }
}

// Fetch Bundle Social post status (works for both scheduled and posted content)
async function fetchBundleSocialPostStatus(postId: string): Promise<{ status: string; errors?: Record<string, string> } | null> {
  try {
    const response = await fetch(
      `https://api.bundle.social/api/v1/post/${postId}`,
      {
        headers: {
          'x-api-key': BUNDLE_SOCIAL_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error(`Bundle Social API error for post status ${postId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return { status: data.status, errors: data.errors };
  } catch (error) {
    console.error(`Error fetching Bundle Social post status ${postId}:`, error);
    return null;
  }
}

// Fetch all campaigns from Airtable
async function fetchAirtableCampaigns(): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tblDKeX3BOFuLCucu`);
    url.searchParams.append('filterByFormula', '{Status} = "Active"');
    if (offset) url.searchParams.append('offset', offset);

    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data: AirtableResponse = await response.json();
    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

// Fetch content for a campaign from Airtable
async function fetchAirtableContent(campaignId: string): Promise<AirtableRecord[]> {
  const allRecords: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tbleqHUKb7il998rO`);
    url.searchParams.append('filterByFormula', `{campaign_id} = '${campaignId}'`);
    url.searchParams.append('fields[]', 'api_post_id');
    url.searchParams.append('fields[]', 'video_url');
    if (offset) url.searchParams.append('offset', offset);

    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data: AirtableResponse = await response.json();
    allRecords.push(...data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

// Sync posts for a single campaign (scheduled by syncBundleSocialPosts)
export const syncBundleSocialPostsByCampaign = internalAction({
  args: {
    campaignRecordId: v.string(),
    campaignIdField: v.string(),
  },
  handler: async (ctx, { campaignRecordId, campaignIdField }) => {
    try {
      let processedCount = 0;
      let noApiPostIdCount = 0;
      let noVideoUrlCount = 0;
      let alreadyExistsCount = 0;
      let scheduledCount = 0;
      let errorCount = 0;
      const errorMessages: string[] = [];

      // Fetch content for this campaign using the campaign_id field
      const contentRecords = await fetchAirtableContent(campaignIdField);

      // DELETION LOGIC: Remove posts that no longer exist in Airtable
      // Get all existing posts from database for this campaign
      const existingPosts = await ctx.runQuery(internal.app.bundleSocialQueries.getPostsByCampaign, { campaignId: campaignRecordId });

      // Build Set of valid postIds from Airtable content
      const validPostIds = new Set<string>();
      for (const content of contentRecords) {
        const apiPostIdRaw = content.fields['api_post_id'];
        let apiPostId: string | undefined;
        if (Array.isArray(apiPostIdRaw)) {
          apiPostId = apiPostIdRaw[0];
        } else if (typeof apiPostIdRaw === 'string') {
          apiPostId = apiPostIdRaw;
        }
        if (apiPostId) {
          validPostIds.add(apiPostId);
        }
      }

      // Find orphaned posts (exist in DB but not in Airtable)
      const orphanedPosts = existingPosts.filter(post => !validPostIds.has(post.postId));

      // Delete orphaned posts
      let deletedCount = 0;
      for (const orphanedPost of orphanedPosts) {
        const deleted = await ctx.runMutation(internal.app.bundleSocialQueries.deletePostByPostId, { postId: orphanedPost.postId });
        if (deleted) {
          deletedCount++;
        }
      }

      // If we deleted any posts, schedule a rebuild of campaign performance
      if (deletedCount > 0) {
        console.log(`Deleted ${deletedCount} orphaned posts for campaign ${campaignRecordId}, scheduling performance rebuild`);
        await ctx.scheduler.runAfter(0, internal.app.bundleSocial.aggregateCampaignPerformanceByCampaign, {
          campaignId: campaignRecordId,
          rebuildFromSnapshots: true,
        });
      }

      for (const content of contentRecords) {
        const apiPostIdRaw = content.fields['api_post_id'];
        const videoUrl = content.fields['video_url'] as string | undefined;

        // Extract api_post_id (handle both string and array formats)
        let apiPostId: string | undefined;
        if (Array.isArray(apiPostIdRaw)) {
          apiPostId = apiPostIdRaw[0];
        } else if (typeof apiPostIdRaw === 'string') {
          apiPostId = apiPostIdRaw;
        }

        // Skip if no api_post_id
        if (!apiPostId) {
          noApiPostIdCount++;
          continue;
        }

        // Skip if no video_url
        if (!videoUrl) {
          noVideoUrlCount++;
          continue;
        }

        // Check if already exists
        const exists = await ctx.runQuery(internal.app.bundleSocialQueries.checkPostExists, { postId: apiPostId });
        if (exists) {
          alreadyExistsCount++;
          continue;
        }

        // Fetch data from Bundle Social
        const bundleData = await fetchBundleSocialPost(apiPostId);
        if (!bundleData || !bundleData.items || bundleData.items.length === 0) {
          // Check if post is scheduled (not yet posted)
          const postStatus = await fetchBundleSocialPostStatus(apiPostId);

          if (postStatus && postStatus.status === 'SCHEDULED') {
            scheduledCount++;
            continue;
          }

          // Log actual error with details if available
          if (postStatus && postStatus.status === 'ERROR' && postStatus.errors) {
            const errorMsg = Object.values(postStatus.errors).join(', ');
            console.error(`Post ${apiPostId} has errors: ${errorMsg}`);
            errorMessages.push(errorMsg);
          } else {
            const errorMsg = `No data from Bundle Social for post ${apiPostId}`;
            console.error(errorMsg);
            errorMessages.push(errorMsg);
          }

          errorCount++;
          continue;
        }

        // Extract data
        const stats = bundleData.items[0];
        if (!stats) {
          const errorMsg = `No stats data for post ${apiPostId}`;
          console.error(errorMsg);
          errorMessages.push(errorMsg);
          errorCount++;
          continue;
        }

        const postedAtMs = new Date(bundleData.post.postedDate).getTime();
        const postedAtSeconds = Math.floor(postedAtMs / 1000);

        // Insert into database using the Airtable record ID (immutable)
        await ctx.runMutation(internal.app.bundleSocialQueries.insertPost, {
          campaignId: campaignRecordId,  // Using Airtable record ID (e.g., recK2FEC9YDXc0BKs)
          postId: apiPostId,
          videoId: bundleData.post.externalData.TIKTOK.id,
          postedAt: postedAtSeconds,
          videoUrl: bundleData.post.externalData.TIKTOK.permalink,
          mediaUrl: videoUrl,
          views: stats.views,
          likes: stats.likes,
          comments: stats.comments,
          shares: stats.shares,
          saves: stats.saves,
        });

        processedCount++;
      }

      // Save sync statistics to database
      await ctx.runMutation(internal.app.bundleSocialQueries.upsertAirtableCampaignStats, {
        campaignId: campaignRecordId,
        posted: processedCount + alreadyExistsCount,
        noPostId: noApiPostIdCount,
        noVideoUrl: noVideoUrlCount,
        scheduled: scheduledCount,
        errors: errorMessages,
      });

      console.log(`Sync campaign ${campaignRecordId}: ${processedCount} new posts, ${alreadyExistsCount} already exist, ${noApiPostIdCount} no api_post_id, ${noVideoUrlCount} no video_url, ${scheduledCount} scheduled, ${errorCount} errors`);
    } catch (error) {
      console.error(`Error syncing campaign ${campaignRecordId}:`, error);
      throw error;
    }
  },
});

// Sync posts from Airtable (runs every 30 minutes)
// Schedules individual jobs per campaign to avoid timeout
export const syncBundleSocialPosts = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      // Fetch all active campaigns from Airtable
      const campaigns = await fetchAirtableCampaigns();
      let scheduledCount = 0;

      for (const campaign of campaigns) {
        // Use the internal Airtable record ID (e.g., recK2FEC9YDXc0BKs) instead of campaign_id field
        // This is immutable and won't change even if the campaign_id field is modified
        const campaignRecordId = campaign.id;
        if (!campaignRecordId) continue;

        // Get the campaign_id field to fetch content from Airtable
        const campaignIdField = campaign.fields['campaign_id'] as string;
        if (!campaignIdField) continue;

        console.log(campaignRecordId, campaignIdField);

        // Schedule background job for this campaign
        await ctx.scheduler.runAfter(0, internal.app.bundleSocial.syncBundleSocialPostsByCampaign, {
          campaignRecordId,
          campaignIdField,
        });

        scheduledCount++;
      }

      console.log(`Sync scheduler: ${scheduledCount} campaigns scheduled for processing`);
    } catch (error) {
      console.error('Error scheduling Bundle Social sync:', error);
      throw error;
    }
  },
});

// Refresh posts for a single campaign (scheduled by refreshBundleSocialPosts)
export const refreshBundleSocialPostsByCampaign = internalAction({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, { campaignId }) => {
    try {
      const startTime = Date.now();

      // Get today's date in DD-MM-YYYY format
      const today = new Date();
      const date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

      // Get all posts for this campaign
      const allPosts = await ctx.runQuery(internal.app.bundleSocialQueries.getPostsByCampaign, { campaignId });


      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const posts = allPosts.filter(
        (post: { postId: string }) => uuidRegex.test(post.postId)
      );

      // Process a single post
      const processPost = async (post: { postId: string; campaignId: string }) => {
        try {
          // Fetch updated data from Bundle Social
          const bundleData = await fetchBundleSocialPost(post.postId);
          if (!bundleData || !bundleData.items || bundleData.items.length === 0) {
            return {
              postId: post.postId,
              success: false,
              error: `No data from Bundle Social`
            };
          }

          const stats = bundleData.items[0];
          if (!stats) {
            return {
              postId: post.postId,
              success: false,
              error: `No stats data`
            };
          }

          // if (post.postId == "3ade199f-a34c-4d95-aca4-5714fc2c44f8") {
          //   console.log(bundleData);
          //   console.log(stats)
          // }

          // Update post stats
          await ctx.runMutation(internal.app.bundleSocialQueries.updatePostStats, {
            postId: post.postId,
            views: stats.views,
            likes: stats.likes,
            comments: stats.comments,
            shares: stats.shares,
            saves: stats.saves,
          });

          // Upsert snapshot
          await ctx.runMutation(internal.app.bundleSocialQueries.upsertSnapshot, {
            campaignId: post.campaignId,
            postId: post.postId,
            date,
            views: stats.views,
            likes: stats.likes,
            comments: stats.comments,
            shares: stats.shares,
            saves: stats.saves,
          });

          return {
            postId: post.postId,
            success: true
          };
        } catch (error) {
          return {
            postId: post.postId,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      };

      const results: Array<{
        postId: string;
        success: boolean;
        error?: string;
      }> = [];

      console.log(`[refreshBundleSocial] Processing ${posts.length} posts with concurrency limit of ${CONCURRENT_LIMIT}`);

      for (let i = 0; i < posts.length; i += CONCURRENT_LIMIT) {
        const batch = posts.slice(i, i + CONCURRENT_LIMIT);
        const batchStartTime = Date.now();
        console.log(`[refreshBundleSocial] Processing batch ${Math.floor(i / CONCURRENT_LIMIT) + 1}/${Math.ceil(posts.length / CONCURRENT_LIMIT)} (${batch.length} items)`);

        const batchResults = await Promise.allSettled(
          batch.map(post => processPost(post))
        );

        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            console.error(`[refreshBundleSocial] Unexpected error in batch processing:`, result.reason);
            results.push({
              postId: 'unknown',
              success: false,
              error: 'Unexpected error during processing'
            });
          }
        });

        console.log(`[refreshBundleSocial] Batch ${Math.floor(i / CONCURRENT_LIMIT) + 1} completed in ${Date.now() - batchStartTime}ms`);
      }

      const totalTime = Date.now() - startTime;
      const updatedCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      console.log(`Refresh campaign ${campaignId}: ${updatedCount} posts updated, ${errorCount} errors in ${totalTime}ms`);
    } catch (error) {
      console.error(`Error refreshing campaign ${campaignId}:`, error);
      throw error;
    }
  },
});

// Refresh posts (runs every 6 hours)
// Schedules individual jobs per campaign to avoid timeout
export const refreshBundleSocialPosts = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      // Get unique campaign IDs
      const campaignIds = await ctx.runQuery(internal.app.bundleSocialQueries.getUniqueCampaignIds, {});
      let scheduledCount = 0;

      for (const campaignId of campaignIds) {
        // Schedule background job for this campaign
        await ctx.scheduler.runAfter(0, internal.app.bundleSocial.refreshBundleSocialPostsByCampaign, {
          campaignId,
        });

        scheduledCount++;
      }

      console.log(`Refresh scheduler: ${scheduledCount} campaigns scheduled for refresh`);
    } catch (error) {
      console.error('Error scheduling Bundle Social refresh:', error);
      throw error;
    }
  },
});

// Aggregate campaign performance for a single campaign (scheduled by aggregateCampaignPerformance)
export const aggregateCampaignPerformanceByCampaign = internalAction({
  args: {
    campaignId: v.string(),
    rebuildFromSnapshots: v.optional(v.boolean()), // If true, delete all existing records and rebuild from snapshots
  },
  handler: async (ctx, { campaignId, rebuildFromSnapshots = false }) => {
    try {
      if (rebuildFromSnapshots) {
        // REBUILD MODE: Delete all existing records and recreate from snapshots
        console.log(`[REBUILD] Starting rebuild for campaign ${campaignId} from snapshots`);

        // 1. Delete all existing performance records for this campaign
        const deletedCount = await ctx.runMutation(internal.app.bundleSocialQueries.deleteCampaignPerformance, { campaignId });
        console.log(`[REBUILD] Deleted ${deletedCount} existing performance records`);

        // 2. Get all valid posts for this campaign to filter snapshots
        const posts = await ctx.runQuery(internal.app.bundleSocialQueries.getPostsByCampaign, { campaignId });
        const validPostIds = new Set(posts.map(post => post.postId));
        console.log(`[REBUILD] Found ${validPostIds.size} valid posts in bundleSocialPostedVideos`);

        // 3. Get all snapshots for this campaign
        const allSnapshots = await ctx.runQuery(internal.app.bundleSocialQueries.getAllSnapshotsForCampaign, { campaignId });
        console.log(`[REBUILD] Found ${allSnapshots.length} total snapshots`);

        // 4. Filter snapshots to only include those with postIds that exist in bundleSocialPostedVideos
        const snapshots = allSnapshots.filter(snapshot => validPostIds.has(snapshot.postId));
        console.log(`[REBUILD] Filtered to ${snapshots.length} snapshots with valid postIds`);

        if (snapshots.length === 0) {
          console.log(`[REBUILD] No valid snapshots found for campaign ${campaignId}`);
          return;
        }

        // 5. Group snapshots by date and aggregate
        const snapshotsByDate = new Map<string, {
          postIds: Set<string>;
          views: number;
          likes: number;
          comments: number;
          shares: number;
          saves: number;
        }>();

        for (const snapshot of snapshots) {
          const existing = snapshotsByDate.get(snapshot.date);
          if (existing) {
            existing.postIds.add(snapshot.postId);
            existing.views += snapshot.views;
            existing.likes += snapshot.likes;
            existing.comments += snapshot.comments;
            existing.shares += snapshot.shares;
            existing.saves += snapshot.saves;
          } else {
            snapshotsByDate.set(snapshot.date, {
              postIds: new Set([snapshot.postId]),
              views: snapshot.views,
              likes: snapshot.likes,
              comments: snapshot.comments,
              shares: snapshot.shares,
              saves: snapshot.saves,
            });
          }
        }

        // 6. Sort dates and forward-fill missing dates
        const sortedDates = Array.from(snapshotsByDate.entries())
          .map(([date, metrics]) => ({ date, ...metrics }))
          .sort((a, b) => {
            const partsA = a.date.split('-');
            const dayA = parseInt(partsA[0] || '0', 10);
            const monthA = parseInt(partsA[1] || '0', 10);
            const yearA = parseInt(partsA[2] || '0', 10);

            const partsB = b.date.split('-');
            const dayB = parseInt(partsB[0] || '0', 10);
            const monthB = parseInt(partsB[1] || '0', 10);
            const yearB = parseInt(partsB[2] || '0', 10);

            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA.getTime() - dateB.getTime();
          });

        // Helper to format date as DD-MM-YYYY
        const formatDate = (date: Date): string => {
          return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
        };

        // Helper to parse DD-MM-YYYY to Date
        const parseDate = (dateStr: string): Date => {
          const parts = dateStr.split('-');
          const day = parseInt(parts[0] || '0', 10);
          const month = parseInt(parts[1] || '0', 10);
          const year = parseInt(parts[2] || '0', 10);
          return new Date(year, month - 1, day);
        };

        // Forward-fill missing dates
        const filledDates: Array<{
          date: string;
          postIds: Set<string>;
          views: number;
          likes: number;
          comments: number;
          shares: number;
          saves: number;
        }> = [];

        if (sortedDates.length > 0) {
          const firstDate = parseDate(sortedDates[0].date);
          const lastDate = parseDate(sortedDates[sortedDates.length - 1].date);

          // Create map for quick lookup
          const dateMap = new Map(sortedDates.map(item => [item.date, item]));

          const currentDate = new Date(firstDate);
          let previousEntry = sortedDates[0];

          while (currentDate <= lastDate) {
            const dateStr = formatDate(currentDate);
            const existing = dateMap.get(dateStr);

            if (existing) {
              filledDates.push(existing);
              previousEntry = existing;
            } else {
              // Forward-fill from previous entry (create new Set to avoid reference sharing)
              filledDates.push({
                date: dateStr,
                postIds: new Set(previousEntry.postIds),
                views: previousEntry.views,
                likes: previousEntry.likes,
                comments: previousEntry.comments,
                shares: previousEntry.shares,
                saves: previousEntry.saves,
              });
            }

            currentDate.setDate(currentDate.getDate() + 1);
          }
        }

        // 7. Insert aggregated performance records for each date (including forward-filled)
        let insertedCount = 0;
        for (const metrics of filledDates) {
          await ctx.runMutation(internal.app.bundleSocialQueries.upsertCampaignPerformance, {
            campaignId,
            date: metrics.date,
            posts: metrics.postIds.size,
            views: metrics.views,
            likes: metrics.likes,
            comments: metrics.comments,
            shares: metrics.shares,
            saves: metrics.saves,
          });
          insertedCount++;
        }

        console.log(`[REBUILD] Rebuilt ${insertedCount} performance records for campaign ${campaignId} (with forward-filled gaps)`);
      } else {
        // NORMAL MODE: Only update today's record
        // Get today's date in DD-MM-YYYY format
        const today = new Date();
        const date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

        // Get all posts for this campaign
        const posts = await ctx.runQuery(internal.app.bundleSocialQueries.getPostsByCampaign, { campaignId });

        // Aggregate stats
        let totalViews = 0;
        let totalLikes = 0;
        let totalComments = 0;
        let totalShares = 0;
        let totalSaves = 0;
        const totalPosts = posts.length;

        for (const post of posts) {
          totalViews += post.views;
          totalLikes += post.likes;
          totalComments += post.comments;
          totalShares += post.shares;
          totalSaves += post.saves;
        }

        // Upsert aggregated performance
        await ctx.runMutation(internal.app.bundleSocialQueries.upsertCampaignPerformance, {
          campaignId,
          date,
          posts: totalPosts,
          views: totalViews,
          likes: totalLikes,
          comments: totalComments,
          shares: totalShares,
          saves: totalSaves,
        });

        console.log(`Aggregated campaign ${campaignId}: ${totalPosts} posts, ${totalViews} views`);
      }
    } catch (error) {
      console.error(`Error aggregating campaign ${campaignId}:`, error);
      throw error;
    }
  },
});

// Aggregate campaign performance (runs every 6 hours)
// Schedules individual jobs per campaign to avoid timeout
export const aggregateCampaignPerformance = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      // Get unique campaign IDs
      const campaignIds = await ctx.runQuery(internal.app.bundleSocialQueries.getUniqueCampaignIds, {});
      let scheduledCount = 0;

      for (const campaignId of campaignIds) {
        // Schedule background job for this campaign
        await ctx.scheduler.runAfter(0, internal.app.bundleSocial.aggregateCampaignPerformanceByCampaign, {
          campaignId,
          rebuildFromSnapshots: true,
        });

        scheduledCount++;
      }

      console.log(`Aggregation scheduler: ${scheduledCount} campaigns scheduled for aggregation`);
    } catch (error) {
      console.error('Error scheduling campaign performance aggregation:', error);
      throw error;
    }
  },
});

// Get post counts by date for calendar
export const getPostCountsByDate = action({
  args: {
    campaignId: v.string(),
  },
  handler: async (ctx, { campaignId }): Promise<Record<string, number>> => {
    return await ctx.runQuery(internal.app.bundleSocialQueries.getPostCountsByDate, {
      campaignId,
    });
  },
});

// Get campaign analytics with Airtable metadata
export const getCampaignAnalyticsWithMetadata = action({
  args: {
    campaignId: v.string(),
    days: v.optional(v.number()),
    postedStartDate: v.optional(v.number()),
    postedEndDate: v.optional(v.number()),
  },
  handler: async (ctx, { campaignId, days, postedStartDate, postedEndDate }): Promise<{
    totals: { posts: number; views: number; likes: number; comments: number; shares: number; saves: number };
    growth: { views: number; likes: number; comments: number; shares: number; saves: number };
    engagementRate: string;
    engagementGrowth: string;
    dailyData: Array<{ date: string; views: number; likes: number; comments: number; shares: number; saves: number }>;
    videoMetrics: Array<{ postId: string; videoId: string; videoUrl: string; mediaUrl?: string; postedAt: number; views: number; likes: number; comments: number; shares: number; saves: number }>;
    lastUpdatedAt: number;
    campaignMetadata: { campaignId: string; name: string; artist: string; song: string };
  }> => {
    try {
      // Fetch analytics data from pre-aggregated table or filter by posted date
      const analytics = await ctx.runQuery(internal.app.bundleSocialQueries.getCampaignAnalytics, {
        campaignId,
        days,
        postedStartDate,
        postedEndDate,
      });

      // Fetch campaign metadata from Airtable
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/tblDKeX3BOFuLCucu/${campaignId}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
      });

      if (!response.ok) {
        console.error(`Failed to fetch campaign metadata from Airtable: ${response.status}`);
        // Return analytics without metadata if Airtable fetch fails
        return {
          ...analytics,
          campaignMetadata: {
            campaignId,
            name: 'Unknown Campaign',
            artist: 'Unknown Artist',
            song: 'Unknown Song',
          },
        };
      }

      const campaignData = await response.json();
      const fields = campaignData.fields || {};

      // Fetch artist and song details from related Artist table
      let artist = 'Unknown Artist';
      let song = 'Unknown Song';

      const artistSongIds = fields['Artist / Song'] as string[] | undefined;
      if (artistSongIds?.[0]) {
        const artistUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_ARTIST_TABLE_ID}/${artistSongIds[0]}`;
        const artistResponse = await fetch(artistUrl, {
          headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
        });

        if (artistResponse.ok) {
          const artistData = await artistResponse.json();
          artist = (artistData.fields['Artist'] as string) || 'Unknown Artist';
          song = (artistData.fields['Song'] as string) || 'Unknown Song';
        }
      }

      return {
        ...analytics,
        campaignMetadata: {
          campaignId,
          name: fields['campaign_name'] || fields['campaign_id'] || 'Unknown Campaign',
          artist,
          song,
        },
      };
    } catch (error) {
      console.error(`Error fetching campaign analytics for ${campaignId}:`, error);
      throw error;
    }
  },
});
