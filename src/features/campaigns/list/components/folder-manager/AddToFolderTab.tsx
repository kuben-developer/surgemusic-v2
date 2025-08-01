"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Plus, 
  Filter,
  X,
  CheckSquare,
  Square,
  Grid3X3,
  List,
  LayoutGrid,
  Music,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CampaignFilters, type FilterState } from "./CampaignFilters";
import type { UseFolderManagerLogicReturn } from "../../types/folder-manager.types";
import type { Doc } from "../../../../../../../convex/_generated/dataModel";
import { isWithinInterval, format } from "date-fns";
import Image from "next/image";

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
    selectedCampaignIds,
    handleCampaignSelect,
    handleSelectAllCampaigns,
    handleBulkAddCampaigns,
  } = folderLogic;

  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{x: number, y: number} | null>(null);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const campaignRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // Handle drag selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || e.target !== e.currentTarget) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsSelecting(true);
    setSelectionStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setSelectionEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    
    // Clear selection if not holding ctrl/cmd
    if (!e.ctrlKey && !e.metaKey) {
      handleSelectAllCampaigns(false);
    }
  }, [handleSelectAllCampaigns]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isSelecting || !selectionStart || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setSelectionEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    
    // Calculate selection rectangle
    const minX = Math.min(selectionStart.x, e.clientX - rect.left);
    const maxX = Math.max(selectionStart.x, e.clientX - rect.left);
    const minY = Math.min(selectionStart.y, e.clientY - rect.top);
    const maxY = Math.max(selectionStart.y, e.clientY - rect.top);
    
    // Check which campaigns are within the selection
    const newSelected = new Set(selectedCampaignIds);
    
    campaignRefs.current.forEach((element, campaignId) => {
      const elemRect = element.getBoundingClientRect();
      const elemX = elemRect.left - rect.left;
      const elemY = elemRect.top - rect.top;
      
      const inSelection = 
        elemX < maxX && 
        elemX + elemRect.width > minX &&
        elemY < maxY && 
        elemY + elemRect.height > minY;
      
      if (inSelection) {
        newSelected.add(campaignId);
      }
    });
    
    // Update selection
    newSelected.forEach(id => {
      if (!selectedCampaignIds.has(id)) {
        handleCampaignSelect(id, true);
      }
    });
  }, [isSelecting, selectionStart, selectedCampaignIds, handleCampaignSelect]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, []);

  // Handle shift-click selection
  const handleCampaignClick = useCallback((index: number, campaign: Doc<"campaigns">, e: React.MouseEvent) => {
    if (e.shiftKey && lastSelectedIndex !== null) {
      // Select range
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      
      for (let i = start; i <= end; i++) {
        if (filteredAvailableCampaigns[i]) {
          handleCampaignSelect(filteredAvailableCampaigns[i]._id, true);
        }
      }
    } else if (e.ctrlKey || e.metaKey) {
      // Toggle single item
      handleCampaignSelect(campaign._id, !selectedCampaignIds.has(campaign._id));
      setLastSelectedIndex(index);
    } else {
      // Toggle this item selection
      if (selectedCampaignIds.size === 1 && selectedCampaignIds.has(campaign._id)) {
        // If only this item is selected, deselect it
        handleCampaignSelect(campaign._id, false);
      } else {
        // Otherwise, select only this item
        handleSelectAllCampaigns(false);
        handleCampaignSelect(campaign._id, true);
      }
      setLastSelectedIndex(index);
    }
  }, [lastSelectedIndex, filteredAvailableCampaigns, handleCampaignSelect, selectedCampaignIds, handleSelectAllCampaigns]);

  // Set up mouse event listeners
  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isSelecting, handleMouseMove, handleMouseUp]);

  // Selection rectangle styles
  const selectionRectStyle = useMemo(() => {
    if (!isSelecting || !selectionStart || !selectionEnd) return null;
    
    const left = Math.min(selectionStart.x, selectionEnd.x);
    const top = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);
    
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  }, [isSelecting, selectionStart, selectionEnd]);

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
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Selection Info and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const allSelected = selectedCampaignIds.size === filteredAvailableCampaigns.length;
                handleSelectAllCampaigns(!allSelected);
              }}
              className="gap-2"
            >
              {selectedCampaignIds.size === filteredAvailableCampaigns.length && filteredAvailableCampaigns.length > 0 ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              Select All
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{filteredAvailableCampaigns.length} available</span>
              {selectedCampaignIds.size > 0 && (
                <>
                  <span>•</span>
                  <span className="font-medium">{selectedCampaignIds.size} selected</span>
                </>
              )}
            </div>
          </div>

          {selectedCampaignIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSelectAllCampaigns(false)}
              >
                Clear selection
              </Button>
              <Button
                onClick={handleBulkAddCampaigns}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add {selectedCampaignIds.size} to Folder
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Campaigns Grid/List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div 
            ref={containerRef}
            className={cn(
              "relative select-none",
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" 
                : "space-y-2"
            )}
            onMouseDown={handleMouseDown}
          >
            {campaignsLoading ? (
              // Loading skeleton
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={cn(
                  "rounded-lg border bg-card",
                  viewMode === "grid" ? "p-3" : "p-2.5"
                )}>
                  {viewMode === "grid" ? (
                    <div className="flex gap-3">
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-3" />
                        <Skeleton className="w-16 h-16 rounded-md" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : filteredAvailableCampaigns.length > 0 ? (
              filteredAvailableCampaigns.map((campaign, index) => (
                <div
                  key={campaign._id}
                  ref={(el) => {
                    if (el) campaignRefs.current.set(campaign._id, el);
                    else campaignRefs.current.delete(campaign._id);
                  }}
                  onClick={(e) => handleCampaignClick(index, campaign, e)}
                  className={cn(
                    "group relative rounded-lg border bg-card transition-all cursor-pointer",
                    selectedCampaignIds.has(campaign._id) 
                      ? "ring-2 ring-primary border-primary" 
                      : "hover:bg-accent/50",
                    viewMode === "grid" ? "p-3" : "p-2.5"
                  )}
                >
                  {viewMode === "grid" ? (
                    <div className="flex gap-3">
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedCampaignIds.has(campaign._id)}
                          onCheckedChange={(checked) => handleCampaignSelect(campaign._id, checked as boolean)}
                          className="mr-3"
                          onClick={(e) => e.stopPropagation()}
                        />
                        
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {campaign.campaignCoverImageUrl ? (
                            <Image
                              src={campaign.campaignCoverImageUrl}
                              alt={campaign.campaignName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
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
                  ) : (
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCampaignIds.has(campaign._id)}
                        onCheckedChange={(checked) => handleCampaignSelect(campaign._id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
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
                            <Music className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{campaign.campaignName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {campaign.songName} • {campaign.artistName}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
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
                  )}
                </div>
              ))
            ) : (
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
            )}
            
            {/* Selection Rectangle */}
            {isSelecting && selectionRectStyle && (
              <div
                className="absolute border-2 border-primary bg-primary/10 pointer-events-none rounded-md"
                style={selectionRectStyle}
              />
            )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}