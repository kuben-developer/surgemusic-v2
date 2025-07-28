import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { api } from "../_generated/api";
import migrationData from '../../migration_data.json';

// Type definitions for migration data
interface MigrationData {
  users: Array<{
    originalId: string;
    clerkId: string;
  }>;
  campaigns: Array<{
    originalId: string;
    originalUserId: string;
  }>;
  ayrshareProfiles: Array<{
    originalProfileName: string;
    originalUserId: string;
    profileName: string;
    profileKey: string;
  }>;
  socialAccounts: Array<{
    originalId: string;
    originalProfileName: string;
    platform: string;
    profileUrl: string;
    userImage: string;
    username: string;
  }>;
  generatedVideos: Array<{
    originalId: string;
    originalCampaignId: string;
    video: {
      name: string;
      url: string;
      type: string;
    };
    scheduledSocialAccountIds: string[];
    tiktokUpload?: {
      scheduledAt: number;
      socialAccountId: string;
      status: {
        isPosted: boolean;
        isFailed: boolean;
        failedReason: string | null;
      };
      post: {
        id: string;
        refId: string | null;
        caption: string;
        url: string | null;
        templateId: string | null;
      };
    };
    instagramUpload?: {
      scheduledAt: number;
      socialAccountId: string;
      status: {
        isPosted: boolean;
        isFailed: boolean;
        failedReason: string | null;
      };
      post: {
        id: string;
        refId: string | null;
        caption: string;
        url: string | null;
        templateId: string | null;
      };
    };
    youtubeUpload?: {
      scheduledAt: number;
      socialAccountId: string;
      status: {
        isPosted: boolean;
        isFailed: boolean;
        failedReason: string | null;
      };
      post: {
        id: string;
        refId: string | null;
        caption: string;
        url: string | null;
        templateId: string | null;
      };
    };
  }>;
}

const data = migrationData as MigrationData;

// Constants for batch processing
const BATCH_SIZE = 5000; // Process 100 videos at a time

// Load ID mappings from existing tables
export const loadIdMappings = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Loading ID mappings from existing tables...");

    // Build user ID map
    const userMap = new Map<string, Id<"users">>();
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      // Find original ID by matching clerkId
      const originalUser = data.users.find(u => u.clerkId === user.clerkId);
      if (originalUser) {
        userMap.set(originalUser.originalId, user._id);
      }
    }

    // Build campaign ID map
    const campaignMap = new Map<string, Id<"campaigns">>();
    const campaigns = await ctx.db.query("campaigns").collect();
    for (const campaign of campaigns) {
      if (campaign.referenceId) {
        campaignMap.set(campaign.referenceId, campaign._id);
      }
    }

    // Build ayrshare profile ID map
    const ayrshareProfileMap = new Map<string, Id<"ayrshareProfiles">>();
    const ayrshareProfiles = await ctx.db.query("ayrshareProfiles").collect();
    for (const profile of ayrshareProfiles) {
      // Find original profile name by matching profileName
      const originalProfile = data.ayrshareProfiles.find(p => p.profileName === profile.profileName);
      if (originalProfile) {
        ayrshareProfileMap.set(originalProfile.originalProfileName, profile._id);
      }
    }

    // Build social account ID map
    const socialAccountMap = new Map<string, Id<"socialAccounts">>();
    const socialAccounts = await ctx.db.query("socialAccounts").collect();
    for (const account of socialAccounts) {
      // Find original ID by matching username and platform
      const originalAccount = data.socialAccounts.find(
        a => a.username === account.username && a.platform === account.platform
      );
      if (originalAccount) {
        socialAccountMap.set(originalAccount.originalId, account._id);
      }
    }

    // Store mappings in a temporary table for batch processing
    await ctx.db.insert("migrationMappings", {
      type: "idMaps",
      data: {
        users: Array.from(userMap.entries()),
        campaigns: Array.from(campaignMap.entries()),
        ayrshareProfiles: Array.from(ayrshareProfileMap.entries()),
        socialAccounts: Array.from(socialAccountMap.entries())
      }
    });

    console.log(`Loaded mappings: ${userMap.size} users, ${campaignMap.size} campaigns, ${ayrshareProfileMap.size} profiles, ${socialAccountMap.size} accounts`);

    return {
      usersCount: userMap.size,
      campaignsCount: campaignMap.size,
      ayrshareProfilesCount: ayrshareProfileMap.size,
      socialAccountsCount: socialAccountMap.size,
      totalVideos: data.generatedVideos.length
    };
  }
});

// Migrate videos in batches
export const migrateVideosBatch = mutation({
  args: {
    offset: v.number(),
    batchSize: v.optional(v.number())
  },
  handler: async (ctx, { offset, batchSize = BATCH_SIZE }) => {
    console.log(`Processing batch starting at offset ${offset}...`);

    // Load ID mappings
    const mappingDoc = await ctx.db
      .query("migrationMappings")
      .filter((q) => q.eq(q.field("type"), "idMaps"))
      .first();

    if (!mappingDoc) {
      throw new Error("ID mappings not found. Please run loadIdMappings first.");
    }

    // Reconstruct maps
    const idMaps = {
      users: new Map<string, Id<"users">>(mappingDoc.data.users),
      campaigns: new Map<string, Id<"campaigns">>(mappingDoc.data.campaigns),
      ayrshareProfiles: new Map<string, Id<"ayrshareProfiles">>(mappingDoc.data.ayrshareProfiles),
      socialAccounts: new Map<string, Id<"socialAccounts">>(mappingDoc.data.socialAccounts)
    };

    // Get batch of videos
    const videoBatch = data.generatedVideos.slice(offset, offset + batchSize);

    let processedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const video of videoBatch) {
      const campaignId = idMaps.campaigns.get(video.originalCampaignId);
      if (!campaignId) {
        errors.push(`Campaign not found for video ${video.originalId}`);
        skippedCount++;
        continue;
      }

      const videoData: any = {
        campaignId,
        video: {
          name: video.video.name,
          url: video.video.url,
          type: video.video.type
        }
      };

      // Map TikTok upload if exists
      if (video.tiktokUpload) {
        const socialAccountId = idMaps.socialAccounts.get(video.tiktokUpload.socialAccountId);
        if (socialAccountId) {
          videoData.tiktokUpload = {
            scheduledAt: video.tiktokUpload.scheduledAt,
            socialAccountId,
            status: {
              isPosted: video.tiktokUpload.status.isPosted,
              isFailed: video.tiktokUpload.status.isFailed,
              failedReason: video.tiktokUpload.status.failedReason || undefined
            },
            post: {
              id: video.tiktokUpload.post.id,
              refId: video.tiktokUpload.post.refId || undefined,
              caption: video.tiktokUpload.post.caption,
              url: video.tiktokUpload.post.url || undefined,
              templateId: video.tiktokUpload.post.templateId || undefined
            }
          };
        } else {
          errors.push(`TikTok social account not found for video ${video.originalId}`);
        }
      }

      // Map Instagram upload if exists
      if (video.instagramUpload) {
        const socialAccountId = idMaps.socialAccounts.get(video.instagramUpload.socialAccountId);
        if (socialAccountId) {
          videoData.instagramUpload = {
            scheduledAt: video.instagramUpload.scheduledAt,
            socialAccountId,
            status: {
              isPosted: video.instagramUpload.status.isPosted,
              isFailed: video.instagramUpload.status.isFailed,
              failedReason: video.instagramUpload.status.failedReason || undefined
            },
            post: {
              id: video.instagramUpload.post.id,
              refId: video.instagramUpload.post.refId || undefined,
              caption: video.instagramUpload.post.caption,
              url: video.instagramUpload.post.url || undefined,
              templateId: video.instagramUpload.post.templateId || undefined
            }
          };
        } else {
          errors.push(`Instagram social account not found for video ${video.originalId}`);
        }
      }

      // Map YouTube upload if exists
      if (video.youtubeUpload) {
        const socialAccountId = idMaps.socialAccounts.get(video.youtubeUpload.socialAccountId);
        if (socialAccountId) {
          videoData.youtubeUpload = {
            scheduledAt: video.youtubeUpload.scheduledAt,
            socialAccountId,
            status: {
              isPosted: video.youtubeUpload.status.isPosted,
              isFailed: video.youtubeUpload.status.isFailed,
              failedReason: video.youtubeUpload.status.failedReason || undefined
            },
            post: {
              id: video.youtubeUpload.post.id,
              refId: video.youtubeUpload.post.refId || undefined,
              caption: video.youtubeUpload.post.caption,
              url: video.youtubeUpload.post.url || undefined,
              templateId: video.youtubeUpload.post.templateId || undefined
            }
          };
        } else {
          errors.push(`YouTube social account not found for video ${video.originalId}`);
        }
      }

      try {
        await ctx.db.insert("generatedVideos", videoData);
        processedCount++;
      } catch (error) {
        errors.push(`Failed to insert video ${video.originalId}: ${error}`);
        skippedCount++;
      }
    }

    // Update progress
    await ctx.db.insert("migrationProgress", {
      type: "generatedVideos",
      offset: offset + videoBatch.length,
      processedCount,
      skippedCount,
      errors: errors.slice(0, 10), // Store first 10 errors
      timestamp: Date.now()
    });

    const hasMore = offset + batchSize < data.generatedVideos.length;

    console.log(`Batch complete. Processed: ${processedCount}, Skipped: ${skippedCount}, Has more: ${hasMore}`);

    return {
      processedCount,
      skippedCount,
      totalInBatch: videoBatch.length,
      hasMore,
      nextOffset: hasMore ? offset + batchSize : null,
      errors: errors.slice(0, 5) // Return first 5 errors
    };
  }
});

// Query to check migration progress
export const getMigrationProgress = query({
  args: {},
  handler: async (ctx) => {
    const progress = await ctx.db
      .query("migrationProgress")
      .filter((q) => q.eq(q.field("type"), "generatedVideos"))
      .order("desc")
      .first();

    if (!progress) {
      return {
        offset: 0,
        processedCount: 0,
        skippedCount: 0,
        totalVideos: data.generatedVideos.length,
        percentComplete: 0
      };
    }

    return {
      offset: progress.offset,
      processedCount: progress.processedCount,
      skippedCount: progress.skippedCount,
      totalVideos: data.generatedVideos.length,
      percentComplete: Math.round((progress.offset / data.generatedVideos.length) * 100),
      lastRunTimestamp: progress.timestamp,
      recentErrors: progress.errors
    };
  }
});

// Main migration orchestrator
export const runGeneratedVideosMigration = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting GeneratedVideos migration...");

    // First load the ID mappings
    const mappingResult = await ctx.runMutation(api.migrateGeneratedVideos.loadIdMappings, {});
    console.log(`Total videos to migrate: ${mappingResult.totalVideos}`);

    let offset = 0;
    let totalProcessed = 0;
    let totalSkipped = 0;

    while (offset < data.generatedVideos.length) {
      const result = await ctx.runMutation(api.migrateGeneratedVideos.migrateVideosBatch, { offset });

      totalProcessed += result.processedCount;
      totalSkipped += result.skippedCount;

      if (!result.hasMore) {
        break;
      }

      offset = result.nextOffset!;

      // Log progress every 10 batches
      if ((offset / BATCH_SIZE) % 10 === 0) {
        console.log(`Progress: ${offset}/${data.generatedVideos.length} (${Math.round((offset / data.generatedVideos.length) * 100)}%)`);
      }
    }

    console.log(`Migration complete! Processed: ${totalProcessed}, Skipped: ${totalSkipped}`);

    return {
      totalProcessed,
      totalSkipped,
      totalVideos: data.generatedVideos.length
    };
  }
});

/* npx convex run migrateGeneratedVideos:migrateVideosBatch {"offset":0}
npx convex run migrateGeneratedVideos:migrateVideosBatch {"offset":5000}
npx convex run migrateGeneratedVideos:migrateVideosBatch {"offset":10000}
npx convex run migrateGeneratedVideos:migrateVideosBatch {"offset":15000}
npx convex run migrateGeneratedVideos:migrateVideosBatch {"offset":20000}
npx convex run migrateGeneratedVideos:migrateVideosBatch {"offset":25000}
npx convex run migrateGeneratedVideos:migrateVideosBatch {"offset":30000}
npx convex run migrateGeneratedVideos:migrateVideosBatch {"offset":35000}
npx convex run migrateGeneratedVideos:migrateVideosBatch {"offset":40000} */