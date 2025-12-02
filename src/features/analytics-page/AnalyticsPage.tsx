"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AnalyticsPageLayout } from "./components/AnalyticsPageLayout";
import { OverviewView } from "./components/OverviewView";
import { CampaignDetailView } from "./components/CampaignDetailView";
import { useSelectedCampaign } from "./hooks/useSelectedCampaign";
import { useAllCampaignsAnalytics } from "./hooks/useAllCampaignsAnalytics";

/**
 * Main Analytics Page component
 *
 * Features:
 * - Overview view showing all campaigns with KPIs and table (default)
 * - Campaign detail view when a campaign is selected from the table
 * - Back navigation to return to overview
 * - URL-based state for deep linking
 */
export function AnalyticsPage() {
  const { selectedCampaignId, setSelectedCampaignId, clearSelection } = useSelectedCampaign();
  const { campaigns, isLoading } = useAllCampaignsAnalytics();

  return (
    <AnalyticsPageLayout>
      {selectedCampaignId ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <CampaignDetailView campaignId={selectedCampaignId} onBack={clearSelection} />
        </Suspense>
      ) : (
        <OverviewView
          campaigns={campaigns}
          onSelectCampaign={setSelectedCampaignId}
          isLoading={isLoading}
        />
      )}
    </AnalyticsPageLayout>
  );
}
