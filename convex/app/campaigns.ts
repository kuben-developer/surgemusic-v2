import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction, internalQuery, mutation, query } from "../_generated/server";

function numericUuid() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return timestamp + random;
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
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
    caption: v.optional(v.string()),
    lyrics: v.optional(v.array(v.object({
      timestamp: v.number(),
      text: v.string(),
    }))),
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

    // Check if caption is unique before creating campaign
    if (args.caption) {
      const trimmedCaption = args.caption.trim();
      if (trimmedCaption) {
        // Check if another campaign already uses this caption
        const existingCampaigns = await ctx.db
          .query("campaigns")
          .withIndex("by_caption", (q) => q.eq("caption", trimmedCaption))
          .collect();

        // Filter out deleted campaigns
        const conflictingCampaign = existingCampaigns.find(
          c => c.isDeleted !== true
        );

        if (conflictingCampaign) {
          throw new Error("This caption is already used by another campaign. Please choose a unique caption.");
        }
      }
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
      caption: args.caption ? args.caption.trim() : undefined,
      lyrics: args.lyrics,
    });

    await ctx.scheduler.runAfter(0, internal.app.campaigns.sendWebhook, {
      campaignId,
      referenceId,
      ...args,
    });

    return campaignId;
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
    if (!campaign || campaign.userId !== user._id || campaign.isDeleted === true) {
      return null;
    }

    return campaign;
  },
});

export const updateCaption = mutation({
  args: {
    campaignId: v.id("campaigns"),
    caption: v.string(),
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
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Check if caption is not empty and is unique
    const trimmedCaption = args.caption.trim();
    if (trimmedCaption) {
      // Check if another campaign already uses this caption
      const existingCampaigns = await ctx.db
        .query("campaigns")
        .withIndex("by_caption", (q) => q.eq("caption", trimmedCaption))
        .collect();

      // Filter out the current campaign and deleted campaigns
      const conflictingCampaign = existingCampaigns.find(
        c => c._id !== args.campaignId && c.isDeleted !== true
      );

      if (conflictingCampaign) {
        throw new Error("This caption is already used by another campaign. Please choose a unique caption.");
      }
    }

    await ctx.db.patch(args.campaignId, { caption: trimmedCaption });

    return { success: true };
  },
});

export const deleteCampaign = mutation({
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
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    if (campaign.isDeleted === true) {
      throw new Error("Campaign already deleted");
    }

    await ctx.db.patch(args.campaignId, { isDeleted: true });

    return { success: true };
  },
});

export const renameCampaign = mutation({
  args: {
    campaignId: v.id("campaigns"),
    newName: v.string(),
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
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    if (campaign.isDeleted === true) {
      throw new Error("Cannot rename deleted campaign");
    }

    const trimmedName = args.newName.trim();
    if (!trimmedName) {
      throw new Error("Campaign name cannot be empty");
    }

    await ctx.db.patch(args.campaignId, { campaignName: trimmedName });

    return { success: true };
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
      .filter((q) => q.neq(q.field("isDeleted"), true))
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
        .filter((q) => q.neq(q.field("isDeleted"), true))
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
        campaigns: folderCampaigns,
        campaignCount: folderCampaigns.length,
      };
    });

    // Get unorganized campaigns (not in any folder)
    const unorganizedCampaigns = allCampaigns
      .filter(c => !campaignIdsInFolders.has(c._id));

    return {
      folders: foldersWithCampaigns,
      unorganizedCampaigns: unorganizedCampaigns.sort((a, b) => b._creationTime - a._creationTime),
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
    lyrics: v.optional(v.array(v.object({
      timestamp: v.number(),
      text: v.string(),
    }))),
  },
  handler: async (ctx, args): Promise<void> => {
    try {
      // Convert lyrics to SRT format and upload to storage if present
      let lyricsSRTUrl = "";
      if (args.lyrics && args.lyrics.length > 0) {
        const srtLines: string[] = [];
        args.lyrics.forEach((line, index) => {
          const subtitleNumber = index + 1;
          const startTime = formatSRTTime(line.timestamp);
          const endTime = formatSRTTime(line.timestamp + 1);
          
          srtLines.push(String(subtitleNumber));
          srtLines.push(`${startTime} --> ${endTime}`);
          srtLines.push(line.text || '');
          srtLines.push('');
        });
        const lyricsSRT = srtLines.join('\n').trim();
        
        // Store the SRT file in Convex storage
        const srtBlob = new Blob([lyricsSRT], { type: 'text/plain' });
        const storageId = await ctx.storage.store(srtBlob);
        
        // Get the public URL for the stored file
        const url = await ctx.storage.getUrl(storageId);
        if (url) {
          lyricsSRTUrl = url;
        }
      }

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
          "Test Content": args.campaignName == "hQobrLIIxsXIe" ? "Yes" : "No",
          "Lyrics SRT": lyricsSRTUrl,
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
          "Test Content": args.campaignName == "hQobrLIIxsXIe" ? "Yes" : "No",
          "Lyrics SRT": lyricsSRTUrl,
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

export const getAllWithCaptions = internalQuery({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db
      .query("campaigns")
      .filter((q) =>
        q.and(
          q.neq(q.field("caption"), undefined),
          q.neq(q.field("isDeleted"), true)
        )
      )
      .collect();
    return campaigns;
  },
})

// Internal query to get a campaign without authentication (for public/shared contexts)
export const getInternal = internalQuery({
  args: {
    campaignId: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.isDeleted === true) {
      return null;
    }
    return campaign;
  },
})


