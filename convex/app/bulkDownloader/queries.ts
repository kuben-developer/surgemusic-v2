import { v } from "convex/values";
import { query, internalQuery } from "../../_generated/server";

/**
 * Get a single job by ID (real-time subscription)
 */
export const getJob = query({
  args: {
    jobId: v.id("bulkDownloadJobs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return null;
    }

    // Verify ownership
    if (job.userId !== user._id) {
      return null;
    }

    return job;
  },
});

/**
 * Get all jobs for the current user
 * Returns jobs sorted by creation time (newest first)
 */
export const getJobsByUser = query({
  args: {
    limit: v.optional(v.number()),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    let jobsQuery = ctx.db
      .query("bulkDownloadJobs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc");

    // Filter by status if provided
    if (args.status) {
      jobsQuery = jobsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const jobs = await jobsQuery.collect();

    // Apply limit if provided
    if (args.limit && args.limit > 0) {
      return jobs.slice(0, args.limit);
    }

    return jobs;
  },
});

/**
 * Get active jobs for the current user (jobs that are in progress)
 */
export const getActiveJobs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const jobs = await ctx.db
      .query("bulkDownloadJobs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Filter for active jobs (not completed or failed)
    const activeStatuses = ["pending", "fetching", "downloading", "zipping", "uploading"];
    return jobs.filter((job) => activeStatuses.includes(job.status));
  },
});

/**
 * Get completed jobs for the current user
 */
export const getCompletedJobs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const jobs = await ctx.db
      .query("bulkDownloadJobs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    if (args.limit && args.limit > 0) {
      return jobs.slice(0, args.limit);
    }

    return jobs;
  },
});

/**
 * Internal query to get job for use in actions
 */
export const getJobInternal = internalQuery({
  args: {
    jobId: v.id("bulkDownloadJobs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

/**
 * Internal query to get jobs by status (for cleanup jobs)
 */
export const getJobsByStatus = internalQuery({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("fetching"),
      v.literal("downloading"),
      v.literal("zipping"),
      v.literal("uploading"),
      v.literal("completed"),
      v.literal("failed")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("bulkDownloadJobs")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();

    if (args.limit && args.limit > 0) {
      return jobs.slice(0, args.limit);
    }

    return jobs;
  },
});
