"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Music, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvailableCampaignsProps {
  filteredAvailableCampaigns: any[];
  campaignsLoading: boolean;
  campaignSearchQuery: string;
  setCampaignSearchQuery: (query: string) => void;
  selectedCampaignIds: Set<string>;
  onCampaignSelect: (campaignId: string, checked: boolean) => void;
  onSelectAllCampaigns: (checked: boolean) => void;
  onBulkAddCampaigns: () => Promise<void>;
}

// Campaign card component for available campaigns
function CampaignCard({ 
  campaign, 
  isSelected, 
  onSelect 
}: { 
  campaign: any;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}) {
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

export function AvailableCampaigns({
  filteredAvailableCampaigns,
  campaignsLoading,
  campaignSearchQuery,
  setCampaignSearchQuery,
  selectedCampaignIds,
  onCampaignSelect,
  onSelectAllCampaigns,
  onBulkAddCampaigns,
}: AvailableCampaignsProps) {
  return (
    <div className="flex-1 p-6 border-r">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Add Campaigns</h3>
          <Badge variant="outline">
            {filteredAvailableCampaigns.length} available
          </Badge>
        </div>
        
        {/* Search and Bulk Actions */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={campaignSearchQuery}
              onChange={(e) => setCampaignSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {filteredAvailableCampaigns.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedCampaignIds.size === filteredAvailableCampaigns.length && filteredAvailableCampaigns.length > 0}
                  onCheckedChange={onSelectAllCampaigns}
                />
                <span className="text-sm">
                  {selectedCampaignIds.size > 0 
                    ? `${selectedCampaignIds.size} selected`
                    : 'Select all'
                  }
                </span>
              </div>
              
              {selectedCampaignIds.size > 0 && (
                <Button
                  onClick={onBulkAddCampaigns}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {selectedCampaignIds.size} Campaign{selectedCampaignIds.size !== 1 ? 's' : ''}
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Available Campaigns List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {campaignsLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : filteredAvailableCampaigns.length > 0 ? (
              filteredAvailableCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign._id}
                  campaign={campaign}
                  isSelected={selectedCampaignIds.has(campaign._id)}
                  onSelect={(checked) => onCampaignSelect(campaign._id, checked)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  {campaignSearchQuery ? 'No campaigns found' : 'No available campaigns'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {campaignSearchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'All campaigns are already in this folder'
                  }
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}