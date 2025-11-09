"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2 } from "lucide-react";
import { CampaignSearchBar } from "./CampaignSearchBar";
import { SelectableCampaignGrid } from "./SelectableCampaignGrid";
import { SelectionControls } from "./SelectionControls";
import { useSelectionLogic } from "@/features/campaign-old/list/hooks/useSelectionLogic";
import type { UseFolderManagerLogicReturn } from "../types/folder-manager.types";

interface AddToFolderTabProps {
  folderLogic: UseFolderManagerLogicReturn;
}

export function AddToFolderTab({ folderLogic }: AddToFolderTabProps) {
  const {
    allCampaigns,
    campaignsLoading,
    folderCampaigns,
    folderCampaignsLoading,
    campaignSearchQuery,
    setCampaignSearchQuery,
    handleBulkAddCampaigns: originalHandleBulkAdd,
    selectedFolderId,
  } = folderLogic;


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
    
    // Exclude campaigns already in folder
    if (folderCampaigns) {
      const folderCampaignIds = new Set(folderCampaigns.campaigns?.map(c => c._id) || []);
      filtered = filtered.filter(campaign => !folderCampaignIds.has(campaign._id));
    }
    
    return filtered;
  }, [allCampaigns, campaignSearchQuery, folderCampaigns]);

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

  const [isAdding, setIsAdding] = useState(false);

  // Reset selection when folder changes
  useEffect(() => {
    setSelectedIds(new Set());
    setCampaignSearchQuery("");
  }, [selectedFolderId, setSelectedIds, setCampaignSearchQuery]);

  // Handle bulk add with our selected IDs
  const handleBulkAdd = async () => {
    setIsAdding(true);
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
    setIsAdding(false);
  };

  const emptyState = (
    <div className="col-span-full flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">
        {campaignSearchQuery ? 'No campaigns found' : 'No available campaigns'}
      </h3>
      <p className="text-sm text-muted-foreground">
        {campaignSearchQuery 
          ? 'Try adjusting your search' 
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
        <CampaignSearchBar
          searchQuery={campaignSearchQuery}
          onSearchChange={setCampaignSearchQuery}
          placeholder="Search campaigns by name, song, artist, or genre..."
        />

        {/* Selection Info and Actions */}
        <SelectionControls
          selectedCount={selectedIds.size}
          totalCount={filteredAvailableCampaigns.length}
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedIds(new Set())}
          actionButton={
            <Button onClick={handleBulkAdd} disabled={isAdding} className="gap-2">
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add {selectedIds.size} to Folder
            </Button>
          }
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {!campaignsLoading && !folderCampaignsLoading && (
              <span>Showing {filteredAvailableCampaigns.length} campaigns</span>
            )}
            {selectedIds.size > 0 && (
              <>
                {!campaignsLoading && !folderCampaignsLoading && <span>•</span>}
                <span className="font-medium">{selectedIds.size} selected</span>
              </>
            )}
          </div>
        </SelectionControls>
      </div>

      {/* Campaigns Grid */}
      <SelectableCampaignGrid
        campaigns={filteredAvailableCampaigns}
        selectedIds={selectedIds}
        isLoading={campaignsLoading || folderCampaignsLoading}
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