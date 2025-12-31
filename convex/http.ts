import { httpRouter } from "convex/server";
import { clerkWebhook } from "./webhooks/clerk";
import { testWebhook } from "./webhooks/test";
import { getPendingClipperVideos, updateClipperVideoOutputs } from "./webhooks/clipper";
import { getPendingMontagerConfigs, updateMontagerVideos } from "./webhooks/montager";
import { getPendingVideosForProcessing, updateProcessedVideos } from "./webhooks/montagerVideos";
import { getAllCampaignsPublic, getCampaignAnalyticsPublic } from "./webhooks/campaignAnalytics";

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

export default http;