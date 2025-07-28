import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalQuery, mutation, query } from "./_generated/server";

function numericUuid() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return timestamp + random;
}

export const create = mutation({
  args: {
    campaignName: v.string(),
    songName: v.string(),
    artistName: v.string(),
    campaignCoverImageUrl: v.optional(v.string()),
    videoCount: v.number(),
    genre: v.string(),
    themes: v.array(v.string()),
    songAudioUrl: v.optional(v.string()),
    musicVideoUrl: v.optional(v.string()),
    lyricVideoUrl: v.optional(v.string()),
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

    const totalCredits = user.credits.videoGeneration + user.credits.videoGenerationAdditional;
    if (totalCredits < args.videoCount) {
      throw new Error("Insufficient video generation credits");
    }

    const referenceId = numericUuid();

    const campaignId = await ctx.db.insert("campaigns", {
      referenceId,
      userId: user._id,
      campaignName: args.campaignName,
      songName: args.songName,
      artistName: args.artistName,
      campaignCoverImageUrl: args.campaignCoverImageUrl,
      videoCount: args.videoCount,
      genre: args.genre,
      themes: args.themes,
      status: "pending",
    });

    await ctx.scheduler.runAfter(0, internal.campaigns.sendWebhook, {
      campaignId,
      referenceId,
      ...args,
    });

    return referenceId;
  },
});

export const get = query({
  args: {
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

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== user._id) {
      return null;
    }

    return campaign;
  },
});

export const getGeneratedVideos = query({
  args: {
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

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== user._id || campaign.status !== "completed") {
      return [];
    }

    const videos = await ctx.db
      .query("generatedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    // TODO: Add logic to check and update video URLs from Ayrshare
    // This requires complex platform-specific logic that needs adaptation

    return videos;
  },
});

export const getPostedVideos = query({
  args: {
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

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== user._id || campaign.status !== "completed") {
      return [];
    }

    const videos = await ctx.db
      .query("generatedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    // Filter videos that have been posted to at least one platform
    return videos.filter(video =>
      (video.tiktokUpload?.post?.url) ||
      (video.instagramUpload?.post?.url) ||
      (video.youtubeUpload?.post?.url)
    );
  },
});

export const getAll = query({
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

    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return campaigns.sort((a, b) => b._creationTime - a._creationTime);
  },
});



export const getAllWithFolders = query({
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

    // Fetch all data in parallel
    const [folders, allCampaigns] = await Promise.all([
      ctx.db
        .query("folders")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect(),
      ctx.db
        .query("campaigns")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .collect()
    ]);

    // Create a map of campaign IDs to campaigns for O(1) lookup
    const campaignMap = new Map(
      allCampaigns.map(c => [c._id, c])
    );

    // Track which campaigns are in folders
    const campaignIdsInFolders = new Set<string>();

    // Process folders with their campaigns
    const foldersWithCampaigns = folders.map(folder => {
      // Add all campaign IDs from this folder to the set
      folder.campaignIds.forEach(id => campaignIdsInFolders.add(id));

      // Get campaigns for this folder from the map
      const folderCampaigns = folder.campaignIds
        .map(id => campaignMap.get(id))
        .filter((c): c is NonNullable<typeof c> => c !== undefined);

      return {
        id: folder._id,
        name: folder.name,
        createdAt: folder._creationTime,
        updatedAt: folder._creationTime,
        campaigns: folderCampaigns,
        campaignCount: folderCampaigns.length,
      };
    });

    // Get unorganized campaigns (not in any folder)
    const unorganizedCampaigns = allCampaigns
      .filter(c => !campaignIdsInFolders.has(c._id))
      .map(c => ({
        ...c,
        id: c._id,
        createdAt: c._creationTime,
        updatedAt: c._creationTime,
      }));

    return {
      folders: foldersWithCampaigns.sort((a, b) => b.createdAt - a.createdAt),
      unorganizedCampaigns: unorganizedCampaigns.sort((a, b) => b.createdAt - a.createdAt),
    };
  },
});

export const getScheduledVideos = query({
  args: {
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

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== user._id) {
      return [];
    }

    const videos = await ctx.db
      .query("generatedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    // Filter and transform scheduled videos
    const scheduledVideos = videos
      .filter(video => {
        // Check if video is scheduled but not posted for any platform
        const tiktokScheduled = video.tiktokUpload?.scheduledAt && !video.tiktokUpload?.status?.isPosted;
        const instagramScheduled = video.instagramUpload?.scheduledAt && !video.instagramUpload?.status?.isPosted;
        const youtubeScheduled = video.youtubeUpload?.scheduledAt && !video.youtubeUpload?.status?.isPosted;

        return tiktokScheduled || instagramScheduled || youtubeScheduled;
      })
      .map(video => {
        // Get the earliest scheduled time and post info
        let earliestSchedule = null;
        let postInfo = null;
        let platforms = [];

        if (video.tiktokUpload?.scheduledAt && !video.tiktokUpload?.status?.isPosted) {
          earliestSchedule = video.tiktokUpload.scheduledAt;
          postInfo = video.tiktokUpload.post;
          platforms.push({ platform: "tiktok", username: "TikTok Account" });
        }

        if (video.instagramUpload?.scheduledAt && !video.instagramUpload?.status?.isPosted) {
          if (!earliestSchedule || video.instagramUpload.scheduledAt < earliestSchedule) {
            earliestSchedule = video.instagramUpload.scheduledAt;
            postInfo = video.instagramUpload.post;
          }
          platforms.push({ platform: "instagram", username: "Instagram Account" });
        }

        if (video.youtubeUpload?.scheduledAt && !video.youtubeUpload?.status?.isPosted) {
          if (!earliestSchedule || video.youtubeUpload.scheduledAt < earliestSchedule) {
            earliestSchedule = video.youtubeUpload.scheduledAt;
            postInfo = video.youtubeUpload.post;
          }
          platforms.push({ platform: "youtube", username: "YouTube Account" });
        }

        return {
          id: video._id,
          videoName: video.video.name,
          videoUrl: video.video.url,
          postId: postInfo?.id || "",
          scheduledAt: new Date(earliestSchedule!),
          postCaption: postInfo?.caption || "",
          scheduledSocialAccounts: platforms,
        };
      })
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

    return scheduledVideos;
  },
});

export const sendWebhook = internalAction({
  args: {
    campaignId: v.any(),
    referenceId: v.string(),
    campaignName: v.string(),
    songName: v.string(),
    artistName: v.string(),
    campaignCoverImageUrl: v.optional(v.string()),
    videoCount: v.number(),
    genre: v.string(),
    themes: v.array(v.string()),
    songAudioUrl: v.optional(v.string()),
    musicVideoUrl: v.optional(v.string()),
    lyricVideoUrl: v.optional(v.string()),
  },
  handler: async (_, args): Promise<void> => {
    try {
      const isCustomCampaign = args.themes.length > 0;
      let payload;

      if (isCustomCampaign) {
        payload = [{
          "Album Art": args.campaignCoverImageUrl || "",
          "Artist Name": args.artistName,
          "Credits": args.videoCount.toString(),
          "Genre": args.genre,
          "Girls content": args.themes.includes("girls") ? "Yes" : "No",
          "luxuryLifestyle": args.themes.includes("luxury_lifestyle") ? "Yes" : "No",
          "natureLifestyle": args.themes.includes("nature_lifestyle") ? "Yes" : "No",
          "customEnterpriseContent": args.themes.includes("enterprise") ? "Yes" : "No",
          "Music": args.songAudioUrl || "",
          "Music Content": args.themes.includes("recommendation") ? "Yes" : "No",
          "Performance Video": args.musicVideoUrl || "",
          "Reaction Content": args.themes.includes("reactions") ? "Yes" : "No",
          "Song Name": args.songName,
          "Campaign ID": args.referenceId,
          "Campaign Setup": "custom",
          "lyricVideo": args.lyricVideoUrl || "",
        }];
      } else {
        payload = [{
          "Credits": args.videoCount.toString(),
          "Music": args.songAudioUrl || "",
          "Campaign ID": args.referenceId,
          "Song Name": args.songName,
          "Artist Name": args.artistName,
          "Genre": args.genre,
          "Campaign Setup": "express",
          "lyricVideo": args.lyricVideoUrl || "",
        }];
      }

      console.log("Sending webhook payload:", payload);

      const webhookResponse = await fetch("https://hkdk.events/gbzu8j6tggs0nr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!webhookResponse.ok) {
        console.error("Failed to send campaign data to webhook:", await webhookResponse.text());
      } else {
        console.log("Campaign data sent to webhook successfully", await webhookResponse.text());
      }
    } catch (error) {
      console.error("Error sending campaign data to webhook:", error);
    }
  },
})

export const getCampaignWithUser = internalQuery({
  args: {
    campaignId: v.id("campaigns"),
    clerkId: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return null;

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== user._id) return null;

    return campaign;
  },
})


