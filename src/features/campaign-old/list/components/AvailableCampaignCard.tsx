"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Music, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface AvailableCampaignCardProps {
  campaign: Doc<"campaigns">;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

export function AvailableCampaignCard({ 
  campaign, 
  isSelected, 
  onSelect 
}: AvailableCampaignCardProps) {
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
          <div className={`w-2 h-2 rounded-full ${
            campaign.status === 'completed' ? 'bg-green-600' : 'bg-orange-400'
          }`} />
          <span className="text-xs text-muted-foreground">
            {campaign.videoCount || 0} videos
          </span>
        </div>
      </div>
    </div>
  );
}