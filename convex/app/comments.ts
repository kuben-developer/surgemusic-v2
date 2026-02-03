import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { fetchCommentsByPostId, type Comment as TokApiComment } from "../services/tokapi/comments";
import type { Doc, Id } from "../_generated/dataModel";

// ============================================================================
// CONSTANTS
// ============================================================================

const RATE_LIMIT_DELAY_MS = 500; // 500ms delay between TokAPI requests (safe margin for 200 req/min)
const COMMENTS_PER_REQUEST = 30; // TokAPI returns 30 comments per request

/**
 * Convert any image URL to JPEG using wsrv.nl proxy service
 * This handles HEIC and other formats that browsers can't display
 */
function getConvertedImageUrl(originalUrl: string): string {
  // Use wsrv.nl to convert to JPEG (free image proxy service)
  return `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&output=jpg&q=85`;
}

// ============================================================================
// PUBLIC QUERIES
// ============================================================================

/**
 * Get comments for admin curation view with pagination and sorting
 */
export const getCommentsForCuration = query({
  args: {
    campaignId: v.string(),
    offset: v.optional(v.number()),
    limit: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal("likes"), v.literal("createdAt"))),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    filterBy: v.optional(v.union(v.literal("all"), v.literal("selected"), v.literal("unselected"))),
  },
  handler: async (ctx, { campaignId, offset = 0, limit = 50, sortBy = "likes", sortOrder = "desc", filterBy = "all" }) => {
    // Fetch all comments for this campaign
    const allComments = await ctx.db
      .query("tiktokComments")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Apply selection filter
    const filteredComments = filterBy === "all"
      ? allComments
      : filterBy === "selected"
        ? allComments.filter(c => c.isSelected)
        : allComments.filter(c => !c.isSelected);

    // Sort comments
    const sortedComments = filteredComments.sort((a, b) => {
      const aValue = sortBy === "likes" ? a.likes : a.createdAt;
      const bValue = sortBy === "likes" ? b.likes : b.createdAt;
      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });

    // Apply pagination
    const paginatedComments = sortedComments.slice(offset, offset + limit);

    // Resolve storage URLs for profile pictures
    const commentsWithUrls = await Promise.all(
      paginatedComments.map(async (comment) => {
        let authorProfilePictureUrl: string | null = null;
        if (comment.authorProfilePictureStorageId) {
          authorProfilePictureUrl = await ctx.storage.getUrl(comment.authorProfilePictureStorageId);
        }
        return {
          ...comment,
          authorProfilePictureUrl,
        };
      })
    );

    return {
      comments: commentsWithUrls,
      totalCount: filteredComments.length,
      selectedCount: allComments.filter(c => c.isSelected).length,
      unselectedCount: allComments.filter(c => !c.isSelected).length,
      hasMore: offset + limit < filteredComments.length,
    };
  },
});

/**
 * Get only selected comments for public view
 */
export const getSelectedComments = query({
  args: {
    campaignId: v.string(),
    sortBy: v.optional(v.union(v.literal("likes"), v.literal("createdAt"))),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, { campaignId, sortBy = "likes", sortOrder = "desc" }) => {
    // Fetch only selected comments
    const comments = await ctx.db
      .query("tiktokComments")
      .withIndex("by_campaignId_isSelected", (q) =>
        q.eq("campaignId", campaignId).eq("isSelected", true)
      )
      .collect();

    // Sort comments
    const sortedComments = comments.sort((a, b) => {
      const aValue = sortBy === "likes" ? a.likes : a.createdAt;
      const bValue = sortBy === "likes" ? b.likes : b.createdAt;
      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });

    // Resolve storage URLs for profile pictures
    const commentsWithUrls = await Promise.all(
      sortedComments.map(async (comment) => {
        let authorProfilePictureUrl: string | null = null;
        if (comment.authorProfilePictureStorageId) {
          authorProfilePictureUrl = await ctx.storage.getUrl(comment.authorProfilePictureStorageId);
        }
        return {
          ...comment,
          authorProfilePictureUrl,
        };
      })
    );

    return commentsWithUrls;
  },
});

/**
 * Get scrape status for a campaign
 */
export const getScrapeStatus = query({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    // Get total comment count
    const comments = await ctx.db
      .query("tiktokComments")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Get last scrape time (most recent scrapedAt from comments)
    const lastScrapedAt = comments.length > 0
      ? Math.max(...comments.map(c => c.scrapedAt))
      : null;

    // Get any active scrape job
    const activeJob = await ctx.db
      .query("commentScrapeJobs")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .filter((q) => q.or(
        q.eq(q.field("status"), "pending"),
        q.eq(q.field("status"), "in_progress")
      ))
      .first();

    return {
      totalComments: comments.length,
      selectedCount: comments.filter(c => c.isSelected).length,
      lastScrapedAt,
      activeJob: activeJob ? {
        status: activeJob.status,
        progress: activeJob.progress,
        startedAt: activeJob.startedAt,
      } : null,
    };
  },
});

/**
 * Get scrape job progress (real-time)
 */
export const getScrapeJobProgress = query({
  args: { jobId: v.id("commentScrapeJobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.db.get(jobId);
    return job;
  },
});

// ============================================================================
// PUBLIC MUTATIONS
// ============================================================================

/**
 * Update selection status for multiple comments
 */
export const updateCommentSelections = mutation({
  args: {
    commentIds: v.array(v.id("tiktokComments")),
    isSelected: v.boolean(),
  },
  handler: async (ctx, { commentIds, isSelected }) => {
    const now = Date.now();
    let updatedCount = 0;

    for (const commentId of commentIds) {
      const comment = await ctx.db.get(commentId);
      if (comment) {
        await ctx.db.patch(commentId, {
          isSelected,
          selectedAt: isSelected ? now : undefined,
          updatedAt: now,
        });
        updatedCount++;
      }
    }

    return { updatedCount };
  },
});

/**
 * Auto-select top N comments by likes
 */
export const selectTopCommentsByLikes = mutation({
  args: {
    campaignId: v.string(),
    count: v.number(),
    clearExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, { campaignId, count, clearExisting = false }) => {
    const now = Date.now();

    // Get all comments for this campaign
    const comments = await ctx.db
      .query("tiktokComments")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Clear existing selections if requested
    if (clearExisting) {
      for (const comment of comments) {
        if (comment.isSelected) {
          await ctx.db.patch(comment._id, {
            isSelected: false,
            selectedAt: undefined,
            updatedAt: now,
          });
        }
      }
    }

    // Sort by likes descending and take top N
    const topComments = comments
      .sort((a, b) => b.likes - a.likes)
      .slice(0, count);

    // Select them
    for (const comment of topComments) {
      await ctx.db.patch(comment._id, {
        isSelected: true,
        selectedAt: now,
        updatedAt: now,
      });
    }

    return { selectedCount: topComments.length };
  },
});

/**
 * Start a comment scrape job (user-facing action)
 */
export const startCommentScrape = action({
  args: {
    campaignId: v.string(),
    maxCommentsPerVideo: v.optional(v.number()),
  },
  handler: async (ctx, { campaignId, maxCommentsPerVideo = 100 }): Promise<{ jobId: Id<"commentScrapeJobs">; totalVideos: number }> => {
    // Check for existing active job
    const existingJob = await ctx.runQuery(internal.app.comments.getActiveJobForCampaign, { campaignId });
    if (existingJob) {
      throw new Error("A scrape job is already in progress for this campaign");
    }

    // Get videos for this campaign from bundleSocialPostedVideos
    const videos: Array<{ postId: string; videoId: string }> = await ctx.runQuery(internal.app.comments.getVideosForCampaign, { campaignId });

    if (videos.length === 0) {
      throw new Error("No videos found for this campaign");
    }

    // Create the scrape job
    const jobId: Id<"commentScrapeJobs"> = await ctx.runMutation(internal.app.comments.createScrapeJob, {
      campaignId,
      maxCommentsPerVideo,
      totalVideos: videos.length,
    });

    // Start processing in background
    await ctx.scheduler.runAfter(0, internal.app.comments.processScrapeJob, {
      jobId,
      campaignId,
      maxCommentsPerVideo,
    });

    return { jobId, totalVideos: videos.length };
  },
});

// ============================================================================
// INTERNAL QUERIES
// ============================================================================

export const getActiveJobForCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("commentScrapeJobs")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .filter((q) => q.or(
        q.eq(q.field("status"), "pending"),
        q.eq(q.field("status"), "in_progress")
      ))
      .first();
  },
});

export const getVideosForCampaign = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const videos = await ctx.db
      .query("bundleSocialPostedVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Filter out videos with zero comments (no point scraping them)
    // and return only necessary fields
    return videos
      .filter(v => v.comments > 0)
      .map(v => ({
        postId: v.postId,
        videoId: v.videoId,
      }));
  },
});

export const getExistingCommentIds = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const comments = await ctx.db
      .query("tiktokComments")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    return new Set(comments.map(c => c.commentId));
  },
});

// Get existing comments with their profile picture storage IDs (for avoiding re-downloads)
export const getExistingCommentsWithStorageIds = internalQuery({
  args: { campaignId: v.string() },
  handler: async (ctx, { campaignId }) => {
    const comments = await ctx.db
      .query("tiktokComments")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
      .collect();

    // Return map of commentId -> storageId (only for comments that have storage IDs)
    const result: Record<string, string> = {};
    for (const comment of comments) {
      if (comment.authorProfilePictureStorageId) {
        result[comment.commentId] = comment.authorProfilePictureStorageId;
      }
    }
    return result;
  },
});

export const getScrapeJob = internalQuery({
  args: { jobId: v.id("commentScrapeJobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db.get(jobId);
  },
});

// ============================================================================
// INTERNAL MUTATIONS
// ============================================================================

export const createScrapeJob = internalMutation({
  args: {
    campaignId: v.string(),
    maxCommentsPerVideo: v.number(),
    totalVideos: v.number(),
  },
  handler: async (ctx, { campaignId, maxCommentsPerVideo, totalVideos }) => {
    return await ctx.db.insert("commentScrapeJobs", {
      campaignId,
      maxCommentsPerVideo,
      status: "pending",
      progress: {
        totalVideos,
        processedVideos: 0,
        totalCommentsScraped: 0,
        totalCommentsUpdated: 0,
      },
      startedAt: Date.now(),
    });
  },
});

export const updateScrapeJobProgress = internalMutation({
  args: {
    jobId: v.id("commentScrapeJobs"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed")
    )),
    processedVideos: v.optional(v.number()),
    totalCommentsScraped: v.optional(v.number()),
    totalCommentsUpdated: v.optional(v.number()),
    error: v.optional(v.string()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, { jobId, status, processedVideos, totalCommentsScraped, totalCommentsUpdated, error, completedAt }) => {
    const job = await ctx.db.get(jobId);
    if (!job) return;

    const updates: Partial<Doc<"commentScrapeJobs">> = {};

    if (status !== undefined) {
      updates.status = status;
    }

    if (processedVideos !== undefined || totalCommentsScraped !== undefined || totalCommentsUpdated !== undefined) {
      updates.progress = {
        ...job.progress,
        ...(processedVideos !== undefined && { processedVideos }),
        ...(totalCommentsScraped !== undefined && { totalCommentsScraped }),
        ...(totalCommentsUpdated !== undefined && { totalCommentsUpdated }),
      };
    }

    if (error !== undefined) {
      updates.error = error;
    }

    if (completedAt !== undefined) {
      updates.completedAt = completedAt;
    }

    await ctx.db.patch(jobId, updates);
  },
});

export const bulkUpsertComments = internalMutation({
  args: {
    campaignId: v.string(),
    postId: v.string(),
    comments: v.array(v.object({
      commentId: v.string(),
      text: v.string(),
      likes: v.number(),
      createdAt: v.number(),
      authorUsername: v.string(),
      authorNickname: v.string(),
      authorProfilePictureStorageId: v.optional(v.id("_storage")),
      authorCountry: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { campaignId, postId, comments }) => {
    const now = Date.now();
    let insertedCount = 0;
    let updatedCount = 0;

    for (const comment of comments) {
      // Check if comment already exists
      const existing = await ctx.db
        .query("tiktokComments")
        .withIndex("by_commentId", (q) => q.eq("commentId", comment.commentId))
        .first();

      if (existing) {
        // Update existing comment (likes may have changed)
        // Only update storage ID if provided and not already set
        const updates: Partial<Doc<"tiktokComments">> = {
          text: comment.text,
          likes: comment.likes,
          authorNickname: comment.authorNickname,
          authorCountry: comment.authorCountry,
          scrapedAt: now,
          updatedAt: now,
        };
        if (comment.authorProfilePictureStorageId && !existing.authorProfilePictureStorageId) {
          updates.authorProfilePictureStorageId = comment.authorProfilePictureStorageId;
        }
        await ctx.db.patch(existing._id, updates);
        updatedCount++;
      } else {
        // Insert new comment
        await ctx.db.insert("tiktokComments", {
          commentId: comment.commentId,
          postId,
          campaignId,
          text: comment.text,
          likes: comment.likes,
          createdAt: comment.createdAt,
          authorUsername: comment.authorUsername,
          authorNickname: comment.authorNickname,
          authorProfilePictureStorageId: comment.authorProfilePictureStorageId,
          authorCountry: comment.authorCountry,
          isSelected: false,
          scrapedAt: now,
          updatedAt: now,
        });
        insertedCount++;
      }
    }

    return { insertedCount, updatedCount };
  },
});

// ============================================================================
// INTERNAL ACTIONS
// ============================================================================

/**
 * Process a scrape job - orchestrates scraping for all videos
 */
export const processScrapeJob = internalAction({
  args: {
    jobId: v.id("commentScrapeJobs"),
    campaignId: v.string(),
    maxCommentsPerVideo: v.number(),
  },
  handler: async (ctx, { jobId, campaignId, maxCommentsPerVideo }) => {
    try {
      // Update job status to in_progress
      await ctx.runMutation(internal.app.comments.updateScrapeJobProgress, {
        jobId,
        status: "in_progress",
      });

      // Get all videos for this campaign
      const videos = await ctx.runQuery(internal.app.comments.getVideosForCampaign, { campaignId });

      // Get existing comments with storage IDs to avoid re-downloading
      const existingStorageIds: Record<string, string> = await ctx.runQuery(
        internal.app.comments.getExistingCommentsWithStorageIds,
        { campaignId }
      );

      let totalScraped = 0;
      let totalUpdated = 0;

      // Process each video sequentially to respect rate limits
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if (!video) continue;

        try {
          // Fetch comments from TokAPI
          const comments = await fetchCommentsForVideo(video.videoId, maxCommentsPerVideo);

          if (comments.length > 0) {
            // Download and store profile pictures (deduplicated by username)
            // Skip comments that already have storage IDs in the database
            const usernameToStorageId = new Map<string, Id<"_storage">>();

            for (const comment of comments) {
              const commentId = comment.id;
              const username = comment.user.username;
              const profilePictureUrl = comment.user.profilePicture;

              // Skip if this comment already has a storage ID in the database
              if (existingStorageIds[commentId]) {
                usernameToStorageId.set(username, existingStorageIds[commentId] as Id<"_storage">);
                continue;
              }

              // Skip if already processed this username in this batch or no URL
              if (usernameToStorageId.has(username) || !profilePictureUrl) {
                continue;
              }

              try {
                // Convert image to JPEG using wsrv.nl (handles HEIC and other formats)
                const convertedUrl = getConvertedImageUrl(profilePictureUrl);
                const response = await fetch(convertedUrl);
                if (response.ok) {
                  const arrayBuffer = await response.arrayBuffer();
                  // Create blob as JPEG (wsrv.nl converts to this format)
                  const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
                  // Store in Convex storage
                  const storageId = await ctx.storage.store(blob);
                  usernameToStorageId.set(username, storageId);
                }
              } catch (imgError) {
                // Silently continue if profile picture download fails
                console.warn(`Failed to download profile picture for ${username}:`, imgError);
              }
            }

            // Transform comments for storage
            const transformedComments = comments.map(comment => ({
              commentId: comment.id,
              text: comment.text,
              likes: comment.likes,
              createdAt: comment.createdAt,
              authorUsername: comment.user.username,
              authorNickname: comment.user.nickname,
              authorProfilePictureStorageId: usernameToStorageId.get(comment.user.username),
              authorCountry: comment.user.country || undefined,
            }));

            // Save to database
            const result = await ctx.runMutation(internal.app.comments.bulkUpsertComments, {
              campaignId,
              postId: video.postId,
              comments: transformedComments,
            });

            totalScraped += result.insertedCount;
            totalUpdated += result.updatedCount;
          }

          // Update progress after each video
          await ctx.runMutation(internal.app.comments.updateScrapeJobProgress, {
            jobId,
            processedVideos: i + 1,
            totalCommentsScraped: totalScraped,
            totalCommentsUpdated: totalUpdated,
          });
        } catch (error) {
          console.error(`Error scraping comments for video ${video.videoId}:`, error);
          // Continue with next video even if one fails
        }
      }

      // Mark job as completed
      await ctx.runMutation(internal.app.comments.updateScrapeJobProgress, {
        jobId,
        status: "completed",
        completedAt: Date.now(),
      });

      console.log(`[comments] Scrape job completed for campaign ${campaignId}: ${totalScraped} scraped, ${totalUpdated} updated`);
    } catch (error) {
      // Mark job as failed
      await ctx.runMutation(internal.app.comments.updateScrapeJobProgress, {
        jobId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: Date.now(),
      });

      console.error(`[comments] Scrape job failed for campaign ${campaignId}:`, error);
      throw error;
    }
  },
});

/**
 * Scrape comments for a single video
 * Handles pagination and rate limiting
 * Returns the comments to be saved by the caller
 */
async function fetchCommentsForVideo(
  videoId: string,
  maxComments: number,
): Promise<TokApiComment[]> {
  const allComments: TokApiComment[] = [];
  let offset = 0;
  let hasMore = true;

  // Fetch comments with pagination
  while (hasMore && allComments.length < maxComments) {
    const response = await fetchCommentsByPostId(videoId, offset, COMMENTS_PER_REQUEST);

    allComments.push(...response.comments);
    hasMore = response.hasMore;
    offset += COMMENTS_PER_REQUEST;

    // Rate limit delay between requests
    if (hasMore && allComments.length < maxComments) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    }
  }

  // Trim to maxComments if we fetched more
  return allComments.slice(0, maxComments);
}
