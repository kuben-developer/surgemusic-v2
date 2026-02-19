import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "";
const AIRTABLE_CONTENT_TABLE_ID = "tbleqHUKb7il998rO";

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

// =============================================================================
// INTERNAL QUERIES
// =============================================================================

/** Get unlinked montagerVideos for a single campaign (indexed query) */
export const getUnlinkedByCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const videos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
    return videos
      .filter((v) => v.airtableRecordId && !v.tiktokVideoId)
      .map((v) => ({
        _id: v._id,
        airtableRecordId: v.airtableRecordId!,
      }));
  },
});

/** Get montagerVideos by campaignId that have tiktokVideoId set */
export const getLinkedMontagerVideos = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const videos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
    return videos
      .filter((v) => v.tiktokVideoId)
      .map((v) => ({
        _id: v._id,
        tiktokVideoId: v.tiktokVideoId!,
        caption: v.caption,
        montagerFolderId: v.montagerFolderId,
        overlayStyle: v.overlayStyle,
      }));
  },
});

/** Get tiktokVideoStats by campaignId as a map */
export const getTiktokStatsMap = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const stats = await ctx.db
      .query("tiktokVideoStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
    return stats.map((s) => ({
      tiktokVideoId: s.tiktokVideoId,
      views: s.views,
      likes: s.likes,
      comments: s.comments,
      shares: s.shares,
      saves: s.saves,
    }));
  },
});

/** Find tiktokVideoStats by bundlePostId */
export const findStatsByBundlePostId = internalQuery({
  args: { bundlePostId: v.string() },
  handler: async (ctx, { bundlePostId }) => {
    const stat = await ctx.db
      .query("tiktokVideoStats")
      .withIndex("by_bundlePostId", (q) => q.eq("bundlePostId", bundlePostId))
      .first();
    return stat ? { tiktokVideoId: stat.tiktokVideoId } : null;
  },
});


/** Find tiktokVideoStats by tiktokVideoId */
export const findStatsByTiktokVideoId = internalQuery({
  args: { tiktokVideoId: v.string() },
  handler: async (ctx, { tiktokVideoId }) => {
    const stat = await ctx.db
      .query("tiktokVideoStats")
      .withIndex("by_tiktokVideoId", (q) =>
        q.eq("tiktokVideoId", tiktokVideoId),
      )
      .first();
    return stat ? { tiktokVideoId: stat.tiktokVideoId } : null;
  },
});

/** Get folder names by IDs */
export const getMontagerFolderNames = internalQuery({
  args: { folderIds: v.array(v.id("montagerFolders")) },
  handler: async (ctx, { folderIds }) => {
    const result: Record<string, string> = {};
    for (const id of folderIds) {
      const folder = await ctx.db.get(id);
      if (folder) {
        result[id] = folder.folderName;
      }
    }
    return result;
  },
});

/** Get existing dimension stats for a campaign (for deletion) */
export const getDimensionStatsByCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const stats = await ctx.db
      .query("advancedAnalyticsDimensionStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
    return stats.map((s) => s._id);
  },
});

/** Get campaign IDs, optionally filtered to active only */
export const getAllCampaignIds = internalQuery({
  args: { includeAll: v.optional(v.boolean()) },
  handler: async (ctx, { includeAll }) => {
    if (includeAll) {
      const campaigns = await ctx.db.query("campaigns").collect();
      return campaigns.map((c) => c.campaignId);
    }
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .collect();
    return campaigns.map((c) => c.campaignId);
  },
});

/** Get all campaign names as a map of campaignId → campaignName */
export const getAllCampaignNames = internalQuery({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    const map: Record<string, string> = {};
    for (const c of campaigns) {
      map[c.campaignId] = c.campaignName;
    }
    return map;
  },
});

/** Get campaign name (campaignName) by campaignId (Airtable record ID) */
export const getCampaignName = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();
    return campaign?.campaignName ?? null;
  },
});

// =============================================================================
// INTERNAL MUTATIONS
// =============================================================================

/** Patch a montagerVideo with tiktokVideoId */
export const patchMontagerVideoTiktokId = internalMutation({
  args: {
    montagerVideoId: v.id("montagerVideos"),
    tiktokVideoId: v.string(),
  },
  handler: async (ctx, { montagerVideoId, tiktokVideoId }) => {
    await ctx.db.patch(montagerVideoId, { tiktokVideoId });
  },
});

/** Delete old dimension stats and insert new ones for a campaign */
export const replaceDimensionStats = internalMutation({
  args: {
    campaignId: v.string(),
    oldIds: v.array(v.id("advancedAnalyticsDimensionStats")),
    newStats: v.array(
      v.object({
        campaignId: v.string(),
        dimension: v.string(),
        dimensionValue: v.string(),
        totalVideos: v.number(),
        totalViews: v.number(),
        totalLikes: v.number(),
        totalComments: v.number(),
        totalShares: v.number(),
        totalSaves: v.number(),
        avgViews: v.number(),
        avgLikes: v.number(),
        lastUpdated: v.number(),
      }),
    ),
  },
  handler: async (ctx, { oldIds, newStats }) => {
    // Delete old stats
    for (const id of oldIds) {
      await ctx.db.delete(id);
    }
    // Insert new stats
    for (const stat of newStats) {
      await ctx.db.insert("advancedAnalyticsDimensionStats", stat);
    }
    return { deleted: oldIds.length, inserted: newStats.length };
  },
});

// =============================================================================
// LINKING CRON
// =============================================================================

/**
 * Fetches Airtable content table for a campaign, returns mapping:
 * airtableRecordId → { apiPostId, tiktokId }
 *
 * Filters by campaignName (the text campaign_id field in Airtable)
 * to avoid fetching the entire content table.
 */
async function fetchAirtableMappings(
  campaignName: string,
): Promise<Map<string, { apiPostId?: string; tiktokId?: string }>> {
  const mapping = new Map<
    string,
    { apiPostId?: string; tiktokId?: string }
  >();

  let offset: string | undefined;

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_CONTENT_TABLE_ID}`,
    );

    url.searchParams.append(
      "filterByFormula",
      `{campaign_id} = '${campaignName}'`,
    );
    url.searchParams.append("fields[]", "api_post_id");
    url.searchParams.append("fields[]", "tiktok_id");

    if (offset) url.searchParams.append("offset", offset);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) {
      console.error(
        `[AdvancedAnalytics] Airtable API error: ${response.status}`,
      );
      break;
    }

    const data: AirtableResponse =
      (await response.json()) as AirtableResponse;

    for (const record of data.records) {
      const apiPostIdArr = record.fields["api_post_id"] as
        | string[]
        | undefined;
      const tiktokId = record.fields["tiktok_id"] as string | undefined;

      mapping.set(record.id, {
        apiPostId: apiPostIdArr?.[0],
        tiktokId,
      });
    }

    offset = data.offset;
  } while (offset);

  return mapping;
}

/**
 * Orchestrator: get all campaign IDs, schedule per-campaign linking.
 * Called by cron every 3 hours.
 */
export const linkMontagerToTiktok = internalAction({
  args: {
    campaignId: v.optional(v.string()),
    includeAll: v.optional(v.boolean()),
  },
  handler: async (ctx, { campaignId, includeAll }) => {
    if (campaignId) {
      // Link a single campaign
      await ctx.scheduler.runAfter(
        0,
        internal.app.advancedAnalytics.linkSingleCampaignMontagerVideos,
        { campaignId },
      );
      console.log(`[AdvancedAnalytics] Scheduled linking for campaign ${campaignId}`);
      return;
    }

    // Default: active campaigns only. Pass includeAll=true for all.
    const campaignIds = await ctx.runQuery(
      internal.app.advancedAnalytics.getAllCampaignIds,
      { includeAll: includeAll ?? false },
    );

    for (const id of campaignIds) {
      await ctx.scheduler.runAfter(
        0,
        internal.app.advancedAnalytics.linkSingleCampaignMontagerVideos,
        { campaignId: id },
      );
    }

    console.log(
      `[AdvancedAnalytics] Scheduled linking for ${campaignIds.length} campaigns (includeAll=${!!includeAll})`,
    );
  },
});

/**
 * Link montagerVideos to tiktokVideoStats for a single campaign.
 * Uses indexed query (by_campaignId) to avoid full table scans.
 * Processes in chunks of LINK_CHUNK_SIZE and self-schedules to avoid timeouts.
 */
const LINK_CHUNK_SIZE = 50;

export const linkSingleCampaignMontagerVideos = internalAction({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    // Get unlinked videos for this campaign (indexed query)
    const unlinked = await ctx.runQuery(
      internal.app.advancedAnalytics.getUnlinkedByCampaign,
      { campaignId },
    );

    if (unlinked.length === 0) {
      console.log(`[Link] Campaign ${campaignId}: no unlinked videos, skipping`);
      return;
    }

    console.log(`[Link] Campaign ${campaignId}: ${unlinked.length} unlinked, processing chunk of ${Math.min(LINK_CHUNK_SIZE, unlinked.length)}`);

    // Look up campaign name to filter Airtable content table
    const campaignName = await ctx.runQuery(
      internal.app.advancedAnalytics.getCampaignName,
      { campaignId },
    );

    if (!campaignName) {
      console.error(`[Link] Campaign ${campaignId}: campaign name not found, aborting`);
      return;
    }

    // Fetch Airtable mapping for this campaign (filtered by campaign name)
    let airtableMapping: Map<
      string,
      { apiPostId?: string; tiktokId?: string }
    >;
    try {
      airtableMapping = await fetchAirtableMappings(campaignName);
    } catch (error) {
      console.error(`[Link] Campaign ${campaignId}: Airtable fetch failed:`, error);
      return;
    }

    // Process only first chunk
    const chunk = unlinked.slice(0, LINK_CHUNK_SIZE);

    let linked = 0;
    let noAirtableMatch = 0;
    let noApiPostId = 0;
    let hasAirtableButNoStats = 0;
    let resolvedViaTiktokId = 0;
    let resolvedViaBundlePostId = 0;

    for (const video of chunk) {
      const mapping = airtableMapping.get(video.airtableRecordId);
      if (!mapping) {
        noAirtableMatch++;
        continue;
      }

      // Skip records with no api_post_id and no tiktok_id (not yet posted)
      if (!mapping.apiPostId && !mapping.tiktokId) {
        noApiPostId++;
        continue;
      }

      let resolvedTiktokVideoId: string | null = null;

      // Path 1: tiktok_id → tiktokVideoStats.tiktokVideoId
      if (mapping.tiktokId) {
        const stat = await ctx.runQuery(
          internal.app.advancedAnalytics.findStatsByTiktokVideoId,
          { tiktokVideoId: mapping.tiktokId },
        );
        if (stat) {
          resolvedTiktokVideoId = stat.tiktokVideoId;
          resolvedViaTiktokId++;
        }
      }

      // Path 2: api_post_id → tiktokVideoStats.bundlePostId
      if (!resolvedTiktokVideoId && mapping.apiPostId) {
        const stat = await ctx.runQuery(
          internal.app.advancedAnalytics.findStatsByBundlePostId,
          { bundlePostId: mapping.apiPostId },
        );
        if (stat) {
          resolvedTiktokVideoId = stat.tiktokVideoId;
          resolvedViaBundlePostId++;
        }
      }

      if (resolvedTiktokVideoId) {
        await ctx.runMutation(
          internal.app.advancedAnalytics.patchMontagerVideoTiktokId,
          {
            montagerVideoId: video._id as never,
            tiktokVideoId: resolvedTiktokVideoId,
          },
        );
        linked++;
      } else {
        hasAirtableButNoStats++;
      }
    }

    console.log(
      `[Link] Campaign ${campaignId} ("${campaignName}") chunk done:\n` +
      `  Processed: ${chunk.length}/${unlinked.length}\n` +
      `  Linked: ${linked} (tiktokId: ${resolvedViaTiktokId}, bundlePostId: ${resolvedViaBundlePostId})\n` +
      `  No Airtable match: ${noAirtableMatch}, not posted: ${noApiPostId}, no stats: ${hasAirtableButNoStats}`,
    );

    // Self-schedule if more unlinked videos remain
    if (unlinked.length > LINK_CHUNK_SIZE) {
      console.log(`[Link] Campaign ${campaignId}: scheduling next chunk (${unlinked.length - LINK_CHUNK_SIZE} remaining)`);
      await ctx.scheduler.runAfter(
        0,
        internal.app.advancedAnalytics.linkSingleCampaignMontagerVideos,
        { campaignId },
      );
    }
  },
});

// =============================================================================
// ANALYTICS COMPUTATION
// =============================================================================

interface TiktokStatsEntry {
  tiktokVideoId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

interface DimensionAccumulator {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
}

/**
 * Compute dimension stats for a single campaign.
 */
export const computeSingleCampaignDimensionStats = internalAction({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    // 1. Get linked montagerVideos
    const linkedVideos = await ctx.runQuery(
      internal.app.advancedAnalytics.getLinkedMontagerVideos,
      { campaignId },
    );

    if (linkedVideos.length === 0) {
      console.log(
        `[AdvancedAnalytics] No linked videos for campaign ${campaignId}`,
      );
      return;
    }

    // 2. Get tiktokVideoStats as map
    const statsArr = await ctx.runQuery(
      internal.app.advancedAnalytics.getTiktokStatsMap,
      { campaignId },
    );
    const statsMap = new Map<string, TiktokStatsEntry>(statsArr.map((s: TiktokStatsEntry) => [s.tiktokVideoId, s]));

    // 3. Resolve folder names
    const uniqueFolderIds = [
      ...new Set(
        linkedVideos
          .map((v: { montagerFolderId?: string }) => v.montagerFolderId)
          .filter((id): id is string => !!id),
      ),
    ];
    const folderNames =
      uniqueFolderIds.length > 0
        ? await ctx.runQuery(
            internal.app.advancedAnalytics.getMontagerFolderNames,
            { folderIds: uniqueFolderIds as never },
          )
        : {};

    // 4. Aggregate by dimensions
    const dimensions: Record<
      string,
      Map<string, DimensionAccumulator>
    > = {
      caption: new Map(),
      folder: new Map(),
      overlayStyle: new Map(),
    };

    for (const video of linkedVideos) {
      const stats = statsMap.get(video.tiktokVideoId);
      if (!stats) continue;

      const addToDimension = (
        dimension: string,
        value: string | undefined | null,
      ) => {
        if (!value) return;
        const map = dimensions[dimension]!;
        const existing = map.get(value) ?? {
          totalVideos: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalSaves: 0,
        };
        existing.totalVideos++;
        existing.totalViews += stats.views;
        existing.totalLikes += stats.likes;
        existing.totalComments += stats.comments;
        existing.totalShares += stats.shares;
        existing.totalSaves += stats.saves;
        map.set(value, existing);
      };

      addToDimension("caption", video.caption);
      addToDimension(
        "folder",
        video.montagerFolderId
          ? folderNames[video.montagerFolderId]
          : null,
      );
      addToDimension("overlayStyle", video.overlayStyle);
    }

    // 5. Build new stats rows
    const now = Date.now();
    const newStats: Array<{
      campaignId: string;
      dimension: string;
      dimensionValue: string;
      totalVideos: number;
      totalViews: number;
      totalLikes: number;
      totalComments: number;
      totalShares: number;
      totalSaves: number;
      avgViews: number;
      avgLikes: number;
      lastUpdated: number;
    }> = [];

    for (const [dimension, map] of Object.entries(dimensions)) {
      for (const [dimensionValue, acc] of map.entries()) {
        newStats.push({
          campaignId,
          dimension,
          dimensionValue,
          totalVideos: acc.totalVideos,
          totalViews: acc.totalViews,
          totalLikes: acc.totalLikes,
          totalComments: acc.totalComments,
          totalShares: acc.totalShares,
          totalSaves: acc.totalSaves,
          avgViews: acc.totalVideos > 0 ? Math.round(acc.totalViews / acc.totalVideos) : 0,
          avgLikes: acc.totalVideos > 0 ? Math.round(acc.totalLikes / acc.totalVideos) : 0,
          lastUpdated: now,
        });
      }
    }

    // 6. Delete old and insert new (in a single mutation for consistency)
    const oldIds = await ctx.runQuery(
      internal.app.advancedAnalytics.getDimensionStatsByCampaign,
      { campaignId },
    );

    // Process in batches to avoid mutation size limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < newStats.length || i === 0; i += BATCH_SIZE) {
      const batch = newStats.slice(i, i + BATCH_SIZE);
      const idsToDelete = i === 0 ? oldIds : [];

      await ctx.runMutation(
        internal.app.advancedAnalytics.replaceDimensionStats,
        {
          campaignId,
          oldIds: idsToDelete as never,
          newStats: batch,
        },
      );
    }

    console.log(
      `[AdvancedAnalytics] Campaign ${campaignId}: computed ${newStats.length} dimension stats from ${linkedVideos.length} linked videos`,
    );
  },
});

/**
 * Orchestrator: compute dimension stats for all campaigns.
 */
export const computeDimensionStats = internalAction({
  args: {},
  handler: async (ctx) => {
    const campaignIds = await ctx.runQuery(
      internal.app.advancedAnalytics.getAllCampaignIds,
      {},
    );

    for (const campaignId of campaignIds) {
      await ctx.scheduler.runAfter(
        0,
        internal.app.advancedAnalytics.computeSingleCampaignDimensionStats,
        { campaignId },
      );
    }

    console.log(
      `[AdvancedAnalytics] Scheduled dimension stats computation for ${campaignIds.length} campaigns`,
    );
  },
});

// =============================================================================
// USER-FACING QUERIES
// =============================================================================

/** Get dimension stats for a campaign, filtered by dimension */
export const getDimensionStats = query({
  args: {
    campaignId: v.string(),
    dimension: v.string(),
  },
  handler: async (ctx, { campaignId, dimension }) => {
    const stats = await ctx.db
      .query("advancedAnalyticsDimensionStats")
      .withIndex("by_campaignId_dimension", (q) =>
        q.eq("campaignId", campaignId).eq("dimension", dimension),
      )
      .collect();

    // Sort by totalViews descending
    return stats.sort((a, b) => b.totalViews - a.totalViews);
  },
});

/** Get advanced analytics summary for a campaign */
export const getAdvancedAnalyticsSummary = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const montagerVideos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    const totalLinked = montagerVideos.filter((v) => v.tiktokVideoId).length;
    const totalUnlinked = montagerVideos.filter(
      (v) => v.airtableRecordId && !v.tiktokVideoId,
    ).length;

    // Get latest update time from dimension stats
    const stats = await ctx.db
      .query("advancedAnalyticsDimensionStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .first();

    return {
      lastUpdated: stats?.lastUpdated ?? null,
      totalLinked,
      totalUnlinked,
      totalMontagerVideos: montagerVideos.length,
    };
  },
});

/** Count stats vs linked montagerVideos for a single campaign */
export const getCampaignSyncCounts = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const statsCount = (
      await ctx.db
        .query("tiktokVideoStats")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .collect()
    ).length;

    const montagerVideos = await ctx.db
      .query("montagerVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    const linkedCount = montagerVideos.filter((v) => v.tiktokVideoId).length;

    return { statsCount, linkedCount };
  },
});

/** List campaigns where tiktokVideoStats > linked montagerVideos */
export const getUnsyncedCampaigns = internalAction({
  args: {},
  handler: async (ctx): Promise<Array<{ campaignId: string; campaignName: string; statsCount: number; linkedCount: number }>> => {
    const campaignIds: string[] = await ctx.runQuery(
      internal.app.advancedAnalytics.getAllCampaignIds,
      { includeAll: true },
    );

    const campaigns: Record<string, string> = await ctx.runQuery(
      internal.app.advancedAnalytics.getAllCampaignNames,
      {},
    );

    const results: Array<{ campaignId: string; campaignName: string; statsCount: number; linkedCount: number }> = [];
    for (const campaignId of campaignIds) {
      const { statsCount, linkedCount }: { statsCount: number; linkedCount: number } = await ctx.runQuery(
        internal.app.advancedAnalytics.getCampaignSyncCounts,
        { campaignId },
      );

      if (statsCount > linkedCount) {
        results.push({
          campaignId,
          campaignName: campaigns[campaignId] ?? campaignId,
          statsCount,
          linkedCount,
        });
      }
    }

    results.sort((a, b) => (b.statsCount - b.linkedCount) - (a.statsCount - a.linkedCount));
    console.log(`[AdvancedAnalytics] Unsynced campaigns:\n${results.map((r) => `  ${r.campaignName}: ${r.statsCount} stats, ${r.linkedCount} linked (delta: ${r.statsCount - r.linkedCount})`).join("\n")}`);
    return results;
  },
});

// =============================================================================
// USER-FACING MUTATIONS
// =============================================================================

/** Trigger manual refresh of dimension stats for a campaign */
export const triggerRefreshDimensionStats = mutation({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    await ctx.scheduler.runAfter(
      0,
      internal.app.advancedAnalytics.computeSingleCampaignDimensionStats,
      { campaignId },
    );
    return { success: true };
  },
});
