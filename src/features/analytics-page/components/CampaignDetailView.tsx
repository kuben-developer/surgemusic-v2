"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsClient } from "@/features/campaign/analytics/components/AnalyticsClient";

interface CampaignDetailViewProps {
  campaignId: string;
  onBack: () => void;
}

/**
 * Campaign detail view
 *
 * Wraps the existing AnalyticsClient from campaign/analytics
 * to show full analytics for a selected campaign.
 * Includes back navigation to return to the overview.
 */
export function CampaignDetailView({ campaignId, onBack }: CampaignDetailViewProps) {
  return (
    <div className="w-full space-y-4">
      {/* Back Navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Campaigns
        </Button>
      </div>

      {/* Campaign Analytics */}
      <AnalyticsClient campaignId={campaignId} hideBackButton />
    </div>
  );
}
