"use client";

import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useEffect, useState } from "react";
import type { AirtableCampaign } from "../../shared/types/campaign-v2.types";

export function useCampaignV2List() {
  const getCampaigns = useAction(api.app.campaignV2.getCampaigns);
  const [campaigns, setCampaigns] = useState<AirtableCampaign[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCampaigns();
        setCampaigns(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch campaigns"));
        console.error("Error fetching campaigns:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCampaigns();
  }, [getCampaigns]);

  return {
    campaigns,
    isLoading,
    error,
  };
}
