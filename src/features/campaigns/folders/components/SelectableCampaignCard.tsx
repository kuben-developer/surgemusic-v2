"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Music } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { format } from "date-fns";
import Image from "next/image";

interface SelectableCampaignCardProps {
  campaign: Doc<"campaigns">;
  isSelected: boolean;
  onSelect: (campaignId: string, selected: boolean) => void;
  onClick: (e: React.MouseEvent) => void;
  cardRef?: (el: HTMLDivElement | null) => void;
}

export function SelectableCampaignCard({ 
  campaign, 
  isSelected, 
  onSelect, 
  onClick,
  cardRef 
}: SelectableCampaignCardProps) {
  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={cn(
        "group relative rounded-lg border bg-card transition-all cursor-pointer p-3",
        isSelected 
          ? "ring-2 ring-primary border-primary" 
          : "hover:bg-accent/50"
      )}
    >
      <div className="flex gap-3">
        <div className="flex items-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(campaign._id, checked as boolean)}
            className="mr-3"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 select-none">
            {campaign.campaignCoverImageUrl ? (
              <Image
                src={campaign.campaignCoverImageUrl}
                alt={campaign.campaignName}
                fill
                className="object-cover select-none pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center select-none">
                <Music className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{campaign.campaignName}</h4>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {campaign.songName} • {campaign.artistName}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant="secondary" className="text-xs">
              {campaign.genre}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {campaign.videoCount || 0} videos
            </span>
            <span className="text-xs text-muted-foreground">
              • {format(new Date(campaign._creationTime), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}