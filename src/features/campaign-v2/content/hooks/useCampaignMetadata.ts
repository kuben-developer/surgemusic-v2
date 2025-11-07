"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export function useCampaignMetadata(campaignRecordId: string) {
  const metadata = useQuery(
    api.app.bundleSocialQueries.getAirtableCampaignMetadata,
    { campaignId: campaignRecordId }
  );

  return {
    metadata,
    isLoading: metadata === undefined,
  };
}
