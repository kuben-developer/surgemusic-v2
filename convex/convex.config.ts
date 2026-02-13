import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();

app.use(aggregate, { name: "aggregateViews" });
app.use(aggregate, { name: "aggregateLikes" });
app.use(aggregate, { name: "aggregateComments" });
app.use(aggregate, { name: "aggregateShares" });
app.use(aggregate, { name: "aggregateSaves" });

export default app;
