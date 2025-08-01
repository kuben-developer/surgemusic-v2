"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Archive, Music, X } from "lucide-react";
import Image from "next/image";

interface FolderCampaignsProps {
  folderCampaigns?: any;
  folderCampaignsLoading: boolean;
  onRemoveCampaign: (campaignId: string) => Promise<void>;
}

// Campaign card component for campaigns in folder
function FolderCampaignCard({ 
  campaign, 
  onRemove 
}: { 
  campaign: any; 
  onRemove: () => void;
}) {
  return (
    <div className="group flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {campaign.campaignCoverImageUrl ? (
          <Image
            src={campaign.campaignCoverImageUrl}
            alt={campaign.campaignName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{campaign.campaignName}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="truncate">{campaign.songName}</span>
          <span>•</span>
          <span className="truncate">{campaign.artistName}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Badge variant="secondary" className="text-xs">
            {campaign.genre}
          </Badge>
          <div className={`w-1.5 h-1.5 rounded-full ${campaign.status === 'completed' ? 'bg-green-600' : 'bg-orange-400'}`} />
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onRemove}
        className="opacity-60 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all flex-shrink-0 h-8 w-8 p-0"
        title="Remove from folder"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function FolderCampaigns({
  folderCampaigns,
  folderCampaignsLoading,
  onRemoveCampaign,
}: FolderCampaignsProps) {
  return (
    <div className="w-[400px] p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">In This Folder</h3>
          <Badge variant="outline">
            {folderCampaigns?.campaigns?.length || 0}
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
            ) : folderCampaigns?.campaigns && folderCampaigns.campaigns.length > 0 ? (
              folderCampaigns.campaigns.map((campaign: any) => (
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