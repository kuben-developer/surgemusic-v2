import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

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
  })
    .index("by_clerkId", ["clerkId"]),

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
    isDeleted: v.optional(v.boolean()),
    caption: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_referenceId", ["referenceId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_caption", ["caption"]),

  campaignPerformanceSnapshots: defineTable({
    campaignId: v.id('campaigns'),
    userId: v.id('users'),
    date: v.string(), // 24-11-2023
    posts: v.number(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_campaignId", ["campaignId"])
    .index("by_campaignId_date", ["campaignId", "date"]),

  manuallyPostedVideos: defineTable({
    campaignId: v.id('campaigns'),
    userId: v.id('users'),
    socialPlatform: socialPlatforms,
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
    updatedAt: v.number(),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_userId", ["userId"])
    .index("by_videoId_socialPlatform", ["videoId", "socialPlatform"]),

  comments: defineTable({
    commentId: v.string(),
    campaignId: v.id('campaigns'),
    userId: v.id('users'),
    videoId: v.id('manuallyPostedVideos'),
    socialPlatform: socialPlatforms,
    text: v.string(),
    authorUsername: v.string(),
    authorNickname: v.string(),
    authorProfilePicUrl: v.string(),
    createdAt: v.number(),
  })
    .index("by_commentId", ["commentId"])
    .index("by_campaignId", ["campaignId"])
    .index("by_userId", ["userId"])
    .index("by_socialPlatform", ["socialPlatform"]),


  ayrshareProfiles: defineTable({
    profileName: v.string(),
    profileKey: v.string(),
    userId: v.id('users'),
  })
    .index("by_userId", ["userId"])
    .index("by_profileName", ["profileName"]),

  socialAccounts: defineTable({
    ayrshareProfileId: v.id('ayrshareProfiles'),
    platform: socialPlatforms,
    profileUrl: v.string(),
    userImage: v.string(),
    username: v.string(),
  })
    .index("by_ayrshareProfileId", ["ayrshareProfileId"])
    .index("by_platform", ["platform"]),

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

  })
    .index("by_campaignId", ["campaignId"]),

  reports: defineTable({
    name: v.string(),
    userId: v.id('users'),
    publicShareId: v.optional(v.string()),
    campaignIds: v.array(v.id('campaigns')),
    hiddenVideoIds: v.array(v.id('generatedVideos')),
  })
    .index("by_userId", ["userId"]),

  folders: defineTable({
    name: v.string(),
    userId: v.id('users'),
    campaignIds: v.array(v.id('campaigns')),
  })
    .index("by_userId", ["userId"]),
})