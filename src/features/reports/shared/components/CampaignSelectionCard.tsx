"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
    const [campaignOrder, setCampaignOrder] = useState<string[]>([]);
    const initialSelectionsRef = useRef<string[] | null>(null);
    const sortAppliedRef = useRef(false);
    
    // Capture initial selections on first render
    if (initialSelectionsRef.current === null) {
        initialSelectionsRef.current = selectedCampaignIds;
    }
    
    // Apply initial sorting only once when component first loads with campaigns
    useEffect(() => {
        if (!sortAppliedRef.current && campaigns && campaigns.length > 0) {
            const initialSelections = initialSelectionsRef.current;
            
            // Check if we have initial selections (editing mode)
            if (initialSelections && initialSelections.length > 0) {
                // Sort campaigns with initially selected ones at the top
                const selected: typeof campaigns = [];
                const unselected: typeof campaigns = [];
                
                campaigns.forEach(campaign => {
                    if (initialSelections.includes(campaign._id)) {
                        selected.push(campaign);
                    } else {
                        unselected.push(campaign);
                    }
                });
                
                // Store the sorted order with selected campaigns first
                const sortedOrder = [...selected, ...unselected].map(c => c._id);
                setCampaignOrder(sortedOrder);
            } else {
                // No initial selections (create mode), use the original order
                setCampaignOrder(campaigns.map(c => c._id));
            }
            sortAppliedRef.current = true;
        }
    }, [campaigns]); // Only depend on campaigns
    
    // Filter campaigns based on search query
    const filteredCampaigns = useMemo(() => {
        if (!campaigns) return [];
        
        if (!searchQuery.trim()) return campaigns;
        
        const query = searchQuery.toLowerCase();
        return campaigns.filter(campaign =>
            campaign.campaignName.toLowerCase().includes(query) ||
            campaign.songName.toLowerCase().includes(query) ||
            campaign.artistName.toLowerCase().includes(query) ||
            campaign.genre.toLowerCase().includes(query)
        );
    }, [campaigns, searchQuery]);
    
    // Apply the stable sort order to filtered campaigns
    const sortedCampaigns = useMemo(() => {
        if (!filteredCampaigns || filteredCampaigns.length === 0) return [];
        
        // If we have a campaign order, use it to sort the filtered results
        if (campaignOrder.length > 0) {
            // Create a map for quick lookup
            const campaignMap = new Map<string, Doc<"campaigns">>();
            filteredCampaigns.forEach(c => campaignMap.set(c._id, c));
            
            const sorted: typeof filteredCampaigns = [];
            
            // Add campaigns in the stored order
            for (const id of campaignOrder) {
                const campaign = campaignMap.get(id);
                if (campaign) {
                    sorted.push(campaign);
                }
            }
            
            return sorted;
        }
        
        // No custom order, use the filtered campaigns as-is
        return filteredCampaigns;
    }, [filteredCampaigns, campaignOrder]);
    
    // Track if we're doing a bulk operation to prevent state reset
    const isBulkOperationRef = useRef(false);
    
    // Custom handleItemSelect that syncs with parent
    const customHandleItemSelect = (itemId: string, selected: boolean) => {
        onToggleCampaign(itemId, selected);
    };
    
    // Use shared selection logic with sorted campaigns
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
    } = useSelectionLogic({ items: sortedCampaigns });
    
    // Initialize internal state from parent state
    useEffect(() => {
        // Skip if we're in a bulk operation
        if (!isBulkOperationRef.current) {
            setSelectedIds(new Set(selectedCampaignIds));
        }
    }, [selectedCampaignIds, setSelectedIds]);
    
    // Wrap individual item selection to sync with parent
    const handleItemSelectWrapper = (campaignId: string, selected: boolean) => {
        handleItemSelect(campaignId, selected);
        onToggleCampaign(campaignId, selected);
    };
    
    // Wrap item click to sync with parent 
    const handleItemClickWrapper = (index: number, campaign: Doc<"campaigns">, e: React.MouseEvent) => {
        if (e.shiftKey && selectedIds.size > 0) {
            // Shift-click for range selection
            const selectedArray = Array.from(selectedIds);
            const lastSelectedId = selectedArray[selectedArray.length - 1];
            const lastIndex = sortedCampaigns.findIndex(c => c._id === lastSelectedId);
            
            if (lastIndex !== -1) {
                const start = Math.min(lastIndex, index);
                const end = Math.max(lastIndex, index);
                
                for (let i = start; i <= end; i++) {
                    const item = sortedCampaigns[i];
                    if (item && !selectedIds.has(item._id)) {
                        handleItemSelectWrapper(item._id, true);
                    }
                }
            }
        } else if (e.ctrlKey || e.metaKey) {
            // Ctrl/Cmd click - for drag selection, do nothing
            return;
        } else {
            // Normal click - toggle selection
            const isCurrentlySelected = selectedIds.has(campaign._id);
            handleItemSelectWrapper(campaign._id, !isCurrentlySelected);
        }
    };
    
    // Handle select all with proper parent sync
    const handleSelectAllWrapper = (selected: boolean) => {
        // Set flag to prevent state reset from parent update
        isBulkOperationRef.current = true;
        
        if (selected) {
            // Select all visible campaigns
            const allVisibleIds = sortedCampaigns.map(c => c._id);
            
            // Update internal state
            const newSelection = new Set(allVisibleIds);
            setSelectedIds(newSelection);
            
            // Update parent state for each campaign
            allVisibleIds.forEach(id => {
                if (!selectedCampaignIds.includes(id)) {
                    onToggleCampaign(id, true);
                }
            });
            
            // Reset flag after a delay to allow state to settle
            setTimeout(() => {
                isBulkOperationRef.current = false;
            }, 100);
        } else {
            // Clear all selections
            setSelectedIds(new Set());
            onClearAll();
            
            setTimeout(() => {
                isBulkOperationRef.current = false;
            }, 100);
        }
    };
    
    const handleClearSelectionWrapper = () => {
        // Set flag to prevent state reset
        isBulkOperationRef.current = true;
        
        // Clear both internal and parent state
        setSelectedIds(new Set());
        onClearAll();
        
        // Reset flag after a delay
        setTimeout(() => {
            isBulkOperationRef.current = false;
        }, 100);
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
                            onItemClick={handleItemClickWrapper}
                            onItemSelect={handleItemSelectWrapper}
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
                                    totalCount={sortedCampaigns.length}
                                    onSelectAll={handleSelectAllWrapper}
                                    onClearSelection={handleClearSelectionWrapper}
                                >
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>Showing {sortedCampaigns.length} campaigns</span>
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
                                campaigns={sortedCampaigns}
                                selectedIds={selectedIds}
                                isLoading={false}
                                emptyState={emptyState}
                                containerRef={containerRef}
                                onMouseDown={handleMouseDown}
                                onItemClick={handleItemClickWrapper}
                                onItemSelect={handleItemSelectWrapper}
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