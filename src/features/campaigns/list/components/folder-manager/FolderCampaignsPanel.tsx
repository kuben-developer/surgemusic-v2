"use client"

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Archive } from "lucide-react";
import { FolderCampaignCard } from "./CampaignCard";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

interface FolderCampaignsPanelProps {
  folderCampaigns: Doc<"campaigns">[] | undefined;
  folderCampaignsLoading: boolean;
  onRemoveCampaign: (campaignId: string) => void;
}

export function FolderCampaignsPanel({
  folderCampaigns,
  folderCampaignsLoading,
  onRemoveCampaign
}: FolderCampaignsPanelProps) {
  return (
    <div className="w-[400px] p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">In This Folder</h3>
          <Badge variant="outline">
            {folderCampaigns?.length || 0}
          </Badge>
        </div>
        
        <ScrollArea className="h-[480px]">
          <div className="space-y-2">
            {folderCampaignsLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))
            ) : folderCampaigns && folderCampaigns.length > 0 ? (
              folderCampaigns.map((campaign) => (
                <FolderCampaignCard
                  key={campaign._id}
                  campaign={campaign}
                  onRemove={() => onRemoveCampaign(campaign._id)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  No campaigns in this folder
                </p>
                <p className="text-xs text-muted-foreground">
                  Add campaigns from the left panel
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}