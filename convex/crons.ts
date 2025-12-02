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

crons.cron(
    "refreshTiktokStats",
    "30 */3 * * *", // Every 3 hours at 30 minutes past the hour
    internal.app.bundle.refreshTiktokStats,
);

crons.interval(
    "calculateCampaignAnalytics",
    { minutes: 120 }, // Every 2 hours
    internal.app.analytics.calculateCampaignAnalytics,
    {}
);

export default crons;