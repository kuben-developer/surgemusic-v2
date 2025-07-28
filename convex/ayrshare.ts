import { query, mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY || "";
const AYRSHARE_DOMAIN = "id-jgi1t";
const AYRSHARE_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAu4a0qAgreuASIYtTkmBvxQN7oQKuJ1yYw7wlQI+9eabDPwsZ
cwnlORHWIoRLu+CCShu0ks/8bqDWHwqOLHhwn35Arkgc04zrO99AGTJVcYmrebxv
KMjoPbzybAZvveL/7L4Fqq114a9+7s93tHGrULbyiqkOoYDZHaacnZUtiR1so9fa
O4ro+iQatyq7cM09W8qOCMPM/JaWb+ecB8e+13ELY6sqw0oZJbH3Y97xpG3nNYAz
jp5zIQz0+n28k1uVXL7HwP4WKNhc0GpsaAvaLoVQKftap9nMf4sFYFVldCtAFTsr
xNjzCmuXqz1Mvicv0ACCVtodF30mH1UF/T5v3wIDAQABAoIBAC4skAUj5djenXhG
/y/2sO642dMeftVQVokzpZSNECGJL2AxknWiBSAVRT3Ah4leUZZ/1emkbsqqra59
Ad7vVQPgqXqAZSCt/SoD4ZuSqjlHpcJW5KQNPCofgS2aNB90aoHXlDufdHw6oy2Y
RihXKNC6C2SbFfAscsl7QesHVWwCN9wGUQZG6RiafEj6SW4Y9eI4addPmftkUYRr
R26FJUvyqgiX1B9IVAFDigQtnGktC8rO/2nqxKyQvhLwEslSsGjQ8gvsP+Tl5YF8
8e858qwJc7awm2rwL9WR+eO3Xz4xyqchMhiApzqPuPXk5/qkIjWHi3JunwT8ciR5
nJXapTkCgYEA3DRUj72ySVSYObuiKaqBtB41cdEPtaHwyP20WxsfB2Brgk3iC+F4
UDbuzfS0HfOQc5NUuXX28E2i+fL5lTLqbtJa4BlGT5FO260MdmNdgHz/YKH0cU1E
FNvobJHdgutv67UXp8fJdBLTbuw6SNMqsZtNzflFqGu4/R7kmBCD2m0CgYEA2gJ9
1Trqk3BgWW6KIi4SfSYxqCTVfxsXT+KqHDvcEmWWaEYgPDqiwkrED8lQOatKGxkP
J+fKMlNmQhsbK04EIuJBl8f7Gy1ksXRMgPQzNt8xs2+HE49KtxZ6lIcvvD6xctoS
tjwwIf/wj9Zp3Vv8JXeRxVs/Lb+e7MhY7wEIA/sCgYEAiUGNG/Ov94llQUc1cyc2
paDWy1T2p86DGaUaEFe9ZYmyOYx2Q9WMeuNiwrmus6Sn+4JwIxHmlC6wUYAkFd2g
xucTge//JYV7U+5vgDO7imVfgUox5ZW1xBK2s0XQftRl9NPyJMChT1qUs+VHBzGo
wP/+5U5lHu/WZOAmuKpCpZkCgYB5rxJVRkFQclUVFeH8GgMv33WwCH8yJwjoCfgx
MigwDIvbP+kWNRRLpjexKAijZ7xBS8dt2q69UFevZjnP/gfJAMjj0zeRf9DIS8W3
5JYBdqrjIMkgXcayUtWwuZQnWkbpeFchaI7lK1o2rtMAPyuKLicrJTcqbd5jA6DA
Jq82qQKBgQDayUNw6aiEPbrZ5pPgnOPoMT25w1gM1kvH+BMtWF2zTMsFu4zXpmkb
09ZqgOQeeXDAfR8dEOytiIb/tIdQ4X2OGz9mRI+qamAxnOswYSppi/CrsfDu4C7n
WzxBTSvVZv7twqG3gFAPlCwvWNnQzJTpQBrFkdgD+obyI8sZjwvzeA==
-----END RSA PRIVATE KEY-----`;

export const getProfiles = query({
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

    const profiles = await ctx.db
      .query("ayrshareProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const profilesWithAccounts = await Promise.all(
      profiles.map(async (profile) => {
        const socialAccounts = await ctx.db
          .query("socialAccounts")
          .withIndex("by_ayrshareProfileId", (q) => q.eq("ayrshareProfileId", profile._id))
          .collect();

        return {
          ...profile,
          socialAccounts,
        };
      })
    );

    return profilesWithAccounts;
  },
});

export const checkProfiles = mutation({
  args: {
    profileName: v.string(),
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

    const profile = await ctx.db
      .query("ayrshareProfiles")
      .withIndex("by_profileName", (q) => q.eq("profileName", args.profileName))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Schedule action to check profile
    await ctx.scheduler.runAfter(0, api.ayrshare.checkProfileWithAPI, {
      profileId: profile._id,
      profileKey: profile.profileKey,
    });

    return { message: "Checking profile..." };
  },
});

export const createProfile = mutation({
  args: {
    profileName: v.string(),
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

    const profileName = args.profileName + "|" + crypto.randomUUID();

    // Schedule action to create profile via API
    await ctx.scheduler.runAfter(0, api.ayrshare.createProfileWithAPI, {
      profileName,
      userId: user._id,
    });

    return { message: "Creating profile..." };
  },
});

export const deleteProfileMutation = mutation({
  args: {
    profileName: v.string(),
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

    const profile = await ctx.db
      .query("ayrshareProfiles")
      .withIndex("by_profileName", (q) => q.eq("profileName", args.profileName))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    const socialAccounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_ayrshareProfileId", (q) => q.eq("ayrshareProfileId", profile._id))
      .collect();

    if (socialAccounts.length > 0) {
      throw new Error("Please unlink all social accounts before deleting this profile");
    }

    // Schedule action to delete profile via API
    await ctx.scheduler.runAfter(0, api.ayrshare.deleteProfileWithAPI, {
      profileId: profile._id,
      profileKey: profile.profileKey,
    });

    return { success: true };
  },
});

export const generateProfileManagerUrl = mutation({
  args: {
    profileKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Schedule action to generate URL
    await ctx.scheduler.runAfter(0, api.ayrshare.generateProfileManagerUrlWithAPI, {
      profileKey: args.profileKey,
    });

    return { message: "Generating profile manager URL..." };
  },
});

export const schedulePost = action({
  args: {
    schedules: v.array(v.object({
      videoId: v.string(),
      profileKey: v.string(),
      post: v.string(),
      platforms: v.array(v.string()),
      mediaUrls: v.array(v.string()),
      scheduleDate: v.string(),
      socialAccountIds: v.optional(v.record(v.string(), v.string())),
    }))
  },
  handler: async (ctx, args) => {
    const schedules = args.schedules;
    const startTime = Date.now();
    console.log(`[schedulePost] Starting to schedule ${schedules.length} videos at ${new Date().toISOString()}`);
    
    const videoIds = schedules.map(schedule => schedule.videoId);
    const existingVideos = await ctx.runQuery(internal.ayrshare.getVideosByIds, { videoIds });
    const existingVideoIds = new Set(existingVideos.map((v: any) => v._id));

    const processSchedule = async (schedule: typeof schedules[0]) => {
      const scheduleStartTime = Date.now();
      try {
        if (!existingVideoIds.has(schedule.videoId)) {
          console.log(`[schedulePost] Video ${schedule.videoId} not found - ${Date.now() - scheduleStartTime}ms`);
          return {
            videoId: schedule.videoId,
            success: false,
            error: `Video with ID ${schedule.videoId} not found`
          };
        }

        const apiStartTime = Date.now();
        const response = await fetch("https://api.ayrshare.com/api/post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
            "Profile-Key": schedule.profileKey
          },
          body: JSON.stringify({
            post: schedule.post,
            platforms: schedule.platforms,
            mediaUrls: schedule.mediaUrls,
            scheduleDate: schedule.scheduleDate,
          }),
        });

        const result = await response.json();
        console.log(`[schedulePost] Ayrshare API call for video ${schedule.videoId} took ${Date.now() - apiStartTime}ms`);

        if (!response.ok || result.posts.length === 0 || result.posts[0].status !== "scheduled") {
          throw new Error(JSON.stringify(result, null, 2) || "Failed to schedule post");
        }

        const socialAccountIds = schedule.socialAccountIds && Object.keys(schedule.socialAccountIds).length > 0
          ? Object.values(schedule.socialAccountIds).filter(id => id && id.trim() !== '')
          : [];

        await ctx.runMutation(internal.ayrshare.updateVideoSchedule, {
          videoId: schedule.videoId,
          scheduledAt: new Date(schedule.scheduleDate).getTime(),
          postId: result.posts[0].id,
          refId: result.posts[0].refId,
          postCaption: result.posts[0].post,
          socialAccountIds,
        });

        console.log(`[schedulePost] Successfully scheduled video ${schedule.videoId} - total time: ${Date.now() - scheduleStartTime}ms`);
        return {
          videoId: schedule.videoId,
          success: true
        };
      } catch (updateError) {
        console.error(`[schedulePost] Error scheduling video ${schedule.videoId} after ${Date.now() - scheduleStartTime}ms:`, updateError);
        return {
          videoId: schedule.videoId,
          success: false,
          error: updateError instanceof Error ? updateError.message : String(updateError)
        };
      }
    };

    const CONCURRENT_LIMIT = 5;
    const results: Array<{
      videoId: string;
      success: boolean;
      error?: string;
    }> = [];
    
    console.log(`[schedulePost] Processing ${schedules.length} schedules with concurrency limit of ${CONCURRENT_LIMIT}`);
    
    for (let i = 0; i < schedules.length; i += CONCURRENT_LIMIT) {
      const batch = schedules.slice(i, i + CONCURRENT_LIMIT);
      const batchStartTime = Date.now();
      console.log(`[schedulePost] Processing batch ${Math.floor(i / CONCURRENT_LIMIT) + 1}/${Math.ceil(schedules.length / CONCURRENT_LIMIT)} (${batch.length} items)`);
      
      const batchResults = await Promise.allSettled(
        batch.map(schedule => processSchedule(schedule))
      );
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`[schedulePost] Unexpected error in batch processing:`, result.reason);
          results.push({
            videoId: 'unknown',
            success: false,
            error: 'Unexpected error during processing'
          });
        }
      });
      
      console.log(`[schedulePost] Batch ${Math.floor(i / CONCURRENT_LIMIT) + 1} completed in ${Date.now() - batchStartTime}ms`);
    }

    if (results.length > 0 && results.every(r => !r.success)) {
      console.log("[schedulePost] All videos failed:", results);
      throw new Error("Failed to schedule any posts");
    }

    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`[schedulePost] Completed scheduling ${schedules.length} videos in ${totalTime}ms`);
    console.log(`[schedulePost] Success: ${successCount}, Failed: ${failureCount}`);
    console.log(`[schedulePost] Average time per video: ${Math.round(totalTime / schedules.length)}ms`);

    return {
      success: results.some(r => r.success),
      message: `Scheduled ${successCount} posts successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      results,
      performanceMetrics: {
        totalTimeMs: totalTime,
        totalVideos: schedules.length,
        successCount,
        failureCount,
        averageTimePerVideo: Math.round(totalTime / schedules.length)
      }
    };
  },
});

export const unschedulePost = mutation({
  args: {
    postIds: v.array(v.string()),
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

    // Schedule action to unschedule posts
    await ctx.scheduler.runAfter(0, api.ayrshare.unschedulePostsWithAPI, {
      postIds: args.postIds,
      userId: user._id,
    });

    return { message: "Unscheduling posts..." };
  },
});

// Internal actions that make external API calls
export const checkProfileWithAPI = action({
  args: {
    profileId: v.id("ayrshareProfiles"),
    profileKey: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch("https://api.ayrshare.com/api/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
        "Profile-Key": args.profileKey
      },
    });

    const result = await response.json();
    
    if (result.message === "Some profiles not found. Please verify the Profile Keys.") {
      await ctx.runMutation(internal.ayrshare.deleteProfileAndAccounts, {
        profileId: args.profileId,
      });
      return { message: "Deleted" };
    }

    if (!response.ok) {
      throw new Error(result.message || "Failed to check Ayrshare profile");
    }

    return { message: "All Good" };
  },
});

export const createProfileWithAPI = action({
  args: {
    profileName: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const response = await fetch("https://api.ayrshare.com/api/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`
      },
      body: JSON.stringify({
        title: args.profileName,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create Ayrshare profile");
    }

    await ctx.runMutation(internal.ayrshare.saveProfile, {
      profileName: args.profileName,
      profileKey: result.profileKey,
      userId: args.userId,
    });

    return { success: true };
  },
});

export const deleteProfileWithAPI = action({
  args: {
    profileId: v.id("ayrshareProfiles"),
    profileKey: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch("https://api.ayrshare.com/api/profiles", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
        "Profile-Key": args.profileKey
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete Ayrshare profile");
    }

    await ctx.runMutation(internal.ayrshare.deleteProfileAndAccounts, {
      profileId: args.profileId,
    });

    return { success: true };
  },
});

export const generateProfileManagerUrlWithAPI = action({
  args: {
    profileKey: v.string(),
  },
  handler: async (_ctx, args) => {
    const response = await fetch("https://api.ayrshare.com/api/profiles/generateJWT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`
      },
      body: JSON.stringify({
        domain: AYRSHARE_DOMAIN,
        privateKey: AYRSHARE_PRIVATE_KEY,
        profileKey: args.profileKey,
        logout: true
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to generate profile manager URL");
    }

    return { url: result.url };
  },
});

export const unschedulePostsWithAPI = action({
  args: {
    postIds: v.array(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log(`[unschedulePost] Starting to unschedule ${args.postIds.length} posts`);
    
    // Get videos with the given postIds
    const videos = await ctx.runQuery(internal.ayrshare.getVideosByPostIds, {
      postIds: args.postIds,
      userId: args.userId,
    });

    if (videos.length === 0) {
      throw new Error("No videos found with the provided postIds");
    }

    // Group videos by profile key
    const videosByProfile = new Map<string, any[]>();
    
    for (const video of videos) {
      // Get profile key from the first scheduled platform
      let profileKey: string | null = null;

      if (video.tiktokUpload?.socialAccountId) {
        const account = await ctx.runQuery(internal.ayrshare.getSocialAccountWithProfile, {
          accountId: video.tiktokUpload.socialAccountId,
        });
        if (account) {
          profileKey = account.profile.profileKey;
        }
      }

      if (!profileKey) {
        console.warn(`Skipping video without profile key: ${video._id}`);
        continue;
      }

      if (!videosByProfile.has(profileKey)) {
        videosByProfile.set(profileKey, []);
      }
      videosByProfile.get(profileKey)!.push(video);
    }

    const results: { postId: string; success: boolean; error?: string }[] = [];

    // Process each profile group
    for (const [profileKey, profileVideos] of videosByProfile) {
      const postIdsToDelete = profileVideos
        .map(v => v.tiktokUpload?.post?.id || v.instagramUpload?.post?.id || v.youtubeUpload?.post?.id)
        .filter((id): id is string => id !== null);
      
      if (postIdsToDelete.length === 0) continue;

      console.log(`[unschedulePost] Calling Ayrshare API to delete ${postIdsToDelete.length} posts for profile ${profileKey}`);
      
      try {
        const deleteBody = postIdsToDelete.length === 1 
          ? { id: postIdsToDelete[0] }
          : { bulk: postIdsToDelete };

        const response = await fetch("https://api.ayrshare.com/api/post", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
            "Profile-Key": profileKey
          },
          body: JSON.stringify(deleteBody),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to unschedule posts from Ayrshare");
        }

        console.log(`[unschedulePost] Successfully deleted from Ayrshare, updating database`);

        // Update videos in database
        const videoIds = profileVideos.map(v => v._id);
        await ctx.runMutation(internal.ayrshare.clearVideoSchedules, {
          videoIds,
        });

        // Add success results
        postIdsToDelete.forEach(postId => {
          results.push({ postId, success: true });
        });

      } catch (error) {
        console.error(`[unschedulePost] Error for profile ${profileKey}:`, error);
        postIdsToDelete.forEach(postId => {
          results.push({ 
            postId, 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          });
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`[unschedulePost] Completed: ${successCount} success, ${failureCount} failed`);
    
    return {
      success: successCount > 0,
      message: `Unscheduled ${successCount} posts${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      results,
    };
  },
});

// Internal queries and mutations
export const getVideosByIds = internalQuery({
  args: { videoIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const videos = [];
    for (const id of args.videoIds) {
      try {
        const video = await ctx.db.get(id as any);
        if (video) {
          videos.push(video);
        }
      } catch (error) {
        console.error(`Failed to get video ${id}:`, error);
      }
    }
    return videos;
  },
});

export const getVideosByPostIds = internalQuery({
  args: {
    postIds: v.array(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allVideos = await ctx.db
      .query("generatedVideos")
      .collect();

    return allVideos.filter(video => {
      // Check if video belongs to user's campaign
      const hasPostId = args.postIds.some(postId => 
        video.tiktokUpload?.post?.id === postId ||
        video.instagramUpload?.post?.id === postId ||
        video.youtubeUpload?.post?.id === postId
      );

      return hasPostId;
    });
  },
});

export const getSocialAccountWithProfile = internalQuery({
  args: {
    accountId: v.id("socialAccounts"),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) return null;

    const profile = await ctx.db.get(account.ayrshareProfileId);
    if (!profile) return null;

    return {
      account,
      profile,
    };
  },
});

export const updateVideoSchedule = internalMutation({
  args: {
    videoId: v.string(),
    scheduledAt: v.number(),
    postId: v.string(),
    refId: v.optional(v.string()),
    postCaption: v.string(),
    socialAccountIds: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    // This is a placeholder - actual implementation depends on video schema
    console.log("updateVideoSchedule called with:", args);
    
    // In a real implementation, you would:
    // 1. Get the video by ID
    // 2. Determine which platforms to update based on socialAccountIds
    // 3. Update the appropriate upload objects (tiktokUpload, instagramUpload, etc.)
  },
});

export const deleteProfileAndAccounts = internalMutation({
  args: {
    profileId: v.id("ayrshareProfiles"),
  },
  handler: async (ctx, args) => {
    const socialAccounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_ayrshareProfileId", (q) => q.eq("ayrshareProfileId", args.profileId))
      .collect();

    for (const account of socialAccounts) {
      await ctx.db.delete(account._id);
    }

    await ctx.db.delete(args.profileId);
  },
});

export const saveProfile = internalMutation({
  args: {
    profileName: v.string(),
    profileKey: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("ayrshareProfiles", {
      profileName: args.profileName,
      profileKey: args.profileKey,
      userId: args.userId,
    });
  },
});

export const deleteProfileInternal = internalMutation({
  args: {
    profileId: v.id("ayrshareProfiles"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.profileId);
  },
});

export const clearVideoSchedules = internalMutation({
  args: {
    videoIds: v.array(v.id("generatedVideos")),
  },
  handler: async (ctx, args) => {
    for (const videoId of args.videoIds) {
      const video = await ctx.db.get(videoId);
      if (!video) continue;

      const updateData: any = {};

      // Clear schedule data for each platform
      if (video.tiktokUpload) {
        updateData.tiktokUpload = {
          ...video.tiktokUpload,
          scheduledAt: undefined,
          post: {
            ...video.tiktokUpload.post,
            id: "",
            refId: undefined,
          },
        };
      }

      if (video.instagramUpload) {
        updateData.instagramUpload = {
          ...video.instagramUpload,
          scheduledAt: undefined,
          post: {
            ...video.instagramUpload.post,
            id: "",
            refId: undefined,
          },
        };
      }

      if (video.youtubeUpload) {
        updateData.youtubeUpload = {
          ...video.youtubeUpload,
          scheduledAt: undefined,
          post: {
            ...video.youtubeUpload.post,
            id: "",
            refId: undefined,
          },
        };
      }

      await ctx.db.patch(videoId, updateData);
    }
  },
});
