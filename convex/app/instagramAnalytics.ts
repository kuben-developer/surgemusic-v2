import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "../_generated/server";
import { fetchInstagramMediaByShortcode } from "./instagram";

// =============================================================================
// CONSTANTS
// =============================================================================

const CONCURRENCY = 5;
const DB_BATCH = 10;
const POPULATE_STAGGER_MS = 0.1 * 60 * 1000; // 6 seconds between campaigns

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getHourlyIntervalId(prefix: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  return `${prefix}_${year}${month}${day}${hour}`;
}

function getSnapshotAt(): number {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  const hour = now.getUTCHours();
  return year * 1000000 + month * 10000 + day * 100 + hour;
}

// =============================================================================
// INTERNAL QUERIES
// =============================================================================

export const getExistingInstagramShortcodes = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const posts = await ctx.db
      .query("instagramPostStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
    return posts.map((p) => p.instagramShortcode);
  },
});

export const getAirtableContentWithInstagram = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const contents = await ctx.db
      .query("airtableContents")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
    return contents.filter((c) => c.instagramId);
  },
});

export const getInstagramPostsByCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("instagramPostStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
  },
});

export const getInstagramTotals = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const posts = await ctx.db
      .query("instagramPostStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    return {
      totalPosts: posts.length,
      totalViews: posts.reduce((sum, p) => sum + p.views, 0),
      totalLikes: posts.reduce((sum, p) => sum + p.likes, 0),
      totalComments: posts.reduce((sum, p) => sum + p.comments, 0),
    };
  },
});

// =============================================================================
// MUTATIONS
// =============================================================================

export const upsertInstagramPostStats = internalMutation({
  args: {
    posts: v.array(
      v.object({
        campaignId: v.string(),
        instagramShortcode: v.string(),
        instagramUserId: v.string(),
        instagramUsername: v.string(),
        mediaUrl: v.string(),
        mediaType: v.number(),
        postedAt: v.number(),
        views: v.number(),
        likes: v.number(),
        comments: v.number(),
        thumbnailStorageId: v.optional(v.id("_storage")),
      }),
    ),
  },
  handler: async (ctx, { posts }) => {
    let inserted = 0;
    let updated = 0;

    for (const post of posts) {
      const existing = await ctx.db
        .query("instagramPostStats")
        .withIndex("by_instagramShortcode", (q) =>
          q.eq("instagramShortcode", post.instagramShortcode),
        )
        .first();

      if (existing) {
        const patch: Record<string, unknown> = {
          views: post.views,
          likes: post.likes,
          comments: post.comments,
          instagramUserId: post.instagramUserId,
          instagramUsername: post.instagramUsername,
          mediaUrl: post.mediaUrl,
        };
        // Only set thumbnail if not already stored
        if (post.thumbnailStorageId && !existing.thumbnailStorageId) {
          patch.thumbnailStorageId = post.thumbnailStorageId;
        }
        await ctx.db.patch(existing._id, patch);
        updated++;
      } else {
        await ctx.db.insert("instagramPostStats", post);
        inserted++;
      }
    }

    return { inserted, updated };
  },
});

export const upsertInstagramPostSnapshots = internalMutation({
  args: {
    shortcodes: v.array(v.string()),
  },
  handler: async (ctx, { shortcodes }) => {
    const hour = new Date().getUTCHours();
    const snapshotAt = getSnapshotAt();

    for (const shortcode of shortcodes) {
      const post = await ctx.db
        .query("instagramPostStats")
        .withIndex("by_instagramShortcode", (q) =>
          q.eq("instagramShortcode", shortcode),
        )
        .first();

      if (!post) continue;

      const intervalId = getHourlyIntervalId(shortcode);
      const existing = await ctx.db
        .query("instagramPostSnapshots")
        .withIndex("by_intervalId", (q) => q.eq("intervalId", intervalId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          views: post.views,
          likes: post.likes,
          comments: post.comments,
        });
      } else {
        await ctx.db.insert("instagramPostSnapshots", {
          instagramShortcode: shortcode,
          intervalId,
          snapshotAt,
          hour,
          views: post.views,
          likes: post.likes,
          comments: post.comments,
        });
      }
    }
  },
});

// =============================================================================
// POPULATE ACTION
// =============================================================================

export const populateInstagramPostStats = internalAction({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    // Get airtableContents with instagramId for this campaign
    const contents = await ctx.runQuery(
      internal.app.instagramAnalytics.getAirtableContentWithInstagram,
      { campaignId },
    );

    if (contents.length === 0) return;

    // Get existing shortcodes to deduplicate
    const existingShortcodes = new Set(
      await ctx.runQuery(
        internal.app.instagramAnalytics.getExistingInstagramShortcodes,
        { campaignId },
      ),
    );

    // Collect pending shortcodes (not yet in instagramPostStats)
    const pending: string[] = [];
    // Also collect existing shortcodes that need stat refresh
    const toRefresh: string[] = [];

    for (const content of contents) {
      const shortcode = content.instagramId!;
      if (existingShortcodes.has(shortcode)) {
        toRefresh.push(shortcode);
      } else {
        pending.push(shortcode);
      }
    }

    type PostResult = {
      campaignId: string;
      instagramShortcode: string;
      instagramUserId: string;
      instagramUsername: string;
      mediaUrl: string;
      mediaType: number;
      postedAt: number;
      views: number;
      likes: number;
      comments: number;
      thumbnailStorageId?: Id<"_storage">;
    };

    async function downloadThumbnail(url: string): Promise<Id<"_storage"> | undefined> {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (!response.ok) return undefined;
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
        const storageId = await ctx.storage.store(blob);
        return storageId;
      } catch {
        return undefined;
      }
    }

    async function processShortcode(shortcode: string, isNew: boolean): Promise<PostResult | null> {
      const details = await fetchInstagramMediaByShortcode(shortcode);
      if (!details) return null;

      // Only download thumbnail for new posts (not refreshes)
      let thumbnailStorageId: Id<"_storage"> | undefined;
      if (isNew && details.thumbnailUrl) {
        thumbnailStorageId = await downloadThumbnail(details.thumbnailUrl);
      }

      return {
        campaignId,
        instagramShortcode: details.shortcode,
        instagramUserId: details.instagramUserId,
        instagramUsername: details.instagramUsername,
        mediaUrl: `https://www.instagram.com/p/${details.shortcode}/`,
        mediaType: details.mediaType,
        postedAt: details.postedAt,
        views: details.views,
        likes: details.likes,
        comments: details.comments,
        thumbnailStorageId,
      };
    }

    // Process all shortcodes (new + refresh) in parallel batches
    const pendingSet = new Set(pending);
    const allShortcodes = [...pending, ...toRefresh];
    const posts: PostResult[] = [];
    let errors = 0;

    for (let i = 0; i < allShortcodes.length; i += CONCURRENCY) {
      const batch = allShortcodes.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map((sc) => processShortcode(sc, pendingSet.has(sc))),
      );

      for (const result of results) {
        if (result.status === "fulfilled" && result.value) {
          posts.push(result.value);
        } else if (result.status === "rejected") {
          errors++;
        }
      }
    }

    // Write to instagramPostStats in batches
    for (let i = 0; i < posts.length; i += DB_BATCH) {
      await ctx.scheduler.runAfter(
        0,
        internal.app.instagramAnalytics.upsertInstagramPostStats,
        { posts: posts.slice(i, i + DB_BATCH) },
      );
    }

    // Create snapshots for all processed shortcodes
    if (posts.length > 0) {
      await ctx.scheduler.runAfter(
        0,
        internal.app.instagramAnalytics.upsertInstagramPostSnapshots,
        { shortcodes: posts.map((p) => p.instagramShortcode) },
      );
    }

    console.log(
      `[IG Populate] Campaign ${campaignId}: ${pending.length} new, ${toRefresh.length} refreshed, ${posts.length} processed, ${errors} errors`,
    );
  },
});

export const populateAllCampaignsInstagram = internalAction({
  args: {},
  handler: async (ctx) => {
    const campaignIds = await ctx.runQuery(
      internal.app.analyticsV2.getAllCampaignIds,
      {},
    );

    let scheduled = 0;
    for (const campaignId of campaignIds) {
      await ctx.scheduler.runAfter(
        scheduled * POPULATE_STAGGER_MS,
        internal.app.instagramAnalytics.populateInstagramPostStats,
        { campaignId },
      );
      scheduled++;
    }

    console.log(
      `[IG Populate] Scheduled ${scheduled} campaigns with ${POPULATE_STAGGER_MS / 1000}s stagger`,
    );
  },
});

/**
 * Manually trigger Instagram populate for a single campaign.
 * Call from dashboard: populateInstagramForCampaign({ campaignId: "rec..." })
 */
export const populateInstagramForCampaign = internalAction({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    await ctx.scheduler.runAfter(
      0,
      internal.app.instagramAnalytics.populateInstagramPostStats,
      { campaignId },
    );
    console.log(`[IG Populate] Manually scheduled campaign ${campaignId}`);
  },
});

// =============================================================================
// THUMBNAIL BACKFILL
// =============================================================================

/** Get Instagram posts missing thumbnails (paginated). */
export const getPostsMissingThumbnails = internalQuery({
  args: { limit: v.number(), cursor: v.optional(v.string()) },
  handler: async (ctx, { limit, cursor }) => {
    const result = await ctx.db
      .query("instagramPostStats")
      .paginate({ numItems: limit, cursor: cursor ?? null });

    const missing = result.page.filter((p) => !p.thumbnailStorageId);
    return {
      posts: missing.map((p) => ({
        _id: p._id,
        instagramShortcode: p.instagramShortcode,
      })),
      isDone: result.isDone,
      cursor: result.continueCursor,
    };
  },
});

/** Patch a single post with its thumbnail storage ID. */
export const patchThumbnail = internalMutation({
  args: {
    postId: v.id("instagramPostStats"),
    thumbnailStorageId: v.id("_storage"),
  },
  handler: async (ctx, { postId, thumbnailStorageId }) => {
    await ctx.db.patch(postId, { thumbnailStorageId });
  },
});

/**
 * Backfill thumbnails for all Instagram posts that don't have one yet.
 * Run from dashboard: internal.app.instagramAnalytics.backfillInstagramThumbnails({})
 */
export const backfillInstagramThumbnails = internalAction({
  args: {},
  handler: async (ctx) => {
    let cursor: string | undefined;
    let total = 0;
    let downloaded = 0;
    let errors = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const batch = await ctx.runQuery(
        internal.app.instagramAnalytics.getPostsMissingThumbnails,
        { limit: 100, cursor },
      );

      for (const post of batch.posts) {
        total++;
        try {
          const details = await fetchInstagramMediaByShortcode(post.instagramShortcode);
          if (!details?.thumbnailUrl) { errors++; continue; }

          const response = await fetch(details.thumbnailUrl, { signal: AbortSignal.timeout(10000) });
          if (!response.ok) { errors++; continue; }

          const arrayBuffer = await response.arrayBuffer();
          const blob = new Blob([arrayBuffer], { type: "image/jpeg" });
          const storageId = await ctx.storage.store(blob);

          await ctx.runMutation(
            internal.app.instagramAnalytics.patchThumbnail,
            { postId: post._id, thumbnailStorageId: storageId },
          );
          downloaded++;
        } catch {
          errors++;
        }
      }

      if (batch.isDone) break;
      cursor = batch.cursor;
    }

    console.log(`[IG Thumbnails] Backfill done: ${downloaded} downloaded, ${errors} errors, ${total} total processed`);
  },
});

// =============================================================================
// USER-FACING QUERIES
// =============================================================================

export const getInstagramPostCount = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const posts = await ctx.db
      .query("instagramPostStats")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();
    return posts.length;
  },
});
