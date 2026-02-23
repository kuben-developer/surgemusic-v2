import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
    "syncAirtableCampaign",
    { minuteUTC: 0 }, // Every hour at 0 minutes past the hour
    internal.app.airtable.syncAirtableCampaign,
    {}
);

crons.hourly(
    "syncAirtableContent",
    { minuteUTC: 15 }, // Every hour at 15 minutes past the hour
    internal.app.airtable.syncAirtableContent,
    {}
);

// V2 Analytics Crons
crons.hourly(
    "snapshotCampaignStatsV2",
    { minuteUTC: 45 }, // Every hour at :45
    internal.app.analyticsV2.snapshotCampaignStats,
    {}
);

crons.cron(
    "populateAllCampaignsV2",
    "0 */3 * * *", // Every 3 hours at :00
    internal.app.analyticsV2.populateAllCampaigns,
    {}
);

crons.interval(
    "recalculateMinViewsExcluded",
    { minutes: 60 }, // Every 1 hours
    internal.app.analyticsV2.recalculateAllMinViewsExcluded,
    {}
);

// Campaign list cache: pre-compute totals every 15 minutes
crons.interval(
    "cacheAllCampaignTotals",
    { minutes: 15 },
    internal.app.analyticsV2.cacheAllCampaignTotals,
    {}
);

// // Advanced Analytics: link montagerVideos → tiktokVideoId via Airtable
// crons.interval(
//     "linkMontagerToTiktok",
//     { minutes: 180 }, // Every 3 hours
//     internal.app.advancedAnalytics.linkMontagerToTiktok,
//     {}
// );

// Advanced Analytics: compute dimension stats
crons.interval(
    "computeDimensionStats",
    { minutes: 180 }, // Every 3 hours
    internal.app.advancedAnalytics.computeDimensionStats,
    {}
);

crons.interval(
    "cleanupStaleBulkDownloads",
    { minutes: 30 },
    internal.app.bulkDownloader.cleanup.cleanupStaleJobs,
    {}
);

export default crons;
