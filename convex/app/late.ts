import { query, action, internalMutation, internalQuery, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import type { Doc, Id } from "../_generated/dataModel";

const LATE_API_KEY = process.env.LATE_API_KEY || "";
const LATE_API_BASE_URL = "https://getlate.dev/api/v1";

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
      .query("lateProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const profilesWithAccounts = await Promise.all(
      profiles.map(async (profile) => {
        const socialAccounts = await ctx.db
          .query("lateSocialAccounts")
          .withIndex("by_lateProfileId", (q) => q.eq("lateProfileId", profile._id))
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

export const createProfile = action({
  args: {
    profileName: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(internal.app.late.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Create profile via Late API
    const response = await fetch(`${LATE_API_BASE_URL}/profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LATE_API_KEY}`,
      },
      body: JSON.stringify({
        name: args.profileName,
        description: args.description || "",
        color: args.color || "#ffeda0",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error.message || "Failed to create Late profile");
    }

    await ctx.runMutation(internal.app.late.saveProfile, {
      profileName: args.profileName,
      lateProfileId: result.profile._id,
      userId: user._id,
    });

    return { success: true, profile: result.profile };
  },
});

export const deleteProfile = action({
  args: {
    profileId: v.id("lateProfiles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(internal.app.late.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const profile = await ctx.runQuery(internal.app.late.getProfileById, {
      profileId: args.profileId,
    });

    if (!profile || profile.userId !== user._id) {
      throw new Error("Profile not found or access denied");
    }

    const socialAccounts = await ctx.runQuery(internal.app.late.getSocialAccountsForProfile, {
      profileId: args.profileId,
    });

    if (socialAccounts.length > 0) {
      throw new Error("Please disconnect all social accounts before deleting this profile");
    }

    // Delete profile from Late API
    const response = await fetch(`${LATE_API_BASE_URL}/profiles/${profile.lateProfileId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LATE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Failed to delete Late profile");
    }

    await ctx.runMutation(internal.app.late.deleteProfileAndAccounts, {
      profileId: args.profileId,
    });

    return { success: true };
  },
});

export const generateConnectUrl = action({
  args: {
    profileId: v.id("lateProfiles"),
    platform: v.union(v.literal("tiktok"), v.literal("instagram"), v.literal("youtube")),
    redirectUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const profile: Doc<"lateProfiles"> | null = await ctx.runQuery(internal.app.late.getProfileById, {
      profileId: args.profileId,
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Build the Late API connect URL
    const params: URLSearchParams = new URLSearchParams({
      profileId: profile.lateProfileId,
    });

    if (args.redirectUrl) {
      params.append("redirect_url", args.redirectUrl);
    }

    const connectUrl = `${LATE_API_BASE_URL}/connect/${args.platform}?${params.toString()}`;

    // Call Late API to get the OAuth authorization URL
    const response = await fetch(connectUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${LATE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate connection URL");
    }

    const data = await response.json();

    // Return the authUrl that the client should redirect to
    if (!data.authUrl) {
      throw new Error("No auth URL received from Late API");
    }

    return { url: data.authUrl };
  },
});

export const syncAccountsAfterOAuth = action({
  args: {
    profileId: v.id("lateProfiles"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; accountCount: number }> => {
    try {
      console.log("[syncAccountsAfterOAuth] Starting sync for profileId:", args.profileId);

      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      const profile: Doc<"lateProfiles"> | null = await ctx.runQuery(internal.app.late.getProfileById, {
        profileId: args.profileId,
      });

      if (!profile) {
        throw new Error(`Profile not found: ${args.profileId}`);
      }

      console.log("[syncAccountsAfterOAuth] Found profile:", profile._id, "Late profile ID:", profile.lateProfileId);

      // Fetch accounts from Late API
      const url = `${LATE_API_BASE_URL}/accounts?profileId=${profile.lateProfileId}`;
      console.log("[syncAccountsAfterOAuth] Fetching accounts from:", url);

      const response: Response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${LATE_API_KEY}`,
        },
      });

      console.log("[syncAccountsAfterOAuth] Late API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[syncAccountsAfterOAuth] Late API error:", errorText);
        let error: { error?: string } = {};
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText };
        }
        throw new Error(`Late API error (${response.status}): ${error.error || errorText}`);
      }

      const data = await response.json() as {
        accounts?: Array<{
          _id: string;
          platform: string;
          username: string;
          displayName?: string;
          profilePicture?: string;
          profileUrl?: string;
        }>
      };

      console.log("[syncAccountsAfterOAuth] Received accounts:", data.accounts?.length || 0);

      if (!data.accounts || !Array.isArray(data.accounts)) {
        throw new Error("Invalid response from Late API: missing or invalid accounts array");
      }

      // Store accounts in database
      for (const account of data.accounts) {
        console.log("[syncAccountsAfterOAuth] Processing account:", account._id, account.platform, account.username);

        // Check if account already exists
        const existing = await ctx.runQuery(internal.app.late.getAccountByLateId, {
          lateAccountId: account._id,
        });

        if (!existing) {
          console.log("[syncAccountsAfterOAuth] Creating new account:", account._id);
          await ctx.runMutation(internal.app.late.saveAccount, {
            lateProfileId: args.profileId,
            lateAccountId: account._id,
            platform: account.platform as "tiktok" | "instagram" | "youtube",
            profileUrl: account.profileUrl || "",
            userImage: account.profilePicture || "",
            username: account.username,
            displayName: account.displayName || account.username,
          });
        } else {
          console.log("[syncAccountsAfterOAuth] Account already exists:", account._id);
        }
      }

      console.log("[syncAccountsAfterOAuth] Sync completed successfully");
      return { success: true, accountCount: data.accounts.length };
    } catch (error) {
      console.error("[syncAccountsAfterOAuth] Error:", error);
      throw error;
    }
  },
});

export const syncLateProfilesAndAccounts = action({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    syncedProfiles: number;
    syncedAccounts: number;
    message: string;
  }> => {
    try {
      console.log("[syncLateProfilesAndAccounts] Starting sync");

      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      const user = await ctx.runQuery(internal.app.late.getUserByClerkId, {
        clerkId: identity.subject,
      });

      if (!user) {
        throw new Error("User not found");
      }

      let syncedProfilesCount = 0;
      let syncedAccountsCount = 0;

      // Fetch all profiles from Late API
      const profilesUrl = `${LATE_API_BASE_URL}/profiles`;
      console.log("[syncLateProfilesAndAccounts] Fetching profiles from:", profilesUrl);

      const profilesResponse = await fetch(profilesUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${LATE_API_KEY}`,
        },
      });

      if (!profilesResponse.ok) {
        const errorText = await profilesResponse.text();
        console.error("[syncLateProfilesAndAccounts] Late API profiles error:", errorText);
        throw new Error(`Failed to fetch profiles from Late API: ${errorText}`);
      }

      const profilesData = await profilesResponse.json() as {
        profiles?: Array<{
          _id: string;
          name: string;
          description?: string;
          color?: string;
          isDefault?: boolean;
          createdAt?: string;
        }>
      };

      if (!profilesData.profiles || !Array.isArray(profilesData.profiles)) {
        throw new Error("Invalid response from Late API: missing or invalid profiles array");
      }

      console.log("[syncLateProfilesAndAccounts] Received profiles:", profilesData.profiles.length);

      // Sync each profile
      for (const lateProfile of profilesData.profiles) {
        console.log("[syncLateProfilesAndAccounts] Processing profile:", lateProfile._id, lateProfile.name);

        // Check if profile exists in our database
        const existingProfile = await ctx.runQuery(internal.app.late.getProfileByLateProfileId, {
          lateProfileId: lateProfile._id,
        });

        if (!existingProfile) {
          // Insert new profile
          console.log("[syncLateProfilesAndAccounts] Creating new profile:", lateProfile._id);
          await ctx.runMutation(internal.app.late.saveProfile, {
            profileName: lateProfile.name,
            lateProfileId: lateProfile._id,
            userId: user._id,
          });
          syncedProfilesCount++;
        } else {
          // Update profile name if different
          if (existingProfile.profileName !== lateProfile.name) {
            console.log("[syncLateProfilesAndAccounts] Updating profile name:", existingProfile._id, "from", existingProfile.profileName, "to", lateProfile.name);
            await ctx.runMutation(internal.app.late.updateProfileName, {
              profileId: existingProfile._id,
              profileName: lateProfile.name,
            });
          }
          syncedProfilesCount++;
        }

        // Fetch accounts for this profile
        const accountsUrl = `${LATE_API_BASE_URL}/accounts?profileId=${lateProfile._id}`;
        console.log("[syncLateProfilesAndAccounts] Fetching accounts from:", accountsUrl);

        const accountsResponse = await fetch(accountsUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${LATE_API_KEY}`,
          },
        });

        if (!accountsResponse.ok) {
          const errorText = await accountsResponse.text();
          console.error("[syncLateProfilesAndAccounts] Late API accounts error:", errorText);
          // Continue with next profile instead of failing completely
          continue;
        }

        const accountsData = await accountsResponse.json() as {
          accounts?: Array<{
            _id: string;
            profileId: string;
            platform: string;
            username: string;
            displayName?: string;
            profilePicture?: string;
            profileUrl?: string;
            isActive?: boolean;
          }>
        };

        if (!accountsData.accounts || !Array.isArray(accountsData.accounts)) {
          console.warn("[syncLateProfilesAndAccounts] Invalid accounts response for profile:", lateProfile._id);
          continue;
        }

        console.log("[syncLateProfilesAndAccounts] Received accounts:", accountsData.accounts.length);

        // Get the profile ID from our database (either the newly created one or the existing one)
        const ourProfile = await ctx.runQuery(internal.app.late.getProfileByLateProfileId, {
          lateProfileId: lateProfile._id,
        });

        if (!ourProfile) {
          console.error("[syncLateProfilesAndAccounts] Could not find profile in our database:", lateProfile._id);
          continue;
        }

        // Sync each account
        for (const lateAccount of accountsData.accounts) {
          // Only sync supported platforms
          if (!["tiktok", "instagram", "youtube"].includes(lateAccount.platform)) {
            console.log("[syncLateProfilesAndAccounts] Skipping unsupported platform:", lateAccount.platform);
            continue;
          }

          console.log("[syncLateProfilesAndAccounts] Processing account:", lateAccount._id, lateAccount.platform, lateAccount.username);

          // Check if account exists in our database
          const existingAccount = await ctx.runQuery(internal.app.late.getAccountByLateId, {
            lateAccountId: lateAccount._id,
          });

          if (!existingAccount) {
            // Insert new account
            console.log("[syncLateProfilesAndAccounts] Creating new account:", lateAccount._id);
            await ctx.runMutation(internal.app.late.saveAccount, {
              lateProfileId: ourProfile._id,
              lateAccountId: lateAccount._id,
              platform: lateAccount.platform as "tiktok" | "instagram" | "youtube",
              profileUrl: lateAccount.profileUrl || "",
              userImage: lateAccount.profilePicture || "",
              username: lateAccount.username,
              displayName: lateAccount.displayName || lateAccount.username,
            });
            syncedAccountsCount++;
          } else {
            // Patch account to ensure it's up to date
            console.log("[syncLateProfilesAndAccounts] Updating account:", lateAccount._id);
            await ctx.runMutation(internal.app.late.patchAccount, {
              accountId: existingAccount._id,
              profileUrl: lateAccount.profileUrl || "",
              userImage: lateAccount.profilePicture || "",
              username: lateAccount.username,
              displayName: lateAccount.displayName || lateAccount.username,
            });
            syncedAccountsCount++;
          }
        }
      }

      console.log("[syncLateProfilesAndAccounts] Sync completed successfully");
      return {
        success: true,
        syncedProfiles: syncedProfilesCount,
        syncedAccounts: syncedAccountsCount,
        message: `Synced ${syncedProfilesCount} profiles and ${syncedAccountsCount} accounts`,
      };
    } catch (error) {
      console.error("[syncLateProfilesAndAccounts] Error:", error);
      throw error;
    }
  },
});

export const schedulePost = action({
  args: {
    schedules: v.array(v.object({
      videoId: v.string(),
      lateProfileId: v.string(),
      content: v.string(),
      platforms: v.array(v.object({
        platform: v.string(),
        accountId: v.string(),
      })),
      mediaItems: v.array(v.object({
        type: v.string(),
        url: v.string(),
      })),
      scheduleDate: v.string(),
      socialAccountIds: v.optional(v.record(v.string(), v.string())),
    }))
  },
  handler: async (ctx, args) => {
    const schedules = args.schedules;
    const startTime = Date.now();
    console.log(`[Late schedulePost] Starting to schedule ${schedules.length} videos at ${new Date().toISOString()}`);

    const videoIds = schedules.map(schedule => schedule.videoId);
    const existingVideos = await ctx.runQuery(internal.app.late.getVideosByIds, { videoIds });
    const existingVideoIds = new Set(existingVideos.map((v: any) => v._id));

    const processSchedule = async (schedule: typeof schedules[0]) => {
      const scheduleStartTime = Date.now();
      try {
        if (!existingVideoIds.has(schedule.videoId)) {
          console.log(`[Late schedulePost] Video ${schedule.videoId} not found - ${Date.now() - scheduleStartTime}ms`);
          return {
            videoId: schedule.videoId,
            success: false,
            error: `Video with ID ${schedule.videoId} not found`
          };
        }

        const apiStartTime = Date.now();
        const response = await fetch(`${LATE_API_BASE_URL}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LATE_API_KEY}`,
          },
          body: JSON.stringify({
            content: schedule.content,
            platforms: schedule.platforms,
            mediaItems: schedule.mediaItems,
            scheduledFor: schedule.scheduleDate,
            timezone: "UTC",
          }),
        });

        const result = await response.json();
        console.log(`[Late schedulePost] Late API call for video ${schedule.videoId} took ${Date.now() - apiStartTime}ms`);

        if (!response.ok || !result.post) {
          throw new Error(JSON.stringify(result, null, 2) || "Failed to schedule post");
        }

        const socialAccountIds = schedule.socialAccountIds && Object.keys(schedule.socialAccountIds).length > 0
          ? Object.values(schedule.socialAccountIds).filter(id => id && id.trim() !== '')
          : [];

        await ctx.runMutation(internal.app.late.updateVideoSchedule, {
          videoId: schedule.videoId,
          scheduledAt: new Date(schedule.scheduleDate).getTime(),
          postId: result.post._id,
          postCaption: result.post.content,
          socialAccountIds,
        });

        console.log(`[Late schedulePost] Successfully scheduled video ${schedule.videoId} - total time: ${Date.now() - scheduleStartTime}ms`);
        return {
          videoId: schedule.videoId,
          success: true
        };
      } catch (updateError) {
        console.error(`[Late schedulePost] Error scheduling video ${schedule.videoId} after ${Date.now() - scheduleStartTime}ms:`, updateError);
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

    console.log(`[Late schedulePost] Processing ${schedules.length} schedules with concurrency limit of ${CONCURRENT_LIMIT}`);

    for (let i = 0; i < schedules.length; i += CONCURRENT_LIMIT) {
      const batch = schedules.slice(i, i + CONCURRENT_LIMIT);
      const batchStartTime = Date.now();
      console.log(`[Late schedulePost] Processing batch ${Math.floor(i / CONCURRENT_LIMIT) + 1}/${Math.ceil(schedules.length / CONCURRENT_LIMIT)} (${batch.length} items)`);

      const batchResults = await Promise.allSettled(
        batch.map(schedule => processSchedule(schedule))
      );

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`[Late schedulePost] Unexpected error in batch processing:`, result.reason);
          results.push({
            videoId: 'unknown',
            success: false,
            error: 'Unexpected error during processing'
          });
        }
      });

      console.log(`[Late schedulePost] Batch ${Math.floor(i / CONCURRENT_LIMIT) + 1} completed in ${Date.now() - batchStartTime}ms`);
    }

    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`[Late schedulePost] Completed scheduling ${schedules.length} videos in ${totalTime}ms`);
    console.log(`[Late schedulePost] Success: ${successCount}, Failed: ${failureCount}`);

    const success = results.some(r => r.success);
    const message = success
      ? `Scheduled ${successCount} posts successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`
      : "Failed to schedule any posts";

    return {
      success,
      message,
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

export const unschedulePost = action({
  args: {
    postIds: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    message: string;
    results: { postId: string; success: boolean; error?: string }[];
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(internal.app.late.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const result: {
      success: boolean;
      message: string;
      results: { postId: string; success: boolean; error?: string }[];
    } = await ctx.runAction(api.app.late.unschedulePostsWithAPI, {
      postIds: args.postIds,
      userId: user._id,
    });

    return result;
  },
});

export const unschedulePostsWithAPI = action({
  args: {
    postIds: v.array(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log(`[Late unschedulePost] Starting to unschedule ${args.postIds.length} posts`);

    const videos = await ctx.runQuery(internal.app.late.getVideosByPostIds, {
      postIds: args.postIds,
      userId: args.userId,
    });

    if (videos.length === 0) {
      throw new Error("No videos found with the provided postIds");
    }

    const results: { postId: string; success: boolean; error?: string }[] = [];

    for (const video of videos) {
      const postId = video.lateTiktokUpload?.post?.id ||
                     video.lateInstagramUpload?.post?.id ||
                     video.lateYoutubeUpload?.post?.id;

      if (!postId) continue;

      try {
        const response = await fetch(`${LATE_API_BASE_URL}/posts/${postId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LATE_API_KEY}`,
          },
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Failed to unschedule post from Late");
        }

        await ctx.runMutation(internal.app.late.clearVideoSchedules, {
          videoIds: [video._id],
        });

        results.push({ postId, success: true });
      } catch (error) {
        console.error(`[Late unschedulePost] Error for postId ${postId}:`, error);
        results.push({
          postId,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      success: successCount > 0,
      message: `Unscheduled ${successCount} posts${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      results,
    };
  },
});

// Monitor API posted videos and fetch analytics from Late
export const monitorLatePostedVideos = internalAction({
  args: {},
  handler: async (ctx) => {
    const BATCH_SIZE = 50;

    const generatedVideos = await ctx.runQuery(internal.app.late.getPostedGeneratedVideos);

    for (let i = 0; i < generatedVideos.length; i += BATCH_SIZE) {
      const batch = generatedVideos.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (video) => {
          const campaign = await ctx.runQuery(internal.app.late.getCampaignById, {
            campaignId: video.campaignId
          });

          if (!campaign) {
            console.error(`Campaign not found for video ${video._id}`);
            return;
          }

          const platforms: Array<{
            platform: "tiktok" | "instagram" | "youtube",
            upload: NonNullable<typeof video.lateTiktokUpload | typeof video.lateInstagramUpload | typeof video.lateYoutubeUpload>
          }> = [];

          if (video.lateTiktokUpload?.status.isPosted && video.lateTiktokUpload.post.id) {
            platforms.push({ platform: "tiktok", upload: video.lateTiktokUpload });
          }
          if (video.lateInstagramUpload?.status.isPosted && video.lateInstagramUpload.post.id) {
            platforms.push({ platform: "instagram", upload: video.lateInstagramUpload });
          }
          if (video.lateYoutubeUpload?.status.isPosted && video.lateYoutubeUpload.post.id) {
            platforms.push({ platform: "youtube", upload: video.lateYoutubeUpload });
          }

          for (const { platform, upload } of platforms) {
            try {
              // Fetch analytics from Late API
              // Note: Late API doesn't have a direct analytics endpoint like Ayrshare
              // We would need to implement custom analytics tracking or use Late's usage stats
              // For now, we'll store basic post data and update it when available

              const response = await fetch(`${LATE_API_BASE_URL}/posts/${upload.post.id}`, {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${LATE_API_KEY}`,
                  "Content-Type": "application/json",
                },
              });

              if (!response.ok) {
                if (response.status === 429) {
                  console.warn(`Rate limited for post ${upload.post.id}`);
                  continue;
                }
                throw new Error(`Failed to fetch post: ${response.statusText}`);
              }

              const data = await response.json();

              // Store basic post data (Late doesn't provide detailed analytics like Ayrshare)
              await ctx.runMutation(internal.app.late.storeLatePostedVideo, {
                campaignId: video.campaignId,
                userId: campaign.userId,
                socialPlatform: platform,
                videoId: data.post._id || upload.post.id,
                postedAt: data.post._creationTime
                  ? Math.floor(new Date(data.post._creationTime).getTime() / 1000)
                  : Math.floor(upload.scheduledAt / 1000),
                videoUrl: data.post.platforms?.[0]?.platformPostUrl || upload.post.url || "",
                thumbnailUrl: video.video.url,
                mediaUrl: undefined,
                views: 0, // Late doesn't provide analytics
                likes: 0,
                comments: 0,
                shares: 0,
                saves: 0,
              });

            } catch (error) {
              console.error(`Error processing Late ${platform} for video ${video._id}:`, error);
            }
          }
        })
      );
    }
  },
});

// Internal queries and mutations
export const getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    return user;
  },
});

export const getProfileById = internalQuery({
  args: { profileId: v.id("lateProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.profileId);
  },
});

export const getSocialAccountsForProfile = internalQuery({
  args: { profileId: v.id("lateProfiles") },
  handler: async (ctx, args) => {
    const socialAccounts = await ctx.db
      .query("lateSocialAccounts")
      .withIndex("by_lateProfileId", (q) => q.eq("lateProfileId", args.profileId))
      .collect();
    return socialAccounts;
  },
});

export const saveProfile = internalMutation({
  args: {
    profileName: v.string(),
    lateProfileId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("lateProfiles", {
      profileName: args.profileName,
      lateProfileId: args.lateProfileId,
      userId: args.userId,
    });
  },
});

export const updateProfileName = internalMutation({
  args: {
    profileId: v.id("lateProfiles"),
    profileName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      profileName: args.profileName,
    });
  },
});

export const deleteProfileAndAccounts = internalMutation({
  args: {
    profileId: v.id("lateProfiles"),
  },
  handler: async (ctx, args) => {
    const socialAccounts = await ctx.db
      .query("lateSocialAccounts")
      .withIndex("by_lateProfileId", (q) => q.eq("lateProfileId", args.profileId))
      .collect();

    for (const account of socialAccounts) {
      await ctx.db.delete(account._id);
    }

    await ctx.db.delete(args.profileId);
  },
});

export const getAccountByLateId = internalQuery({
  args: {
    lateAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("lateSocialAccounts")
      .withIndex("by_lateAccountId", (q) => q.eq("lateAccountId", args.lateAccountId))
      .first();
    return account;
  },
});

export const getProfileByLateProfileId = internalQuery({
  args: {
    lateProfileId: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("lateProfiles")
      .withIndex("by_lateProfileId", (q) => q.eq("lateProfileId", args.lateProfileId))
      .unique();
    return profile;
  },
});

export const saveAccount = internalMutation({
  args: {
    lateProfileId: v.id("lateProfiles"),
    lateAccountId: v.string(),
    platform: v.union(v.literal("tiktok"), v.literal("instagram"), v.literal("youtube")),
    profileUrl: v.string(),
    userImage: v.string(),
    username: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("lateSocialAccounts", {
      lateProfileId: args.lateProfileId,
      lateAccountId: args.lateAccountId,
      platform: args.platform,
      profileUrl: args.profileUrl,
      userImage: args.userImage,
      username: args.username,
      displayName: args.displayName,
    });
  },
});

export const patchAccount = internalMutation({
  args: {
    accountId: v.id("lateSocialAccounts"),
    profileUrl: v.string(),
    userImage: v.string(),
    username: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.accountId, {
      profileUrl: args.profileUrl,
      userImage: args.userImage,
      username: args.username,
      displayName: args.displayName,
    });
  },
});

export const deleteSocialAccount = internalMutation({
  args: {
    accountId: v.id("lateSocialAccounts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.accountId);
  },
});

export const disconnectAccount = action({
  args: {
    accountId: v.id("lateSocialAccounts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(internal.app.late.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get the account details
    const account = await ctx.runQuery(internal.app.late.getSocialAccountById, {
      accountId: args.accountId,
    });

    if (!account) {
      throw new Error("Social account not found");
    }

    // Verify the account belongs to the user's profile
    const profile = await ctx.runQuery(internal.app.late.getProfileById, {
      profileId: account.lateProfileId,
    });

    if (!profile || profile.userId !== user._id) {
      throw new Error("Account not found or access denied");
    }

    // Disconnect from Late API
    const response = await fetch(`${LATE_API_BASE_URL}/accounts/${account.lateAccountId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${LATE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to disconnect account from Late API");
    }

    // Delete from our database
    await ctx.runMutation(internal.app.late.deleteSocialAccount, {
      accountId: args.accountId,
    });

    return { success: true };
  },
});

export const getSocialAccountById = internalQuery({
  args: {
    accountId: v.id("lateSocialAccounts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.accountId);
  },
});

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
      const hasPostId = args.postIds.some(postId =>
        video.lateTiktokUpload?.post?.id === postId ||
        video.lateInstagramUpload?.post?.id === postId ||
        video.lateYoutubeUpload?.post?.id === postId
      );

      return hasPostId;
    });
  },
});

export const updateVideoSchedule = internalMutation({
  args: {
    videoId: v.string(),
    scheduledAt: v.number(),
    postId: v.string(),
    postCaption: v.string(),
    socialAccountIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId as unknown as Id<"generatedVideos">) as Doc<"generatedVideos"> | null;
    if (!video) {
      console.warn(`[updateVideoSchedule] Video not found: ${args.videoId}`);
      return;
    }

    const accounts = await Promise.all(
      args.socialAccountIds.map(async (id) => {
        try {
          return await ctx.db.get(id as unknown as Id<"lateSocialAccounts">) as Doc<"lateSocialAccounts"> | null;
        } catch (err) {
          console.error(`[updateVideoSchedule] Failed to fetch Late social account ${id}:`, err);
          return null;
        }
      })
    );

    const accountsByPlatform = new Map<Doc<"lateSocialAccounts">["platform"], Doc<"lateSocialAccounts">>();
    for (const account of accounts) {
      if (!account) continue;
      if (!accountsByPlatform.has(account.platform)) {
        accountsByPlatform.set(account.platform, account);
      }
    }

    if (accountsByPlatform.size === 0) {
      console.warn(`[updateVideoSchedule] No valid Late social accounts to schedule for video ${args.videoId}`);
      return;
    }

    const updateData: any = {};

    const buildPost = (existing: Doc<"generatedVideos">["lateTiktokUpload"] | Doc<"generatedVideos">["lateInstagramUpload"] | Doc<"generatedVideos">["lateYoutubeUpload"] | undefined) => ({
      id: args.postId,
      refId: undefined,
      caption: args.postCaption,
      url: existing?.post?.url,
    });

    type UploadStatus = { isPosted: boolean; isFailed: boolean; failedReason?: string };
    const baseStatus: UploadStatus = {
      isPosted: false,
      isFailed: false,
      failedReason: undefined as string | undefined,
    };

    const tiktokAccount = accountsByPlatform.get("tiktok");
    if (tiktokAccount) {
      updateData.lateTiktokUpload = {
        scheduledAt: args.scheduledAt,
        socialAccountId: tiktokAccount._id,
        status: { ...baseStatus },
        post: buildPost(video.lateTiktokUpload),
      };
    }

    const instagramAccount = accountsByPlatform.get("instagram");
    if (instagramAccount) {
      updateData.lateInstagramUpload = {
        scheduledAt: args.scheduledAt,
        socialAccountId: instagramAccount._id,
        status: { ...baseStatus },
        post: buildPost(video.lateInstagramUpload),
      };
    }

    const youtubeAccount = accountsByPlatform.get("youtube");
    if (youtubeAccount) {
      updateData.lateYoutubeUpload = {
        scheduledAt: args.scheduledAt,
        socialAccountId: youtubeAccount._id,
        status: { ...baseStatus },
        post: buildPost(video.lateYoutubeUpload),
      };
    }

    await ctx.db.patch(video._id, updateData);
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

      if (video.lateTiktokUpload !== undefined) {
        updateData.lateTiktokUpload = undefined;
      }

      if (video.lateInstagramUpload !== undefined) {
        updateData.lateInstagramUpload = undefined;
      }

      if (video.lateYoutubeUpload !== undefined) {
        updateData.lateYoutubeUpload = undefined;
      }

      if (Object.keys(updateData).length > 0) {
        await ctx.db.patch(videoId, updateData);
      }
    }
  },
});

export const storeLatePostedVideo = internalMutation({
  args: {
    campaignId: v.id('campaigns'),
    userId: v.id('users'),
    socialPlatform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube")
    ),
    videoId: v.string(),
    postedAt: v.number(),
    videoUrl: v.string(),
    mediaUrl: v.optional(v.string()),
    thumbnailUrl: v.string(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
    audienceCities: v.optional(v.array(v.object({
      city: v.string(),
      percentage: v.number(),
    }))),
    audienceCountries: v.optional(v.array(v.object({
      country: v.string(),
      percentage: v.number(),
    }))),
    audienceGenders: v.optional(v.array(v.object({
      gender: v.string(),
      percentage: v.number(),
    }))),
    audienceTypes: v.optional(v.array(v.object({
      type: v.string(),
      percentage: v.number(),
    }))),
    averageTimeWatched: v.optional(v.number()),
    engagementLikes: v.optional(v.array(v.object({
      second: v.string(),
      percentage: v.number(),
    }))),
    fullVideoWatchedRate: v.optional(v.number()),
    newFollowers: v.optional(v.number()),
    profileViews: v.optional(v.number()),
    videoDuration: v.optional(v.number()),
    videoViewRetention: v.optional(v.array(v.object({
      second: v.string(),
      percentage: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("latePostedVideos")
      .withIndex("by_videoId_socialPlatform", (q) =>
        q.eq("videoId", args.videoId).eq("socialPlatform", args.socialPlatform)
      )
      .filter((q) => q.eq(q.field("campaignId"), args.campaignId))
      .unique();

    const dataToStore: any = {
      views: args.views,
      likes: args.likes,
      comments: args.comments,
      shares: args.shares,
      saves: args.saves,
      thumbnailUrl: args.thumbnailUrl,
      videoUrl: args.videoUrl,
      updatedAt: Date.now(),
    };

    if (args.audienceCities !== undefined) dataToStore.audienceCities = args.audienceCities;
    if (args.audienceCountries !== undefined) dataToStore.audienceCountries = args.audienceCountries;
    if (args.audienceGenders !== undefined) dataToStore.audienceGenders = args.audienceGenders;
    if (args.audienceTypes !== undefined) dataToStore.audienceTypes = args.audienceTypes;
    if (args.averageTimeWatched !== undefined) dataToStore.averageTimeWatched = args.averageTimeWatched;
    if (args.engagementLikes !== undefined) dataToStore.engagementLikes = args.engagementLikes;
    if (args.fullVideoWatchedRate !== undefined) dataToStore.fullVideoWatchedRate = args.fullVideoWatchedRate;
    if (args.newFollowers !== undefined) dataToStore.newFollowers = args.newFollowers;
    if (args.profileViews !== undefined) dataToStore.profileViews = args.profileViews;
    if (args.videoDuration !== undefined) dataToStore.videoDuration = args.videoDuration;
    if (args.videoViewRetention !== undefined) dataToStore.videoViewRetention = args.videoViewRetention;

    if (existing) {
      await ctx.db.patch(existing._id, dataToStore);
      return existing._id;
    } else {
      const id = await ctx.db.insert("latePostedVideos", {
        campaignId: args.campaignId,
        userId: args.userId,
        socialPlatform: args.socialPlatform,
        videoId: args.videoId,
        postedAt: args.postedAt,
        mediaUrl: args.mediaUrl,
        ...dataToStore,
      });
      return id;
    }
  },
});

export const getPostedGeneratedVideos = internalQuery({
  args: {},
  handler: async (ctx) => {
    const videos = await ctx.db
      .query("generatedVideos")
      .collect();

    return videos.filter(v =>
      (v.lateTiktokUpload?.status.isPosted && v.lateTiktokUpload.post.id) ||
      (v.lateInstagramUpload?.status.isPosted && v.lateInstagramUpload.post.id) ||
      (v.lateYoutubeUpload?.status.isPosted && v.lateYoutubeUpload.post.id)
    );
  },
});

export const getCampaignById = internalQuery({
  args: { campaignId: v.id('campaigns') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.campaignId);
  },
});
