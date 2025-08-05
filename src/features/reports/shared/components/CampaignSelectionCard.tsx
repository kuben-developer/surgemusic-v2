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
    
    // Sync external selection state with internal state (parent → internal)
    useEffect(() => {
        setSelectedIds(new Set(selectedCampaignIds));
    }, [selectedCampaignIds, setSelectedIds]);
    
    // Sync internal selection state with parent (internal → parent)
    // This ensures drag selection and other internal changes sync back
    useEffect(() => {
        const currentParentIds = new Set(selectedCampaignIds);
        const internalIds = selectedIds;
        
        // Find differences
        const toAdd = Array.from(internalIds).filter(id => !currentParentIds.has(id));
        const toRemove = Array.from(currentParentIds).filter(id => !internalIds.has(id));
        
        // Sync changes to parent
        toAdd.forEach(id => onToggleCampaign(id, true));
        toRemove.forEach(id => onToggleCampaign(id, false));
    }, [selectedIds]); // Intentionally not including dependencies to avoid infinite loop
    
    // Since we have bidirectional sync via useEffect, we can use the original handlers
    const handleSelectAllWrapper = (selected: boolean) => {
        handleSelectAll(selected);
    };
    
    const handleClearSelectionWrapper = () => {
        setSelectedIds(new Set());
        onClearAll(); // Call the parent's clear all function
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