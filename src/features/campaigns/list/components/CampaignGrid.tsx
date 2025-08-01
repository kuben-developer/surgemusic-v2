"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { AvailableCampaignCard } from "./AvailableCampaignCard";

interface CampaignGridProps {
  campaigns: Doc<"campaigns">[];
  isLoading: boolean;
  selectedCampaignIds: Set<string>;
  searchQuery: string;
  onCampaignSelect: (campaignId: string, checked: boolean) => void;
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="text-center py-12">
      <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground mb-2">
        {searchQuery ? 'No campaigns found' : 'No available campaigns'}
      </p>
      <p className="text-xs text-muted-foreground">
        {searchQuery 
          ? 'Try adjusting your search terms' 
          : 'All campaigns are already in this folder'
        }
      </p>
    </div>
  );
}

export function CampaignGrid({
  campaigns,
  isLoading,
  selectedCampaignIds,
  searchQuery,
  onCampaignSelect,
}: CampaignGridProps) {
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {isLoading ? (
          <LoadingSkeleton />
        ) : campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <AvailableCampaignCard
              key={campaign._id}
              campaign={campaign}
              isSelected={selectedCampaignIds.has(campaign._id)}
              onSelect={(checked) => onCampaignSelect(campaign._id, checked)}
            />
          ))
        ) : (
          <EmptyState searchQuery={searchQuery} />
        )}
      </div>
    </ScrollArea>
  );
}