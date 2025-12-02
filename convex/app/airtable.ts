import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { action, internalAction, internalMutation, internalQuery } from "../_generated/server";

// Airtable configuration - these should come from environment variables
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";
const AIRTABLE_CAMPAIGN_TABLE_ID = "tblDKeX3BOFuLCucu";
const AIRTABLE_ARTIST_TABLE_ID = "tblGoMJr5XOVFx50O";
const AIRTABLE_CONTENT_TABLE_ID = "tbleqHUKb7il998rO";

// Getlate API configuration
const LATE_API_KEY = process.env.LATE_API_KEY || "";
const LATE_API_BASE_URL = "https://getlate.dev/api/v1";

interface AirtableRecord {
    id: string;
    fields: Record<string, unknown>;
}

interface AirtableResponse {
    records: AirtableRecord[];
    offset?: string;
}

interface CampaignOutput {
    id: string;
    campaign_id: string;
    artist: string;
    song: string;
    status: string;
}

interface ContentItem {
    id: string;
    video_url?: string;
    account_niche: string;
    video_category: string;
    api_post_id?: string;
}

// Helper function to fetch records from Airtable
async function fetchRecords(
    tableId: string,
    filterFormula?: string,
    fields?: string[]
): Promise<AirtableRecord[]> {
    const allRecords: AirtableRecord[] = [];
    let offset: string | undefined;

    do {
        const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);

        if (filterFormula) url.searchParams.append("filterByFormula", filterFormula);
        if (fields) fields.forEach((field) => url.searchParams.append("fields[]", field));
        if (offset) url.searchParams.append("offset", offset);

        const response = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
        });

        if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status}`);
        }

        const data: AirtableResponse = (await response.json()) as AirtableResponse;
        allRecords.push(...data.records);
        offset = data.offset;
    } while (offset);

    return allRecords;
}

// Helper function to fetch a single record by ID
async function fetchRecordById(
    tableId: string,
    recordId: string
): Promise<AirtableRecord | null> {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`;

    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) {
        return null;
    }

    return (await response.json()) as AirtableRecord;
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

  return true;
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

/**
 * Fetch all active campaigns from Airtable
 */
export const getCampaigns = action({
    args: {},
    handler: async (): Promise<CampaignOutput[]> => {
        const records = await fetchRecords(
            AIRTABLE_CAMPAIGN_TABLE_ID,
            undefined,
            ["campaign", "client_id", "Status"]
        );

        const outputData: CampaignOutput[] = [];

        for (const record of records) {
            const output: CampaignOutput = {
                id: record.id,
                campaign_id: record.fields["campaign"] as string,
                artist: "",
                song: "",
                status: (record.fields["Status"] as string) || "Unknown",
            };

            // Fetch artist and song details from related table
            const artistSongIds = record.fields["client_id"] as string[] | undefined;
            if (artistSongIds?.[0]) {
                const artistRecord = await fetchRecordById(AIRTABLE_ARTIST_TABLE_ID, artistSongIds[0]);
                if (artistRecord) {
                    output.artist = (artistRecord.fields["Artist"] as string) || "";
                    output.song = (artistRecord.fields["Song"] as string) || "";
                }
            }

            outputData.push(output);
        }

        return outputData;
    },
});

/**
 * Fetch all content for a specific campaign
 */
export const getCampaignContent = action({
    args: {
        campaignRecordId: v.string(),
    },
    handler: async (ctx, args): Promise<{
        content: ContentItem[];
        campaign_id: string;
        campaign_name: string;
        artist: string;
        song: string;
    }> => {
        // First, get the campaign to extract campaign_id and metadata
        const campaign = await fetchRecordById(AIRTABLE_CAMPAIGN_TABLE_ID, args.campaignRecordId);

        if (!campaign) {
            throw new Error("Campaign not found");
        }

        const campaignId = campaign.fields["campaign"] as string;
        if (!campaignId) {
            throw new Error("Campaign has no campaign field");
        }

        // Fetch artist and song details from related table
        let artist = "";
        let song = "";
        const artistSongIds = campaign.fields["client_id"] as string[] | undefined;
        if (artistSongIds?.[0]) {
            const artistRecord = await fetchRecordById(AIRTABLE_ARTIST_TABLE_ID, artistSongIds[0]);
            if (artistRecord) {
                artist = (artistRecord.fields["Artist"] as string) || "";
                song = (artistRecord.fields["Song"] as string) || "";
            }
        }

        // Fetch all content for this campaign
        const allRecords: ContentItem[] = [];
        let offset: string | undefined;

        do {
            const url = new URL(
                `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_CONTENT_TABLE_ID}`
            );

            url.searchParams.append("filterByFormula", `{campaign_id} = '${campaignId}'`);
            url.searchParams.append("fields[]", "video_url");
            url.searchParams.append("fields[]", "account_niche");
            url.searchParams.append("fields[]", "video_category");
            url.searchParams.append("fields[]", "api_post_id");

            if (offset) url.searchParams.append("offset", offset);

            const response = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
            });

            if (!response.ok) {
                throw new Error(`Airtable API error: ${response.status}`);
            }

            const data: AirtableResponse = (await response.json()) as AirtableResponse;

            data.records.forEach((record) => {
                // account_niche is an array in Airtable, take first element
                const accountNiche = record.fields["account_niche"] as string[] | undefined;
                const apiPostId = record.fields["api_post_id"] as string[] | undefined;

                allRecords.push({
                    id: record.id,
                    video_url: record.fields["video_url"] as string | undefined,
                    account_niche: accountNiche?.[0] || "",
                    video_category: (record.fields["video_category"] as string) || "",
                    api_post_id: apiPostId?.[0] as string | undefined,
                });
            });

            offset = data.offset;
        } while (offset);

        return {
            content: allRecords,
            campaign_id: campaignId,
            campaign_name: campaignId,
            artist,
            song,
        };
    },
});

// ============================================================
// INTERNAL QUERY/MUTATION HELPERS
// ============================================================

/**
 * Check if content record exists by postId
 */
export const checkContentExists = internalQuery({
    args: { postId: v.string() },
    handler: async (ctx, { postId }): Promise<boolean> => {
        const existing = await ctx.db
            .query("airtableContents")
            .withIndex("by_postId", (q) => q.eq("postId", postId))
            .first();
        return existing !== null;
    },
});

/**
 * Get all content records for a specific campaign
 */
export const getContentByCampaign = internalQuery({
    args: { campaignId: v.string() },
    handler: async (ctx, { campaignId }) => {
        return await ctx.db
            .query("airtableContents")
            .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
            .collect();
    },
});

/**
 * Insert new content record
 */
export const insertContent = internalMutation({
    args: {
        campaignId: v.string(),
        postId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("airtableContents", {
            campaignId: args.campaignId,
            postId: args.postId,
        });
    },
});

/**
 * Delete content by postId
 */
export const deleteContentByPostId = internalMutation({
    args: { postId: v.string() },
    handler: async (ctx, { postId }) => {
        const content = await ctx.db
            .query("airtableContents")
            .withIndex("by_postId", (q) => q.eq("postId", postId))
            .first();

        if (content) {
            await ctx.db.delete(content._id);
            return true;
        }
        return false;
    },
});

/**
 * Upsert campaign with name, artist, song, and sync statistics
 */
export const upsertAirtableCampaign = internalMutation({
    args: {
        campaignId: v.string(),
        campaignName: v.string(),
        artist: v.string(),
        song: v.string(),
        total: v.number(),
        published: v.number(),
    },
    handler: async (ctx, { campaignId, campaignName, artist, song, total, published }) => {
        // Check if campaign record exists
        const existing = await ctx.db
            .query("airtableCampaigns")
            .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
            .first();

        if (existing) {
            // Update existing record
            await ctx.db.patch(existing._id, {
                campaignName,
                artist,
                song,
                total,
                published,
            });
        } else {
            // Insert new record
            await ctx.db.insert("airtableCampaigns", {
                campaignId,
                campaignName,
                artist,
                song,
                total,
                published,
            });
        }
    },
});

/**
 * Sync campaign metadata from Airtable to airtableCampaigns table
 * Fetches all active campaigns and upserts them with name, artist, and song
 */
export const syncAirtableCampaign = internalAction({
    args: {},
    handler: async (ctx) => {
        try {
            // Fetch all active campaigns from Airtable
            const campaigns = await ctx.runAction(api.app.airtable.getCampaigns, {});

            let syncedCount = 0;

            for (const campaign of campaigns) {
                try {
                    // Upsert campaign to database
                    await ctx.runMutation(internal.app.airtable.upsertAirtableCampaign, {
                        campaignId: campaign.id, // Airtable record ID (immutable)
                        campaignName: campaign.campaign_id, // campaign_id field value
                        artist: campaign.artist,
                        song: campaign.song,
                        total: 0,
                        published: 0,
                    });
                    syncedCount++;
                } catch (error) {
                    console.error(`Failed to sync campaign ${campaign.id}:`, error);
                }
            }

            console.log(`Synced ${syncedCount} campaigns from Airtable`);

            return { syncedCount };
        } catch (error) {
            console.error("Error syncing campaigns from Airtable:", error);
            throw error;
        }
    },
});

/**
 * Sync content for a specific campaign from Airtable to airtableContents table
 * Handles deletion of orphaned records and tracks total and published counts
 */
export const syncAirtableContentByCampaign = internalAction({
    args: {
        campaignRecordId: v.string(),
    },
    handler: async (ctx, { campaignRecordId }): Promise<{
        totalCount: number;
        publishedCount: number;
        insertedCount: number;
        deletedCount: number;
    }> => {
        try {
            // Fetch content for this campaign from Airtable
            const result: { content: ContentItem[]; campaign_id: string } = await ctx.runAction(api.app.airtable.getCampaignContent, {
                campaignRecordId,
            });

            const contentRecords: ContentItem[] = result.content;
            const totalCount: number = contentRecords.length;

            // DELETION LOGIC: Remove content that no longer exists in Airtable
            const existingContent = await ctx.runQuery(
                internal.app.airtable.getContentByCampaign,
                { campaignId: campaignRecordId }
            );

            // Build Set of valid postIds from Airtable content
            const validPostIds = new Set<string>();
            for (const content of contentRecords) {
                if (content.api_post_id) {
                    validPostIds.add(content.api_post_id);
                }
            }

            // Find and delete orphaned content
            const orphanedContent = existingContent.filter(
                (content: { postId: string }) => !validPostIds.has(content.postId)
            );

            let deletedCount = 0;
            for (const orphaned of orphanedContent) {
                const deleted = await ctx.runMutation(
                    internal.app.airtable.deleteContentByPostId,
                    { postId: orphaned.postId }
                );
                if (deleted) {
                    deletedCount++;
                }
            }

            // Process each content record from Airtable
            let insertedCount = 0;
            for (const content of contentRecords) {
                const apiPostId = content.api_post_id;

                // Skip if no api_post_id
                if (!apiPostId) {
                    continue;
                }

                // Check if already exists
                const exists = await ctx.runQuery(internal.app.airtable.checkContentExists, {
                    postId: apiPostId,
                });

                if (exists) {
                    continue;
                }

                // Insert into database
                await ctx.runMutation(internal.app.airtable.insertContent, {
                    campaignId: campaignRecordId,
                    postId: apiPostId,
                });

                insertedCount++;
            }

            // Calculate published count (records with valid api_post_id)
            const publishedCount = validPostIds.size;

            // Get campaign info for updating
            const campaigns = await ctx.runAction(api.app.airtable.getCampaigns, {});
            const campaign = campaigns.find((c: CampaignOutput) => c.id === campaignRecordId);

            if (campaign) {
                // Update campaign with sync statistics
                await ctx.runMutation(internal.app.airtable.upsertAirtableCampaign, {
                    campaignId: campaignRecordId,
                    campaignName: campaign.campaign_id,
                    artist: campaign.artist,
                    song: campaign.song,
                    total: totalCount,
                    published: publishedCount,
                });
            }

            console.log(
                `Synced campaign ${campaignRecordId}: ${totalCount} total, ${publishedCount} published, ${insertedCount} inserted, ${deletedCount} deleted`
            );

            return {
                totalCount,
                publishedCount,
                insertedCount,
                deletedCount,
            };
        } catch (error) {
            console.error(`Error syncing content for campaign ${campaignRecordId}:`, error);
            throw error;
        }
    },
});

/**
 * Sync content for all active campaigns from Airtable
 * Orchestrator that schedules syncAirtableContentByCampaign for each campaign
 */
export const syncAirtableContent = internalAction({
    args: {},
    handler: async (ctx): Promise<{ campaignCount: number }> => {
        try {
            // Fetch all active campaigns from Airtable
            const campaigns: CampaignOutput[] = await ctx.runAction(api.app.airtable.getCampaigns, {});

            console.log(`Starting content sync for ${campaigns.length} active campaigns`);

            // Schedule sync for each campaign in parallel
            for (const campaign of campaigns) {
                await ctx.scheduler.runAfter(
                    0,
                    internal.app.airtable.syncAirtableContentByCampaign,
                    {
                        campaignRecordId: campaign.id, // Use Airtable record ID
                    }
                );
            }

            return { campaignCount: campaigns.length };
        } catch (error) {
            console.error("Error syncing Airtable content:", error);
            throw error;
        }
    },
});

/**
 * Syncs getlate posts from Airtable campaigns
 * This function processes posts from the getlate service (identified by 24 hex chars, no dashes)
 * and stores them in bundleSocialPostedVideos and bundleSocialSnapshots tables
 *
 * Uses modern bulk operations pattern for efficiency
 */
export const syncGetlatePosts = action({
    args: {},
    handler: async (ctx) => {
      console.log("🚀 Starting getlate posts sync...");

      try {
        // Get today's date in DD-MM-YYYY format for snapshots
        const today = new Date();
        const date = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

        const CONCURRENT_LIMIT = 25;

        // Global statistics
        let totalCampaigns = 0;
        let totalGetlatePosts = 0;
        let totalSucceeded = 0;
        let totalFailed = 0;
        let totalSkipped = 0;

        // Fetch all active campaigns from Airtable using existing API
        const campaigns = await ctx.runAction(api.app.airtable.getCampaigns, {});
        console.log(`📊 Found ${campaigns.length} active campaigns`);

        for (const campaign of campaigns) {
          const campaignRecordId = campaign.id;
          const campaignIdField = campaign.campaign_id;

          if (!campaignRecordId || !campaignIdField) {
            continue;
          }

          // Fetch content for this campaign using existing API
          const result = await ctx.runAction(api.app.airtable.getCampaignContent, {
            campaignRecordId,
          });

          // Filter for getlate posts only
          const getlatePosts: Array<{
            apiPostId: string;
            videoUrl?: string;
            campaignId: string;
          }> = [];

          for (const content of result.content) {
            const apiPostId = content.api_post_id;

            // Check if this is a getlate post
            if (apiPostId && isGetlatePostId(apiPostId)) {
              getlatePosts.push({
                apiPostId,
                videoUrl: content.video_url,
                campaignId: campaignRecordId,
              });
            }
          }

          if (getlatePosts.length === 0) {
            // No getlate posts in this campaign, skip silently
            continue;
          }

          totalCampaigns++;
          totalGetlatePosts += getlatePosts.length;

          console.log(`\n📦 Campaign ${campaignRecordId} (${campaignIdField}): ${getlatePosts.length} getlate post(s)`);

          // Bulk check existing posts
          const existingPostIds = await ctx.runQuery(
            internal.app.bundle.getExistingPostedVideos,
            { campaignId: campaignRecordId }
          );
          const existingPostIdsSet = new Set(existingPostIds);

          // Collect data for bulk operations
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

          const snapshotsToUpsert: Array<{
            postId: string;
            views: number;
            likes: number;
            comments: number;
            shares: number;
            saves: number;
          }> = [];

          // Process posts in batches with concurrency
          for (let i = 0; i < getlatePosts.length; i += CONCURRENT_LIMIT) {
            const batch = getlatePosts.slice(i, i + CONCURRENT_LIMIT);

            const batchResults = await Promise.allSettled(
              batch.map(async (post) => {
                const { apiPostId, videoUrl } = post;

                // Check if already exists (using in-memory Set)
                if (existingPostIdsSet.has(apiPostId)) {
                  totalSkipped++;
                  return { success: true, skipped: true };
                }

                try {
                  // Step 1: Get TikTok video ID
                  let tiktokVideoId: string | null;

                  // Treat apiPostId as a TikTok video ID if it is numeric
                  if (/^\d+$/.test(apiPostId)) {
                    tiktokVideoId = apiPostId;
                    console.log(`  🔍 Using numeric apiPostId as TikTok video ID: ${apiPostId}`);
                  } else {
                    // Fetch from getlate API
                    tiktokVideoId = await fetchTikTokVideoIdFromGetlate(apiPostId);
                  }

                  if (!tiktokVideoId) {
                    console.error(`  ✗ Failed to get TikTok video ID for post ${apiPostId}`);
                    return { success: false };
                  }

                  // Step 2: Get video stats from TikTok
                  const result = await ctx.runAction(internal.app.tiktok.getTikTokVideoById, {
                    videoId: tiktokVideoId,
                  });

                  if (!result.success || !result.video) {
                    console.error(`  ✗ Failed to fetch video stats: ${result.error || 'Unknown error'}`);
                    return { success: false };
                  }

                  const stats = result.video;
                  const videoUrlFromTikTok = `https://www.tiktok.com/@/video/${tiktokVideoId}`;

                  // Collect data for bulk insert
                  postsToInsert.push({
                    campaignId: campaignRecordId,
                    postId: apiPostId,
                    videoId: tiktokVideoId,
                    postedAt: Math.floor(Date.now() / 1000),
                    videoUrl: videoUrlFromTikTok,
                    mediaUrl: videoUrl,
                    views: stats.views,
                    likes: stats.likes,
                    comments: stats.comments,
                    shares: stats.shares,
                    saves: stats.saves,
                  });

                  // Collect data for bulk snapshot
                  snapshotsToUpsert.push({
                    postId: apiPostId,
                    views: stats.views,
                    likes: stats.likes,
                    comments: stats.comments,
                    shares: stats.shares,
                    saves: stats.saves,
                  });

                  console.log(`  ✓ Collected: ${stats.views.toLocaleString()} views, ${stats.likes.toLocaleString()} likes`);
                  return { success: true, skipped: false };

                } catch (error) {
                  console.error(`  ✗ Error processing post ${apiPostId}:`, error);
                  return { success: false };
                }
              })
            );

            // Count results
            for (const result of batchResults) {
              if (result.status === 'fulfilled') {
                if (result.value.success && !result.value.skipped) {
                  totalSucceeded++;
                } else if (!result.value.success) {
                  totalFailed++;
                }
                // Skipped count already incremented in the processing
              } else {
                totalFailed++;
              }
            }
          }

          // Bulk insert posts
          if (postsToInsert.length > 0) {
            await ctx.runMutation(internal.app.bundle.bulkInsertPostedVideos, {
              posts: postsToInsert,
            });
            console.log(`  💾 Bulk inserted ${postsToInsert.length} posts`);
          }

          // Bulk upsert snapshots
          if (snapshotsToUpsert.length > 0) {
            await ctx.runMutation(internal.app.bundle.bulkUpsertDailySnapshots, {
              campaignId: campaignRecordId,
              date,
              snapshots: snapshotsToUpsert,
            });
            console.log(`  📸 Bulk upserted ${snapshotsToUpsert.length} snapshots`);
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