import { Card } from "@/components/ui/card";
import { ArrowUpRight, BarChart2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "../constants/metrics";
import type { AnalyticsData, GrowthMetric } from "../types/analytics.types";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface KPIMetricsProps {
  totals: AnalyticsData['totals'];
  avgEngagementRate: string;
  generatedVideos: Doc<"videos">[] | undefined;
  viewsGrowth: GrowthMetric;
  likesGrowth: GrowthMetric;
  commentsGrowth: GrowthMetric;
  sharesGrowth: GrowthMetric;
  engagementGrowth: GrowthMetric;
}

export function KPIMetrics({
  totals,
  avgEngagementRate,
  generatedVideos,
  viewsGrowth,
  likesGrowth,
  commentsGrowth,
  sharesGrowth,
  engagementGrowth,
}: KPIMetricsProps) {
  return (
    <motion.section
      variants={fadeInUp}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Total Posts</h3>
          <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
            <BarChart2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{generatedVideos?.length || 0}</p>
        </div>
      </Card>

      <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Total Views</h3>
          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <div className="h-4 w-4 text-green-600 dark:text-green-400">👁️</div>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{totals.views.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs">
            {viewsGrowth.value > 0 && (
              <>
                {viewsGrowth.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 rotate-180 text-red-600 dark:text-red-400" />
                )}
                <span className={viewsGrowth.isPositive ?
                  "text-green-600 dark:text-green-400" :
                  "text-red-600 dark:text-red-400"}>
                  {viewsGrowth.value}%
                </span>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Total Likes</h3>
          <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <div className="h-4 w-4 text-orange-600 dark:text-orange-400">❤️</div>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{totals.likes.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs">
            {likesGrowth.value > 0 && (
              <>
                {likesGrowth.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 rotate-180 text-red-600 dark:text-red-400" />
                )}
                <span className={likesGrowth.isPositive ?
                  "text-green-600 dark:text-green-400" :
                  "text-red-600 dark:text-red-400"}>
                  {likesGrowth.value}%
                </span>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Comments</h3>
          <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <div className="h-4 w-4 text-red-600 dark:text-red-400">💬</div>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{totals.comments.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs">
            {commentsGrowth.value > 0 && (
              <>
                {commentsGrowth.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 rotate-180 text-red-600 dark:text-red-400" />
                )}
                <span className={commentsGrowth.isPositive ?
                  "text-green-600 dark:text-green-400" :
                  "text-red-600 dark:text-red-400"}>
                  {commentsGrowth.value}%
                </span>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Total Shares</h3>
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <div className="h-4 w-4 text-blue-600 dark:text-blue-400">🔄</div>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{totals.shares.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs">
            {sharesGrowth.value > 0 && (
              <>
                {sharesGrowth.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 rotate-180 text-red-600 dark:text-red-400" />
                )}
                <span className={sharesGrowth.isPositive ?
                  "text-green-600 dark:text-green-400" :
                  "text-red-600 dark:text-red-400"}>
                  {sharesGrowth.value}%
                </span>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4 border border-primary/10 hover:border-primary/20 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Eng. Rate</h3>
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{avgEngagementRate}%</p>
          <div className="flex items-center gap-1 text-xs">
            {engagementGrowth.value > 0 && (
              <>
                {engagementGrowth.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 rotate-180 text-red-600 dark:text-red-400" />
                )}
                <span className={engagementGrowth.isPositive ?
                  "text-green-600 dark:text-green-400" :
                  "text-red-600 dark:text-red-400"}>
                  {engagementGrowth.value}%
                </span>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.section>
  );
}