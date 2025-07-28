import { action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getSharedReport = action({
  args: {
    shareId: v.string(),
    days: v.number(),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      // Find the report by its public share ID
      const report = await ctx.runQuery(internal.public.getReportByShareId, {
        shareId: args.shareId,
      });

      if (!report) {
        console.info(`Access attempt to non-existent shared report: ${args.shareId}`);
        throw new Error("Shared report not found.");
      }

      console.info(`Access to shared report ${report._id} via share ID ${args.shareId}`);

      const campaignIds = report.campaignIds;

      if (campaignIds.length === 0) {
        return {
          reportName: report.name,
          reportCreatedAt: new Date(report._creationTime),
          dailyData: [],
          totals: { views: 0, likes: 0, comments: 0, shares: 0 },
          avgEngagementRate: "0.00",
          videoMetrics: [],
          campaigns: [],
          hiddenVideoIds: report.hiddenVideoIds,
        };
      }

      // Get campaign details
      const campaigns = await ctx.runQuery(internal.public.getCampaignsByIds, {
        campaignIds: report.campaignIds,
      });

      // Use the existing fetchCombinedAnalytics function from analytics
      const analyticsData = await ctx.runAction(internal.analytics.fetchCombinedAnalytics, {
        campaignIds: campaignIds as any,
        days: args.days,
        clerkId: report.userId as any, // Pass the report owner's ID
      });

      // Filter out hidden videos from videoMetrics
      const filteredVideoMetrics = report.hiddenVideoIds.length > 0
        ? analyticsData.videoMetrics.filter((vm: any) => !report.hiddenVideoIds.includes(vm.videoInfo.id))
        : analyticsData.videoMetrics;

      // Sanitize video metrics to remove sensitive data
      const sanitizedVideoMetrics = filteredVideoMetrics.map((metric: any) => {
        const { videoInfo, ...rest } = metric;
        return {
          ...rest,
          videoInfo: {
            id: videoInfo.id,
            videoUrl: videoInfo.video?.url || videoInfo.videoUrl,
            videoName: videoInfo.video?.name || videoInfo.videoName,
            videoType: videoInfo.video?.type || videoInfo.videoType,
            createdAt: videoInfo._creationTime || videoInfo.createdAt,
            tiktokUrl: videoInfo.tiktokUpload?.post?.url || null,
            campaign: {
              id: videoInfo.campaignId,
              campaignName: campaigns.find((c: any) => c._id === videoInfo.campaignId)?.campaignName || "Unknown",
            },
          },
        };
      });

      return {
        reportName: report.name,
        reportCreatedAt: new Date(report._creationTime),
        dailyData: analyticsData.dailyData,
        totals: analyticsData.totals,
        avgEngagementRate: analyticsData.avgEngagementRate,
        videoMetrics: sanitizedVideoMetrics,
        campaigns: campaigns.map((c: any) => ({
          id: c._id,
          campaignName: c.campaignName,
          artistName: c.artistName,
          songName: c.songName,
          genre: c.genre,
          campaignCoverImageUrl: c.campaignCoverImageUrl,
        })),
        hiddenVideoIds: report.hiddenVideoIds,
        lastUpdatedAt: analyticsData.lastUpdatedAt,
      };
    } catch (error) {
      console.error(`Error accessing shared report:`, error);
      throw new Error("An error occurred while accessing the shared report.");
    }
  },
});

export const getReportByShareId = internalQuery({
  args: { shareId: v.string() },
  handler: async (ctx, args) => {
    // Find report by publicShareId
    const reports = await ctx.db
      .query("reports")
      .filter((q) => q.eq(q.field("publicShareId"), args.shareId))
      .collect();

    return reports[0] || null;
  },
})

export const getCampaignsByIds = internalQuery({
  args: { campaignIds: v.array(v.id("campaigns")) },
  handler: async (ctx, args) => {
    const campaigns = await Promise.all(
      args.campaignIds.map(id => ctx.db.get(id))
    );
    return campaigns.filter(c => c !== null);
  },
})