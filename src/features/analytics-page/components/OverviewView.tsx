"use client";

import { motion } from "framer-motion";
import { BarChart3, Loader2 } from "lucide-react";
import { OverviewKPIMetrics } from "./OverviewKPIMetrics";
import { CampaignOverviewTable } from "./CampaignOverviewTable";
import { staggerContainer } from "../constants/analytics-page.constants";
import type { OverviewViewProps, AggregateTotals } from "../types/analytics-page.types";

/**
 * Overview view showing all campaigns
 *
 * Displays:
 * - Page header
 * - Aggregate KPI metrics
 * - Sortable campaign table with sparklines
 */
export function OverviewView({
  campaigns,
  onSelectCampaign,
  isLoading = false,
}: OverviewViewProps) {
  // Calculate aggregate totals
  const aggregateTotals: AggregateTotals = campaigns.reduce(
    (acc, campaign) => ({
      campaigns: acc.campaigns + 1,
      posts: acc.posts + campaign.totals.posts,
      views: acc.views + campaign.totals.views,
      likes: acc.likes + campaign.totals.likes,
      comments: acc.comments + campaign.totals.comments,
      shares: acc.shares + campaign.totals.shares,
    }),
    {
      campaigns: 0,
      posts: 0,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Overview of all campaign performance
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">No Campaigns Found</p>
            <p className="text-sm text-muted-foreground">
              Analytics data will appear here once campaigns have analytics data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Overview of all campaign performance
          </p>
        </div>
      </div>

      {/* KPI Metrics */}
      <OverviewKPIMetrics totals={aggregateTotals} />

      {/* Campaign Table */}
      <CampaignOverviewTable
        campaigns={campaigns}
        onSelectCampaign={onSelectCampaign}
      />
    </motion.div>
  );
}
