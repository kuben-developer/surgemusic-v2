"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Hook for managing URL-based campaign selection state
 *
 * Uses query parameter `?campaignId=xxx` for:
 * - Deep linking to specific campaign analytics
 * - Browser back/forward navigation
 * - Shareable URLs
 */
export function useSelectedCampaign() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get the currently selected campaign ID from URL
  const selectedCampaignId = searchParams.get("campaignId");

  // Set the selected campaign (updates URL)
  const setSelectedCampaignId = useCallback(
    (campaignId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (campaignId) {
        params.set("campaignId", campaignId);
      } else {
        params.delete("campaignId");
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.push(newUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Clear selection (go back to overview)
  const clearSelection = useCallback(() => {
    setSelectedCampaignId(null);
  }, [setSelectedCampaignId]);

  // Check if a campaign is currently selected
  const hasSelection = selectedCampaignId !== null;

  return {
    selectedCampaignId,
    setSelectedCampaignId,
    clearSelection,
    hasSelection,
  };
}
