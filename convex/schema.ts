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
    postId: v.string(), // from airtable api_post_id column in Content base or tiktok_id for manual posts
    caption: v.optional(v.string()),
    error: v.optional(v.string()),
    errorAt: v.optional(v.number()), // Timestamp when error was set (for retry logic)
    isManual: v.optional(v.boolean()), // true if manually posted (not through Bundle Social API)
    tiktokId: v.optional(v.string()), // TikTok video ID for manual posts
    instagramId: v.optional(v.string()), // Instagram shortcode e.g. "DUvNQgmEWM1"
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_postId", ["postId"])
    .index("by_error", ["error"]),

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

  tiktokVideoStats: defineTable({
    campaignId: v.string(), // airtable campaign id
    tiktokAuthorId: v.string(), // TikTok author ID
    tiktokVideoId: v.string(), // TikTok video ID
    mediaUrl: v.string(),
    postedAt: v.number(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
    isManual: v.boolean(),
    bundlePostId: v.optional(v.string()), // Bundle Social post ID (for dedup on re-runs)
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_tiktokAuthorId", ["tiktokAuthorId"])
    .index("by_campaignId_postedAt", ["campaignId", "postedAt"])
    .index("by_tiktokVideoId", ["tiktokVideoId"])
    .index("by_bundlePostId", ["bundlePostId"]),

  tiktokVideoSnapshots: defineTable({
    tiktokVideoId: v.string(), // TikTok video ID
    intervalId: v.string(), // Format: "tiktokVideoId_YYYYMMDDHH" e.g., "video123_2025090114" (hourly intervals)
    snapshotAt: v.number(), // YYYYMMDDHH
    hour: v.number(), // Hour of the day (0-23)
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    shares: v.number(),
    saves: v.number(),
  })
    .index("by_intervalId", ["intervalId"])
    .index("by_tiktokVideoId", ["tiktokVideoId"])
    .index("by_snapshotAt", ["snapshotAt"])
    .index("by_hour", ["hour"]),

  instagramPostStats: defineTable({
    campaignId: v.string(),
    instagramShortcode: v.string(),    // e.g. "DUvNQgmEWM1"
    instagramUserId: v.string(),       // user.pk from RocketAPI
    instagramUsername: v.string(),     // user.username
    mediaUrl: v.string(),             // https://www.instagram.com/p/{shortcode}/
    mediaType: v.number(),            // 1=photo, 2=video, 8=carousel
    postedAt: v.number(),             // taken_at unix timestamp
    views: v.number(),                // play_count (0 for non-video)
    likes: v.number(),                // like_count
    comments: v.number(),             // comment_count
    thumbnailStorageId: v.optional(v.id("_storage")),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_instagramShortcode", ["instagramShortcode"])
    .index("by_campaignId_postedAt", ["campaignId", "postedAt"]),

  instagramPostSnapshots: defineTable({
    instagramShortcode: v.string(),
    intervalId: v.string(),           // "shortcode_YYYYMMDDHH"
    snapshotAt: v.number(),           // YYYYMMDDHH
    hour: v.number(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
  })
    .index("by_intervalId", ["intervalId"])
    .index("by_instagramShortcode", ["instagramShortcode"])
    .index("by_snapshotAt", ["snapshotAt"]),

  campaigns: defineTable({
    campaignId: v.string(), // airtable campaign id
    campaignName: v.string(),
    artist: v.string(),
    song: v.string(),
    status: v.optional(v.string()), // Campaign status: "Active", "Planned", "Done"
    total: v.optional(v.number()), // Total content records from Airtable
    published: v.optional(v.number()), // Number of rows with valid api_post_id

    minViewsExcludedStats: v.object({
      totalPosts: v.number(),
      totalViews: v.number(),
      totalLikes: v.number(),
      totalComments: v.number(),
      totalShares: v.number(),
      totalSaves: v.number(),
    }),

    // Display settings (controlled from logged-in view only)
    minViewsFilter: v.optional(v.number()), // Filter out posts with fewer than X views (0 = show all)
    currencySymbol: v.optional(v.union(v.literal("USD"), v.literal("GBP"))), // Currency for CPM display
    manualCpmMultiplier: v.optional(v.number()), // CPM rate for manual posts (default: 0.50)
    apiCpmMultiplier: v.optional(v.number()), // CPM rate for API posts (default: 0.50)

    // Content samples for analytics dashboard display
    contentSamples: v.optional(v.array(v.object({
      videoUrl: v.string(),
      thumbnailUrl: v.string(),
      addedAt: v.number(),
      sourceVideoId: v.optional(v.string()),
    }))),

    // Pre-computed totals for fast campaign list loading (updated by cron)
    cachedTotals: v.optional(v.object({
      posts: v.number(),
      views: v.number(),
      likes: v.number(),
      comments: v.number(),
      shares: v.number(),
      saves: v.number(),
    })),
    cachedFirstVideoAt: v.optional(v.number()),
    cachedAt: v.optional(v.number()),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_status", ["status"]),

  campaignSnapshots: defineTable({
    campaignId: v.string(), // airtable campaign id
    intervalId: v.string(), // Format: "campaignId_YYYYMMDDHH_platform" (hourly per-platform)
    snapshotAt: v.number(), // YYYYMMDDHH
    hour: v.number(), // Hour of the day (0-23)
    platform: v.optional(v.union(v.literal("tiktok"), v.literal("instagram"))), // undefined = legacy combined
    totalPosts: v.number(),
    totalViews: v.number(),
    totalLikes: v.number(),
    totalComments: v.number(),
    totalShares: v.number(),
    totalSaves: v.number(),
  })
    .index("by_intervalId", ["intervalId"])
    .index("by_campaignId", ["campaignId"])
    .index("by_campaignId_platform", ["campaignId", "platform"])
    .index("by_snapshotAt", ["snapshotAt"])
    .index("by_hour", ["hour"]),


  captions: defineTable({
    campaignId: v.string(), // airtable campaign id
    text: v.string(),
  })
    .index("by_campaign", ["campaignId"]),

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
    caption: v.optional(v.string()), // The exact caption used when processing this video

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
    tiktokVideoId: v.optional(v.string()), // Resolved by linking cron (advanced analytics)
  })
    .index("by_montagerFolderId", ["montagerFolderId"])
    .index("by_montagerFolderId_status", ["montagerFolderId", "status"])
    .index("by_airtableRecordId", ["airtableRecordId"])
    .index("by_campaignId", ["campaignId"])
    .index("by_status", ["status"]),

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

    // Result (when completed) - array of video URLs for client-side zipping
    result: v.optional(v.object({
      videos: v.array(v.object({
        filename: v.string(),
        url: v.string(),
        size: v.number(),
      })),
      totalVideos: v.number(),
      totalSize: v.number(),
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

  // PODCAST CLIPPER
  podcastClipperFolders: defineTable({
    userId: v.id("users"),
    folderName: v.string(),
    videoCount: v.optional(v.number()),
    reframedCount: v.optional(v.number()),
    calibrationStatus: v.optional(v.union(
      v.literal("none"),
      v.literal("pending"),
      v.literal("detected"),
      v.literal("configured"),
    )),
  })
    .index("by_userId", ["userId"]),

  podcastClipperVideos: defineTable({
    folderId: v.id("podcastClipperFolders"),
    videoName: v.string(),
    inputVideoUrl: v.string(),
    reframedVideoUrl: v.optional(v.string()),
    status: v.union(
      v.literal("uploaded"),
      v.literal("reframing"),
      v.literal("reframed"),
      v.literal("failed"),
    ),
    errorMessage: v.optional(v.string()),
    isReferenceVideo: v.optional(v.boolean()),
  })
    .index("by_folderId", ["folderId"])
    .index("by_folderId_status", ["folderId", "status"]),

  podcastClipperConfigs: defineTable({
    folderId: v.id("podcastClipperFolders"),
    sourceWidth: v.number(),
    sourceHeight: v.number(),
    sceneThreshold: v.number(),
    clusterThreshold: v.number(),
  })
    .index("by_folderId", ["folderId"]),

  podcastClipperSceneTypes: defineTable({
    folderId: v.id("podcastClipperFolders"),
    sceneTypeId: v.number(),
    frameStorageId: v.id("_storage"),
    histogramStorageId: v.id("_storage"),
    crop: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      width: v.number(),
      height: v.number(),
    })),
    altCrop: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      width: v.number(),
      height: v.number(),
    })),
  })
    .index("by_folderId", ["folderId"]),

  podcastClipperTasks: defineTable({
    folderId: v.id("podcastClipperFolders"),
    type: v.union(v.literal("calibrate"), v.literal("reframe")),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    referenceVideoId: v.optional(v.id("podcastClipperVideos")),
    targetVideoId: v.optional(v.id("podcastClipperVideos")),
    sceneThreshold: v.optional(v.number()),
    clusterThreshold: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_folderId", ["folderId"])
    .index("by_type_status", ["type", "status"]),

  // TIKTOK COMMENTS (for campaign analytics curation)
  tiktokComments: defineTable({
    // Identifiers
    commentId: v.string(),           // TikTok comment ID (cid) - for deduplication
    postId: v.string(),              // Video postId
    campaignId: v.string(),          // Airtable campaign ID

    // Comment content
    text: v.string(),
    likes: v.number(),
    createdAt: v.number(),           // Unix timestamp from TikTok (create_time)

    // User info (denormalized)
    authorUsername: v.string(),
    authorNickname: v.string(),
    authorProfilePictureStorageId: v.optional(v.id("_storage")), // Convex storage ID for profile picture
    authorCountry: v.optional(v.string()),

    // Curation status
    isSelected: v.boolean(),         // true = display on public view
    selectedAt: v.optional(v.number()),

    // Metadata
    scrapedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_postId", ["postId"])
    .index("by_commentId", ["commentId"])
    .index("by_campaignId_isSelected", ["campaignId", "isSelected"])
    .index("by_campaignId_createdAt", ["campaignId", "createdAt"])
    .index("by_campaignId_likes", ["campaignId", "likes"]),

  // ADVANCED ANALYTICS (pre-computed dimension stats)
  advancedAnalyticsDimensionStats: defineTable({
    campaignId: v.string(),
    dimension: v.string(),      // "caption" | "folder" | "overlayStyle"
    dimensionValue: v.string(), // The actual caption text / folder name / style name
    totalVideos: v.number(),
    totalViews: v.number(),
    totalLikes: v.number(),
    totalComments: v.number(),
    totalShares: v.number(),
    totalSaves: v.number(),
    avgViews: v.number(),
    avgLikes: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_campaignId_dimension", ["campaignId", "dimension"]),

  // COMMENT SCRAPE JOBS (background job tracking)
  commentScrapeJobs: defineTable({
    campaignId: v.string(),
    maxCommentsPerVideo: v.number(),

    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed")
    ),

    progress: v.object({
      totalVideos: v.number(),
      processedVideos: v.number(),
      totalCommentsScraped: v.number(),
      totalCommentsUpdated: v.number(),
    }),

    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_campaignId", ["campaignId"])
    .index("by_status", ["status"]),
})