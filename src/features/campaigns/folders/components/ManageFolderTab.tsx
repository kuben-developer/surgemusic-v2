"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Trash2,
  Archive,
  Filter,
  ChevronDown,
  X,
  FolderOpen
} from "lucide-react";
import { CampaignGrid } from "@/features/campaigns/list/components/folder-manager/CampaignGrid";
import { SelectionControls } from "@/features/campaigns/list/components/folder-manager/SelectionControls";
import { useSelectionLogic } from "@/features/campaigns/list/hooks/useSelectionLogic";
import type { UseFolderManagerLogicReturn } from "../types/folder-manager.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("name");

  // Filter and sort campaigns
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
    
    // Sort campaigns
    const sorted = [...filtered];
    switch (sortBy) {
      case "name":
        sorted.sort((a, b) => a.campaignName.localeCompare(b.campaignName));
        break;
      case "date":
        sorted.sort((a, b) => b._creationTime - a._creationTime);
        break;
      case "status":
        sorted.sort((a, b) => {
          if (a.status === b.status) return a.campaignName.localeCompare(b.campaignName);
          return a.status === "completed" ? -1 : 1;
        });
        break;
    }
    
    return sorted;
  }, [folderCampaigns, searchQuery, sortBy]);

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

  // Handle bulk remove
  const handleBulkRemove = async () => {
    for (const campaignId of selectedIds) {
      await handleRemoveCampaign(campaignId);
    }
    setSelectedIds(new Set());
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
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns in this folder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Sort
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Name {sortBy === "name" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("date")}>
                Date Added {sortBy === "date" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("status")}>
                Status {sortBy === "status" && "✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Selection Info and Actions */}
        <div className="flex items-center justify-between">
          <SelectionControls
            selectedCount={selectedIds.size}
            totalCount={filteredCampaigns.length}
            onSelectAll={handleSelectAll}
            onClearSelection={() => setSelectedIds(new Set())}
            actionButton={
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkRemove}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Remove {selectedIds.size} from Folder
              </Button>
            }
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">{selectedFolder?.name || "Folder"}</h3>
                  <p className="text-xs">
                    {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
                    {selectedIds.size > 0 && (
                      <span className="font-medium"> • {selectedIds.size} selected</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </SelectionControls>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete Folder
          </Button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <CampaignGrid
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