"use node";

import { v } from "convex/values";
import { action, internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { userByUsername } from "../../services/tokapi/user";
import { fetchUserPosts } from "../../services/tokapi/post";
import type { TikTokPost } from "../../services/tokapi/post";
import { TOKAPI_OPTIONS } from "../../services/tokapi/utils";
import { parseVideoUrl, parseProfileUrl } from "./utils";

// S3 Configuration (Backblaze B2)
const BUCKET_NAME = "surge-clipper";
const accessKeyId = process.env.CLIPPER_ACCESS_KEY_ID ?? "";
const secretAccessKey = process.env.CLIPPER_SECRET_ACCESS_KEY ?? "";

const s3Client = new S3Client({
  region: "us-west-004",
  endpoint: "https://s3.us-west-004.backblazeb2.com",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

// Constants
const URL_EXPIRY_HOURS = 24;
const VIDEO_DOWNLOAD_TIMEOUT = 30000; // 30 seconds
const MAX_CONCURRENT_DOWNLOADS = 5;
const VIDEOS_PER_CHUNK = 10;

/**
 * Fetch a single TikTok video by ID
 */
async function fetchVideoById(videoId: string): Promise<{
  success: boolean;
  video?: TikTokPost;
  error?: string;
}> {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const url = `https://api.tokapi.online/v1/post/${videoId}`;
      const response = await fetch(url, TOKAPI_OPTIONS);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.status_code !== 0 || !data.aweme_detail) {
        return {
          success: false,
          error: data.status_msg || "Video not found",
        };
      }

      const aweme = data.aweme_detail;
      const urlList =
        aweme.video?.play_addr?.url_list ||
        aweme.video?.download_addr?.url_list ||
        [];
      const mediaUrl = urlList.length > 0 ? urlList[urlList.length - 1] : "";

      return {
        success: true,
        video: {
          id: aweme.aweme_id || "",
          desc: aweme.desc || "",
          create_time: aweme.create_time || 0,
          views: aweme.statistics?.play_count || 0,
          likes: aweme.statistics?.digg_count || 0,
          comments: aweme.statistics?.comment_count || 0,
          shares: aweme.statistics?.share_count || 0,
          saves: aweme.statistics?.collect_count || 0,
          country: aweme.region || "",
          language: aweme.desc_language || "",
          duration: aweme.video?.duration
            ? Math.floor(aweme.video.duration / 1000)
            : 0,
          mediaUrl,
          isVideo: aweme.aweme_type === 0,
          musicId: aweme.music?.id_str || aweme.music?.mid || "",
          musicTitle: aweme.music?.title || "",
          isAd: aweme.is_ads || false,
          accountId: aweme.author?.uid,
        },
      };
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        await new Promise((res) => setTimeout(res, 200 * attempt));
        continue;
      }
      return {
        success: false,
        error: `Failed after ${MAX_RETRIES} attempts: ${String(error)}`,
      };
    }
  }

  return { success: false, error: "Unknown error" };
}

/**
 * Download a video from URL and return as buffer
 */
async function downloadVideo(
  url: string
): Promise<{ success: boolean; buffer?: Buffer; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), VIDEO_DOWNLOAD_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const arrayBuffer = await response.arrayBuffer();
    return { success: true, buffer: Buffer.from(arrayBuffer) };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, error: "Download timeout" };
    }
    return { success: false, error: String(error) };
  }
}

/**
 * Upload a single video to S3 and return presigned URL
 */
async function uploadVideoToS3(
  buffer: Buffer,
  userId: string,
  jobId: string,
  filename: string
): Promise<{ key: string; url: string; size: number }> {
  const key = `bulk-downloads/${userId}/${jobId}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: "video/mp4",
  });

  await s3Client.send(command);

  // Generate presigned URL for download
  const getCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const expiresInSeconds = URL_EXPIRY_HOURS * 60 * 60;
  const url = await getSignedUrl(s3Client, getCommand, {
    expiresIn: expiresInSeconds,
  });

  return { key, url, size: buffer.length };
}

/**
 * Generate presigned URLs for a list of S3 keys
 */
async function generatePresignedUrls(
  keys: string[]
): Promise<Array<{ key: string; url: string }>> {
  const expiresInSeconds = URL_EXPIRY_HOURS * 60 * 60;

  return Promise.all(
    keys.map(async (key) => {
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      const url = await getSignedUrl(s3Client, getCommand, {
        expiresIn: expiresInSeconds,
      });
      return { key, url };
    })
  );
}

/**
 * Start a bulk download job
 * Entry point that schedules the appropriate processor
 */
export const startJob = action({
  args: {
    jobId: v.id("bulkDownloadJobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(
      internal.app.bulkDownloader.queries.getJobInternal,
      { jobId: args.jobId }
    );

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status !== "pending") {
      throw new Error(`Job is already ${job.status}`);
    }

    // Schedule the appropriate processor
    if (job.type === "videos") {
      await ctx.scheduler.runAfter(
        0,
        internal.app.bulkDownloader.actions.processVideoUrls,
        { jobId: args.jobId }
      );
    } else {
      await ctx.scheduler.runAfter(
        0,
        internal.app.bulkDownloader.actions.processProfiles,
        { jobId: args.jobId }
      );
    }

    return { scheduled: true };
  },
});

/**
 * Process video URLs job - fetching phase only
 * Fetches video metadata, then schedules chunked download processing
 */
export const processVideoUrls = internalAction({
  args: {
    jobId: v.id("bulkDownloadJobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(
      internal.app.bulkDownloader.queries.getJobInternal,
      { jobId: args.jobId }
    );

    if (!job) {
      throw new Error("Job not found");
    }

    const failedUrls: Array<{ url: string; reason: string }> = [];

    try {
      // Update status to fetching
      await ctx.runMutation(
        internal.app.bulkDownloader.mutations.updateJobProgress,
        {
          jobId: args.jobId,
          status: "fetching",
          progress: {
            ...job.progress,
            currentPhase: "Fetching video information...",
          },
        }
      );

      // Parse video IDs from URLs
      const videoIds: Array<{ url: string; videoId: string }> = [];
      for (const url of job.inputUrls) {
        const parsed = parseVideoUrl(url);
        if (parsed) {
          videoIds.push({ url, videoId: parsed.videoId });
        } else {
          failedUrls.push({ url, reason: "Invalid URL format" });
        }
      }

      // Fetch video metadata
      const videosToDownload: Array<{
        url: string;
        videoId: string;
        mediaUrl: string;
        desc: string;
      }> = [];

      for (let i = 0; i < videoIds.length; i++) {
        const videoIdEntry = videoIds[i];
        if (!videoIdEntry) continue;
        const { url, videoId } = videoIdEntry;

        await ctx.runMutation(
          internal.app.bulkDownloader.mutations.updateJobProgress,
          {
            jobId: args.jobId,
            progress: {
              totalItems: job.progress.totalItems,
              processedItems: i,
              downloadedVideos: 0,
              failedVideos: failedUrls.length,
              currentPhase: `Fetching video ${i + 1}/${videoIds.length}...`,
            },
          }
        );

        const result = await fetchVideoById(videoId);

        if (result.success && result.video?.mediaUrl) {
          videosToDownload.push({
            url,
            videoId,
            mediaUrl: result.video.mediaUrl,
            desc: result.video.desc || videoId,
          });
        } else {
          failedUrls.push({ url, reason: result.error || "Video not found" });
        }
      }

      if (videosToDownload.length === 0) {
        await ctx.runMutation(internal.app.bulkDownloader.mutations.failJob, {
          jobId: args.jobId,
          error: "No valid videos found to download",
          failedUrls,
        });
        return;
      }

      // Update status to downloading
      await ctx.runMutation(
        internal.app.bulkDownloader.mutations.updateJobProgress,
        {
          jobId: args.jobId,
          status: "downloading",
          progress: {
            totalItems: job.progress.totalItems,
            processedItems: videoIds.length,
            downloadedVideos: 0,
            failedVideos: failedUrls.length,
            currentPhase: "Downloading videos...",
          },
        }
      );

      // Store any failed URLs from fetching phase
      if (failedUrls.length > 0) {
        await ctx.runMutation(
          internal.app.bulkDownloader.mutations.addFailedUrls,
          {
            jobId: args.jobId,
            failedUrls,
          }
        );
      }

      // Schedule chunked download processing
      await ctx.scheduler.runAfter(
        0,
        internal.app.bulkDownloader.actions.downloadVideosBatch,
        {
          jobId: args.jobId,
          videosToDownload,
          totalFetched: videoIds.length,
          totalItems: job.progress.totalItems,
        }
      );
    } catch (error) {
      await ctx.runMutation(internal.app.bulkDownloader.mutations.failJob, {
        jobId: args.jobId,
        error: `Processing error: ${String(error)}`,
        failedUrls,
      });
    }
  },
});

/**
 * Download videos in chunked batches
 * Processes VIDEOS_PER_CHUNK videos, then schedules itself for the remaining
 * This prevents exceeding Convex's 10-minute action timeout for large jobs
 */
export const downloadVideosBatch = internalAction({
  args: {
    jobId: v.id("bulkDownloadJobs"),
    videosToDownload: v.array(
      v.object({
        url: v.string(),
        videoId: v.string(),
        mediaUrl: v.string(),
        desc: v.string(),
      })
    ),
    totalFetched: v.number(),
    totalItems: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if job is still active (handles cancellation)
    const job = await ctx.runQuery(
      internal.app.bulkDownloader.queries.getJobInternal,
      { jobId: args.jobId }
    );

    if (!job || job.status !== "downloading") {
      return;
    }

    const chunk = args.videosToDownload.slice(0, VIDEOS_PER_CHUNK);
    const remaining = args.videosToDownload.slice(VIDEOS_PER_CHUNK);

    const batchSuccesses: Array<{ filename: string; url: string; size: number }> = [];
    const batchFailures: Array<{ url: string; reason: string }> = [];

    // Download in parallel sub-batches of MAX_CONCURRENT_DOWNLOADS
    for (let i = 0; i < chunk.length; i += MAX_CONCURRENT_DOWNLOADS) {
      const subBatch = chunk.slice(i, i + MAX_CONCURRENT_DOWNLOADS);

      const results = await Promise.all(
        subBatch.map(async (video) => {
          const downloadResult = await downloadVideo(video.mediaUrl);

          if (downloadResult.success && downloadResult.buffer) {
            const safeDesc = video.desc
              .replace(/[^a-zA-Z0-9\s-]/g, "")
              .substring(0, 50)
              .trim();
            const filename = `${video.videoId}_${safeDesc || "video"}.mp4`;

            try {
              const uploaded = await uploadVideoToS3(
                downloadResult.buffer,
                job.userId,
                args.jobId,
                filename
              );
              return { success: true as const, ...uploaded, filename };
            } catch (uploadError) {
              return {
                success: false as const,
                url: video.url,
                reason: `Upload failed: ${String(uploadError)}`,
              };
            }
          } else {
            return {
              success: false as const,
              url: video.url,
              reason: downloadResult.error || "Download failed",
            };
          }
        })
      );

      for (const result of results) {
        if (result.success) {
          batchSuccesses.push({
            filename: result.filename,
            url: result.url,
            size: result.size,
          });
        } else {
          batchFailures.push({ url: result.url, reason: result.reason });
        }
      }
    }

    // Calculate cumulative counts from job state + this batch
    const previousDownloaded = job.result?.videos?.length ?? 0;
    const previousFailed = job.failedUrls?.length ?? 0;
    const cumulativeDownloaded = previousDownloaded + batchSuccesses.length;
    const cumulativeFailed = previousFailed + batchFailures.length;
    const totalToDownload = args.videosToDownload.length + previousDownloaded;

    // Append this batch's results to the job
    await ctx.runMutation(
      internal.app.bulkDownloader.mutations.appendBatchResults,
      {
        jobId: args.jobId,
        videos: batchSuccesses,
        failedUrls: batchFailures,
        progress: {
          totalItems: args.totalItems,
          processedItems: args.totalFetched,
          downloadedVideos: cumulativeDownloaded,
          failedVideos: cumulativeFailed,
          currentPhase:
            remaining.length > 0
              ? `Downloading videos... ${cumulativeDownloaded}/${totalToDownload}`
              : "Finalizing...",
        },
      }
    );

    if (remaining.length > 0) {
      // Schedule next batch
      await ctx.scheduler.runAfter(
        0,
        internal.app.bulkDownloader.actions.downloadVideosBatch,
        {
          jobId: args.jobId,
          videosToDownload: remaining,
          totalFetched: args.totalFetched,
          totalItems: args.totalItems,
        }
      );
    } else {
      // All chunks processed - finalize job
      if (cumulativeDownloaded === 0) {
        await ctx.runMutation(internal.app.bulkDownloader.mutations.failJob, {
          jobId: args.jobId,
          error: "Failed to download any videos",
        });
      } else {
        // Read the final job state to get all accumulated results
        const finalJob = await ctx.runQuery(
          internal.app.bulkDownloader.queries.getJobInternal,
          { jobId: args.jobId }
        );

        if (finalJob?.result) {
          await ctx.runMutation(
            internal.app.bulkDownloader.mutations.completeJob,
            {
              jobId: args.jobId,
              result: finalJob.result,
              progress: {
                totalItems: args.totalItems,
                processedItems: args.totalFetched,
                downloadedVideos: finalJob.result.totalVideos,
                failedVideos: finalJob.failedUrls?.length ?? 0,
                currentPhase: "Complete!",
              },
            }
          );
        }
      }
    }
  },
});

/**
 * Process profile URLs job
 */
export const processProfiles = internalAction({
  args: {
    jobId: v.id("bulkDownloadJobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(
      internal.app.bulkDownloader.queries.getJobInternal,
      { jobId: args.jobId }
    );

    if (!job) {
      throw new Error("Job not found");
    }

    const failedUrls: Array<{ url: string; reason: string }> = [];
    const uploadedVideos: Array<{ filename: string; url: string; size: number }> = [];

    try {
      // Update status to fetching
      await ctx.runMutation(
        internal.app.bulkDownloader.mutations.updateJobProgress,
        {
          jobId: args.jobId,
          status: "fetching",
          progress: {
            ...job.progress,
            currentPhase: "Fetching profile information...",
          },
        }
      );

      // Parse usernames from URLs
      const usernames: Array<{ url: string; username: string }> = [];
      for (const url of job.inputUrls) {
        const parsed = parseProfileUrl(url);
        if (parsed) {
          usernames.push({ url, username: parsed.username });
        } else {
          failedUrls.push({ url, reason: "Invalid profile URL format" });
        }
      }

      // Process each profile
      for (let profileIdx = 0; profileIdx < usernames.length; profileIdx++) {
        const usernameEntry = usernames[profileIdx];
        if (!usernameEntry) continue;
        const { url, username } = usernameEntry;

        // Update profile status to fetching
        await ctx.runMutation(
          internal.app.bulkDownloader.mutations.updateProfileProgress,
          {
            jobId: args.jobId,
            username,
            update: { status: "fetching" },
          }
        );

        try {
          // Fetch user info
          const userData = await userByUsername(username);

          // Update profile with user info
          await ctx.runMutation(
            internal.app.bulkDownloader.mutations.updateProfileProgress,
            {
              jobId: args.jobId,
              username,
              update: {
                profilePicture: userData.profilePicture,
                nickname: userData.nickname,
                totalVideos: userData.videoCount,
              },
            }
          );

          // Fetch all posts with pagination
          const allPosts: TikTokPost[] = [];
          let offset = 0;
          let hasMore = true;
          let maxCursor: number | undefined;

          while (hasMore) {
            const postsResponse = await fetchUserPosts(
              userData.accountId,
              maxCursor || offset
            );

            if (
              !postsResponse.aweme_list ||
              postsResponse.aweme_list.length === 0
            ) {
              hasMore = false;
              break;
            }

            // Filter by date if specified (uploadedBefore is the cutoff timestamp)
            // We want posts AFTER this date, so use > comparison
            let filteredPosts = postsResponse.aweme_list;
            if (job.uploadedBefore) {
              filteredPosts = filteredPosts.filter(
                (post) => post.create_time > job.uploadedBefore!
              );
            }

            allPosts.push(...filteredPosts);

            // Update profile progress
            await ctx.runMutation(
              internal.app.bulkDownloader.mutations.updateProfileProgress,
              {
                jobId: args.jobId,
                username,
                update: { totalVideos: allPosts.length },
              }
            );

            hasMore = postsResponse.has_more;
            if (hasMore && postsResponse.max_cursor) {
              maxCursor = postsResponse.max_cursor;
            } else {
              hasMore = false;
            }

            // TikTok returns posts newest-first, so if we've filtered out all posts
            // in this batch, all remaining posts are older than cutoff - stop pagination
            if (
              job.uploadedBefore &&
              filteredPosts.length === 0 &&
              postsResponse.aweme_list.length > 0
            ) {
              hasMore = false;
            }
          }

          // Update status to downloading
          await ctx.runMutation(
            internal.app.bulkDownloader.mutations.updateProfileProgress,
            {
              jobId: args.jobId,
              username,
              update: {
                status: "downloading",
                totalVideos: allPosts.length,
              },
            }
          );

          // Download and upload videos for this profile in parallel batches
          let downloadedCount = 0;
          const postsWithMedia = allPosts.filter((post) => post.mediaUrl);

          for (let i = 0; i < postsWithMedia.length; i += MAX_CONCURRENT_DOWNLOADS) {
            const batch = postsWithMedia.slice(i, i + MAX_CONCURRENT_DOWNLOADS);

            // Download and upload batch in parallel
            const batchResults = await Promise.all(
              batch.map(async (post) => {
                const downloadResult = await downloadVideo(post.mediaUrl!);

                if (downloadResult.success && downloadResult.buffer) {
                  const safeDesc = post.desc
                    .replace(/[^a-zA-Z0-9\s-]/g, "")
                    .substring(0, 50)
                    .trim();
                  const filename = `${username}/${post.id}_${safeDesc || "video"}.mp4`;

                  try {
                    const uploaded = await uploadVideoToS3(
                      downloadResult.buffer,
                      job.userId,
                      args.jobId,
                      filename
                    );
                    return { success: true as const, ...uploaded, filename };
                  } catch (uploadError) {
                    return { success: false as const };
                  }
                } else {
                  return { success: false as const };
                }
              })
            );

            // Process batch results
            for (const result of batchResults) {
              if (result.success) {
                uploadedVideos.push({
                  filename: result.filename,
                  url: result.url,
                  size: result.size,
                });
                downloadedCount++;
              }
            }

            // Update progress after each batch
            await ctx.runMutation(
              internal.app.bulkDownloader.mutations.updateProfileProgress,
              {
                jobId: args.jobId,
                username,
                update: { downloadedVideos: downloadedCount },
              }
            );
          }

          // Mark profile as completed
          await ctx.runMutation(
            internal.app.bulkDownloader.mutations.updateProfileProgress,
            {
              jobId: args.jobId,
              username,
              update: {
                status: "completed",
                downloadedVideos: downloadedCount,
              },
            }
          );

          // Update overall progress
          await ctx.runMutation(
            internal.app.bulkDownloader.mutations.updateJobProgress,
            {
              jobId: args.jobId,
              progress: {
                totalItems: usernames.length,
                processedItems: profileIdx + 1,
                downloadedVideos: uploadedVideos.length,
                failedVideos: failedUrls.length,
                currentPhase: `Processed ${profileIdx + 1}/${usernames.length} profiles`,
              },
            }
          );
        } catch (error) {
          // Mark profile as failed
          await ctx.runMutation(
            internal.app.bulkDownloader.mutations.updateProfileProgress,
            {
              jobId: args.jobId,
              username,
              update: {
                status: "failed",
                errorMessage: String(error),
              },
            }
          );

          failedUrls.push({ url, reason: String(error) });
        }
      }

      if (uploadedVideos.length === 0) {
        await ctx.runMutation(internal.app.bulkDownloader.mutations.failJob, {
          jobId: args.jobId,
          error: "No videos downloaded from any profile",
          failedUrls,
        });
        return;
      }

      // Mark as completed with video URLs
      const totalSize = uploadedVideos.reduce((sum, v) => sum + v.size, 0);

      await ctx.runMutation(internal.app.bulkDownloader.mutations.completeJob, {
        jobId: args.jobId,
        result: {
          videos: uploadedVideos,
          totalVideos: uploadedVideos.length,
          totalSize,
        },
        progress: {
          totalItems: usernames.length,
          processedItems: usernames.length,
          downloadedVideos: uploadedVideos.length,
          failedVideos: failedUrls.length,
          currentPhase: "Complete!",
        },
      });

      // Add any failed URLs
      if (failedUrls.length > 0) {
        await ctx.runMutation(
          internal.app.bulkDownloader.mutations.addFailedUrls,
          {
            jobId: args.jobId,
            failedUrls,
          }
        );
      }
    } catch (error) {
      await ctx.runMutation(internal.app.bulkDownloader.mutations.failJob, {
        jobId: args.jobId,
        error: `Processing error: ${String(error)}`,
        failedUrls,
      });
    }
  },
});

/**
 * Regenerate presigned download URLs for a completed job
 */
export const regenerateDownloadUrls = action({
  args: {
    jobId: v.id("bulkDownloadJobs"),
  },
  handler: async (ctx, args): Promise<{ videos: Array<{ filename: string; url: string; size: number }> }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const job = await ctx.runQuery(
      internal.app.bulkDownloader.queries.getJobInternal,
      { jobId: args.jobId }
    );

    if (!job || !job.result?.videos) {
      throw new Error("Job not found or no videos available");
    }

    // Extract S3 keys from the current URLs and regenerate
    const videos = job.result.videos;
    const keys = videos.map((v) => {
      // Extract key from the URL (it's in the path after the bucket)
      const urlPath = new URL(v.url).pathname;
      // Remove leading slash and bucket name
      return urlPath.replace(/^\/[^/]+\//, "");
    });

    const newUrls = await generatePresignedUrls(keys);

    // Map back to video objects
    const updatedVideos = videos.map((video, idx) => ({
      filename: video.filename,
      url: newUrls[idx]?.url || video.url,
      size: video.size,
    }));

    // Update the job with new URLs
    await ctx.runMutation(internal.app.bulkDownloader.mutations.completeJob, {
      jobId: args.jobId,
      result: {
        videos: updatedVideos,
        totalVideos: job.result.totalVideos,
        totalSize: job.result.totalSize,
      },
      progress: job.progress,
    });

    return { videos: updatedVideos };
  },
});
