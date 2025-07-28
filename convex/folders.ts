import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
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

    const existingFolder = await ctx.db
      .query("folders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("name"), args.name))
      .unique();

    if (existingFolder) {
      throw new Error("A folder with this name already exists");
    }

    const folderId = await ctx.db.insert("folders", {
      name: args.name,
      userId: user._id,
      campaignIds: [],
    });

    const folder = await ctx.db.get(folderId);
    return folder;
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

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const foldersWithCounts = folders.map((folder) => ({
      ...folder,
      campaignCount: folder.campaignIds.length,
    }));

    return foldersWithCounts;
  },
});

export const update = mutation({
  args: {
    id: v.id("folders"),
    name: v.string(),
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

    const existingFolder = await ctx.db.get(args.id);
    if (!existingFolder) {
      throw new Error("Folder not found");
    }

    if (existingFolder.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const duplicateFolder = await ctx.db
      .query("folders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => 
        q.and(
          q.eq(q.field("name"), args.name),
          q.neq(q.field("_id"), args.id)
        )
      )
      .unique();

    if (duplicateFolder) {
      throw new Error("A folder with this name already exists");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
    });

    const updatedFolder = await ctx.db.get(args.id);
    return updatedFolder;
  },
});

export const deleteFolder = mutation({
  args: {
    id: v.id("folders"),
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

    const existingFolder = await ctx.db.get(args.id);
    if (!existingFolder) {
      throw new Error("Folder not found");
    }

    if (existingFolder.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const campaignsAffected = existingFolder.campaignIds.length;

    await ctx.db.delete(args.id);

    return {
      success: true,
      message: "Folder deleted successfully",
      campaignsAffected,
    };
  },
});

export const addCampaign = mutation({
  args: {
    folderId: v.id("folders"),
    campaignId: v.id("campaigns"),
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

    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }

    if (folder.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.userId !== user._id) {
      throw new Error("Campaign not found or you don't have permission to access it");
    }

    if (folder.campaignIds.includes(args.campaignId)) {
      throw new Error("Campaign is already in this folder");
    }

    await ctx.db.patch(args.folderId, {
      campaignIds: [...folder.campaignIds, args.campaignId],
    });

    const updatedFolder = await ctx.db.get(args.folderId);
    
    return {
      success: true,
      message: "Campaign added to folder successfully",
      folder: updatedFolder,
      campaign,
    };
  },
});

export const addCampaigns = mutation({
  args: {
    folderId: v.id("folders"),
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

    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }

    if (folder.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const campaigns = await Promise.all(
      args.campaignIds.map(id => ctx.db.get(id))
    );

    const validCampaigns = campaigns.filter(c => c && c.userId === user._id);
    
    if (validCampaigns.length !== args.campaignIds.length) {
      const foundIds = validCampaigns.map(c => c!._id);
      const missingIds = args.campaignIds.filter(id => !foundIds.includes(id));
      throw new Error(`Some campaigns not found or you don't have permission: ${missingIds.join(', ')}`);
    }

    const existingCampaignIds = folder.campaignIds;
    const newCampaignIds = args.campaignIds.filter(id => !existingCampaignIds.includes(id));

    if (newCampaignIds.length === 0) {
      throw new Error("All selected campaigns are already in this folder");
    }

    await ctx.db.patch(args.folderId, {
      campaignIds: [...existingCampaignIds, ...newCampaignIds],
    });

    const skippedCount = args.campaignIds.length - newCampaignIds.length;
    const addedCount = newCampaignIds.length;

    let message = `Successfully added ${addedCount} campaign${addedCount !== 1 ? 's' : ''} to folder`;
    if (skippedCount > 0) {
      message += `. ${skippedCount} campaign${skippedCount !== 1 ? 's were' : ' was'} already in the folder`;
    }

    return {
      success: true,
      message,
      addedCount,
      skippedCount,
    };
  },
});

export const removeCampaign = mutation({
  args: {
    folderId: v.id("folders"),
    campaignId: v.id("campaigns"),
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

    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }

    if (folder.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.userId !== user._id) {
      throw new Error("Campaign not found or you don't have permission to access it");
    }

    if (!folder.campaignIds.includes(args.campaignId)) {
      throw new Error("Campaign is not in this folder");
    }

    const updatedCampaignIds = folder.campaignIds.filter(id => id !== args.campaignId);

    await ctx.db.patch(args.folderId, {
      campaignIds: updatedCampaignIds,
    });

    return {
      success: true,
      message: "Campaign removed from folder successfully",
    };
  },
});

export const getCampaigns = query({
  args: {
    folderId: v.id("folders"),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
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

    const folder = await ctx.db.get(args.folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }

    if (folder.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const page = args.page || 1;
    const limit = args.limit || 20;
    const skip = (page - 1) * limit;

    const campaignIds = folder.campaignIds.slice(skip, skip + limit);
    const totalCount = folder.campaignIds.length;

    const campaigns = await Promise.all(
      campaignIds.map(async (id) => {
        const campaign = await ctx.db.get(id);
        if (!campaign) return null;
        
        const generatedVideos = await ctx.db
          .query("generatedVideos")
          .withIndex("by_campaignId", (q) => q.eq("campaignId", id))
          .collect();

        return {
          ...campaign,
          videoCount: generatedVideos.length,
        };
      })
    );

    const validCampaigns = campaigns.filter(c => c !== null);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      campaigns: validCampaigns,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },
});