import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalAction, internalQuery } from "../_generated/server";

const encodeCaption = (caption: string): string => {
  let hex = '';
  for (let i = 0; i < caption.length; i++) {
    hex += caption.charCodeAt(i).toString(16).padStart(4, '0');
  }
  return hex;
};

const normalizeCaption = (caption: string): string => {
  return caption
    .trim()
    // Remove spaces after newlines
    .replace(/\n\s+/g, '\n')
    // Remove spaces before newlines
    .replace(/\s+\n/g, '\n')
    // Normalize multiple spaces to single space
    .replace(/[^\S\n]+/g, ' ')
    // Normalize multiple newlines
    .replace(/\n{3,}/g, '\n\n');
};

const extractCoreCaption = (caption: string): string => {
  // Extract only letters (a-z), convert to lowercase
  const lettersOnly = caption.toLowerCase().replace(/[^a-z]/g, '');

  // Return first 10 letters
  return lettersOnly.substring(0, 10);
};

const TOKAPI_KEY = "808a45b29cf9422798bcc4560909b4c2"
const TIKTOK_ACCOUNTS = [
  "MelodyVibes238",
  "melodywhisperer",
  "lyricvibesoulx",
  "songgazerx",
  "lyricdancer8",
  "trackriderx",
  "musictrekker",
  "rhythmswayx",
  "trackvibe2",
  "echoexplorersoul",
  "purerhythm",
  "lyricbenderx",
  "lyricdream8",
  "melodyswerve",
  "melodydive",
  "melodysoulseeker",
  "tracksoulmatex",
  "musiccraze50",
  "vibechaserz8",
  "jamflow72",
  "jamsoulx",
  "audiorider",
  "SonicWhisper",
  "LyricDreamerX",
  "BeatBenderX",
  "NoteVibes",
  "SonicRiderX",
  "SonicAddictX",
  "TrackLoverX",
  "JamTunerX",
  "MelodyTunerX",
  "EchoDreamer",
  "JamJunkie",
  "trackwhisperx",
  "sonicsway6",
  "sonicwavex",
  "noteseeker",
  "tracksoulmate",
  "echobeats461",
  "vibefusion951",
  "sonicrhythmx",
  "songsoulx6",
  "songwave56",
  "sonicwhispersoul",
  "echowanderer50",
  "trackseekerx",
  "trackvibesoul",
  "songswaysoul",
  "sonicsoulmatex",
  "musicseeker21",
  "rhythmdreamer7",
  "jamvibex",
  "echovibes235",
  "lyricvoyager0",
  "lyricexplorerx",
  "beatlover32",
  "rhythmseeker2",
  "melodytreksoulx",
  "lyrictunerx",
  "musicchaser1",
  "rhythmsoulmate",
  "musicflowr",
  "sonicexplorersoul",
  "echowave303",
  "tracksoul0",
  "jamvibes6",
  "lyricjunkiez",
  "echotreksoul",
  "melodygazer7",
  "lyricbender",
  "soundgazer1",
  "vibegazer4",
  "tuneflow94",
  "lyriclover779",
  "sonicdreamer7",
  "songchasersoul",
  "beatsoul12",
  "rhythmexplorer31",
  "sonicdrifter6",
  "musicsoulmate1",
  "songswayer",
  "melodyhopper",
  "sonicsoulexplorer",
  "songvibesoul",
  "songsoulmatex",
  "songdrift1",
  "echovibesoul",
  "beatjunkiex",
  "beatmaven",
  "songgazer0",
  "beattreksoul",
  "viberider79",
  "echovibe332",
  "songgazerx6",
  "jamrider6",
  "melodysoulz",
  "vibesoulx1",
  "echosoulmate",
  "trackflow8",
  "lyricdreamersoul",
  "songexplorersoul",
  "lyricaddictx",
  "beatvibez0",
  "echoexplorer54",
  "sonicchasersoul",
  "melodywalker83",
  "jamsoul7",
  "melodytuner7",
  "melodysoul26",
  "sonicsoulz",
  "songwhisper8",
  "musicvibes7655",
  "melodyexplorerx",
  "lyricadventurer",
  "echotrekker5",
  "trackwhisper18",
  "trackwhisperer5",
  "songvibesoulx",
  "beatbender4",
  "beatadventurer0",
  "ravijggehzo",
  "TrackTrekX",
  "LyricGazerSoul",
  "TrackDrifterSoul",
  "lyrichopper",
  "notewanderer8",
  "echoriderx",
  "echosoulmate8",
  "rhythmgazer",
  "vipingsounds",
  "echosonic97",
  "vibeexplorer53",
  "melodyseeker6",
  "soundtrackstar6",
  "echochaserx",
  "vibedreamer8",
  "sonicwanderer0",
  "audioswayx",
  "notewhisperer1",
  "sonicseeker81",
  "trackdrifter",
  "jamflowx",
  "melodyjourney53",
  "jamvibessoul",
  "balvieohetm",
  "sonicvibeexplorer",
  "melodyseekersoul",
  "melodyswervex",
  "songhopper",
  "jamsoulmatex",
  "lyricexplorerx5",
  "songsway7"
];


export const getTikTokUserVideos = internalAction({
  args: {
    username: v.string(),
    maxCursor: v.union(v.number(), v.null()),
  },
  handler: async (_, args): Promise<{
    maxCursor: number | null;
    hasMore: boolean;
    videos: {
      videoId: string;
      postedAt: number;
      videoUrl: string;
      mediaUrl?: string;
      thumbnailUrl: string;
      description: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
    }[];
  }> => {
    const videos: {
      videoId: string;
      postedAt: number;
      videoUrl: string;
      mediaUrl?: string;
      thumbnailUrl: string;
      description: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
    }[] = [];

    let requestUrl = `http://api.tokapi.online/v1/post/user/posts?username=${args.username}&count=20`;
    if (args.maxCursor) {
      requestUrl += `&offset=${args.maxCursor}`;
    }

    let data;
    let success = false;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(requestUrl, {
          method: "GET",
          headers: {
            'accept': 'application/json',
            'x-project-name': 'tokapi',
            'x-api-key': TOKAPI_KEY
          },
          signal: AbortSignal.timeout(30000), // 30 second timeout per request
        });

        if (!response.ok) {
          console.error(`HTTP error for @${args.username}: ${response.status}`);
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }

        data = await response.json();
        if (!data.error) {
          success = true;
          break;
        }

        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      } catch (err) {
        console.error(`Attempt ${attempt + 1} failed for @${args.username}:`, err);
        if (attempt < 2) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    if (!success || data?.error) {
      // console.error(`Error fetching from https://www.tiktok.com/@${args.username}`);
      return {
        maxCursor: null,
        hasMore: false,
        videos: []
      };
    }


    // Check if there's an error message in the response
    if (data.status_msg && data.status_msg.length > 0) {
      return {
        maxCursor: null,
        hasMore: false,
        videos: []
      };
    }

    // Ensure required data structures exist
    if (!data.aweme_list || !Array.isArray(data.aweme_list)) {
      return {
        maxCursor: null,
        hasMore: false,
        videos: []
      };
    }


    const maxCursor = data.max_cursor
    const hasMore = data.has_more === 1

    for (const video of data.aweme_list) {
      const thumbnail_url = video.video.cover.url_list[0];

      videos.push({
        videoId: video.aweme_id.toString(),
        postedAt: video.create_time,
        videoUrl: `https://www.tiktok.com/@/video/${video.aweme_id}`,
        thumbnailUrl: thumbnail_url,
        description: video.desc || '',
        views: video.statistics.play_count,
        likes: video.statistics.digg_count,
        comments: video.statistics.comment_count,
        shares: video.statistics.share_count,
        saves: video.statistics.collect_count,
      })
    }

    return {
      maxCursor, hasMore, videos
    };
  },
});


export const getTikTokVideoById = internalAction({
  args: {
    videoId: v.string(),
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
      const requestUrl = `http://api.tokapi.online/v1/post/${args.videoId}`;

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
        console.error(`Failed to fetch video ${args.videoId}: HTTP ${response.status}`);
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
          videoId: args.videoId,
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


export const getTikTokVideoComments = internalAction({
  args: {
    videoId: v.string(),
  },
  handler: async (_, args): Promise<{
    comments: {
      commentId: string;
      text: string;
      authorUsername: string;
      authorNickname: string;
      authorProfilePicUrl: string;
      createdAt: number;
    }[];
  }> => {
    const comments: {
      commentId: string;
      text: string;
      authorUsername: string;
      authorNickname: string;
      authorProfilePicUrl: string;
      createdAt: number;
    }[] = [];

    try {
      const requestUrl = `http://api.tokapi.online/v1/post/${args.videoId}/comments`;
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
        console.error(`Failed to fetch comments for video ${args.videoId}: HTTP ${response.status}`);
        return { comments: [] };
      }

      const data = await response.json();

      // Check if comments exist and is an array
      if (!data.comments || !Array.isArray(data.comments)) {
        return { comments: [] };
      }

      for (const comment of data.comments) {
        // Validate required fields exist
        if (!comment.cid || !comment.user || !comment.text) {
          continue;
        }

        comments.push({
          commentId: comment.cid.toString(),
          text: comment.text || '',
          authorUsername: comment.user.unique_id || 'unknown',
          authorNickname: comment.user.nickname || 'Unknown User',
          authorProfilePicUrl: comment.user.avatar_thumb?.url_list?.[0] || '',
          createdAt: comment.create_time || Date.now(),
        });
      }
    } catch (error) {
      console.error(`Error fetching comments for video ${args.videoId}:`, error);
      return { comments: [] };
    }

    return {
      comments
    };
  },
});


export const scrapeManuallyPostedVideos = internalAction({
  args: {
    username: v.string(),
    captionToCampaignMap: v.record(v.string(), v.object({
      campaignId: v.id("campaigns"),
      userId: v.id("users"),
    })),
  },
  handler: async (ctx, args) => {
    let currentMaxCursor: number | null = null;
    let pagesProcessed = 0;
    const MAX_PAGES = 10; // Limit pages to prevent infinite loops

    while (pagesProcessed < MAX_PAGES) {
      pagesProcessed++;

      let result: {
        maxCursor: number | null;
        hasMore: boolean;
        videos: Array<{
          videoId: string;
          postedAt: number;
          videoUrl: string;
          mediaUrl?: string;
          thumbnailUrl: string;
          views: number;
          likes: number;
          comments: number;
          shares: number;
          saves: number;
          description: string;
        }>;
      } = { maxCursor: null, hasMore: false, videos: [] }; // Initialize with default values

      try {
        result = await ctx.runAction(internal.app.tiktok.getTikTokUserVideos, {
          username: args.username,
          maxCursor: currentMaxCursor
        });
      } catch (error) {
        console.error(`Error fetching videos for @${args.username}:`, error);
        break; // Exit the loop on error
      }
      const { maxCursor, hasMore, videos } = result;
      // console.log(`Fetched ${videos.length} videos for account https://www.tiktok.com/@${args.username}`);

      for (const video of videos) {
        // Normalize and encode the video description to match the encoded keys in the map
        const normalizedDescription = normalizeCaption(video.description);
        const encodedDescription = encodeCaption(normalizedDescription);
        const campaignData = args.captionToCampaignMap[encodedDescription];
        if (campaignData) {
          try {
            const result = await ctx.runMutation(internal.app.analytics.storeManuallyPostedVideo, {
              campaignId: campaignData.campaignId,
              userId: campaignData.userId,
              videoId: video.videoId,
              postedAt: video.postedAt,
              videoUrl: video.videoUrl,
              mediaUrl: video.mediaUrl,
              thumbnailUrl: video.thumbnailUrl,
              views: video.views,
              likes: video.likes,
              comments: video.comments,
              shares: video.shares,
              saves: video.saves,
              socialPlatform: "tiktok",
            });


            // Fetch and store comments for this video
            if (result.videoId && video.comments > 0) {
              try {
                const commentsData = await ctx.runAction(internal.app.tiktok.getTikTokVideoComments, {
                  videoId: video.videoId,
                });

                if (commentsData.comments && commentsData.comments.length > 0) {
                  await ctx.runMutation(internal.app.analytics.storeVideoComments, {
                    campaignId: campaignData.campaignId,
                    userId: campaignData.userId,
                    videoId: result.videoId,
                    socialPlatform: "tiktok",
                    comments: commentsData.comments,
                  });
                }
              } catch (commentError) {
                console.error(`Failed to fetch/store comments for video ${video.videoId}:`, commentError);
              }
            }
          } catch (error) {
            console.error(`Failed to store video ${video.videoId}:`, error);
          }
        } else {
          // console.log(`No match: ${video.description.trim()}`);
        }
      }

      if (!hasMore || !maxCursor) break;
      currentMaxCursor = maxCursor;
    }

    if (pagesProcessed >= MAX_PAGES) {
    }
  },
});


export const scrapeManuallyPostedVideosFromJson = internalAction({
  args: {
    videos: v.array(v.object({
      campaignId: v.string(),
      username: v.string(),
      tiktokVideoId: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Early check: Filter out videos that already exist in database
    const existenceChecks = await Promise.all(
      args.videos
        .filter(v => v.tiktokVideoId && v.tiktokVideoId.trim() !== '')
        .map(async (video) => ({
          ...video,
          exists: await ctx.runQuery(internal.app.analytics.checkVideoExistsInManuallyPosted, {
            videoId: video.tiktokVideoId,
            socialPlatform: "tiktok",
          }),
        }))
    );

    // Filter to only process videos that don't exist yet
    const videosToProcess = existenceChecks.filter(v => !v.exists);
    const skippedCount = existenceChecks.length - videosToProcess.length;

    if (skippedCount > 0) {
      console.log(`⊙ Skipped ${skippedCount} videos that already exist in database`);
    }

    // Step 1: Group videos by username for efficient batch processing
    const videosByUsername = new Map<string, Array<{
      campaignId: string;
      tiktokVideoId: string;
    }>>();

    for (const entry of videosToProcess) {
      if (!videosByUsername.has(entry.username)) {
        videosByUsername.set(entry.username, []);
      }

      videosByUsername.get(entry.username)!.push({
        campaignId: entry.campaignId,
        tiktokVideoId: entry.tiktokVideoId,
      });
    }


    // Step 2: Process each username once
    for (const [username, videosToFind] of videosByUsername) {

      // Fetch campaign data for all videos from this username
      const campaignCache = new Map<string, { _id: Id<"campaigns">; userId: Id<"users"> } | null>();
      for (const video of videosToFind) {
        if (!campaignCache.has(video.campaignId)) {
          const isReferenceId = /^\d+$/.test(video.campaignId);

          let campaign
          if (isReferenceId) {
            campaign = await ctx.runQuery(internal.app.campaigns.getByReferenceId, {
              referenceId: video.campaignId
            });
          } else {
            campaign = await ctx.runQuery(internal.app.campaigns.getInternal, {
              campaignId: video.campaignId as Id<"campaigns">
            });
          }
          campaignCache.set(video.campaignId, campaign);
        }
      }

      // Fetch all videos from this user (with pagination)
      const allUserVideos: Array<{
        videoId: string;
        postedAt: number;
        videoUrl: string;
        mediaUrl?: string;
        thumbnailUrl: string;
        views: number;
        likes: number;
        comments: number;
        shares: number;
        saves: number;
        description: string;
      }> = [];

      let currentMaxCursor: number | null = null;
      let pagesProcessed = 0;
      const MAX_PAGES = 1;

      while (pagesProcessed < MAX_PAGES) {
        pagesProcessed++;

        let result: {
          maxCursor: number | null;
          hasMore: boolean;
          videos: Array<{
            videoId: string;
            postedAt: number;
            videoUrl: string;
            mediaUrl?: string;
            thumbnailUrl: string;
            views: number;
            likes: number;
            comments: number;
            shares: number;
            saves: number;
            description: string;
          }>;
        } = { maxCursor: null, hasMore: false, videos: [] };

        try {
          result = await ctx.runAction(internal.app.tiktok.getTikTokUserVideos, {
            username: username,
            maxCursor: currentMaxCursor
          });
        } catch (error) {
          console.error(`Error fetching videos for @${username}:`, error);
          break;
        }

        const { maxCursor, hasMore, videos } = result;
        allUserVideos.push(...videos);

        // Continue to next page if more available
        if (!hasMore || !maxCursor) break;
        currentMaxCursor = maxCursor;
      }

      // Step 3: Match all videos for this username in one pass
      const videoIdSet = new Set(videosToFind.map(v => v.tiktokVideoId));
      let matchedCount = 0;

      for (const userVideo of allUserVideos) {
        // Find if this video is in our list
        const videoToStore = videosToFind.find(v => v.tiktokVideoId === userVideo.videoId);

        if (videoToStore) {
          const campaign = campaignCache.get(videoToStore.campaignId);

          if (!campaign) {
            console.error(`  ✗ Campaign not found or deleted: ${videoToStore.campaignId}`);
            continue;
          }

          try {
            // Store the video
            const storedVideo = await ctx.runMutation(internal.app.analytics.storeManuallyPostedVideo, {
              campaignId: campaign._id,
              userId: campaign.userId,
              videoId: userVideo.videoId,
              postedAt: userVideo.postedAt,
              videoUrl: userVideo.videoUrl,
              mediaUrl: userVideo.mediaUrl,
              thumbnailUrl: userVideo.thumbnailUrl,
              views: userVideo.views,
              likes: userVideo.likes,
              comments: userVideo.comments,
              shares: userVideo.shares,
              saves: userVideo.saves,
              socialPlatform: "tiktok",
            });

            matchedCount++;

            // Fetch and store comments if available
            if (storedVideo.videoId && userVideo.comments > 0) {
              try {
                const commentsData = await ctx.runAction(internal.app.tiktok.getTikTokVideoComments, {
                  videoId: userVideo.videoId,
                });

                if (commentsData.comments && commentsData.comments.length > 0) {
                  await ctx.runMutation(internal.app.analytics.storeVideoComments, {
                    campaignId: campaign._id,
                    userId: campaign.userId,
                    videoId: storedVideo.videoId,
                    socialPlatform: "tiktok",
                    comments: commentsData.comments,
                  });
                }
              } catch (commentError) {
                console.error(`    ✗ Failed to fetch/store comments for video ${userVideo.videoId}:`, commentError);
              }
            }
          } catch (error) {
            console.error(`  ✗ Failed to store video ${userVideo.videoId}:`, error);
          }
        }
      }

      // Report any videos not found
      const foundVideoIds = new Set(
        allUserVideos.filter(v => videoIdSet.has(v.videoId)).map(v => v.videoId)
      );
      const notFound = videosToFind.filter(v => !foundVideoIds.has(v.tiktokVideoId));

      if (notFound.length > 0) {
        console.log(`  ✗ ${notFound.length} videos not found: ${notFound.map(v => v.tiktokVideoId).join(', ')}`);
      }

    }
  },
});


export const scrapeVideosFromCaptionsJson = internalAction({
  args: {
    videos: v.array(v.object({
      campaignId: v.string(),
      username: v.string(),
      postCaption: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    console.log(`🔍 Starting caption-based video scraping for ${args.videos.length} entries`);

    // Step 1: Group videos by username for efficient batch processing
    const videosByUsername = new Map<string, Array<{
      campaignId: string;
      postCaption: string;
    }>>();

    for (const entry of args.videos) {
      if (!videosByUsername.has(entry.username)) {
        videosByUsername.set(entry.username, []);
      }

      videosByUsername.get(entry.username)!.push({
        campaignId: entry.campaignId,
        postCaption: entry.postCaption,
      });
    }

    console.log(`📊 Processing ${videosByUsername.size} unique username(s)`);

    let totalMatched = 0;
    let totalNotMatched = 0;

    // Step 2: Process each username
    for (const [username, captionsToFind] of videosByUsername) {
      console.log(`\n👤 Processing @${username} (${captionsToFind.length} caption(s) to match)`);

      // Fetch campaign data for all videos from this username
      const campaignCache = new Map<string, { _id: Id<"campaigns">; userId: Id<"users"> } | null>();
      for (const video of captionsToFind) {
        if (!campaignCache.has(video.campaignId)) {
          const isReferenceId = /^\d+$/.test(video.campaignId);

          let campaign
          if (isReferenceId) {
            campaign = await ctx.runQuery(internal.app.campaigns.getByReferenceId, {
              referenceId: video.campaignId
            });
          } else {
            campaign = await ctx.runQuery(internal.app.campaigns.getInternal, {
              campaignId: video.campaignId as Id<"campaigns">
            });
          }
          campaignCache.set(video.campaignId, campaign);
        }
      }

      // Fetch all videos from this user (with pagination)
      const allUserVideos: Array<{
        videoId: string;
        postedAt: number;
        videoUrl: string;
        mediaUrl?: string;
        thumbnailUrl: string;
        views: number;
        likes: number;
        comments: number;
        shares: number;
        saves: number;
        description: string;
      }> = [];

      let currentMaxCursor: number | null = null;
      let pagesProcessed = 0;
      const MAX_PAGES = 5; // Fetch up to 5 pages (100 videos) to find matches

      while (pagesProcessed < MAX_PAGES) {
        pagesProcessed++;

        let result: {
          maxCursor: number | null;
          hasMore: boolean;
          videos: Array<{
            videoId: string;
            postedAt: number;
            videoUrl: string;
            mediaUrl?: string;
            thumbnailUrl: string;
            views: number;
            likes: number;
            comments: number;
            shares: number;
            saves: number;
            description: string;
          }>;
        } = { maxCursor: null, hasMore: false, videos: [] };

        try {
          result = await ctx.runAction(internal.app.tiktok.getTikTokUserVideos, {
            username: username,
            maxCursor: currentMaxCursor
          });
        } catch (error) {
          console.error(`  ✗ Error fetching videos for @${username}:`, error);
          break;
        }

        const { maxCursor, hasMore, videos } = result;
        allUserVideos.push(...videos);
        console.log(`  📥 Fetched page ${pagesProcessed}: ${videos.length} video(s)`);

        // Continue to next page if more available
        if (!hasMore || !maxCursor) break;
        currentMaxCursor = maxCursor;
      }

      console.log(`  📊 Total videos fetched: ${allUserVideos.length}`);

      // Step 3: Match videos by caption
      let matchedCount = 0;
      const notFoundCaptions: string[] = [];

      for (const captionEntry of captionsToFind) {
        const campaign = campaignCache.get(captionEntry.campaignId);

        if (!campaign) {
          console.error(`  ✗ Campaign not found or deleted: ${captionEntry.campaignId}`);
          notFoundCaptions.push(captionEntry.postCaption.substring(0, 50) + '...');
          totalNotMatched++;
          continue;
        }

        // Extract core caption (first 10 letters)
        const coreCaption = extractCoreCaption(captionEntry.postCaption);
        const encodedCoreCaption = encodeCaption(coreCaption);

        // Check if caption contains "moliy" (case insensitive)
        const hasMoliy = captionEntry.postCaption.toLowerCase().includes('moliy');

        console.log(`\n  🔍 Looking for caption:`);
        console.log(`     Original: "${captionEntry.postCaption}"`);
        console.log(`     Core (first 10 letters): "${coreCaption}"`);
        console.log(`     Contains "moliy": ${hasMoliy ? 'YES' : 'NO'}`);
        console.log(`  📝 Checking ${allUserVideos.length} video(s)...\n`);

        // Find matching videos using core caption comparison OR "moliy" keyword
        const matchingVideos = allUserVideos.filter((video, index) => {
          const coreDescription = extractCoreCaption(video.description);
          const encodedCoreDescription = encodeCaption(coreDescription);

          // Match if: first 10 letters match OR both contain "moliy"
          const firstTenMatch = encodedCoreDescription === encodedCoreCaption;
          const videoHasMoliy = video.description.toLowerCase().includes('moliy');
          const moliyMatch = hasMoliy && videoHasMoliy;
          const isMatch = firstTenMatch || moliyMatch;

          // Debug logging for each video
          console.log(`  Video ${index + 1}/${allUserVideos.length}:`);
          console.log(`    Original: "${video.description}"`);
          console.log(`    Core: "${coreDescription}"`);
          console.log(`    Has "moliy": ${videoHasMoliy ? 'YES' : 'NO'}`);
          console.log(`    Match: ${isMatch ? '✅ YES' : '❌ NO'}${moliyMatch ? ' (moliy keyword)' : firstTenMatch ? ' (first 10 letters)' : ''}`);

          return isMatch;
        });

        if (matchingVideos.length === 0) {
          console.log(`  ⊙ No match found for caption: "${captionEntry.postCaption}"`);
          notFoundCaptions.push(captionEntry.postCaption.substring(0, 50) + '...');
          totalNotMatched++;
          continue;
        }

        // Store all matching videos (there might be multiple with the same caption)
        for (const matchedVideo of matchingVideos) {
          // Check if video already exists
          const videoExists = await ctx.runQuery(internal.app.analytics.checkVideoExistsInManuallyPosted, {
            videoId: matchedVideo.videoId,
            socialPlatform: "tiktok",
          });

          if (videoExists) {
            console.log(`  ⊙ Video ${matchedVideo.videoId} already exists, skipping`);
            continue;
          }

          try {
            // Store the video
            const storedVideo = await ctx.runMutation(internal.app.analytics.storeManuallyPostedVideo, {
              campaignId: campaign._id,
              userId: campaign.userId,
              videoId: matchedVideo.videoId,
              postedAt: matchedVideo.postedAt,
              videoUrl: matchedVideo.videoUrl,
              mediaUrl: matchedVideo.mediaUrl,
              thumbnailUrl: matchedVideo.thumbnailUrl,
              views: matchedVideo.views,
              likes: matchedVideo.likes,
              comments: matchedVideo.comments,
              shares: matchedVideo.shares,
              saves: matchedVideo.saves,
              socialPlatform: "tiktok",
            });

            matchedCount++;
            totalMatched++;
            console.log(`  ✓ Matched and stored video ${matchedVideo.videoId} (${matchedVideo.views.toLocaleString()} views)`);

            // Fetch and store comments if available
            if (storedVideo.videoId && matchedVideo.comments > 0) {
              try {
                const commentsData = await ctx.runAction(internal.app.tiktok.getTikTokVideoComments, {
                  videoId: matchedVideo.videoId,
                });

                if (commentsData.comments && commentsData.comments.length > 0) {
                  await ctx.runMutation(internal.app.analytics.storeVideoComments, {
                    campaignId: campaign._id,
                    userId: campaign.userId,
                    videoId: storedVideo.videoId,
                    socialPlatform: "tiktok",
                    comments: commentsData.comments,
                  });
                  console.log(`    ✓ Stored ${commentsData.comments.length} comment(s)`);
                }
              } catch (commentError) {
                console.error(`    ✗ Failed to fetch/store comments for video ${matchedVideo.videoId}:`, commentError);
              }
            }
          } catch (error) {
            console.error(`  ✗ Failed to store video ${matchedVideo.videoId}:`, error);
          }
        }
      }

      console.log(`  ✅ @${username}: ${matchedCount} video(s) matched and stored`);
      if (notFoundCaptions.length > 0) {
        console.log(`  ⚠️  ${notFoundCaptions.length} caption(s) not found`);
      }
    }

    console.log(`\n🎉 Scraping complete: ${totalMatched} video(s) matched, ${totalNotMatched} not found`);

    return {
      totalProcessed: args.videos.length,
      totalMatched,
      totalNotMatched,
    };
  },
});


export const getTikTokVideosForCampaigns = internalQuery({
  args: {
    campaignIds: v.array(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    const allVideos: Array<{
      _id: Id<"manuallyPostedVideos"> | Id<"ayrsharePostedVideos"> | Id<"latePostedVideos">;
      campaignId: Id<"campaigns">;
      userId: Id<"users">;
      videoId: string;
      videoUrl: string;
      socialPlatform: "tiktok" | "instagram" | "youtube";
    }> = [];

    for (const campaignId of args.campaignIds) {
      // Get manually posted TikTok videos
      const manualVideos = await ctx.db
        .query("manuallyPostedVideos")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .filter((q) => q.eq(q.field("socialPlatform"), "tiktok"))
        .collect();

      // Get Ayrshare posted TikTok videos
      const ayrshareVideos = await ctx.db
        .query("ayrsharePostedVideos")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .filter((q) => q.eq(q.field("socialPlatform"), "tiktok"))
        .collect();

      // Get Late API posted TikTok videos
      const lateVideos = await ctx.db
        .query("latePostedVideos")
        .withIndex("by_campaignId", (q) => q.eq("campaignId", campaignId))
        .filter((q) => q.eq(q.field("socialPlatform"), "tiktok"))
        .collect();

      // Add to combined list with videoUrl included
      allVideos.push(
        ...manualVideos.map(v => ({
          _id: v._id,
          campaignId: v.campaignId,
          userId: v.userId,
          videoId: v.videoId,
          videoUrl: v.videoUrl,
          socialPlatform: v.socialPlatform,
        })),
        ...ayrshareVideos.map(v => ({
          _id: v._id,
          campaignId: v.campaignId,
          userId: v.userId,
          videoId: v.videoId,
          videoUrl: v.videoUrl,
          socialPlatform: v.socialPlatform,
        })),
        ...lateVideos.map(v => ({
          _id: v._id,
          campaignId: v.campaignId,
          userId: v.userId,
          videoId: v.videoId,
          videoUrl: v.videoUrl,
          socialPlatform: v.socialPlatform,
        }))
      );
    }

    return allVideos;
  },
});


export const refreshCampaignVideoAnalytics = internalAction({
  args: {
    campaignIds: v.array(v.id("campaigns")),
  },
  handler: async (ctx, args): Promise<{
    campaignsProcessed: number;
    videosToRefresh: number;
    videosRefreshed: number;
    videosFailed: number;
    errors: string[];
  }> => {
    console.log(`🔄 Starting analytics refresh for ${args.campaignIds.length} campaign(s)`);

    // Get all existing TikTok videos for these campaigns
    const existingVideos: Array<{
      _id: Id<"manuallyPostedVideos"> | Id<"ayrsharePostedVideos"> | Id<"latePostedVideos">;
      campaignId: Id<"campaigns">;
      userId: Id<"users">;
      videoId: string;
      videoUrl: string;
      socialPlatform: "tiktok" | "instagram" | "youtube";
    }> = await ctx.runQuery(internal.app.tiktok.getTikTokVideosForCampaigns, {
      campaignIds: args.campaignIds,
    });

    if (existingVideos.length === 0) {
      console.log("⚠️  No TikTok videos found for the specified campaigns");
      return {
        campaignsProcessed: args.campaignIds.length,
        videosToRefresh: 0,
        videosRefreshed: 0,
        videosFailed: 0,
        errors: [],
      };
    }

    console.log(`📊 Found ${existingVideos.length} TikTok video(s) to refresh`);

    let videosRefreshed = 0;
    let videosFailed = 0;
    const errors: string[] = [];
    const CONCURRENT_THREADS = 5;
    const DELAY_BETWEEN_BATCHES_MS = 500; // Delay between batches to avoid rate limiting

    // Process videos in batches of 5 concurrently
    for (let i = 0; i < existingVideos.length; i += CONCURRENT_THREADS) {
      const batch = existingVideos.slice(i, i + CONCURRENT_THREADS);
      const batchNumber = Math.floor(i / CONCURRENT_THREADS) + 1;
      const totalBatches = Math.ceil(existingVideos.length / CONCURRENT_THREADS);

      console.log(`\n📦 Batch ${batchNumber}/${totalBatches} - Processing ${batch.length} video(s) in parallel...`);

      // Process all videos in this batch concurrently
      const batchResults = await Promise.all(
        batch.map(async (video, batchIndex) => {
          const videoNumber = i + batchIndex + 1;
          console.log(`🔍 [${videoNumber}/${existingVideos.length}] Fetching stats for video ${video.videoId}`);

          try {
            // Fetch fresh stats directly by video ID
            const result = await ctx.runAction(internal.app.tiktok.getTikTokVideoById, {
              videoId: video.videoId,
            });

            if (!result.success || !result.video) {
              const errorMsg = `Video ${video.videoId}: ${result.error || 'Unknown error'}`;
              console.error(`  ✗ [${videoNumber}/${existingVideos.length}] ${errorMsg}`);
              return { success: false, error: errorMsg };
            }

            const freshStats = result.video;

            // Update video analytics in database
            const storedVideo = await ctx.runMutation(internal.app.analytics.storeManuallyPostedVideo, {
              campaignId: video.campaignId,
              userId: video.userId,
              videoId: video.videoId,
              postedAt: Date.now(), // Keep existing postedAt (this gets overwritten in mutation if exists)
              videoUrl: video.videoUrl,
              mediaUrl: undefined, // Keep existing
              thumbnailUrl: video.videoUrl, // Keep existing (this gets overwritten if exists)
              views: freshStats.views,
              likes: freshStats.likes,
              comments: freshStats.comments,
              shares: freshStats.shares,
              saves: freshStats.saves,
              socialPlatform: "tiktok",
            });

            console.log(`  ✓ [${videoNumber}/${existingVideos.length}] Updated: ${freshStats.views.toLocaleString()} views, ${freshStats.likes.toLocaleString()} likes, ${freshStats.comments.toLocaleString()} comments`);

            // Refresh comments if available
            if (storedVideo.videoId && freshStats.comments > 0) {
              try {
                const commentsData = await ctx.runAction(internal.app.tiktok.getTikTokVideoComments, {
                  videoId: video.videoId,
                });

                if (commentsData.comments && commentsData.comments.length > 0) {
                  await ctx.runMutation(internal.app.analytics.storeVideoComments, {
                    campaignId: video.campaignId,
                    userId: video.userId,
                    videoId: storedVideo.videoId,
                    socialPlatform: "tiktok",
                    comments: commentsData.comments,
                  });
                  console.log(`    ✓ [${videoNumber}/${existingVideos.length}] Refreshed ${commentsData.comments.length} comment(s)`);
                }
              } catch (commentError) {
                console.error(`    ⚠️  [${videoNumber}/${existingVideos.length}] Failed to refresh comments:`, commentError);
                // Don't count comment failures as video failures
              }
            }

            return { success: true };
          } catch (error) {
            const errorMsg = `Failed to process video ${video.videoId}: ${error}`;
            console.error(`  ✗ [${videoNumber}/${existingVideos.length}] ${errorMsg}`);
            return { success: false, error: errorMsg };
          }
        })
      );

      // Count successes and failures for this batch
      for (const result of batchResults) {
        if (result.success) {
          videosRefreshed++;
        } else {
          videosFailed++;
          if (result.error) {
            errors.push(result.error);
          }
        }
      }

      console.log(`✅ Batch ${batchNumber}/${totalBatches} complete - Success: ${batchResults.filter(r => r.success).length}/${batch.length}`);

      // Small delay between batches to avoid overwhelming the API
      if (i + CONCURRENT_THREADS < existingVideos.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
      }
    }

    const summary: {
      campaignsProcessed: number;
      videosToRefresh: number;
      videosRefreshed: number;
      videosFailed: number;
      errors: string[];
    } = {
      campaignsProcessed: args.campaignIds.length,
      videosToRefresh: existingVideos.length,
      videosRefreshed,
      videosFailed,
      errors: errors.slice(0, 20), // Show more errors since they're more relevant now
    };

    console.log(`✅ Refresh complete: ${videosRefreshed} succeeded, ${videosFailed} failed out of ${existingVideos.length} videos`);

    return summary;
  },
});


export const monitorManuallyPostedVideos = internalAction({
  handler: async (ctx) => {
    const campaigns = await ctx.runQuery(internal.app.campaigns.getAllWithCaptions);
    const captionToCampaignMap = new Map<string, { campaignId: Id<"campaigns">, userId: Id<"users"> }>();

    for (const campaign of campaigns) {
      if (campaign.caption) {
        // Normalize and encode caption as key to avoid issues with special characters and whitespace
        const normalizedCaption = normalizeCaption(campaign.caption);
        const encodedCaption = encodeCaption(normalizedCaption);
        captionToCampaignMap.set(encodedCaption, {
          campaignId: campaign._id,
          userId: campaign.userId
        });
      }
    }

    // console.log(`Found ${captionToCampaignMap.size} campaigns with captions`);

    // Reduce batch size and increase delay to prevent timeouts
    const BATCH_SIZE = 30; // Reduced from 90 to prevent overwhelming the API
    const BATCH_DELAY_MS = 120000; // 2 minutes between batches (increased from 1 minute)

    for (let i = 0; i < TIKTOK_ACCOUNTS.length; i += BATCH_SIZE) {
      const batch = TIKTOK_ACCOUNTS.slice(i, i + BATCH_SIZE);
      const batchDelay = Math.floor(i / BATCH_SIZE) * BATCH_DELAY_MS;

      for (const username of batch) {
        // Don't await scheduler.runAfter - it's fire-and-forget
        await ctx.scheduler.runAfter(batchDelay, internal.app.tiktok.scrapeManuallyPostedVideos, {
          username: username.trim(),
          captionToCampaignMap: Object.fromEntries(captionToCampaignMap),
        });
      }

      // console.log(`Deployed batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} scrapers scheduled to run after ${batchDelay}ms`);
    }

  },
});