"use client";

import { CampaignCard } from "./CampaignCard";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface CampaignGridViewProps {
  campaigns: Doc<"campaigns">[];
  searchQuery: string;
}

export function CampaignGridView({ campaigns, searchQuery }: CampaignGridViewProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {searchQuery ? `No campaigns found matching "${searchQuery}"` : "No campaigns found"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign._id} campaign={campaign} />
      ))}
    </div>
  );
}