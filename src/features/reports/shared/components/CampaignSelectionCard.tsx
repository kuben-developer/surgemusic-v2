"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { Doc } from "../../../../../convex/_generated/dataModel";
import { CampaignSelectionHeader } from "./CampaignSelectionHeader";
import { CampaignSearchBar } from "./CampaignSearchBar";
import { SelectableCampaignGrid } from "./SelectableCampaignGrid";
import { SelectionControls } from "./SelectionControls";
import { useSelectionLogic } from "../hooks/useSelectionLogic";

interface CampaignSelectionCardProps {
    campaigns: Doc<"campaigns">[];
    isLoadingCampaigns: boolean;
    campaignsError: null;
    selectedCampaignIds: string[];
    allCampaignIds: string[];
    onSelectAll: () => void;
    onClearAll: () => void;
    onToggleCampaign: (campaignId: string, checked: boolean) => void;
    error?: string;
}

export function CampaignSelectionCard({
    campaigns,
    isLoadingCampaigns,
    campaignsError,
    selectedCampaignIds,
    allCampaignIds,
    onSelectAll,
    onClearAll,
    onToggleCampaign,
    error,
}: CampaignSelectionCardProps) {
    const [searchQuery, setSearchQuery] = useState("");
    
    // Sort campaigns: selected ones first, then unselected
    const sortedCampaigns = useMemo(() => {
        if (!campaigns) return [];
        
        const sorted = [...campaigns].sort((a, b) => {
            const aSelected = selectedCampaignIds.includes(a._id);
            const bSelected = selectedCampaignIds.includes(b._id);
            
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0; // Keep original order for items with same selection status
        });
        
        return sorted;
    }, [campaigns, selectedCampaignIds]);
    
    // Filter campaigns based on search query
    const filteredCampaigns = useMemo(() => {
        if (!sortedCampaigns) return [];
        
        if (!searchQuery.trim()) return sortedCampaigns;
        
        const query = searchQuery.toLowerCase();
        return sortedCampaigns.filter(campaign =>
            campaign.campaignName.toLowerCase().includes(query) ||
            campaign.songName.toLowerCase().includes(query) ||
            campaign.artistName.toLowerCase().includes(query) ||
            campaign.genre.toLowerCase().includes(query)
        );
    }, [sortedCampaigns, searchQuery]);
    
    // Use shared selection logic with filtered campaigns
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
    } = useSelectionLogic({ 
        items: filteredCampaigns,
        onItemSelect: onToggleCampaign
    });
    
    // Keep internal state in sync with parent state
    useEffect(() => {
        setSelectedIds(new Set(selectedCampaignIds));
    }, [selectedCampaignIds, setSelectedIds]);
    
    // Handle select all with simplified logic
    const handleSelectAllWrapper = (selected: boolean) => {
        if (selected) {
            // Get all visible campaign IDs
            const allVisibleIds = filteredCampaigns.map(c => c._id);
            // Call onSelectAll with all IDs at once instead of toggling individually
            onSelectAll();
        } else {
            onClearAll();
        }
    };
    
    const handleClearSelectionWrapper = () => {
        onClearAll();
    };
    
    const emptyState = (
        <div className="col-span-full flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No campaigns found' : 'No campaigns available'}
            </h3>
            <p className="text-sm text-muted-foreground">
                {searchQuery 
                    ? 'Try adjusting your search' 
                    : 'Create campaigns to include them in reports'
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
        <div className="space-y-2">
            <Card className="overflow-hidden">
                <CampaignSelectionHeader />
                <CardContent className="p-0">
                    {isLoadingCampaigns ? (
                        <SelectableCampaignGrid
                            campaigns={[]}
                            selectedIds={new Set()}
                            isLoading={true}
                            emptyState={emptyState}
                            containerRef={containerRef}
                            onMouseDown={handleMouseDown}
                            onItemClick={handleItemClick}
                            onItemSelect={handleItemSelect}
                            itemRefs={itemRefs}
                            selectionRect={selectionRect}
                        />
                    ) : campaignsError ? (
                        <div className="p-6 text-center text-muted-foreground">
                            Error loading campaigns. Please try again.
                        </div>
                    ) : !campaigns || campaigns.length === 0 ? (
                        <div className="p-6">{emptyState}</div>
                    ) : (
                        <div className="flex flex-col h-[500px]">
                            {/* Search and Selection Controls */}
                            <div className="px-6 py-4 space-y-4 flex-shrink-0 bg-background/50 border-b">
                                <CampaignSearchBar
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    placeholder="Search campaigns by name, song, artist, or genre..."
                                />
                                
                                <SelectionControls
                                    selectedCount={selectedIds.size}
                                    totalCount={filteredCampaigns.length}
                                    onSelectAll={handleSelectAllWrapper}
                                    onClearSelection={handleClearSelectionWrapper}
                                >
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>Showing {filteredCampaigns.length} campaigns</span>
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
                            <SelectableCampaignGrid
                                campaigns={filteredCampaigns}
                                selectedIds={selectedIds}
                                isLoading={false}
                                emptyState={emptyState}
                                containerRef={containerRef}
                                onMouseDown={handleMouseDown}
                                onItemClick={handleItemClick}
                                onItemSelect={handleItemSelect}
                                itemRefs={itemRefs}
                                selectionRect={selectionRect}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
            {error && (
                <p className="text-sm text-destructive pt-2">{error}</p>
            )}
        </div>
    );
}