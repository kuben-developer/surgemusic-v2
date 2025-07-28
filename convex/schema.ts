import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const socialPlatforms = v.union(
  v.literal("tiktok"),
  v.literal("instagram"),
  v.literal("youtube"),
);

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),

    billing: v.object({
      stripeCustomerId: v.optional(v.string()),
      subscriptionPriceId: v.optional(v.string()),
      firstTimeUser: v.boolean(),
      isTrial: v.boolean(),
    }),

    // Credits grouped for easier updates
    credits: v.object({
      videoGeneration: v.number(),
      videoGenerationAdditional: v.number(),
      postScheduler: v.number(),
      postSchedulerAdditional: v.number(),
    }),
  }),

  campaigns: defineTable({
    userId: v.id('users'),
    referenceId: v.string(),
    campaignName: v.string(),
    songName: v.string(),
    artistName: v.string(),
    campaignCoverImageUrl: v.optional(v.string()),
    videoCount: v.number(),
    genre: v.string(),
    themes: v.array(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
  }),

  ayrshareProfiles: defineTable({
    profileName: v.string(),
    profileKey: v.string(),
    userId: v.id('users'),
  }),

  socialAccounts: defineTable({
    ayrshareProfileId: v.id('ayrshareProfiles'),
    platform: socialPlatforms,
    profileUrl: v.string(),
    userImage: v.string(),
    username: v.string(),
  }),

  generatedVideos: defineTable({
    campaignId: v.id('campaigns'),

    video: v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
    }),

    tiktokUpload: v.optional(v.object({
      scheduledAt: v.number(),
      socialAccountId: v.id('socialAccounts'),
      status: v.object({
        isPosted: v.boolean(),
        isFailed: v.boolean(),
        failedReason: v.optional(v.string()),
      }),
      post: v.object({
        id: v.string(),
        refId: v.optional(v.string()),
        caption: v.string(),
        url: v.optional(v.string()),
        templateId: v.optional(v.string()),
      }),
    })),

    instagramUpload: v.optional(v.object({
      scheduledAt: v.number(),
      socialAccountId: v.id('socialAccounts'),
      status: v.object({
        isPosted: v.boolean(),
        isFailed: v.boolean(),
        failedReason: v.optional(v.string()),
      }),
      post: v.object({
        id: v.string(),
        refId: v.optional(v.string()),
        caption: v.string(),
        url: v.optional(v.string()),
        templateId: v.optional(v.string()),
      }),
    })),

    youtubeUpload: v.optional(v.object({
      scheduledAt: v.number(),
      socialAccountId: v.id('socialAccounts'),
      status: v.object({
        isPosted: v.boolean(),
        isFailed: v.boolean(),
        failedReason: v.optional(v.string()),
      }),
      post: v.object({
        id: v.string(),
        refId: v.optional(v.string()),
        caption: v.string(),
        url: v.optional(v.string()),
        templateId: v.optional(v.string()),
      }),
    })),

  }),

  reports: defineTable({
    name: v.string(),
    userId: v.id('users'),
    publicShareId: v.optional(v.string()),
    campaignIds: v.array(v.id('campaigns')),
    hiddenVideoIds: v.array(v.id('generatedVideos')),
  }),

  folders: defineTable({
    name: v.string(),
    userId: v.id('users'),
    campaignIds: v.array(v.id('campaigns')),
  }),

  // Temporary tables for migration
  migrationMappings: defineTable({
    type: v.string(),
    data: v.any(),
  }),

  migrationProgress: defineTable({
    type: v.string(),
    offset: v.number(),
    processedCount: v.number(),
    skippedCount: v.number(),
    errors: v.array(v.string()),
    timestamp: v.number(),
  })
})