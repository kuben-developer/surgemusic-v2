"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Music, Sparkles, X } from "lucide-react";
import Image from "next/image";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

interface CampaignCardProps {
  campaign: Doc<"campaigns">;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

export function CampaignCard({ campaign, isSelected, onSelect }: CampaignCardProps) {
  return (
    <div 
      className={cn(
        "group flex m-2 items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer",
        isSelected && "ring-1 ring-primary bg-accent/50"
      )}
      onClick={() => onSelect(!isSelected)}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onSelect}
        className="flex-shrink-0 pointer-events-none"
      />
      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {campaign.campaignCoverImageUrl ? (
          <Image
            src={campaign.campaignCoverImageUrl}
            alt={campaign.campaignName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{campaign.campaignName}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Music className="h-3 w-3" />
          <span className="truncate">{campaign.songName}</span>
          <span>•</span>
          <Sparkles className="h-3 w-3" />
          <span className="truncate">{campaign.artistName}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {campaign.genre}
          </Badge>
          <div className={`w-2 h-2 rounded-full ${campaign.status === 'completed' ? 'bg-green-600' : 'bg-orange-400'}`} />
          <span className="text-xs text-muted-foreground">{campaign.videoCount || 0} videos</span>
        </div>
      </div>
    </div>
  );
}

interface FolderCampaignCardProps {
  campaign: Doc<"campaigns">;
  onRemove: () => void;
}

export function FolderCampaignCard({ campaign, onRemove }: FolderCampaignCardProps) {
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