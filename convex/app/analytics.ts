import { v } from "convex/values";
import { internalAction, action } from "../_generated/server";
import { internal } from "../_generated/api";


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
        await ctx.scheduler.runAfter(0, internal.app.analytics.aggregateCampaignPerformanceByCampaign, {
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
