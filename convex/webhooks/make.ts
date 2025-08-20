import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

export const makeWebhook = httpAction(async (ctx, request) => {
  const body = await request.text();
  console.log("Make.com webhook received", body);

  try {
    const videos = JSON.parse(body) as Array<{
      URL: string;
      "CAMPAIGN ID": number;
      "CONTENT TYPE": string;
      "TOTAL_VIDEO": number;
      "TEMPLATE ID": string;
    }>;

    // Create a counter for each video type
    const videoTypeCounters = new Map<string, number>();

    // Process each video
    for (const video of videos) {
      // Standardize video type to normal case (e.g., "REACTIONS" -> "Reactions")
      const videoType = video["CONTENT TYPE"].toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

      // Increment counter for this video type
      const currentCount = videoTypeCounters.get(videoType) ?? 0;
      videoTypeCounters.set(videoType, currentCount + 1);

      // Generate video name
      const videoName = `${videoType} ${currentCount + 1}`;

      // Store in database
      await ctx.runMutation(internal.webhooks.make.createGeneratedVideo, {
        campaignReferenceId: Math.trunc(Number(video["CAMPAIGN ID"])).toString(),
        videoName: videoName,
        videoUrl: video.URL,
        videoType: videoType,
        templateId: video["TEMPLATE ID"],
      });
    }

    if (videos.length > 0) {
      // Get total videos generated for this campaign
      const campaignReferenceId = Math.trunc(Number(videos[0]?.["CAMPAIGN ID"])).toString();
      const totalVideosNeeded = videos[0]?.["TOTAL_VIDEO"];

      if (campaignReferenceId && totalVideosNeeded) {
        await ctx.runMutation(internal.webhooks.make.checkCampaignCompletion, {
          campaignReferenceId,
          totalVideosNeeded,
        });
      }
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
});

// Internal mutations
import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const createGeneratedVideo = internalMutation({
  args: {
    campaignReferenceId: v.string(),
    videoName: v.string(),
    videoUrl: v.string(),
    videoType: v.string(),
    templateId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find campaign by reference ID
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_referenceId", (q) => q.eq("referenceId", args.campaignReferenceId))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .unique();

    if (!campaign) {
      throw new Error(`Campaign not found with reference ID: ${args.campaignReferenceId}`);
    }

    // Create generated video record
    await ctx.db.insert("generatedVideos", {
      campaignId: campaign._id,
      video: {
        name: args.videoName,
        url: args.videoUrl,
        type: args.videoType,
      },
      // Initialize upload status objects as undefined (they'll be set when videos are scheduled)
    });
  },
});

export const checkCampaignCompletion = internalMutation({
  args: {
    campaignReferenceId: v.string(),
    totalVideosNeeded: v.number(),
  },
  handler: async (ctx, args) => {
    // Find campaign by reference ID
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_referenceId", (q) => q.eq("referenceId", args.campaignReferenceId))
      .filter((q) => q.neq(q.field("isDeleted"), true))
      .unique();

    if (!campaign) {
      console.error(`Campaign not found with reference ID: ${args.campaignReferenceId}`);
      return;
    }

    // Count generated videos for this campaign
    const generatedVideos = await ctx.db
      .query("generatedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaign._id))
      .collect();

    const generatedVideosCount = generatedVideos.length;

    // Mark as complete only if we've generated all videos
    if (generatedVideosCount >= args.totalVideosNeeded) {
      await ctx.db.patch(campaign._id, {
        status: "completed",
      });

      // Deduct credits from user
      const user = await ctx.db.get(campaign.userId);
      if (user) {
        let remainingToDeduct = args.totalVideosNeeded;
        let regularCredits = user.credits.videoGeneration;
        let additionalCredits = user.credits.videoGenerationAdditional;

        // First deduct from regular credits
        if (regularCredits > 0) {
          const deductFromRegular = Math.min(regularCredits, remainingToDeduct);
          regularCredits -= deductFromRegular;
          remainingToDeduct -= deductFromRegular;
        }

        // Then deduct from additional credits if needed
        if (remainingToDeduct > 0 && additionalCredits > 0) {
          const deductFromAdditional = Math.min(additionalCredits, remainingToDeduct);
          additionalCredits -= deductFromAdditional;
        }

        await ctx.db.patch(campaign.userId, {
          credits: {
            ...user.credits,
            videoGeneration: regularCredits,
            videoGenerationAdditional: additionalCredits,
          },
        });
      }
    }
  },
});