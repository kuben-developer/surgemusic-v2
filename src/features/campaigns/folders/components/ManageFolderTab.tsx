"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Archive,
  X,
  Loader2,
  Trash2
} from "lucide-react";
import { CampaignSearchBar } from "./CampaignSearchBar";
import { SelectableCampaignGrid } from "./SelectableCampaignGrid";
import { SelectionControls } from "./SelectionControls";
import { useSelectionLogic } from "@/features/campaigns/list/hooks/useSelectionLogic";
import type { UseFolderManagerLogicReturn } from "../types/folder-manager.types";

interface ManageFolderTabProps {
  folderLogic: UseFolderManagerLogicReturn;
}

export function ManageFolderTab({ folderLogic }: ManageFolderTabProps) {
  const {
    selectedFolder,
    folderCampaigns,
    folderCampaignsLoading,
    handleRemoveCampaign,
    setShowDeleteDialog,
  } = folderLogic;

  const [searchQuery, setSearchQuery] = useState("");

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    if (!folderCampaigns?.campaigns) return [];
    
    let filtered = folderCampaigns.campaigns;
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.campaignName.toLowerCase().includes(query) ||
        campaign.songName.toLowerCase().includes(query) ||
        campaign.artistName.toLowerCase().includes(query) ||
        campaign.genre.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [folderCampaigns, searchQuery]);

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
  } = useSelectionLogic({ items: filteredCampaigns });

  const [isRemoving, setIsRemoving] = useState(false);

  // Reset selection when folder changes
  useEffect(() => {
    setSelectedIds(new Set());
    setSearchQuery("");
  }, [selectedFolder?._id, setSelectedIds]);

  // Handle bulk remove
  const handleBulkRemove = async () => {
    setIsRemoving(true);
    for (const campaignId of selectedIds) {
      await handleRemoveCampaign(campaignId);
    }
    setSelectedIds(new Set());
    setIsRemoving(false);
  };

  const emptyState = (
    <div className="col-span-full flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <Archive className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">
        {searchQuery ? 'No campaigns found' : 'No campaigns in this folder'}
      </h3>
      <p className="text-sm text-muted-foreground">
        {searchQuery 
          ? 'Try adjusting your search terms' 
          : 'Add campaigns from the "Add to Folder" tab'
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
      {/* Header Section */}
      <div className="px-6 py-4 space-y-4 flex-shrink-0 bg-background/50 border-b">
        {/* Search Bar Row */}
        <CampaignSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search campaigns in this folder..."
        />

        {/* Selection Info and Actions */}
        <SelectionControls
          selectedCount={selectedIds.size}
          totalCount={filteredCampaigns.length}
          onSelectAll={handleSelectAll}
          onClearSelection={() => setSelectedIds(new Set())}
          actionButton={
            <Button
              variant="destructive"
              onClick={handleBulkRemove}
              disabled={isRemoving}
              className="gap-2"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Remove {selectedIds.size} from Folder
            </Button>
          }
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {!folderCampaignsLoading && (
              <span>Showing {filteredCampaigns.length} campaigns</span>
            )}
            {selectedIds.size > 0 && (
              <>
                {!folderCampaignsLoading && <span>•</span>}
                <span className="font-medium">{selectedIds.size} selected</span>
              </>
            )}
          </div>
        </SelectionControls>
      </div>

      {/* Campaigns Grid */}
      <SelectableCampaignGrid
        campaigns={filteredCampaigns}
        selectedIds={selectedIds}
        isLoading={folderCampaignsLoading}
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