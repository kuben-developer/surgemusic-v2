import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalQuery, mutation, query } from "./_generated/server";

function generateShareId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export const create = mutation({
  args: {
    name: v.string(),
    campaignIds: v.array(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (args.campaignIds.length === 0) {
      throw new Error("At least one campaign must be selected.");
    }

    // Validate that the user owns the campaigns being linked
    const campaigns = await Promise.all(
      args.campaignIds.map(id => ctx.db.get(id))
    );

    const userCampaigns = campaigns.filter(c => c && c.userId === user._id);
    if (userCampaigns.length !== args.campaignIds.length) {
      throw new Error("One or more campaign IDs are invalid or do not belong to the user.");
    }

    const reportId = await ctx.db.insert("reports", {
      name: args.name,
      userId: user._id,
      campaignIds: args.campaignIds,
      hiddenVideoIds: [],
    });

    const report = await ctx.db.get(reportId);
    return {
      ...report,
      campaigns: userCampaigns,
    };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const reportsWithCampaigns = await Promise.all(
      reports.map(async (report) => {
        const campaigns = await Promise.all(
          report.campaignIds.map(async (id) => {
            const campaign = await ctx.db.get(id);
            return campaign ? { id: campaign._id, campaignName: campaign.campaignName } : null;
          })
        );

        return {
          ...report,
          campaigns: campaigns.filter(c => c !== null),
        };
      })
    );

    return reportsWithCampaigns.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const get = query({
  args: { id: v.id("reports") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const report = await ctx.db.get(args.id);
    if (!report) {
      throw new Error("Report not found.");
    }

    if (report.userId !== user._id) {
      throw new Error("You do not have permission to access this report.");
    }

    const campaigns = await Promise.all(
      report.campaignIds.map(id => ctx.db.get(id))
    );

    return {
      ...report,
      campaigns: campaigns.filter(c => c !== null),
    };
  },
});

export const update = mutation({
  args: {
    id: v.id("reports"),
    name: v.optional(v.string()),
    campaignIds: v.optional(v.array(v.id("campaigns"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (!args.name && !args.campaignIds) {
      throw new Error("Either name or campaignIds must be provided for update.");
    }

    const report = await ctx.db.get(args.id);
    if (!report) {
      throw new Error("Report not found.");
    }

    if (report.userId !== user._id) {
      throw new Error("You do not have permission to access this report.");
    }

    const updateData: any = {};

    if (args.name) {
      updateData.name = args.name;
    }

    if (args.campaignIds) {
      if (args.campaignIds.length === 0) {
        throw new Error("At least one campaign must be selected.");
      }

      const campaigns = await Promise.all(
        args.campaignIds.map(id => ctx.db.get(id))
      );

      const userCampaigns = campaigns.filter(c => c && c.userId === user._id);
      if (userCampaigns.length !== args.campaignIds.length) {
        throw new Error("One or more campaign IDs are invalid or do not belong to the user.");
      }

      updateData.campaignIds = args.campaignIds;
    }

    await ctx.db.patch(args.id, updateData);

    const updatedReport = await ctx.db.get(args.id);
    const campaigns = await Promise.all(
      updatedReport!.campaignIds.map(id => ctx.db.get(id))
    );

    return {
      ...updatedReport,
      campaigns: campaigns.filter(c => c !== null),
    };
  },
});

export const deleteReport = mutation({
  args: { id: v.id("reports") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const report = await ctx.db.get(args.id);
    if (!report) {
      throw new Error("Report not found.");
    }

    if (report.userId !== user._id) {
      throw new Error("You do not have permission to access this report.");
    }

    await ctx.db.delete(args.id);

    return report;
  },
});

export const getAnalytics = action({
  args: {
    id: v.string(),
    days: v.number(),
  },
  handler: async (ctx, args): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // If days=30, try to fetch from blob storage first
    if (args.days === 30) {
      try {
        const blobUrl = `https://zessa1ux5tl2b8nb.public.blob.vercel-storage.com/report-analytics/${args.id}.json`;
        const response = await fetch(blobUrl);

        if (response.ok) {
          const blobData = await response.json();
          console.log(`Analytics fetched from blob for report ${args.id}`);

          const { reportId, processedAt, ...analyticsData } = blobData;
          return analyticsData;
        }
      } catch (error) {
        console.log(`Failed to fetch from blob for report ${args.id}, falling back to real-time calculation`);
      }
    }

    // Fall back to real-time calculation
    const report = await ctx.runQuery(internal.reports.getReportWithCampaigns, {
      reportId: args.id as any,
      clerkId: identity.subject,
    });

    if (!report) {
      throw new Error("Report not found or access denied");
    }

    const campaignIds = report.campaignIds;
    if (campaignIds.length === 0) {
      return {
        dailyData: [],
        totals: { views: 0, likes: 0, comments: 0, shares: 0 },
        avgEngagementRate: "0.00",
        videoMetrics: [],
        campaigns: [],
        hiddenVideoIds: report.hiddenVideoIds,
        lastUpdatedAt: null
      };
    }

    // Use the fetchCombinedAnalytics action from campaigns
    const analyticsData = await ctx.runAction(internal.campaigns.fetchCombinedAnalytics, {
      campaignIds: campaignIds as any,
      days: args.days,
      clerkId: identity.subject,
    });

    return {
      ...analyticsData,
      hiddenVideoIds: report.hiddenVideoIds,
    };
  },
});

export const share = mutation({
  args: {
    id: v.id("reports"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const report = await ctx.db.get(args.id);
    if (!report) {
      throw new Error("Report not found.");
    }

    if (report.userId !== user._id) {
      throw new Error("You do not have permission to access this report.");
    }

    let shareId = report.publicShareId;

    if (!shareId) {
      shareId = generateShareId();
      await ctx.db.patch(args.id, { publicShareId: shareId });
    }

    const shareUrl = `${process.env.DOMAIN_URL}/public/reports/${shareId}`;

    return {
      shareId,
      shareUrl,
      reportName: report.name,
    };
  },
});

export const updateHiddenVideos = mutation({
  args: {
    reportId: v.id("reports"),
    hiddenVideoIds: v.array(v.id("generatedVideos")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found.");
    }

    if (report.userId !== user._id) {
      throw new Error("You do not have permission to access this report.");
    }

    // Validate that the video IDs exist
    const validVideos = await Promise.all(
      args.hiddenVideoIds.map(id => ctx.db.get(id))
    );

    const validVideoIds = validVideos
      .filter(v => v !== null)
      .map(v => v!._id);

    if (validVideoIds.length !== args.hiddenVideoIds.length) {
      const invalidVideoIds = args.hiddenVideoIds.filter(id => !validVideoIds.includes(id));
      console.warn(`Filtered out ${invalidVideoIds.length} invalid video IDs during updateHiddenVideos operation`);
    }

    await ctx.db.patch(args.reportId, {
      hiddenVideoIds: validVideoIds,
    });

    const updatedReport = await ctx.db.get(args.reportId);
    return updatedReport;
  },
});

// Internal functions
export const getReportWithCampaigns = internalQuery({
  args: {
    reportId: v.id("reports"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return null;

    const report = await ctx.db.get(args.reportId);
    if (!report || report.userId !== user._id) return null;

    return report;
  },
})