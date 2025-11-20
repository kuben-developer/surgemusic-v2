import { httpRouter } from "convex/server";
import { clerkWebhook } from "./webhooks/clerk";
import { testWebhook } from "./webhooks/test";
import { getPendingVideos, updateGeneratedVideos } from "./webhooks/generatedVideos";

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

export default http;