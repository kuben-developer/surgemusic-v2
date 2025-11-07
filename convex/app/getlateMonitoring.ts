/**
 * GETLATE MONITORING SCRIPT (TEMPORARY - 2 WEEKS)
 *
 * This script monitors and syncs TikTok posts from Getlate API during the migration period
 * to Bundle Social. After full migration, this file can be safely deleted.
 *
 * USAGE:
 * ------
 * 1. Open Convex Dashboard: https://dashboard.convex.dev
 * 2. Go to "Functions" tab
 * 3. Find "app/getlateMonitoring:syncGetlatePosts" or "app/getlateMonitoring:refreshGetlatePosts"
 * 4. Click "Run" to execute manually
 *
 * FUNCTIONS:
 * ----------
 * - syncGetlatePosts: Initial sync of NEW getlate posts from Airtable
 *   Run this to import getlate posts that aren't in the database yet
 *
 * - refreshGetlatePosts: Refresh analytics for EXISTING getlate posts
 *   Run this to update view counts, likes, etc. for posts already imported
 *
 * HOW IT WORKS:
 * -------------
 * 1. Detects getlate posts by ID format:
 *    - Getlate: 24 hex chars, no dashes (e.g., "68ffb07bbb2064520678cb9c")
 *    - Bundle Social: UUID with dashes (e.g., "656ab815-49c7-452f-9909-6cb89671f4c2")
 *
 * 2. For each getlate post:
 *    - Fetches TikTok video ID from Getlate API
 *    - Gets video stats from TikTok via getTikTokVideoById
 *    - Stores in bundleSocialPostedVideos and bundleSocialSnapshots tables
 *
 * MIGRATION TIMELINE:
 * -------------------
 * - Week 1-2: Run syncGetlatePosts and refreshGetlatePosts as needed
 * - After full migration to Bundle Social: Delete this file
 *
 * NOTES:
 * ------
 * - No database schema changes required (uses existing tables)
 * - Main Bundle Social sync functions remain untouched
 * - Runs independently without affecting Bundle Social workflows
 */

"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const LATE_API_KEY = process.env.LATE_API_KEY!;
const LATE_API_BASE_URL = "https://getlate.dev/api/v1";

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

/**
 * Detects if a post ID is in getlate format (MongoDB ObjectId) vs Bundle Social format (UUID)
 * Getlate: 24 hex characters, no dashes (e.g., "68ffb07bbb2064520678cb9c")
 * Bundle Social: UUID with dashes (e.g., "656ab815-49c7-452f-9909-6cb89671f4c2")
 */
function isGetlatePostId(postId: string): boolean {
  // UUID format has dashes
  if (postId.includes('-')) {
    return false;
  }

  // MongoDB ObjectId: exactly 24 hex characters
  const objectIdPattern = /^[a-f0-9]{24}$/i;
  return objectIdPattern.test(postId);
}

/**
 * Fetches TikTok video ID from getlate API
 */
async function fetchTikTokVideoIdFromGetlate(postId: string): Promise<string | null> {
  try {
    const response = await fetch(`${LATE_API_BASE_URL}/posts/${postId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${LATE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Getlate API error for post ${postId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const tiktokVideoId = data.post?.platforms?.[0]?.platformPostId || null;

    if (!tiktokVideoId) {
      console.error(`No platformPostId found in Getlate API response for post ${postId}`);
      return null;
    }

    return tiktokVideoId;
  } catch (error) {
    console.error(`Error fetching from Getlate API for post ${postId}:`, error);
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

/**
 * Syncs getlate posts from Airtable campaigns
 * This is a temporary script for the next 2 weeks during migration to Bundle Social
 *
 * Usage: Call manually from Convex dashboard whenever you need to sync getlate posts
 */
export const syncGetlatePosts = action({
  args: {},
  handler: async (ctx) => {
    console.log("🚀 Starting getlate posts sync...");

    try {
      // Get today's date in DD-MM-YYYY format for snapshots
      const today = new Date();
      const date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

      // Global statistics
      let totalCampaigns = 0;
      let totalGetlatePosts = 0;
      let totalSucceeded = 0;
      let totalFailed = 0;
      let totalSkipped = 0;

      // Fetch all active campaigns from Airtable
      const campaigns = await fetchAirtableCampaigns();
      console.log(`📊 Found ${campaigns.length} active campaigns`);

      for (const campaign of campaigns) {
        const campaignRecordId = campaign.id;
        const campaignIdField = campaign.fields['campaign_id'] as string;

        if (!campaignRecordId || !campaignIdField) {
          console.log(`⊙ Skipping campaign (missing IDs)`);
          continue;
        }

        // Fetch content for this campaign
        const contentRecords = await fetchAirtableContent(campaignIdField);

        // Filter for getlate posts only
        const getlatePosts: Array<{ apiPostId: string; videoUrl?: string }> = [];

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

          // Check if this is a getlate post
          if (apiPostId && isGetlatePostId(apiPostId)) {
            getlatePosts.push({ apiPostId, videoUrl });
          }
        }

        if (getlatePosts.length === 0) {
          // No getlate posts in this campaign, skip silently
          continue;
        }

        totalCampaigns++;
        totalGetlatePosts += getlatePosts.length;

        console.log(`\n📦 Campaign ${campaignRecordId} (${campaignIdField}): ${getlatePosts.length} getlate post(s)`);

        // Process each getlate post
        for (const post of getlatePosts) {
          const { apiPostId, videoUrl } = post;

          try {
            // Check if already exists
            const exists = await ctx.runQuery(internal.app.bundleSocialQueries.checkPostExists, {
              postId: apiPostId
            });

            if (exists) {
              console.log(`  ⊙ Post ${apiPostId} already exists, skipping`);
              totalSkipped++;
              continue;
            }

            // Step 1: Get TikTok video ID from getlate API
            console.log(`  🔍 Fetching TikTok video ID from getlate for post: ${apiPostId}`);
            const tiktokVideoId = await fetchTikTokVideoIdFromGetlate(apiPostId);

            if (!tiktokVideoId) {
              console.error(`  ✗ Failed to get TikTok video ID for post ${apiPostId}`);
              totalFailed++;
              continue;
            }

            console.log(`  ✓ Got TikTok video ID: ${tiktokVideoId}`);

            // Step 2: Get video stats from TikTok
            console.log(`  🔍 Fetching video stats from TikTok...`);
            const result = await ctx.runAction(internal.app.tiktok.getTikTokVideoById, {
              videoId: tiktokVideoId,
            });

            if (!result.success || !result.video) {
              console.error(`  ✗ Failed to fetch video stats: ${result.error || 'Unknown error'}`);
              totalFailed++;
              continue;
            }

            const stats = result.video;
            const videoUrlFromTikTok = `https://www.tiktok.com/@/video/${tiktokVideoId}`;

            // Step 3: Insert post into bundleSocialPostedVideos
            console.log(`  💾 Storing post data...`);
            await ctx.runMutation(internal.app.bundleSocialQueries.insertPost, {
              campaignId: campaignRecordId,
              postId: apiPostId,  // Use getlate post ID
              videoId: tiktokVideoId,
              postedAt: Math.floor(Date.now() / 1000),  // Current timestamp in seconds
              videoUrl: videoUrlFromTikTok,
              mediaUrl: videoUrl,  // From Airtable if available
              views: stats.views,
              likes: stats.likes,
              comments: stats.comments,
              shares: stats.shares,
              saves: stats.saves,
            });

            // Step 4: Create snapshot
            await ctx.runMutation(internal.app.bundleSocialQueries.upsertSnapshot, {
              campaignId: campaignRecordId,
              postId: apiPostId,
              date,
              views: stats.views,
              likes: stats.likes,
              comments: stats.comments,
              shares: stats.shares,
              saves: stats.saves,
            });

            totalSucceeded++;
            console.log(`  ✓ Stored: ${stats.views.toLocaleString()} views, ${stats.likes.toLocaleString()} likes, ${stats.comments.toLocaleString()} comments`);

          } catch (error) {
            console.error(`  ✗ Error processing post ${apiPostId}:`, error);
            totalFailed++;
          }
        }
      }

      const summary = {
        campaigns: totalCampaigns,
        totalGetlatePosts,
        succeeded: totalSucceeded,
        failed: totalFailed,
        skipped: totalSkipped,
      };

      console.log(`\n✅ Getlate sync complete!`);
      console.log(`   Campaigns with getlate posts: ${summary.campaigns}`);
      console.log(`   Total getlate posts found: ${summary.totalGetlatePosts}`);
      console.log(`   Successfully synced: ${summary.succeeded}`);
      console.log(`   Skipped (already exist): ${summary.skipped}`);
      console.log(`   Failed: ${summary.failed}`);

      return summary;

    } catch (error) {
      console.error('❌ Error during getlate sync:', error);
      throw error;
    }
  },
});

/**
 * Refreshes analytics for existing getlate posts
 * Similar to refreshBundleSocialPosts but only processes getlate posts
 */
export const refreshGetlatePosts = action({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting getlate posts refresh...");

    try {
      // Get today's date in DD-MM-YYYY format
      const today = new Date();
      const date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

      // Get unique campaign IDs
      const campaignIds = await ctx.runQuery(internal.app.bundleSocialQueries.getUniqueCampaignIds, {});

      let totalUpdated = 0;
      let totalFailed = 0;
      let totalCampaignsProcessed = 0;

      console.log(`📊 Found ${campaignIds.length} campaigns with posts`);

      for (const campaignId of campaignIds) {
        // Get all posts for this campaign
        const posts = await ctx.runQuery(internal.app.bundleSocialQueries.getPostsByCampaign, { campaignId });

        // Filter for getlate posts only
        const getlatePosts = posts.filter(post => isGetlatePostId(post.postId));

        if (getlatePosts.length === 0) {
          continue;
        }

        totalCampaignsProcessed++;
        console.log(`\n📦 Campaign ${campaignId}: ${getlatePosts.length} getlate post(s) to refresh`);

        for (const post of getlatePosts) {
          try {
            // Step 1: Get TikTok video ID from getlate API
            const tiktokVideoId = await fetchTikTokVideoIdFromGetlate(post.postId);

            if (!tiktokVideoId) {
              console.error(`  ✗ Failed to get TikTok video ID for post ${post.postId}`);
              totalFailed++;
              continue;
            }

            // Step 2: Get fresh stats from TikTok
            const result = await ctx.runAction(internal.app.tiktok.getTikTokVideoById, {
              videoId: tiktokVideoId,
            });

            if (!result.success || !result.video) {
              console.error(`  ✗ Failed to fetch video stats for ${post.postId}: ${result.error || 'Unknown error'}`);
              totalFailed++;
              continue;
            }

            const stats = result.video;

            // Step 3: Update post stats
            await ctx.runMutation(internal.app.bundleSocialQueries.updatePostStats, {
              postId: post.postId,
              views: stats.views,
              likes: stats.likes,
              comments: stats.comments,
              shares: stats.shares,
              saves: stats.saves,
            });

            // Step 4: Upsert snapshot
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

            totalUpdated++;
            console.log(`  ✓ Updated post ${post.postId}: ${stats.views.toLocaleString()} views`);

          } catch (error) {
            console.error(`  ✗ Error refreshing post ${post.postId}:`, error);
            totalFailed++;
          }
        }
      }

      const summary = {
        campaignsProcessed: totalCampaignsProcessed,
        updated: totalUpdated,
        failed: totalFailed,
      };

      console.log(`\n✅ Getlate refresh complete!`);
      console.log(`   Campaigns processed: ${summary.campaignsProcessed}`);
      console.log(`   Posts updated: ${summary.updated}`);
      console.log(`   Failed: ${summary.failed}`);

      return summary;

    } catch (error) {
      console.error('❌ Error during getlate refresh:', error);
      throw error;
    }
  },
});
