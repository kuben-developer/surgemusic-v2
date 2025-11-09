"use client";

import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useEffect, useState } from "react";
import type { CampaignContentData } from "../../shared/types/campaign.types";

export function useCampaignContent(campaignRecordId: string) {
  const getCampaignContent = useAction(api.app.campaignV2.getCampaignContent);
  const [data, setData] = useState<CampaignContentData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getCampaignContent({ campaignRecordId });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch content"));
        console.error("Error fetching campaign content:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (campaignRecordId) {
      fetchContent();
    }
  }, [campaignRecordId, getCampaignContent]);

  return {
    data,
    isLoading,
    error,
  };
}
