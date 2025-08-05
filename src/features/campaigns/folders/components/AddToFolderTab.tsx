"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { CampaignFilters, type FilterState } from "@/features/campaigns/list/components/folder-manager/CampaignFilters";
import { CampaignGrid } from "@/features/campaigns/list/components/folder-manager/CampaignGrid";
import { SelectionControls } from "@/features/campaigns/list/components/folder-manager/SelectionControls";
import { useSelectionLogic } from "@/features/campaigns/list/hooks/useSelectionLogic";
import type { UseFolderManagerLogicReturn } from "../types/folder-manager.types";
import { isWithinInterval } from "date-fns";

interface AddToFolderTabProps {
  folderLogic: UseFolderManagerLogicReturn;
}

export function AddToFolderTab({ folderLogic }: AddToFolderTabProps) {
  const {
    allCampaigns,
    campaignsLoading,
    folderCampaigns,
    campaignSearchQuery,
    setCampaignSearchQuery,
    handleBulkAddCampaigns: originalHandleBulkAdd,
  } = folderLogic;

  // Get unique genres and max video count for filters
  const { genres, maxVideoCount } = useMemo(() => {
    if (!allCampaigns) return { genres: [], maxVideoCount: 100 };
    
    const genreSet = new Set(allCampaigns.map(c => c.genre));
    const maxVideos = Math.max(...allCampaigns.map(c => c.videoCount || 0), 100);
    
    return {
      genres: Array.from(genreSet).sort(),
      maxVideoCount: maxVideos
    };
  }, [allCampaigns]);

  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    genre: "",
    dateRange: undefined,
    videoCountRange: [0, maxVideoCount],
    artistName: ""
  });

  // Filter campaigns based on search query and exclude those already in folder
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
    
    // Apply advanced filters
    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(campaign => campaign.status === filters.status);
    }
    
    // Genre filter
    if (filters.genre) {
      filtered = filtered.filter(campaign => campaign.genre === filters.genre);
    }
    
    // Date range filter
    if (filters.dateRange?.from) {
      filtered = filtered.filter(campaign => {
        const campaignDate = new Date(campaign._creationTime);
        if (filters.dateRange?.to) {
          return isWithinInterval(campaignDate, {
            start: filters.dateRange.from!,
            end: filters.dateRange.to
          });
        }
        return campaignDate >= filters.dateRange.from!;
      });
    }
    
    // Video count filter
    filtered = filtered.filter(campaign => {
      const videoCount = campaign.videoCount || 0;
      return videoCount >= filters.videoCountRange[0] && videoCount <= filters.videoCountRange[1];
    });
    
    // Artist name filter
    if (filters.artistName.trim()) {
      const artistQuery = filters.artistName.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.artistName.toLowerCase().includes(artistQuery)
      );
    }
    
    // Exclude campaigns already in folder
    if (folderCampaigns) {
      const folderCampaignIds = new Set(folderCampaigns.campaigns?.map(c => c._id) || []);
      filtered = filtered.filter(campaign => !folderCampaignIds.has(campaign._id));
    }
    
    return filtered;
  }, [allCampaigns, campaignSearchQuery, folderCampaigns, filters]);

  // Use shared selection logic
  const {
    selectedIds,
    setSelectedIds,
    handleItemSelect,
    handleSelectAll,
    handleMouseDown,
    handleItemClick,
    containerRef,
    itemRefs,
    isSelecting,
    selectionRectStyle,
  } = useSelectionLogic({ items: filteredAvailableCampaigns });

  // Handle bulk add with our selected IDs
  const handleBulkAdd = async () => {
    // Convert Set to array for the original handler
    const selectedArray = Array.from(selectedIds);
    if (selectedArray.length > 0) {
      // Update the folderLogic's selectedCampaignIds before calling bulk add
      folderLogic.selectedCampaignIds.clear();
      selectedArray.forEach(id => folderLogic.selectedCampaignIds.add(id));
      await originalHandleBulkAdd();
      // Clear our local selection after successful add
      setSelectedIds(new Set());
    }
  };

  const emptyState = (
    <div className="col-span-full flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">
        {campaignSearchQuery || Object.values(filters).some(v => v && v !== "all" && (Array.isArray(v) ? v[0] !== 0 || v[1] !== maxVideoCount : true))
          ? 'No campaigns found' 
          : 'No available campaigns'
        }
      </h3>
      <p className="text-sm text-muted-foreground">
        {campaignSearchQuery || Object.values(filters).some(v => v && v !== "all" && (Array.isArray(v) ? v[0] !== 0 || v[1] !== maxVideoCount : true))
          ? 'Try adjusting your search or filters' 
          : 'All campaigns are already in this folder'
        }
      </p>
    </div>
  );

  const selectionRect = isSelecting && selectionRectStyle && (
    <div
      className="absolute border-2 border-primary bg-primary/10 pointer-events-none rounded-md"
      style={selectionRectStyle}
    />
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Section: Search, Filters, and Actions */}
      <div className="px-6 py-4 space-y-4 flex-shrink-0 bg-background/50 border-b">
        {/* Search Bar Row */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns by name, song, artist, or genre..."
              value={campaignSearchQuery}
              onChange={(e) => setCampaignSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          
          <CampaignFilters
            filters={filters}
            onFiltersChange={setFilters}
            genres={genres}
            maxVideoCount={maxVideoCount}
          />
        </div>

        {/* Selection Info and Actions */}
        <SelectionControls
          selectedCount={selectedIds.size}
          totalCount={filteredAvailableCampaigns.length}
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedIds(new Set())}
          actionButton={
            <Button onClick={handleBulkAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add {selectedIds.size} to Folder
            </Button>
          }
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{filteredAvailableCampaigns.length} available</span>
            {selectedIds.size > 0 && (
              <>
                <span>•</span>
                <span className="font-medium">{selectedIds.size} selected</span>
              </>
            )}
          </div>
        </SelectionControls>
      </div>

      {/* Campaigns Grid */}
      <CampaignGrid
        campaigns={filteredAvailableCampaigns}
        selectedIds={selectedIds}
        isLoading={campaignsLoading}
        emptyState={emptyState}
        containerRef={containerRef}
        onMouseDown={handleMouseDown}
        onItemClick={handleItemClick}
        onItemSelect={handleItemSelect}
        itemRefs={itemRefs}
        selectionRect={selectionRect}
      />
    </div>
  );
}