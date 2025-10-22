import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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
    "refreshCampaignVideoAnalytics",
    { minutes: 300 },
    internal.app.tiktok.refreshCampaignVideoAnalytics,
    { campaignIds: [] as Id<"campaigns">[] }
)

export default crons;