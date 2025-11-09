"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignTable } from "./components/CampaignTable";
import { useCampaignList } from "./hooks/useCampaignList";
import { AlertCircle } from "lucide-react";

export function CampaignListPage() {
  const router = useRouter();
  const { campaigns, isLoading, error } = useCampaignList();

  const handleSelectCampaign = (campaignId: string) => {
    router.push(`/campaign/${campaignId}`);
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="rounded-lg border p-8">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="text-center py-16 text-destructive border border-destructive/50 rounded-lg bg-destructive/5">
          <AlertCircle className="size-12 mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-1">Error Loading Campaigns</h3>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            View and manage campaigns from Airtable
          </p>
        </div>

        {/* Table */}
        <CampaignTable
          campaigns={campaigns || []}
          onSelectCampaign={handleSelectCampaign}
        />
      </div>
    </div>
  );
}
