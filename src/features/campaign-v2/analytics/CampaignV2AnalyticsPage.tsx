"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AnalyticsClient } from "./components/AnalyticsClient";

interface CampaignV2AnalyticsPageProps {
  campaignId: string;
}

export function CampaignV2AnalyticsPage({ campaignId }: CampaignV2AnalyticsPageProps) {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <AnalyticsClient campaignId={campaignId} />
      </Suspense>
    </div>
  );
}
