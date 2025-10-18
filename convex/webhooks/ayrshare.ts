import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

export const ayrshareWebhook = httpAction(async (ctx, request) => {
  const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY || "";
  const body = await request.json();
  console.log("Ayrshare webhook received:", body);
  
  if (body.action === "social") {
    if (body.type === "link") {
      const profileName = body.title;
      
      const profile = await ctx.runQuery(internal.webhooks.ayrshare.getProfileByName, {
        profileName,
      });
      
      if (!profile) {
        return new Response("Profile not found", { status: 404 });
      }
      
      // Fetch user data from Ayrshare API
      const response = await fetch("https://api.ayrshare.com/api/user", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
          "Content-Type": "application/json",
          "Profile-Key": profile.profileKey
        }
      });
      
      if (!response.ok) {
        return new Response("Failed to fetch user data from Ayrshare", { status: 500 });
      }
      
      const userData = await response.json();
      console.log("Ayrshare user data:", userData);
      
      const accounts = userData.displayNames;
      
      for (const account of accounts) {
        if (account.platform === body.platform) {
          // Create a new social account record in the database
          await ctx.runMutation(internal.webhooks.ayrshare.createSocialAccount, {
            ayrshareProfileId: profile._id,
            platform: account.platform,
            profileUrl: account.profileUrl,
            userImage: account.userImage,
            username: account.username,
          });
          
          console.log(`Created social account record for ${account.platform}: ${account.username}`);
        }
      }
    } else if (body.type === "unlink") {
      const profileName = body.title;
      const platform = body.platform;
      
      await ctx.runMutation(internal.webhooks.ayrshare.deleteSocialAccounts, {
        profileName,
        platform,
      });
    }
  } else if (body.action === "scheduled") {
    const post = await ctx.runQuery(internal.webhooks.ayrshare.getVideoByPostId, {
      postId: body.id,
    });
    
    if (!post) {
      return new Response("Post not found", { status: 404 });
    }
    
    console.log("Post:", JSON.stringify(post, null, 2));
    
    if (body.errors.length > 0) {
      const failedPlatform = body.platforms[0];
      
      await ctx.runMutation(internal.webhooks.ayrshare.updateVideoFailure, {
        videoId: post._id,
        platform: failedPlatform,
        failedReason: body.errors[0].message,
      });
    }
    
    // Extract successful platforms from the postIds array
    const successfulPlatforms = body.postIds
      .filter((postInfo: any) => postInfo.status === "success")
      .map((postInfo: any) => postInfo.platform);
    
    console.log("Successful platforms:", successfulPlatforms);
    
    const tiktokUrl = body.postIds.find((postInfo: any) => postInfo.platform === "tiktok")?.postUrl || null;
    const instagramUrl = body.postIds.find((postInfo: any) => postInfo.platform === "instagram")?.postUrl || null;
    const youtubeUrl = body.postIds.find((postInfo: any) => postInfo.platform === "youtube")?.postUrl || null;
    
    console.log("Tiktok URL:", tiktokUrl);
    console.log("Instagram URL:", instagramUrl);
    console.log("Youtube URL:", youtubeUrl);
    
    if (!tiktokUrl && !instagramUrl && !youtubeUrl) {
      return new Response("No URLs found", { status: 404 });
    }
    
    // Update the database record with posting status for each platform
    await ctx.runMutation(internal.webhooks.ayrshare.updateVideoPostStatus, {
      videoId: post._id,
      tiktok: {
        posted: successfulPlatforms.includes("tiktok") && tiktokUrl ? true : false,
        url: tiktokUrl,
      },
      instagram: {
        posted: successfulPlatforms.includes("instagram") && instagramUrl ? true : false,
        url: instagramUrl,
      },
      youtube: {
        posted: successfulPlatforms.includes("youtube") && youtubeUrl ? true : false,
        url: youtubeUrl,
      },
    });
  }
  
  return new Response(null, { status: 200 });
});

// Internal queries and mutations
import { internalQuery, internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const getProfileByName = internalQuery({
  args: { profileName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ayrshareProfiles")
      .withIndex("by_profileName", (q) => q.eq("profileName", args.profileName))
      .unique();
  },
});

export const createSocialAccount = internalMutation({
  args: {
    ayrshareProfileId: v.id("ayrshareProfiles"),
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
    ),
    profileUrl: v.string(),
    userImage: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if account already exists
    const existingAccount = await ctx.db
      .query("socialAccounts")
      .withIndex("by_ayrshareProfileId", (q) => q.eq("ayrshareProfileId", args.ayrshareProfileId))
      .filter((q) => q.eq(q.field("platform"), args.platform))
      .unique();
    
    if (existingAccount) {
      // Update existing account
      await ctx.db.patch(existingAccount._id, {
        profileUrl: args.profileUrl,
        userImage: args.userImage,
        username: args.username,
      });
    } else {
      // Create new account
      await ctx.db.insert("socialAccounts", {
        ayrshareProfileId: args.ayrshareProfileId,
        platform: args.platform,
        profileUrl: args.profileUrl,
        userImage: args.userImage,
        username: args.username,
      });
    }
  },
});

export const deleteSocialAccounts = internalMutation({
  args: {
    profileName: v.string(),
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("ayrshareProfiles")
      .withIndex("by_profileName", (q) => q.eq("profileName", args.profileName))
      .unique();
    
    if (!profile) {
      return;
    }
    
    const accounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_ayrshareProfileId", (q) => q.eq("ayrshareProfileId", profile._id))
      .filter((q) => q.eq(q.field("platform"), args.platform))
      .collect();
    
    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }
  },
});

export const getVideoByPostId = internalQuery({
  args: { postId: v.string() },
  handler: async (ctx, args) => {
    // Try TikTok index first
    let video = await ctx.db
      .query("generatedVideos")
      .withIndex("by_tiktok_post_id", (q) =>
        q.eq("tiktokUpload.post.id", args.postId)
      )
      .first();

    if (video) return video;

    // Try Instagram index
    video = await ctx.db
      .query("generatedVideos")
      .withIndex("by_instagram_post_id", (q) =>
        q.eq("instagramUpload.post.id", args.postId)
      )
      .first();

    if (video) return video;

    // Try YouTube index
    video = await ctx.db
      .query("generatedVideos")
      .withIndex("by_youtube_post_id", (q) =>
        q.eq("youtubeUpload.post.id", args.postId)
      )
      .first();

    return video;
  },
});

export const updateVideoFailure = internalMutation({
  args: {
    videoId: v.id("generatedVideos"),
    platform: v.string(),
    failedReason: v.string(),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) return;
    
    const updateData: any = {};
    
    if (args.platform === "tiktok" && video.tiktokUpload) {
      updateData.tiktokUpload = {
        ...video.tiktokUpload,
        status: {
          ...video.tiktokUpload.status,
          isFailed: true,
          failedReason: args.failedReason,
        },
      };
    } else if (args.platform === "instagram" && video.instagramUpload) {
      updateData.instagramUpload = {
        ...video.instagramUpload,
        status: {
          ...video.instagramUpload.status,
          isFailed: true,
          failedReason: args.failedReason,
        },
      };
    } else if (args.platform === "youtube" && video.youtubeUpload) {
      updateData.youtubeUpload = {
        ...video.youtubeUpload,
        status: {
          ...video.youtubeUpload.status,
          isFailed: true,
          failedReason: args.failedReason,
        },
      };
    }
    
    await ctx.db.patch(args.videoId, updateData);
  },
});

export const updateVideoPostStatus = internalMutation({
  args: {
    videoId: v.id("generatedVideos"),
    tiktok: v.object({
      posted: v.boolean(),
      url: v.union(v.string(), v.null()),
    }),
    instagram: v.object({
      posted: v.boolean(),
      url: v.union(v.string(), v.null()),
    }),
    youtube: v.object({
      posted: v.boolean(),
      url: v.union(v.string(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    if (!video) return;
    
    const updateData: any = {};
    
    if (video.tiktokUpload) {
      updateData.tiktokUpload = {
        ...video.tiktokUpload,
        status: {
          ...video.tiktokUpload.status,
          isPosted: args.tiktok.posted,
        },
        post: {
          ...video.tiktokUpload.post,
          url: args.tiktok.url || video.tiktokUpload.post.url,
        },
      };
    }
    
    if (video.instagramUpload) {
      updateData.instagramUpload = {
        ...video.instagramUpload,
        status: {
          ...video.instagramUpload.status,
          isPosted: args.instagram.posted,
        },
        post: {
          ...video.instagramUpload.post,
          url: args.instagram.url || video.instagramUpload.post.url,
        },
      };
    }
    
    if (video.youtubeUpload) {
      updateData.youtubeUpload = {
        ...video.youtubeUpload,
        status: {
          ...video.youtubeUpload.status,
          isPosted: args.youtube.posted,
        },
        post: {
          ...video.youtubeUpload.post,
          url: args.youtube.url || video.youtubeUpload.post.url,
        },
      };
    }
    
    await ctx.db.patch(args.videoId, updateData);
  },
});