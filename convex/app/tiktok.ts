import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";

const encodeCaption = (caption: string): string => {
  let hex = '';
  for (let i = 0; i < caption.length; i++) {
    hex += caption.charCodeAt(i).toString(16).padStart(4, '0');
  }
  return hex;
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
        // Encode the video description to match the encoded keys in the map
        const encodedDescription = encodeCaption(video.description.trim());
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
    // Step 1: Group videos by username for efficient batch processing
    const videosByUsername = new Map<string, Array<{
      campaignId: string;
      tiktokVideoId: string;
    }>>();

    for (const entry of args.videos) {
      // Skip if tiktokVideoId is empty
      if (!entry.tiktokVideoId || entry.tiktokVideoId.trim() === '') {
        continue;
      }

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
          const campaign = await ctx.runQuery(internal.app.campaigns.getInternal, {
            campaignId: video.campaignId as Id<"campaigns">
          });
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


export const monitorManuallyPostedVideos = internalAction({
  handler: async (ctx) => {
    const campaigns = await ctx.runQuery(internal.app.campaigns.getAllWithCaptions);
    const captionToCampaignMap = new Map<string, { campaignId: Id<"campaigns">, userId: Id<"users"> }>();

    for (const campaign of campaigns) {
      if (campaign.caption) {
        // Use encoded caption as key to avoid issues with special characters
        const encodedCaption = encodeCaption(campaign.caption);
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