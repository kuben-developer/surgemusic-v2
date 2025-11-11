import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval(
//     "syncBundleSocialPosts",
//     { minutes: 30 },
//     internal.app.bundleSocial.syncBundleSocialPosts,
//     {}
// );

// crons.interval(
//     "refreshBundleSocialPosts",
//     { minutes: 120 },
//     internal.app.bundleSocial.refreshBundleSocialPosts,
//     {}
// );

// crons.interval(
//     "aggregateBundleSocialCampaignPerformance",
//     { minutes: 30 },
//     internal.app.bundleSocial.aggregateCampaignPerformance,
//     {}
// );

export default crons;