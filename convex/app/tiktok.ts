import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction, internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

const TOKAPI_KEY = "808a45b29cf9422798bcc4560909b4c2";
const TOKAPI_BASE_URL = "http://api.tokapi.online";
const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// ==================== TypeScript Interfaces ====================

interface UserIdResponse {
  status_code: number;
  uid?: string;
  sec_uid?: string;
}

interface PostsResponse {
  status_code: number;
  aweme_list?: AwemeDetail[];
  has_more?: number;
  max_cursor?: number;
  min_cursor?: number;
}

interface AwemeDetail {
  aweme_id: string;
  author: {
    uid: string;
    unique_id: string;
    nickname: string;
    avatar_larger?: {
      url_list: string[];
    };
  };
  statistics: {
    play_count: number;
    digg_count: number;
    comment_count: number;
    share_count: number;
    collect_count: number;
  };
  create_time: number;
  desc: string;
  video?: {
    play_addr?: {
      url_list: string[];
    };
  };
  music?: {
    play_url?: {
      url_list: string[];
    };
  };
}

interface TikTokVideo {
  userId: string;
  username: string;
  nickname: string;
  profilePicture: string;
  videoId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  createTime: number;
  desc: string;
  videoUrl: string;
  musicUrl: string;
}

interface ScrapeResult {
  username: string;
  complete: boolean;
  postsCount: number;
  error?: string;
}

/**
 * Fetches TikTok video stats by video ID using TOKAPI service
 * Used for getlate posts and manual video scraping
 */
export const getTikTokVideoById = internalAction({
  args: {
    videoId: v.union(v.string(), v.number()),
  },
  handler: async (_, args): Promise<{
    success: boolean;
    video?: {
      videoId: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
    };
    error?: string;
  }> => {
    try {
      const videoId = String(args.videoId);
      const requestUrl = `http://api.tokapi.online/v1/post/${videoId}`;

      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          'accept': 'application/json',
          'x-project-name': 'tokapi',
          'x-api-key': TOKAPI_KEY
        },
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        console.error(`Failed to fetch video ${videoId}: HTTP ${response.status}`);
        return {
          success: false,
          error: `HTTP ${response.status}`
        };
      }

      const data = await response.json();

      // Check for errors in response
      if (data.status_code !== 0 || !data.aweme_detail) {
        return {
          success: false,
          error: data.status_msg || 'Video not found'
        };
      }

      const aweme = data.aweme_detail;
      const stats = aweme.statistics;

      if (!stats) {
        return {
          success: false,
          error: 'No statistics found'
        };
      }

      return {
        success: true,
        video: {
          videoId,
          views: stats.play_count || 0,
          likes: stats.digg_count || 0,
          comments: stats.comment_count || 0,
          shares: stats.share_count || 0,
          saves: stats.collect_count || 0,
        }
      };
    } catch (error) {
      console.error(`Error fetching video ${args.videoId}:`, error);
      return {
        success: false,
        error: String(error)
      };
    }
  },
});

// ==================== Internal Query: Get Latest Scraped Video ====================

/**
 * Get the latest scraped video for a specific username
 * Used to determine where to stop scraping (avoid re-scraping old content)
 */
export const getLatestScrapedVideo = internalQuery({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const latestVideo = await ctx.db
      .query("tiktokVideos")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .order("desc")
      .first();

    if (!latestVideo) {
      return null;
    }

    return {
      videoId: latestVideo.videoId,
      createTime: latestVideo.createTime,
    };
  },
});

// ==================== Internal Mutation: Bulk Insert Videos ====================

/**
 * Bulk insert TikTok videos into the database
 * Checks for existing videos to avoid duplicates
 */
export const bulkInsertTikTokVideos = internalMutation({
  args: {
    videos: v.array(
      v.object({
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
      })
    ),
  },
  handler: async (ctx, args) => {
    // Get existing video IDs to avoid duplicates
    const existingVideos = await ctx.db
      .query("tiktokVideos")
      .withIndex("by_videoId")
      .collect();

    const existingVideoIds = new Set(existingVideos.map((v) => v.videoId));

    // Filter out existing videos
    const newVideos = args.videos.filter((v) => !existingVideoIds.has(v.videoId));

    // Insert new videos
    let insertedCount = 0;
    for (const video of newVideos) {
      await ctx.db.insert("tiktokVideos", video);
      insertedCount++;
    }

    return {
      total: args.videos.length,
      inserted: insertedCount,
      skipped: args.videos.length - insertedCount,
    };
  },
});

// ==================== Helper Functions ====================

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make API request with retry logic
 */
async function makeAPIRequest<T>(url: string, retries = MAX_RETRIES): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-project-name": "tokapi",
          "x-api-key": TOKAPI_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      await sleep(RETRY_DELAY * attempt); // Exponential backoff
    }
  }

  throw new Error("Max retries exceeded");
}

/**
 * Clean profile picture URL
 * Remove "sign-" prefix/suffix and split on "?"
 * Example: "https://...sign-abc-sign?param=value" -> "https://...abc"
 */
function cleanProfilePictureUrl(url: string): string {
  // Remove "sign-" prefix and "-sign" suffix
  const cleaned = url.replace(/sign-/g, "").replace(/-sign/g, "");
  // Split on "?" and take the first part
  return cleaned.split("?")[0] || "";
}

/**
 * Extract video URL from url_list
 * Find the URL that contains "/aweme/v1/play/"
 */
function extractVideoUrl(urlList: string[] | undefined): string {
  if (!urlList || urlList.length === 0) {
    return "";
  }

  // Find URL containing "/aweme/v1/play/"
  const playUrl = urlList.find((url) => url.includes("/aweme/v1/play/"));
  return playUrl || urlList[0] || "";
}

/**
 * Map Tokapi aweme to TikTokVideo format
 */
function mapAwemeToVideo(aweme: AwemeDetail, username: string): TikTokVideo {
  const profilePictureRaw = aweme.author.avatar_larger?.url_list?.[0] || "";
  const musicUrlList = aweme.music?.play_url?.url_list || [];
  const videoUrlList = aweme.video?.play_addr?.url_list || [];

  return {
    userId: aweme.author.uid,
    username: username,
    nickname: aweme.author.nickname || "",
    profilePicture: profilePictureRaw ? cleanProfilePictureUrl(profilePictureRaw) : "",
    videoId: aweme.aweme_id,
    views: aweme.statistics.play_count || 0,
    likes: aweme.statistics.digg_count || 0,
    comments: aweme.statistics.comment_count || 0,
    shares: aweme.statistics.share_count || 0,
    saves: aweme.statistics.collect_count || 0,
    createTime: aweme.create_time,
    desc: aweme.desc || "",
    videoUrl: extractVideoUrl(videoUrlList),
    musicUrl: musicUrlList[musicUrlList.length - 1] || "",
  };
}

// ==================== Scrape Single User Action ====================

/**
 * Scrape posts for a single TikTok username
 * Returns complete=true if we reached the end OR found a previously scraped video
 */
async function scrapeSingleUser(
  username: string,
  latestVideoId: string | null
): Promise<ScrapeResult & { videos: TikTokVideo[] }> {
  try {
    // Step 1: Get user ID by username
    const userUrl = `${TOKAPI_BASE_URL}/v1/user/username/${username}`;
    const userData = await makeAPIRequest<UserIdResponse>(userUrl);

    if (userData.status_code !== 0 || !userData.uid) {
      return {
        username,
        complete: false,
        postsCount: 0,
        videos: [],
        error: `Failed to get user ID: status_code=${userData.status_code}`,
      };
    }

    const userId = userData.uid;

    // Step 2: Paginate through user's posts
    const allVideos: TikTokVideo[] = [];
    let offset = 0;
    let hasMore = true;
    let reachedPreviousVideo = false;

    while (hasMore && !reachedPreviousVideo) {
      const postsUrl = `${TOKAPI_BASE_URL}/v1/post/user/${userId}/posts?count=30&offset=${offset}&region=US&with_pinned_posts=1`;
      const postsData = await makeAPIRequest<PostsResponse>(postsUrl);

      if (postsData.status_code !== 0) {
        return {
          username,
          complete: false,
          postsCount: allVideos.length,
          videos: [],
          error: `Failed to fetch posts: status_code=${postsData.status_code}`,
        };
      }

      if (!postsData.aweme_list || postsData.aweme_list.length === 0) {
        // Reached the end (no more posts)
        hasMore = false;
        break;
      }

      // Process each post
      for (const aweme of postsData.aweme_list) {
        // Check if we've reached a previously scraped video
        if (latestVideoId && aweme.aweme_id === latestVideoId) {
          reachedPreviousVideo = true;
          break;
        }

        // Map and add the video
        const video = mapAwemeToVideo(aweme, username);
        allVideos.push(video);
      }

      // Check if there are more posts
      hasMore = postsData.has_more === 1;

      if (hasMore && postsData.max_cursor) {
        offset = postsData.max_cursor;
      } else {
        hasMore = false;
      }
    }

    // Determine if scrape is complete
    const complete = !hasMore || reachedPreviousVideo;

    return {
      username,
      complete,
      postsCount: allVideos.length,
      videos: complete ? allVideos : [], // Only return videos if complete
      error: complete
        ? undefined
        : "Incomplete scrape: did not reach end or previous video",
    };
  } catch (error) {
    return {
      username,
      complete: false,
      postsCount: 0,
      videos: [],
      error: `Error scraping user: ${String(error)}`,
    };
  }
}

// ==================== Main Scraper Action ====================

/**
 * Scrape TikTok posts for multiple usernames in batches
 * Only inserts data if scrape is complete (reached end OR found previously scraped video)
 */
export const scrapeTikTokUserPosts = internalAction({
  args: {
    usernames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const totalUsernames = args.usernames.length;
    const allResults: ScrapeResult[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    let totalInserted = 0;

    console.log(`Starting scrape for ${totalUsernames} usernames...`);

    // Process usernames in batches of 10
    for (let i = 0; i < totalUsernames; i += BATCH_SIZE) {
      const batch = args.usernames.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(totalUsernames / BATCH_SIZE);

      console.log(
        `Processing batch ${batchNumber}/${totalBatches} (${batch.length} usernames)...`
      );

      // Process batch in parallel using Promise.allSettled
      const batchPromises = batch.map(async (username) => {
        // Get latest scraped video for this username
        const latestVideo = await ctx.runQuery(
          internal.app.tiktok.getLatestScrapedVideo,
          { username }
        );

        const latestVideoId = latestVideo?.videoId || null;

        // Scrape the user's posts
        return scrapeSingleUser(username, latestVideoId);
      });

      const batchResults = await Promise.allSettled(batchPromises);

      // Process results
      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          const scrapeResult = result.value;

          if (scrapeResult.error) {
            errors.push(`${scrapeResult.username}: ${scrapeResult.error}`);
          } else if (!scrapeResult.complete) {
            warnings.push(
              `${scrapeResult.username}: Incomplete scrape, no data inserted`
            );
          } else if (scrapeResult.videos.length > 0) {
            // Insert videos for complete scrapes
            try {
              const insertResult = await ctx.runMutation(
                internal.app.tiktok.bulkInsertTikTokVideos,
                { videos: scrapeResult.videos }
              );
              totalInserted += insertResult.inserted;
              console.log(
                `  ${scrapeResult.username}: ${insertResult.inserted} videos inserted (${insertResult.skipped} duplicates skipped)`
              );
            } catch (error) {
              errors.push(
                `${scrapeResult.username}: Failed to insert videos - ${String(error)}`
              );
            }
          }

          allResults.push({
            username: scrapeResult.username,
            complete: scrapeResult.complete,
            postsCount: scrapeResult.postsCount,
            error: scrapeResult.error,
          });
        } else {
          errors.push(`Unknown error: ${result.reason}`);
        }
      }

      console.log(`Batch ${batchNumber}/${totalBatches} complete`);
    }

    // Return summary
    const summary = {
      success: true,
      processed: totalUsernames,
      inserted: totalInserted,
      complete: allResults.filter((r) => r.complete).length,
      incomplete: allResults.filter((r) => !r.complete && !r.error).length,
      failed: allResults.filter((r) => r.error).length,
      warnings,
      errors,
    };

    console.log(
      `Scraping complete: ${summary.complete} complete, ${summary.incomplete} incomplete, ${summary.failed} failed, ${totalInserted} videos inserted`
    );

    return summary;
  },
});

// ==================== Public Functions for Python Script ====================

/**
 * List all TikTok videos without a campaignId
 * Used by Python audio matching script
 */
export const listVideosWithoutCampaign = query({
  args: {},
  handler: async (ctx) => {
    const allVideos = await ctx.db.query("tiktokVideos")
      .withIndex("by_campaignId", (q) => q.eq("campaignId", undefined))
      .collect()
    return allVideos

    // const video = await ctx.db.get('nn70evenrp7gjjv3jxt986ayy57vapp9' as Id<"tiktokVideos">)
    // return [video]


  },
});

/**
 * Update a TikTok video's campaignId
 * Used by Python audio matching script
 */
export const updateVideoCampaign = mutation({
  args: {
    videoId: v.id("tiktokVideos"),
    campaignId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.videoId, {
      campaignId: args.campaignId,
    });

    return { success: true };
  },
});
