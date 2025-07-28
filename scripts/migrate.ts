import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import migrationData from '../../migration_data.json';

// Type definitions for migration data
interface MigrationData {
  users: Array<{
    originalId: string;
    clerkId: string;
    billing: {
      stripeCustomerId: string | null;
      subscriptionPriceId: string | null;
      firstTimeUser: boolean;
      isTrial: boolean;
    };
    credits: {
      videoGeneration: number;
      videoGenerationAdditional: number;
      postScheduler: number;
      postSchedulerAdditional: number;
    };
  }>;
  campaigns: Array<{
    originalId: string;
    originalUserId: string;
    campaignName: string;
    songName: string;
    artistName: string;
    campaignCoverImageUrl: string | null;
    videoCount: number;
    genre: string;
    themes: string[];
    status: "pending" | "completed" | "failed";
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
    platform: "tiktok" | "instagram" | "youtube";
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
  reports: Array<{
    originalId: string;
    originalUserId: string;
    name: string;
    publicShareId: string | null;
    originalCampaignIds: string[];
    originalHiddenVideoIds: string[];
  }>;
  folders: Array<{
    originalId: string;
    originalUserId: string;
    name: string;
    originalCampaignIds: string[];
  }>;
}

const data = migrationData as MigrationData;

// ID mapping to track conversions
const idMaps = {
  users: new Map<string, Id<"users">>(),
  campaigns: new Map<string, Id<"campaigns">>(),
  ayrshareProfiles: new Map<string, Id<"ayrshareProfiles">>(),
  socialAccounts: new Map<string, Id<"socialAccounts">>(),
  generatedVideos: new Map<string, Id<"generatedVideos">>(),
  reports: new Map<string, Id<"reports">>(),
  folders: new Map<string, Id<"folders">>()
};

export const runMigration = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting migration...");

    // 1. Migrate Users
    console.log(`Migrating ${data.users.length} users...`);
    for (const user of data.users) {
      const userId = await ctx.db.insert("users", {
        clerkId: user.clerkId,
        billing: {
          stripeCustomerId: user.billing.stripeCustomerId || undefined,
          subscriptionPriceId: user.billing.subscriptionPriceId || undefined,
          firstTimeUser: user.billing.firstTimeUser,
          isTrial: user.billing.isTrial
        },
        credits: user.credits
      });
      idMaps.users.set(user.originalId, userId);
    }

    // 2. Migrate Campaigns
    console.log(`Migrating ${data.campaigns.length} campaigns...`);
    for (const campaign of data.campaigns) {
      const userId = idMaps.users.get(campaign.originalUserId);
      if (!userId) {
        console.error(`User not found for campaign ${campaign.originalId}`);
        continue;
      }

      const campaignId = await ctx.db.insert("campaigns", {
        userId,
        referenceId: campaign.originalId,
        campaignName: campaign.campaignName,
        songName: campaign.songName,
        artistName: campaign.artistName,
        campaignCoverImageUrl: campaign.campaignCoverImageUrl || undefined,
        videoCount: campaign.videoCount,
        genre: campaign.genre,
        themes: campaign.themes,
        status: campaign.status
      });
      idMaps.campaigns.set(campaign.originalId, campaignId);
    }

    // 3. Migrate AyrshareProfiles
    console.log(`Migrating ${data.ayrshareProfiles.length} Ayrshare profiles...`);
    for (const profile of data.ayrshareProfiles) {
      const userId = idMaps.users.get(profile.originalUserId);
      if (!userId) {
        console.error(`User not found for Ayrshare profile ${profile.originalProfileName}`);
        continue;
      }

      const profileId = await ctx.db.insert("ayrshareProfiles", {
        userId,
        profileName: profile.profileName,
        profileKey: profile.profileKey
      });
      idMaps.ayrshareProfiles.set(profile.originalProfileName, profileId);
    }

    // 4. Migrate SocialAccounts
    console.log(`Migrating ${data.socialAccounts.length} social accounts...`);
    for (const account of data.socialAccounts) {
      const ayrshareProfileId = idMaps.ayrshareProfiles.get(account.originalProfileName);
      if (!ayrshareProfileId) {
        console.error(`Ayrshare profile not found for social account ${account.originalId}`);
        continue;
      }

      const accountId = await ctx.db.insert("socialAccounts", {
        ayrshareProfileId,
        platform: account.platform,
        profileUrl: account.profileUrl,
        userImage: account.userImage,
        username: account.username
      });
      idMaps.socialAccounts.set(account.originalId, accountId);
    }

    // 5. Migrate GeneratedVideos: SKIPPED

    // 6. Migrate Reports
    console.log(`Migrating ${data.reports.length} reports...`);
    for (const report of data.reports) {
      const userId = idMaps.users.get(report.originalUserId);
      if (!userId) {
        console.error(`User not found for report ${report.originalId}`);
        continue;
      }

      // Map campaign IDs
      const campaignIds = report.originalCampaignIds
        .map(id => idMaps.campaigns.get(id))
        .filter((id): id is Id<"campaigns"> => id !== undefined);

      // Map hidden video IDs
      const hiddenVideoIds = report.originalHiddenVideoIds
        .map(id => idMaps.generatedVideos.get(id))
        .filter((id): id is Id<"generatedVideos"> => id !== undefined);

      const reportId = await ctx.db.insert("reports", {
        userId,
        name: report.name,
        publicShareId: report.publicShareId || undefined,
        campaignIds,
        hiddenVideoIds
      });
      idMaps.reports.set(report.originalId, reportId);
    }

    // 7. Migrate Folders
    console.log(`Migrating ${data.folders.length} folders...`);
    for (const folder of data.folders) {
      const userId = idMaps.users.get(folder.originalUserId);
      if (!userId) {
        console.error(`User not found for folder ${folder.originalId}`);
        continue;
      }

      // Map campaign IDs
      const campaignIds = folder.originalCampaignIds
        .map(id => idMaps.campaigns.get(id))
        .filter((id): id is Id<"campaigns"> => id !== undefined);

      const folderId = await ctx.db.insert("folders", {
        userId,
        name: folder.name,
        campaignIds
      });
      idMaps.folders.set(folder.originalId, folderId);
    }

    console.log("Migration completed!");

    return {
      users: idMaps.users.size,
      campaigns: idMaps.campaigns.size,
      ayrshareProfiles: idMaps.ayrshareProfiles.size,
      socialAccounts: idMaps.socialAccounts.size,
      generatedVideos: idMaps.generatedVideos.size,
      reports: idMaps.reports.size,
      folders: idMaps.folders.size
    };
  }
});