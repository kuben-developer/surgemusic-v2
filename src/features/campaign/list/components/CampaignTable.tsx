"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Music, BarChart2, BarChart3, Eye, DollarSign, Calendar, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { calculateCPM, formatCPM } from "@/features/campaign/analytics-v2/utils/cpm.utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CampaignWithAnalytics } from "@/features/analytics-page/types/analytics-page.types";

type SortField = "song" | "posts" | "views" | "cpm" | "firstVideoAt";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface CampaignTableProps {
  campaigns: CampaignWithAnalytics[];
  onSelectCampaign: (campaignId: string) => void;
}

export function CampaignTable({ campaigns, onSelectCampaign }: CampaignTableProps) {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "views",
    direction: "desc",
  });

  const getCPM = (campaign: CampaignWithAnalytics) =>
    calculateCPM({
      totalViews: campaign.totals.views,
      manualVideoCount: 0,
      apiVideoCount: campaign.totals.posts,
    });

  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortConfig.field === "song") {
        aValue = a.song.toLowerCase();
        bValue = b.song.toLowerCase();
      } else if (sortConfig.field === "cpm") {
        aValue = getCPM(a);
        bValue = getCPM(b);
      } else if (sortConfig.field === "firstVideoAt") {
        aValue = a.firstVideoAt ?? 0;
        bValue = b.firstVideoAt ?? 0;
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
        <Music className="size-12 mx-auto mb-3 opacity-30" />
        <h3 className="text-base font-semibold mb-1">No Campaigns Found</h3>
        <p className="text-sm">No campaigns found in this category.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[24%]">
              <button
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                onClick={() => handleSort("song")}
              >
                Song
                <SortIndicator field="song" />
              </button>
            </TableHead>
            <TableHead className="w-[18%]">Actions</TableHead>
            <TableHead className="w-[12%]">
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
            <TableHead className="w-[10%]">
              <button
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                onClick={() => handleSort("cpm")}
              >
                CPM
                <SortIndicator field="cpm" />
              </button>
            </TableHead>
            <TableHead className="w-[14%]">
              <button
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                onClick={() => handleSort("firstVideoAt")}
              >
                First Post
                <SortIndicator field="firstVideoAt" />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCampaigns.map((campaign) => (
            <CampaignRow
              key={campaign.campaignId}
              campaign={campaign}
              onDetails={() => onSelectCampaign(campaign.campaignId)}
              onAnalytics={() => router.push(`/campaign/${campaign.campaignId}/analytics`)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CampaignRow({
  campaign,
  onDetails,
  onAnalytics,
}: {
  campaign: CampaignWithAnalytics;
  onDetails: () => void;
  onAnalytics: () => void;
}) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">
        <div className="min-w-0">
          <p className="truncate">{campaign.song || "\u2014"}</p>
          {campaign.artist && (
            <p className="text-xs text-muted-foreground truncate">
              {campaign.artist}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onDetails}
            className="h-7 px-2.5 text-xs"
          >
            <ExternalLink className="size-3" />
            Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalytics}
            className="h-7 px-2.5 text-xs"
          >
            <BarChart3 className="size-3" />
            Analytics
          </Button>
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
          <DollarSign className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="tabular-nums">
            {formatCPM(
              calculateCPM({
                totalViews: campaign.totals.views,
                manualVideoCount: 0,
                apiVideoCount: campaign.totals.posts,
              }),
            )}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5 text-sky-600 dark:text-sky-400" />
          <span className="tabular-nums text-sm">
            {campaign.firstVideoAt
              ? formatDate(campaign.firstVideoAt)
              : "\u2014"}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
