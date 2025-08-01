"use client";

import { Badge } from "@/components/ui/badge";

interface AvailableCampaignsHeaderProps {
  campaignCount: number;
}

export function AvailableCampaignsHeader({ campaignCount }: AvailableCampaignsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">Add Campaigns</h3>
      <Badge variant="outline">
        {campaignCount} available
      </Badge>
    </div>
  );
}