import { httpRouter } from "convex/server";
import { clerkWebhook } from "./webhooks/clerk";
import { testWebhook } from "./webhooks/test";
import { getPendingClipperVideos, updateClipperVideoOutputs } from "./webhooks/clipper";
import { getPendingMontagerConfigs, updateMontagerVideos } from "./webhooks/montager";
import { getPendingVideosForProcessing, updateProcessedVideos } from "./webhooks/montagerVideos";
import { getAllCampaignsPublic, getCampaignAnalyticsPublic, getCampaignDetailedAnalyticsPublic } from "./webhooks/campaignAnalytics";
import { updateVideoStats, getCampaignVideos, getActiveCampaigns } from "./webhooks/analyticsV2";
import {
  getPendingPodcastClipperTasks,
  getPodcastClipperUploadUrl,
  postCalibrationResult,
  postTaskFailed,
} from "./webhooks/podcastClipper";
import {
  getPendingClipJobs,
  postDownloadResult,
  postTranscriptResult,
  postCutClipsResult,
  postClipReframeResult,
  getPendingOverlayClips,
  postOverlayResult,
  postOverlayFailed,
} from "./webhooks/podcastClipperClips";

const http = httpRouter();

// Test webhook (for testing purposes)
http.route({
  path: "/webhook/test",
  method: "GET",
  handler: testWebhook,
});
http.route({
  path: "/webhook/test",
  method: "POST",
  handler: testWebhook,
});

// Clerk webhook
http.route({
  path: "/webhook/clerk",
  method: "POST",
  handler: clerkWebhook,
});

// Clipper API - Get pending videos (where outputUrls is empty)
http.route({
  path: "/api/clipper/pending",
  method: "GET",
  handler: getPendingClipperVideos,
});

// Clipper API - Update videos with output URLs
http.route({
  path: "/api/clipper/update",
  method: "POST",
  handler: updateClipperVideoOutputs,
});

// Montager API - Get pending configs with randomly selected clips
http.route({
  path: "/api/montager/pending",
  method: "GET",
  handler: getPendingMontagerConfigs,
});

// Montager API - Update with generated montage videos
http.route({
  path: "/api/montager/update",
  method: "POST",
  handler: updateMontagerVideos,
});

// Montager Videos API - Get videos ready for overlay processing
http.route({
  path: "/api/montager-videos/pending",
  method: "GET",
  handler: getPendingVideosForProcessing,
});

// Montager Videos API - Update videos with processed (overlay) URLs
http.route({
  path: "/api/montager-videos/update",
  method: "POST",
  handler: updateProcessedVideos,
});

// Campaign Analytics API - Public endpoint to get all campaigns
http.route({
  path: "/api/campaigns",
  method: "GET",
  handler: getAllCampaignsPublic,
});

// Campaign Analytics API - Public endpoint to get campaign analytics by Airtable campaign ID
http.route({
  path: "/api/campaign-analytics",
  method: "GET",
  handler: getCampaignAnalyticsPublic,
});

// Campaign Analytics API - Public endpoint to get detailed campaign analytics with all video stats
http.route({
  path: "/api/campaign-analytics-detailed",
  method: "GET",
  handler: getCampaignDetailedAnalyticsPublic,
});

// Analytics V2 API - List active campaigns
http.route({
  path: "/api/analytics/campaigns",
  method: "GET",
  handler: getActiveCampaigns,
});

// Analytics V2 API - External scraper pushes updated video stats
http.route({
  path: "/api/analytics/videos",
  method: "POST",
  handler: updateVideoStats,
});

// Analytics V2 API - External scraper discovers videos to scrape
http.route({
  path: "/api/analytics/campaign-videos",
  method: "GET",
  handler: getCampaignVideos,
});

// Podcast Clipper API - Get pending tasks (calibrate/reframe)
http.route({
  path: "/api/podcast-clipper/pending",
  method: "GET",
  handler: getPendingPodcastClipperTasks,
});

// Podcast Clipper API - Get Convex storage upload URL
http.route({
  path: "/api/podcast-clipper/upload-url",
  method: "POST",
  handler: getPodcastClipperUploadUrl,
});

// Podcast Clipper API - Backend pushes calibration results
http.route({
  path: "/api/podcast-clipper/calibration-result",
  method: "POST",
  handler: postCalibrationResult,
});

// Podcast Clipper API - Backend reports task failure
http.route({
  path: "/api/podcast-clipper/task-failed",
  method: "POST",
  handler: postTaskFailed,
});

// Podcast Clipper Clips API - Docker polls for download/transcribe/cut jobs
http.route({
  path: "/api/podcast-clipper/clip-jobs/pending",
  method: "GET",
  handler: getPendingClipJobs,
});

// Podcast Clipper Clips API - Docker posts download result
http.route({
  path: "/api/podcast-clipper/download-result",
  method: "POST",
  handler: postDownloadResult,
});

// Podcast Clipper Clips API - Docker posts transcript result
http.route({
  path: "/api/podcast-clipper/transcript-result",
  method: "POST",
  handler: postTranscriptResult,
});

// Podcast Clipper Clips API - Docker posts cut clips result
http.route({
  path: "/api/podcast-clipper/cut-clips-result",
  method: "POST",
  handler: postCutClipsResult,
});

// Podcast Clipper Clips API - Lambda posts clip reframe result
http.route({
  path: "/api/podcast-clipper/clip-reframe-result",
  method: "POST",
  handler: postClipReframeResult,
});

// Podcast Clipper Clips API - Remotion polls for clips needing overlay
http.route({
  path: "/api/podcast-clipper/clips/pending-overlay",
  method: "GET",
  handler: getPendingOverlayClips,
});

// Podcast Clipper Clips API - Remotion posts overlay result
http.route({
  path: "/api/podcast-clipper/clips/overlay-result",
  method: "POST",
  handler: postOverlayResult,
});

// Podcast Clipper Clips API - Remotion reports overlay failure
http.route({
  path: "/api/podcast-clipper/clips/overlay-failed",
  method: "POST",
  handler: postOverlayFailed,
});

export default http;