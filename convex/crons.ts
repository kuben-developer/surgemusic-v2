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

// crons.cron(
//     "refreshTiktokStats",
//     "30 */3 * * *", // Every 3 hours at 30 minutes past the hour
//     internal.app.bundle.refreshTiktokStats,
// );

// crons.cron(
//     "refreshTiktokStatsByCampaign",
//     "*/5 * * * *",
//     internal.app.bundle.refreshTiktokStatsByCampaign,
//     { campaignId: "recK2FEC9YDXc0BKs" }
// );

crons.interval(
    "calculateCampaignAnalytics",
    { minutes: 120 }, // Every 2 hours
    internal.app.analytics.calculateCampaignAnalytics,
    {}
);

crons.interval(
    "cleanupStaleBulkDownloads",
    { minutes: 30 },
    internal.app.bulkDownloader.cleanup.cleanupStaleJobs,
    {}
);

export default crons;