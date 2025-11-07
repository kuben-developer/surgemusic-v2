import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";

// Public query that can be called from external scripts (no auth required)
export const getAllForExport = query({
  args: {},
  handler: async (ctx) => {
    try {
      // Fetch all ayrshare posted videos
      const ayrshareVideos = await ctx.db
        .query("ayrsharePostedVideos")
        .collect();

      // For each video, get the corresponding campaign
      const videosWithCampaigns = [];

      for (const video of ayrshareVideos) {
        try {
          const campaign = await ctx.db.get(video.campaignId);

          videosWithCampaigns.push({
            campaignId: video.campaignId,
            referenceId: campaign?.referenceId || 'N/A',
            videoId: video.videoId,
            videoUrl: video.videoUrl,
          });
        } catch (err) {
          // Skip videos with missing campaigns
          console.error(`Error processing video ${video.videoId}:`, err);
          continue;
        }
      }

      return videosWithCampaigns;
    } catch (error) {
      console.error("Error in getAllForExport:", error);
      throw new Error(`Failed to export ayrshare videos: ${error}`);
    }
  },
});

// Internal query for use within Convex with pagination
export const getAllAyrshareVideosWithCampaigns = internalQuery({
  args: {
    batchSize: v.optional(v.number()),
    cursor: v.optional(v.string()),
    campaignIds: v.optional(v.array(v.id("campaigns"))),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;

    // Fetch ayrshare posted videos with pagination
    const ayrshareVideos = await ctx.db
      .query("ayrsharePostedVideos")
      .paginate({ numItems: batchSize, cursor: args.cursor || null });

    // For each video, get the corresponding campaign
    const videosWithCampaigns = [];

    for (const video of ayrshareVideos.page) {
      // Filter by campaign IDs if provided
      if (args.campaignIds && !args.campaignIds.includes(video.campaignId)) {
        continue;
      }

      const campaign = await ctx.db.get(video.campaignId);

      videosWithCampaigns.push({
        campaignId: video.campaignId,
        referenceId: campaign?.referenceId || '',
        videoId: video.videoId,
        videoUrl: video.videoUrl,
      });
    }

    return {
      data: videosWithCampaigns,
      hasMore: ayrshareVideos.isDone === false,
      nextCursor: ayrshareVideos.continueCursor,
    };
  },
});

// Get reports by names and return their campaign IDs with report names
export const getReportsByCampaigns = internalQuery({
  args: {
    reportNames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const reports = await ctx.db.query("reports").collect();

    // Filter reports by the provided names
    const matchedReports = reports.filter(report =>
      args.reportNames.includes(report.name)
    );

    // Create a map of campaign ID to report name
    const campaignToReport: Record<string, string> = {};
    const allCampaignIds: string[] = [];

    for (const report of matchedReports) {
      for (const campaignId of report.campaignIds) {
        campaignToReport[campaignId] = report.name;
        if (!allCampaignIds.includes(campaignId)) {
          allCampaignIds.push(campaignId);
        }
      }
    }

    return {
      campaignToReport,
      campaignIds: allCampaignIds,
    };
  },
});
