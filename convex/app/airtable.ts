import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { action, internalAction, internalMutation, internalQuery } from "../_generated/server";

// Airtable configuration - these should come from environment variables
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";
const AIRTABLE_CAMPAIGN_TABLE_ID = "tblDKeX3BOFuLCucu";
const AIRTABLE_ARTIST_TABLE_ID = "tblGoMJr5XOVFx50O";
const AIRTABLE_CONTENT_TABLE_ID = "tbleqHUKb7il998rO";


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
    date?: string; // ISO format "YYYY-MM-DD"
    is_manual?: boolean; // true if manually posted (not through Bundle Social API)
    tiktok_id?: string; // TikTok video ID for manual posts
    status?: string; // "planned" | "done" | etc.
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
            const errorBody = await response.text();
            console.error(`Airtable API error ${response.status}:`, errorBody);
            console.error(`Request URL:`, url.toString().replace(AIRTABLE_API_KEY, "***"));
            throw new Error(`Airtable API error: ${response.status} - ${errorBody}`);
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

            const escapedCampaignId = campaignId.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
            url.searchParams.append("filterByFormula", `{campaign_id} = '${escapedCampaignId}'`);
            url.searchParams.append("fields[]", "video_url");
            url.searchParams.append("fields[]", "account_niche");
            url.searchParams.append("fields[]", "video_category");
            url.searchParams.append("fields[]", "api_post_id");
            url.searchParams.append("fields[]", "date");
            url.searchParams.append("fields[]", "is_manual");
            url.searchParams.append("fields[]", "tiktok_id");
            url.searchParams.append("fields[]", "status");

            if (offset) url.searchParams.append("offset", offset);

            const response = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Airtable API error ${response.status}:`, errorBody);
                console.error(`Request URL:`, url.toString().replace(AIRTABLE_API_KEY, "***"));
                throw new Error(`Airtable API error: ${response.status} - ${errorBody}`);
            }

            const data: AirtableResponse = (await response.json()) as AirtableResponse;

            data.records.forEach((record) => {
                // account_niche is an array in Airtable, take first element
                const accountNiche = record.fields["account_niche"] as string[] | undefined;
                const apiPostId = record.fields["api_post_id"] as string[] | undefined;
                const isManual = record.fields["is_manual"] as boolean | undefined;
                const tiktokId = record.fields["tiktok_id"] as string | undefined;
                const status = record.fields["status"] as string | undefined;

                allRecords.push({
                    id: record.id,
                    video_url: record.fields["video_url"] as string | undefined,
                    account_niche: accountNiche?.[0] || "",
                    video_category: (record.fields["video_category"] as string) || "",
                    api_post_id: apiPostId?.[0] as string | undefined,
                    date: record.fields["date"] as string | undefined,
                    is_manual: isManual,
                    tiktok_id: tiktokId,
                    status: status,
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
        isManual: v.optional(v.boolean()),
        tiktokId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("airtableContents", {
            campaignId: args.campaignId,
            postId: args.postId,
            isManual: args.isManual,
            tiktokId: args.tiktokId,
        });
    },
});

/**
 * Upsert campaign with name, artist, song, status, and sync statistics.
 * Writes directly to the `campaigns` table (unified with analytics settings).
 * On insert, includes default analytics display settings.
 * On patch, only updates Airtable-sourced metadata (won't clobber user settings).
 */
export const upsertCampaign = internalMutation({
    args: {
        campaignId: v.string(),
        campaignName: v.string(),
        artist: v.string(),
        song: v.string(),
        status: v.string(),
        total: v.number(),
        published: v.number(),
    },
    handler: async (ctx, { campaignId, campaignName, artist, song, status, total, published }) => {
        // Check if campaign record exists
        const existing = await ctx.db
            .query("campaigns")
            .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
            .first();

        if (existing) {
            // Update only Airtable-sourced metadata (don't clobber user settings)
            await ctx.db.patch(existing._id, {
                campaignName,
                artist,
                song,
                status,
                total,
                published,
            });
        } else {
            // Insert new record with default analytics settings
            await ctx.db.insert("campaigns", {
                campaignId,
                campaignName,
                artist,
                song,
                status,
                total,
                published,
                minViewsExcludedStats: {
                    totalPosts: 0,
                    totalViews: 0,
                    totalLikes: 0,
                    totalComments: 0,
                    totalShares: 0,
                    totalSaves: 0,
                },
                minViewsFilter: 0,
                currencySymbol: "USD",
                manualCpmMultiplier: 1,
                apiCpmMultiplier: 0.5,
                contentSamples: [],
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
                    await ctx.runMutation(internal.app.airtable.upsertCampaign, {
                        campaignId: campaign.id, // Airtable record ID (immutable)
                        campaignName: campaign.campaign_id, // campaign_id field value
                        artist: campaign.artist,
                        song: campaign.song,
                        status: campaign.status,
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
    }> => {
        try {
            // Fetch content for this campaign from Airtable
            const result: { content: ContentItem[]; campaign_id: string } = await ctx.runAction(api.app.airtable.getCampaignContent, {
                campaignRecordId,
            });

            const contentRecords: ContentItem[] = result.content;
            const totalCount: number = contentRecords.length;

            // Build Set of valid postIds from Airtable content
            // For manual posts without api_post_id, use tiktok_id as the postId
            const validPostIds = new Set<string>();
            for (const content of contentRecords) {
                if (content.api_post_id) {
                    validPostIds.add(content.api_post_id);
                } else if (content.is_manual && content.tiktok_id) {
                    // Manual posts use tiktok_id as postId
                    validPostIds.add(content.tiktok_id);
                }
            }

            // Process each content record from Airtable
            let insertedCount = 0;
            for (const content of contentRecords) {
                const apiPostId = content.api_post_id;
                const isManual = content.is_manual ?? false;
                const tiktokId = content.tiktok_id;

                // Determine the postId to use
                // For manual posts without api_post_id, use tiktok_id as postId
                let postId: string | undefined;
                if (apiPostId) {
                    postId = apiPostId;
                } else if (isManual && tiktokId) {
                    postId = tiktokId;
                }

                // Skip if no valid postId
                if (!postId) {
                    continue;
                }

                // Check if already exists
                const exists = await ctx.runQuery(internal.app.airtable.checkContentExists, {
                    postId,
                });

                if (exists) {
                    continue;
                }

                // Insert into database
                await ctx.runMutation(internal.app.airtable.insertContent, {
                    campaignId: campaignRecordId,
                    postId,
                    isManual: isManual || undefined,
                    tiktokId: tiktokId,
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
                await ctx.runMutation(internal.app.airtable.upsertCampaign, {
                    campaignId: campaignRecordId,
                    campaignName: campaign.campaign_id,
                    artist: campaign.artist,
                    song: campaign.song,
                    status: campaign.status,
                    total: totalCount,
                    published: publishedCount,
                });
            }

            console.log(
                `Synced campaign ${campaignRecordId}: ${totalCount} total, ${publishedCount} published, ${insertedCount} inserted`
            );

            return {
                totalCount,
                publishedCount,
                insertedCount,
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

