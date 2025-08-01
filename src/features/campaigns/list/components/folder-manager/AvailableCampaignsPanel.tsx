"use client"

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus } from "lucide-react";
import { CampaignCard } from "./CampaignCard";
import type { Doc } from "../../../../../../convex/_generated/dataModel";

interface AvailableCampaignsPanelProps {
  allCampaigns: Doc<"campaigns">[] | undefined;
  campaignsLoading: boolean;
  campaignSearchQuery: string;
  onCampaignSearchChange: (query: string) => void;
  selectedCampaignIds: Set<string>;
  onCampaignSelect: (campaignId: string, checked: boolean) => void;
  onSelectAllCampaigns: (checked: boolean) => void;
  onBulkAddCampaigns: () => void;
  folderCampaigns: Doc<"campaigns">[] | undefined;
}

export function AvailableCampaignsPanel({
  allCampaigns,
  campaignsLoading,
  campaignSearchQuery,
  onCampaignSearchChange,
  selectedCampaignIds,
  onCampaignSelect,
  onSelectAllCampaigns,
  onBulkAddCampaigns,
  folderCampaigns
}: AvailableCampaignsPanelProps) {
  
  // Filter campaigns based on search query and exclude those already in the selected folder
  const filteredAvailableCampaigns = useMemo(() => {
    if (!allCampaigns) return [];
    
    let filtered = allCampaigns;
    
    // Filter by search query
    if (campaignSearchQuery.trim()) {
      const query = campaignSearchQuery.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.campaignName.toLowerCase().includes(query) ||
        campaign.songName.toLowerCase().includes(query) ||
        campaign.artistName.toLowerCase().includes(query) ||
        campaign.genre.toLowerCase().includes(query)
      );
    }
    
    // Exclude campaigns already in the selected folder
    if (folderCampaigns) {
      const folderCampaignIds = new Set(folderCampaigns.map(c => c._id));
      filtered = filtered.filter(campaign => !folderCampaignIds.has(campaign._id));
    }
    
    return filtered;
  }, [allCampaigns, campaignSearchQuery, folderCampaigns]);

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
              onChange={(e) => onCampaignSearchChange(e.target.value)}
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