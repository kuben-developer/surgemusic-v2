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
    hasLyrics: v.optional(v.boolean()),
    hasCaptions: v.optional(v.boolean()),
    lyrics: v.optional(v.array(v.object({
      timestamp: v.number(),
      text: v.string(),
    }))),
    // New fields for word-level timing from ElevenLabs
    wordsData: v.optional(v.array(v.object({
      text: v.string(),
      start: v.number(),
      end: v.number(),
      type: v.string(),
      logprob: v.optional(v.number()), // Confidence score from ElevenLabs
    }))),
    // Enhanced lyrics that map seconds to word indices
    lyricsWithWords: v.optional(v.array(v.object({
      timestamp: v.number(),
      text: v.string(),
      wordIndices: v.array(v.number()), // Indices into wordsData array
    }))),
    isFreeCampaign: v.optional(v.boolean()),
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

  ayrsharePostedVideos: defineTable({
    campaignId: v.id('campaigns'),
    userId: v.id('users'),
    socialPlatform: socialPlatforms,
    videoId: v.string(),
    postedAt: v.number(), // seconds epoch from Ayrshare analytics.created
    videoUrl: v.string(),
    mediaUrl: v.optional(v.string()),
    thumbnailUrl: v.string(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),

    // advanced analytics
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

    updatedAt: v.number(), // ms epoch at write time
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_userId", ["userId"])
    .index("by_videoId_socialPlatform", ["videoId", "socialPlatform"]),

  latePostedVideos: defineTable({
    campaignId: v.id('campaigns'),
    userId: v.id('users'),
    socialPlatform: socialPlatforms,
    videoId: v.string(),
    postedAt: v.number(), // seconds epoch from Late post creation
    videoUrl: v.string(),
    mediaUrl: v.optional(v.string()),
    thumbnailUrl: v.string(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),

    // advanced analytics (Late may have different fields than Ayrshare)
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

    updatedAt: v.number(), // ms epoch at write time
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_userId", ["userId"])
    .index("by_videoId_socialPlatform", ["videoId", "socialPlatform"]),

  comments: defineTable({
    commentId: v.string(),
    campaignId: v.id('campaigns'),
    userId: v.id('users'),
    videoId: v.union(v.id('manuallyPostedVideos'), v.id('ayrsharePostedVideos'), v.id('latePostedVideos')),
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

  lateProfiles: defineTable({
    profileName: v.string(),
    lateProfileId: v.string(), // Late API profile ID
    userId: v.id('users'),
  })
    .index("by_userId", ["userId"])
    .index("by_profileName", ["profileName"])
    .index("by_lateProfileId", ["lateProfileId"]),

  lateSocialAccounts: defineTable({
    lateProfileId: v.id('lateProfiles'),
    platform: socialPlatforms,
    lateAccountId: v.string(), // Late API account ID
    profileUrl: v.string(),
    userImage: v.string(),
    username: v.string(),
    displayName: v.optional(v.string()),
  })
    .index("by_lateProfileId", ["lateProfileId"])
    .index("by_platform", ["platform"])
    .index("by_lateAccountId", ["lateAccountId"]),

  generatedVideos: defineTable({
    campaignId: v.id('campaigns'),

    video: v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
      slot0Id: v.optional(v.string()),
      caption: v.optional(v.string()),
      playbook: v.optional(v.string()),
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
      }),
    })),

    // Late API uploads
    lateTiktokUpload: v.optional(v.object({
      scheduledAt: v.number(),
      socialAccountId: v.id('lateSocialAccounts'),
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
      }),
    })),

    lateInstagramUpload: v.optional(v.object({
      scheduledAt: v.number(),
      socialAccountId: v.id('lateSocialAccounts'),
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
      }),
    })),

    lateYoutubeUpload: v.optional(v.object({
      scheduledAt: v.number(),
      socialAccountId: v.id('lateSocialAccounts'),
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
      }),
    })),

  })
    .index("by_campaignId", ["campaignId"]),

  reports: defineTable({
    name: v.string(),
    userId: v.id('users'),
    publicShareId: v.optional(v.string()),
    campaignIds: v.array(v.id('campaigns')),
    hiddenVideoIds: v.array(v.union(
      v.id('generatedVideos'),
      v.id('manuallyPostedVideos'),
      v.id('ayrsharePostedVideos'),
      v.id('latePostedVideos')
    )),
  })
    .index("by_userId", ["userId"]),

  folders: defineTable({
    name: v.string(),
    userId: v.id('users'),
    campaignIds: v.array(v.id('campaigns')),
  })
    .index("by_userId", ["userId"]),

  files: defineTable({
    userId: v.id('users'),
    storageId: v.id('_storage'),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    uploadedAt: v.number(),
    campaignId: v.optional(v.id('campaigns')),
    fileType: v.union(
      v.literal('audio'),
      v.literal('image'),
      v.literal('video')
    ),
    publicUrl: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_campaignId", ["campaignId"]),
})