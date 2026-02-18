"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, BarChart2, Eye, Heart, MessageCircle, Share2, DollarSign } from "lucide-react";
import { calculateCPM, formatCPM } from "@/features/campaign/analytics-v2/utils/cpm.utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sparkline } from "./Sparkline";
import type {
  CampaignOverviewTableProps,
  SortConfig,
  SortField,
  CampaignWithAnalytics,
} from "../types/analytics-page.types";

/**
 * Sortable table showing all campaigns with metrics and sparklines
 */
export function CampaignOverviewTable({
  campaigns,
  onSelectCampaign,
}: CampaignOverviewTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "views",
    direction: "desc",
  });

  // Helper to get CPM for a campaign (uses default multipliers since we don't have per-campaign settings here)
  const getCPM = (campaign: CampaignWithAnalytics) =>
    calculateCPM({
      totalViews: campaign.totals.views,
      manualVideoCount: 0, // Overview doesn't track manual vs API, so treat all as API
      apiVideoCount: campaign.totals.posts,
    });

  // Sort campaigns
  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortConfig.field === "campaignName") {
        aValue = a.campaignName.toLowerCase();
        bValue = b.campaignName.toLowerCase();
      } else if (sortConfig.field === "cpm") {
        aValue = getCPM(a);
        bValue = getCPM(b);
      } else {
        aValue = a.totals[sortConfig.field];
        bValue = b.totals[sortConfig.field];
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [campaigns, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="size-3.5 text-muted-foreground/40" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="size-3.5" />
    ) : (
      <ArrowDown className="size-3.5" />
    );
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <BarChart2 className="size-12 mx-auto mb-3 opacity-30" />
        <h3 className="text-base font-semibold mb-1">No Campaigns Found</h3>
        <p className="text-sm">No campaigns with analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[28%]">
              <button
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                onClick={() => handleSort("campaignName")}
              >
                Campaign
                <SortIndicator field="campaignName" />
              </button>
            </TableHead>
            <TableHead className="w-[10%]">
              <button
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                onClick={() => handleSort("posts")}
              >
                Posts
                <SortIndicator field="posts" />
              </button>
            </TableHead>
            <TableHead className="w-[12%]">
              <button
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                onClick={() => handleSort("views")}
              >
                Views
                <SortIndicator field="views" />
              </button>
            </TableHead>
            <TableHead className="w-[12%]">
              <button
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                onClick={() => handleSort("likes")}
              >
                Likes
                <SortIndicator field="likes" />
              </button>
            </TableHead>
            <TableHead className="w-[12%]">
              <button
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                onClick={() => handleSort("comments")}
              >
                Comments
                <SortIndicator field="comments" />
              </button>
            </TableHead>
            <TableHead className="w-[10%]">
              <button
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                onClick={() => handleSort("shares")}
              >
                Shares
                <SortIndicator field="shares" />
              </button>
            </TableHead>
            <TableHead className="w-[10%]">
              <button
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                onClick={() => handleSort("cpm")}
              >
                CPM
                <SortIndicator field="cpm" />
              </button>
            </TableHead>
            <TableHead className="w-[12%]">Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCampaigns.map((campaign) => (
            <CampaignRow
              key={campaign.campaignId}
              campaign={campaign}
              onClick={() => onSelectCampaign(campaign.campaignId)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CampaignRow({
  campaign,
  onClick,
}: {
  campaign: CampaignWithAnalytics;
  onClick: () => void;
}) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={onClick}
    >
      <TableCell className="font-medium">
        <div className="min-w-0">
          <p className="truncate">{campaign.campaignName}</p>
          {campaign.artist && (
            <p className="text-xs text-muted-foreground truncate">
              {campaign.artist}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <BarChart2 className="size-3.5 text-violet-600 dark:text-violet-400" />
          <span className="tabular-nums">{formatNumber(campaign.totals.posts)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Eye className="size-3.5 text-green-600 dark:text-green-400" />
          <span className="tabular-nums">{formatNumber(campaign.totals.views)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Heart className="size-3.5 text-orange-600 dark:text-orange-400" />
          <span className="tabular-nums">{formatNumber(campaign.totals.likes)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <MessageCircle className="size-3.5 text-red-600 dark:text-red-400" />
          <span className="tabular-nums">{formatNumber(campaign.totals.comments)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Share2 className="size-3.5 text-blue-600 dark:text-blue-400" />
          <span className="tabular-nums">{formatNumber(campaign.totals.shares)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <DollarSign className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="tabular-nums">{formatCPM(calculateCPM({
            totalViews: campaign.totals.views,
            manualVideoCount: 0,
            apiVideoCount: campaign.totals.posts,
          }))}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="w-[80px]">
          <Sparkline data={campaign.sparklineData} dataKey="views" height={28} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}
