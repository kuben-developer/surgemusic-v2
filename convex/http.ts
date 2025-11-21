import { httpRouter } from "convex/server";
import { clerkWebhook } from "./webhooks/clerk";
import { testWebhook } from "./webhooks/test";
import { getPendingVideos, updateGeneratedVideos } from "./webhooks/generatedVideos";
import { getPendingClipperVideos, updateClipperVideoOutputs } from "./webhooks/clipper";
import { getPendingMontagerConfigs, updateMontagerVideos } from "./webhooks/montager";

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

// Generated Videos API - Get pending videos (where generatedVideoUrl is null)
http.route({
  path: "/api/generatedVideos/pending",
  method: "GET",
  handler: getPendingVideos,
});

// Generated Videos API - Update videos with generated URLs
http.route({
  path: "/api/generatedVideos/update",
  method: "POST",
  handler: updateGeneratedVideos,
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

export default http;