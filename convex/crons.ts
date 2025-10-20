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
    { minutes: 60 },
    internal.app.tiktok.refreshCampaignVideoAnalytics,
    { campaignIds: ["j978nsz24t0wzg3d77ccqkbxqn7sd7qx", "j97fydwhzshbck11tmq7qpwpd97sct6q", "j97afad8j8kvcdxytw5m3ztb1x7sd7fg"] as Id<"campaigns">[] }
)

export default crons;