"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useCallback } from "react";
import { toast } from "sonner";

export type DimensionType = "caption" | "folder" | "overlayStyle";

export function useAdvancedAnalyticsV2(
  campaignId: string,
  activeDimension: DimensionType,
) {
  const stats = useQuery(api.app.advancedAnalytics.getDimensionStats, {
    campaignId,
    dimension: activeDimension,
  });

  const summary = useQuery(
    api.app.advancedAnalytics.getAdvancedAnalyticsSummary,
    { campaignId },
  );

  const triggerRefresh = useMutation(
    api.app.advancedAnalytics.triggerRefreshDimensionStats,
  );

  const handleRefresh = useCallback(async () => {
    try {
      await triggerRefresh({ campaignId });
      toast.success("Refresh scheduled. Stats will update shortly.");
    } catch {
      toast.error("Failed to trigger refresh");
    }
  }, [triggerRefresh, campaignId]);

  return {
    stats: stats ?? [],
    isLoading: stats === undefined,
    lastUpdated: summary?.lastUpdated ?? null,
    totalLinked: summary?.totalLinked ?? 0,
    totalUnlinked: summary?.totalUnlinked ?? 0,
    totalMontagerVideos: summary?.totalMontagerVideos ?? 0,
    handleRefresh,
  };
}
