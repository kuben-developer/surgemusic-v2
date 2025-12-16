import { v } from "convex/values";
import { mutation, internalMutation } from "../../_generated/server";
import { parseUrlList } from "./utils";

/**
 * Create a new bulk download job
 * Validates URLs and creates initial job record
 */
export const createJob = mutation({
  args: {
    type: v.union(v.literal("videos"), v.literal("profiles")),
    urls: v.array(v.string()),
    uploadedBefore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Parse and validate URLs
    const { valid, invalid } = parseUrlList(args.urls, args.type);

    if (valid.length === 0) {
      const firstInvalid = invalid[0];
      throw new Error(
        firstInvalid
          ? `No valid URLs found. ${firstInvalid.reason}`
          : "No URLs provided"
      );
    }

    // Extract just the URLs for storage
    const validUrls = valid.map((v) => v.url);

    // Initialize profile progress if this is a profile job
    let profileProgress: Array<{
      username: string;
      profilePicture?: string;
      nickname?: string;
      status: "pending" | "fetching" | "downloading" | "completed" | "failed";
      totalVideos: number;
      downloadedVideos: number;
      errorMessage?: string;
    }> | undefined;

    if (args.type === "profiles") {
      profileProgress = valid.map((v) => ({
        username: (v.parsed as { username: string }).username,
        status: "pending" as const,
        totalVideos: 0,
        downloadedVideos: 0,
      }));
    }

    // Create the job
    const jobId = await ctx.db.insert("bulkDownloadJobs", {
      userId: user._id,
      type: args.type,
      status: "pending",
      inputUrls: validUrls,
      uploadedBefore: args.uploadedBefore,
      progress: {
        totalItems: valid.length,
        processedItems: 0,
        downloadedVideos: 0,
        failedVideos: 0,
        currentPhase: "Waiting to start...",
      },
      profileProgress,
      createdAt: Date.now(),
      // Store invalid URLs as warnings
      failedUrls: invalid.length > 0 ? invalid : undefined,
    });

    return {
      jobId,
      validCount: valid.length,
      invalidCount: invalid.length,
      invalidUrls: invalid,
    };
  },
});

/**
 * Update job status and progress (internal)
 */
export const updateJobProgress = internalMutation({
  args: {
    jobId: v.id("bulkDownloadJobs"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("fetching"),
        v.literal("downloading"),
        v.literal("zipping"),
        v.literal("uploading"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    progress: v.optional(
      v.object({
        totalItems: v.number(),
        processedItems: v.number(),
        downloadedVideos: v.number(),
        failedVideos: v.number(),
        currentPhase: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    const updates: Partial<{
      status: typeof args.status;
      progress: typeof args.progress;
    }> = {};

    if (args.status) {
      updates.status = args.status;
    }
    if (args.progress) {
      updates.progress = args.progress;
    }

    await ctx.db.patch(args.jobId, updates);
  },
});

/**
 * Update individual profile progress (internal)
 */
export const updateProfileProgress = internalMutation({
  args: {
    jobId: v.id("bulkDownloadJobs"),
    username: v.string(),
    update: v.object({
      status: v.optional(
        v.union(
          v.literal("pending"),
          v.literal("fetching"),
          v.literal("downloading"),
          v.literal("completed"),
          v.literal("failed")
        )
      ),
      profilePicture: v.optional(v.string()),
      nickname: v.optional(v.string()),
      totalVideos: v.optional(v.number()),
      downloadedVideos: v.optional(v.number()),
      errorMessage: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || !job.profileProgress) {
      throw new Error("Job not found or not a profile job");
    }

    const updatedProfileProgress = job.profileProgress.map((profile) => {
      if (profile.username.toLowerCase() === args.username.toLowerCase()) {
        return {
          ...profile,
          ...args.update,
          // Keep existing values if not provided in update
          status: args.update.status ?? profile.status,
          totalVideos: args.update.totalVideos ?? profile.totalVideos,
          downloadedVideos: args.update.downloadedVideos ?? profile.downloadedVideos,
        };
      }
      return profile;
    });

    await ctx.db.patch(args.jobId, {
      profileProgress: updatedProfileProgress,
    });
  },
});

/**
 * Mark job as completed with result (internal)
 */
export const completeJob = internalMutation({
  args: {
    jobId: v.id("bulkDownloadJobs"),
    result: v.object({
      zipUrl: v.string(),
      zipKey: v.string(),
      zipSize: v.number(),
      totalVideosInZip: v.number(),
      expiresAt: v.number(),
    }),
    progress: v.object({
      totalItems: v.number(),
      processedItems: v.number(),
      downloadedVideos: v.number(),
      failedVideos: v.number(),
      currentPhase: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    await ctx.db.patch(args.jobId, {
      status: "completed",
      result: args.result,
      progress: args.progress,
      completedAt: Date.now(),
    });
  },
});

/**
 * Mark job as failed with error (internal)
 */
export const failJob = internalMutation({
  args: {
    jobId: v.id("bulkDownloadJobs"),
    error: v.string(),
    failedUrls: v.optional(
      v.array(
        v.object({
          url: v.string(),
          reason: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Merge with existing failed URLs if any
    const allFailedUrls = [
      ...(job.failedUrls || []),
      ...(args.failedUrls || []),
    ];

    await ctx.db.patch(args.jobId, {
      status: "failed",
      error: args.error,
      failedUrls: allFailedUrls.length > 0 ? allFailedUrls : undefined,
      completedAt: Date.now(),
    });
  },
});

/**
 * Add failed URLs to a job (internal)
 */
export const addFailedUrls = internalMutation({
  args: {
    jobId: v.id("bulkDownloadJobs"),
    failedUrls: v.array(
      v.object({
        url: v.string(),
        reason: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    const allFailedUrls = [...(job.failedUrls || []), ...args.failedUrls];

    await ctx.db.patch(args.jobId, {
      failedUrls: allFailedUrls,
    });
  },
});

/**
 * Delete a job (user-facing)
 * Does not delete the S3 file - that should be handled separately or via cleanup job
 */
export const deleteJob = mutation({
  args: {
    jobId: v.id("bulkDownloadJobs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Verify ownership
    if (job.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.jobId);

    return { success: true, deletedZipKey: job.result?.zipKey };
  },
});
