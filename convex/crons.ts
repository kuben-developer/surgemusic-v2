import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval(
//     "monitorManuallyPostedVideos",
//     { minutes: 15 },
//     internal.app.tiktok.monitorManuallyPostedVideos,
// );

crons.interval(
    "aggregateCampaignPerformance",
    { minutes: 30 },
    internal.app.analytics.aggregateCampaignPerformance,
    {}
);

crons.interval(
    "monitorApiPostedVideos",
    { minutes: 60 },
    internal.app.ayrshare.monitorApiPostedVideos,
    {}
);

crons.interval(
    "monitorLatePostedVideos",
    { minutes: 60 },
    internal.app.late.monitorLatePostedVideos,
    {}
);

crons.interval(
    "syncBundleSocialPosts",
    { minutes: 30 },
    internal.app.bundleSocial.syncBundleSocialPosts,
    {}
);

crons.interval(
    "refreshBundleSocialPosts",
    { minutes: 360 },
    internal.app.bundleSocial.refreshBundleSocialPosts,
    {}
);

crons.interval(
    "aggregateBundleSocialCampaignPerformance",
    { minutes: 360 },
    internal.app.bundleSocial.aggregateCampaignPerformance,
    {}
);

// crons.interval(
//     "refreshCampaignVideoAnalytics",
//     { minutes: 300 },
//     internal.app.tiktok.refreshCampaignVideoAnalytics,
//     { campaignIds: [] as Id<"campaigns">[], weeksAgo: 1 }
// )

export default crons;