import { httpRouter } from "convex/server";
import { clerkWebhook } from "./webhooks/clerk";
import { stripeWebhook } from "./webhooks/stripe";
import { makeWebhook } from "./webhooks/make";
import { ayrshareWebhook } from "./webhooks/ayrshare";
import { testWebhook } from "./webhooks/test";
import { exportAyrshareVideosEndpoint } from "./webhooks/exportAyrshareVideos";

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

// Stripe webhook
http.route({
  path: "/webhook/stripe",
  method: "POST",
  handler: stripeWebhook,
});

// Make.com webhook
http.route({
  path: "/webhook/make",
  method: "POST",
  handler: makeWebhook,
});

// Ayrshare webhook
http.route({
  path: "/webhook/ayrshare",
  method: "POST",
  handler: ayrshareWebhook,
});

// Export endpoints
http.route({
  path: "/export/ayrshare-videos",
  method: "GET",
  handler: exportAyrshareVideosEndpoint,
});

export default http;