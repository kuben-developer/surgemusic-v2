import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

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

  // AIRTABLE
  airtableContents: defineTable({
    campaignId: v.string(), // airtable campaign id
    postId: v.string(), // from airtable api_post_id column in Content base
    caption: v.optional(v.string()),
    error: v.optional(v.string()),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_postId", ["postId"])
    .index("by_error", ["error"]),

  airtableCampaigns: defineTable({
    campaignId: v.string(), // airtable campaign id
    campaignName: v.string(),
    artist: v.string(),
    song: v.string(),
    total: v.number(), // Total content records from Airtable for this campaign
    published: v.number(), // Number of rows with valid api_post_id
  })
    .index("by_campaignId", ["campaignId"]),

  campaignAssets: defineTable({
    campaignId: v.string(), // airtable campaign id
    audioFileId: v.optional(v.id('_storage')),
    audioUrl: v.optional(v.string()),
    srtFileId: v.optional(v.id('_storage')),
    srtUrl: v.optional(v.string()),
    hasLyrics: v.optional(v.boolean()),
    lyrics: v.optional(v.array(v.object({
      timestamp: v.number(),
      text: v.string(),
    }))), //deprecated
    wordsData: v.optional(v.array(v.object({
      text: v.string(),
      start: v.number(),
      end: v.number(),
      type: v.string(),
      logprob: v.optional(v.number()),
    }))), //deprecated
    lyricsWithWords: v.optional(v.array(v.object({
      timestamp: v.number(),
      text: v.string(),
      wordIndices: v.array(v.number()),
    }))), //deprecated
  })
    .index("by_campaignId", ["campaignId"]),

  // BUNDLE SOCIAL
  bundleSocialPostedVideos: defineTable({
    campaignId: v.string(), // airtable campaign id
    postId: v.string(), // from airtable api_post_id column in Content base
    videoId: v.string(),
    postedAt: v.number(),
    videoUrl: v.string(),
    mediaUrl: v.optional(v.string()),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
    updatedAt: v.number(),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_postId", ["postId"])
    .index("by_campaignId_postedAt", ["campaignId", "postedAt"]),

  bundleSocialSnapshots: defineTable({
    campaignId: v.string(), // airtable campaign id
    postId: v.string(), // from airtable api_post_id column in Content base
    date: v.string(), // 24-11-2023. Make sure one snapshot per day. Do update/insert if already exists.
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
    updatedAt: v.number(),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_campaignId_date", ["campaignId", "date"]),

  // CAMPAIGN
  campaignAnalytics: defineTable({
    campaignId: v.string(), // airtable campaign id
    campaignName: v.string(),
    artist: v.string(),
    song: v.string(),

    totalPosts: v.number(),
    totalViews: v.number(),
    totalLikes: v.number(),
    totalComments: v.number(),
    totalShares: v.number(),
    totalSaves: v.number(),

    // Display settings (controlled from logged-in view only)
    minViewsFilter: v.optional(v.number()), // Filter out posts with fewer than X views (0 = show all)
    currencySymbol: v.optional(v.union(v.literal("USD"), v.literal("GBP"))), // Currency for CPM display

    dailySnapshotsByDate: v.record(v.string(), v.object({
      totalPosts: v.number(),
      totalViews: v.number(),
      totalLikes: v.number(),
      totalComments: v.number(),
      totalShares: v.number(),
      totalSaves: v.number(),
      dailySnapshots: v.record(v.string(), v.object({
        totalViews: v.number(),
        totalLikes: v.number(),
        totalComments: v.number(),
        totalShares: v.number(),
        totalSaves: v.number(),
      })),
    })),

    dailySnapshots: v.record(v.string(), v.object({
      totalViews: v.number(),
      totalLikes: v.number(),
      totalComments: v.number(),
      totalShares: v.number(),
      totalSaves: v.number(),
    }))


  })
    .index("by_campaignId", ["campaignId"]),

  captions: defineTable({
    campaignId: v.string(), // airtable campaign id
    text: v.string(),
  })
    .index("by_campaign", ["campaignId"]),

  tiktokVideos: defineTable({
    userId: v.string(),
    username: v.string(),
    nickname: v.string(),
    profilePicture: v.string(),

    videoId: v.string(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
    createTime: v.number(),
    desc: v.string(),
    videoUrl: v.string(),
    musicUrl: v.string(),

    campaignId: v.optional(v.string()),
  })
    .index("by_createTime", ["createTime"])
    .index("by_username", ["username"])
    .index("by_campaignId", ["campaignId"])
    .index("by_videoId", ["videoId"]),

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

  clipperFolders: defineTable({
    userId: v.id('users'),
    folderName: v.string(),
    // Denormalized counts for efficient queries
    videoCount: v.optional(v.number()),
    clipCount: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_folderName", ["folderName"]),

  clippedVideoUrls: defineTable({
    clipperFolderId: v.id('clipperFolders'),
    inputVideoName: v.string(),
    inputVideoUrl: v.string(),
    outputUrls: v.array(v.object({
      videoUrl: v.string(),
      clipNumber: v.number(),
      brightness: v.number(),
      clarity: v.number(),
      isDeleted: v.boolean(),
      thumbnailUrl: v.string(),
    })),
    // Status for efficient queries without loading full documents
    status: v.optional(v.union(
      v.literal("pending"),    // Uploaded, waiting for processing
      v.literal("processed")   // Has outputUrls populated
    )),
  })
    .index("by_clipperFolderId", ["clipperFolderId"])
    .index("by_inputVideoName", ["inputVideoName"])
    .index("by_status", ["status"]),

  montagerFolders: defineTable({
    userId: v.id('users'),
    folderName: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_folderName", ["folderName"]),

  montageConfigs: defineTable({
    montagerFolderId: v.id('montagerFolders'),
    clipperFolderIds: v.array(v.id('clipperFolders')),  // Source folders for clips
    numberOfMontages: v.number(),
    isProcessed: v.boolean(),
  })
    .index("by_montagerFolderId", ["montagerFolderId"])
    .index("by_isProcessed", ["isProcessed"]),

  montagerVideos: defineTable({
    montagerFolderId: v.optional(v.id('montagerFolders')),
    videoUrl: v.string(),
    thumbnailUrl: v.string(),
    processedVideoUrl: v.optional(v.string()),

    status: v.union(
      v.literal("pending"),
      v.literal("ready_for_processing"),
      v.literal("processed"),
      v.literal("published"),
    ),
    overlayStyle: v.optional(v.string()),
    renderType: v.optional(v.string()), // "Both" | "LyricsOnly" | "CaptionOnly"
    airtableRecordId: v.optional(v.string()),
    campaignId: v.optional(v.string()), // Airtable campaign ID for fetching assets
    scheduledDate: v.optional(v.string()), // ISO date "YYYY-MM-DD" from Airtable
  })
    .index("by_montagerFolderId", ["montagerFolderId"])
    .index("by_montagerFolderId_status", ["montagerFolderId", "status"])
    .index("by_airtableRecordId", ["airtableRecordId"])
    .index("by_campaignId", ["campaignId"]),

  // BULK DOWNLOADER
  bulkDownloadJobs: defineTable({
    userId: v.id("users"),

    // Job type
    type: v.union(v.literal("videos"), v.literal("profiles")),

    // Job status
    status: v.union(
      v.literal("pending"),
      v.literal("fetching"),
      v.literal("downloading"),
      v.literal("zipping"),
      v.literal("uploading"),
      v.literal("completed"),
      v.literal("failed")
    ),

    // Input
    inputUrls: v.array(v.string()),
    uploadedBefore: v.optional(v.number()), // Unix timestamp for profile filtering

    // Progress tracking
    progress: v.object({
      totalItems: v.number(),
      processedItems: v.number(),
      downloadedVideos: v.number(),
      failedVideos: v.number(),
      currentPhase: v.string(),
    }),

    // Profile-specific progress (for profiles type only)
    profileProgress: v.optional(v.array(v.object({
      username: v.string(),
      profilePicture: v.optional(v.string()),
      nickname: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("fetching"),
        v.literal("downloading"),
        v.literal("completed"),
        v.literal("failed")
      ),
      totalVideos: v.number(),
      downloadedVideos: v.number(),
      errorMessage: v.optional(v.string()),
    }))),

    // Result (when completed)
    result: v.optional(v.object({
      zipUrl: v.string(),
      zipKey: v.string(),
      zipSize: v.number(),
      totalVideosInZip: v.number(),
      expiresAt: v.number(),
    })),

    // Error (when failed)
    error: v.optional(v.string()),
    failedUrls: v.optional(v.array(v.object({
      url: v.string(),
      reason: v.string(),
    }))),

    // Timestamps
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"])
    .index("by_status", ["status"]),
})