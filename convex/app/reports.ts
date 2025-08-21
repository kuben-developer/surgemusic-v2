import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";

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

        const validCampaigns = campaigns.filter(c => c !== null);

        // Log if orphaned campaign IDs were found (can't patch in a query)
        if (validCampaigns.length !== report.campaignIds.length) {
          console.warn(`Report ${report._id} has ${report.campaignIds.length - validCampaigns.length} orphaned campaign ID(s)`);
        }

        return {
          ...report,
          campaignIds: validCampaigns.map(c => c!.id),
          campaigns: validCampaigns,
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

    // Filter out null campaigns (deleted campaigns)
    const validCampaigns = campaigns.filter(c => c !== null);
    const validCampaignIds = validCampaigns.map(c => c!._id);

    // Log if orphaned campaign IDs were found (can't patch in a query)
    if (validCampaignIds.length !== report.campaignIds.length) {
      console.warn(`Report ${args.id} has ${report.campaignIds.length - validCampaignIds.length} orphaned campaign ID(s)`);
    }

    return {
      ...report,
      campaignIds: validCampaignIds, // Return the cleaned up IDs
      campaigns: validCampaigns,
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

      // Filter out null campaigns (deleted) and campaigns not belonging to the user
      const validCampaigns = campaigns.filter(c => c && c.userId === user._id);

      if (validCampaigns.length === 0) {
        throw new Error("No valid campaigns found. All selected campaigns may have been deleted or do not belong to you.");
      }

      // Extract valid campaign IDs
      const validCampaignIds = validCampaigns.map(c => c!._id);

      // Log a warning if some campaigns were filtered out
      if (validCampaignIds.length !== args.campaignIds.length) {
        const removedCount = args.campaignIds.length - validCampaignIds.length;
        console.warn(`Filtered out ${removedCount} invalid or deleted campaign(s) during report update for report ${args.id}`);
      }

      updateData.campaignIds = validCampaignIds;
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

    const shareUrl = `${process.env.DOMAIN_URL}public/reports/${shareId}`;

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
    hiddenVideoIds: v.array(v.union(v.id("generatedVideos"), v.id("manuallyPostedVideos"))),
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

// Mutation to clean up orphaned campaign IDs from a specific report
export const cleanupOrphanedCampaigns = mutation({
  args: {
    reportId: v.id("reports"),
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

    // Check which campaigns still exist
    const campaigns = await Promise.all(
      report.campaignIds.map(id => ctx.db.get(id))
    );

    const validCampaignIds = campaigns
      .filter(c => c !== null)
      .map(c => c!._id);

    if (validCampaignIds.length !== report.campaignIds.length) {
      const removedCount = report.campaignIds.length - validCampaignIds.length;

      await ctx.db.patch(args.reportId, {
        campaignIds: validCampaignIds
      });

      console.log(`Cleaned up ${removedCount} orphaned campaign ID(s) from report ${args.reportId}`);

      return {
        cleanedUp: true,
        removedCount,
        remainingCampaigns: validCampaignIds.length
      };
    }

    return {
      cleanedUp: false,
      removedCount: 0,
      remainingCampaigns: report.campaignIds.length
    };
  },
});

// Helper function to clean up campaign references when a campaign is deleted
// This should be called whenever a campaign is deleted
export const removeCampaignFromReports = internalMutation({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    // Find all reports that contain this campaign
    const allReports = await ctx.db
      .query("reports")
      .collect();

    const affectedReports = allReports.filter(report =>
      report.campaignIds.includes(args.campaignId)
    );

    // Update each affected report to remove the deleted campaign
    for (const report of affectedReports) {
      const updatedCampaignIds = report.campaignIds.filter(
        id => id !== args.campaignId
      );

      // Only keep reports with at least one campaign
      if (updatedCampaignIds.length > 0) {
        await ctx.db.patch(report._id, {
          campaignIds: updatedCampaignIds
        });

        console.log(`Removed deleted campaign ${args.campaignId} from report ${report._id}`);
      } else {
        // Optionally: delete the report if it has no campaigns left
        console.warn(`Report ${report._id} would have no campaigns after removing ${args.campaignId}. Consider deleting or handling this case.`);
      }
    }

    return affectedReports.length;
  },
})