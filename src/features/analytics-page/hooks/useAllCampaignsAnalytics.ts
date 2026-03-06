"use client";

import { useQuery, useQueries } from "convex/react";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import type { AggregateTotals, CampaignWithAnalytics } from "../types/analytics-page.types";

const PAGE_SIZE = 10;

/**
 * Hook for fetching all campaigns with their analytics data
 *
 * Uses paginated queries to stay within Convex document read limits.
 */
export function useAllCampaignsAnalytics() {
  // First, fetch page 0 to learn totalPages
  const firstPage = useQuery(
    api.app.analyticsV2.getAllCampaignsWithAnalyticsV2,
    { page: 0, pageSize: PAGE_SIZE },
  );

  const totalPages = firstPage?.totalPages ?? 1;

  // Build queries object for all remaining pages
  const remainingQueries = useMemo(() => {
    const queries: Record<string, { query: typeof api.app.analyticsV2.getAllCampaignsWithAnalyticsV2; args: { page: number; pageSize: number } }> = {};
    for (let i = 1; i < totalPages; i++) {
      queries[`page${i}`] = {
        query: api.app.analyticsV2.getAllCampaignsWithAnalyticsV2,
        args: { page: i, pageSize: PAGE_SIZE },
      };
    }
    return queries;
  }, [totalPages]);

  const remainingResults = useQueries(remainingQueries);

  // Combine all pages
  const allPages = useMemo(() => {
    if (!firstPage) return [];
    const pages = [firstPage];
    for (let i = 1; i < totalPages; i++) {
      const result = remainingResults[`page${i}`];
      if (result && !(result instanceof Error)) {
        pages.push(result as typeof firstPage);
      }
    }
    return pages;
  }, [firstPage, remainingResults, totalPages]);

  const isLoading =
    firstPage === undefined ||
    (totalPages > 1 &&
      Object.values(remainingResults).some(
        (r) => r === undefined,
      ));

  // Transform and type the data
  const campaigns: CampaignWithAnalytics[] = useMemo(() => {
    if (allPages.length === 0) return [];

    return allPages.flatMap((page) =>
      page.campaigns.map((campaign) => ({
        campaignId: campaign.campaignId,
        campaignName: campaign.campaignName,
        artist: campaign.artist,
        song: campaign.song,
        status: campaign.status,
        totals: {
          posts: campaign.totals.posts,
          views: campaign.totals.views,
          likes: campaign.totals.likes,
          comments: campaign.totals.comments,
          shares: campaign.totals.shares,
          saves: campaign.totals.saves,
        },
        sparklineData: campaign.sparklineData.map((point) => ({
          date: point.date,
          views: point.views,
          likes: point.likes,
          comments: point.comments,
          shares: point.shares,
        })),
        firstVideoAt: campaign.firstVideoAt,
        lastUpdatedAt: campaign.lastUpdatedAt,
      })),
    );
  }, [allPages]);

  // Calculate aggregate totals across all campaigns
  const aggregateTotals: AggregateTotals = useMemo(() => {
    if (campaigns.length === 0) {
      return {
        campaigns: 0,
        posts: 0,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      };
    }

    return campaigns.reduce(
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
  }, [campaigns]);

  return {
    campaigns,
    aggregateTotals,
    isLoading,
  };
}
