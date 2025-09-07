import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
    "monitorManuallyPostedVideos",
    { minutes: 5 },
    internal.app.tiktok.monitorManuallyPostedVideos,
);

crons.interval(
    "aggregateCampaignPerformance",
    { minutes: 5 },
    internal.app.analytics.aggregateCampaignPerformance,
    {}
);

crons.interval(
    "monitorApiPostedVideos",
    { minutes: 5 },
    internal.app.ayrshare.monitorApiPostedVideos,
    {}
);

export default crons;