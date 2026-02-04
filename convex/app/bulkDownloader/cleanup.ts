import { internalMutation } from "../../_generated/server";

const STALE_JOB_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Clean up stale bulk download jobs
 * Jobs stuck in processing states for more than 30 minutes are marked as failed
 */
export const cleanupStaleJobs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - STALE_JOB_TIMEOUT_MS;
    const activeStatuses = ["pending", "fetching", "downloading", "zipping", "uploading"] as const;

    for (const status of activeStatuses) {
      const jobs = await ctx.db
        .query("bulkDownloadJobs")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();

      for (const job of jobs) {
        if (job.createdAt < cutoff) {
          await ctx.db.patch(job._id, {
            status: "failed",
            error: "Job timed out — processing exceeded 30 minutes",
            completedAt: Date.now(),
          });
        }
      }
    }
  },
});
