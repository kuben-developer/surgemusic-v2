"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Trash2,
  Grid3X3,
  List,
  Archive,
  Filter,
  ChevronDown,
  Music,
  X,
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UseFolderManagerLogicReturn } from "../../types/folder-manager.types";
import type { Doc } from "../../../../../../../convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { format } from "date-fns";

interface ManageFolderTabProps {
  folderLogic: UseFolderManagerLogicReturn;
}

export function ManageFolderTab({ folderLogic }: ManageFolderTabProps) {
  const {
    selectedFolder,
    folders,
    folderCampaigns,
    folderCampaignsLoading,
    handleRemoveCampaign,
    setShowDeleteDialog,
  } = folderLogic;

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
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

  const CampaignItem = ({ campaign }: { campaign: Doc<"campaigns"> }) => {
    if (viewMode === "grid") {
      return (
        <div className="group relative rounded-lg border bg-card p-3 transition-all hover:bg-accent/50">
          <div className="flex gap-3">
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
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate pr-6">{campaign.campaignName}</h4>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {campaign.songName} • {campaign.artistName}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="secondary" className="text-xs">
                  {campaign.genre}
                </Badge>
                <div className="flex items-center gap-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    campaign.status === 'completed' ? 'bg-green-600' : 'bg-orange-400'
                  )} />
                  <span className="text-xs text-muted-foreground">{campaign.videoCount || 0} videos</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  • {format(new Date(campaign._creationTime), "MMM d, yyyy")}
                </span>
              </div>
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleRemoveCampaign(campaign._id)}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all flex-shrink-0"
              title="Remove from folder"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="group flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-all">
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
          <div className="flex items-center gap-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              campaign.status === 'completed' ? 'bg-green-600' : 'bg-orange-400'
            )} />
            <span className="text-xs text-muted-foreground">{campaign.videoCount || 0}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            • {format(new Date(campaign._creationTime), "MMM d, yyyy")}
          </span>
        </div>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => handleRemoveCampaign(campaign._id)}
          className="h-8 w-8 opacity-60 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
          title="Remove from folder"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-4 space-y-4 flex-shrink-0 bg-background/50 border-b">
        {/* Top Row: Folder Info and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{selectedFolder?.name || "Folder"}</h3>
              <p className="text-sm text-muted-foreground">
                {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
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

        {/* Search and View Controls */}
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
          
          {/* View Mode Toggle */}
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
      </div>

      {/* Campaigns List/Grid */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className={cn(
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" 
              : "space-y-2"
          )}>
            {folderCampaignsLoading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={cn(
                  "rounded-lg border bg-card",
                  viewMode === "grid" ? "p-3" : "p-2.5"
                )}>
                  {viewMode === "grid" ? (
                    <div className="flex gap-3">
                      <Skeleton className="w-16 h-16 rounded-md" />
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
                      <Skeleton className="h-8 w-8" />
                    </div>
                  )}
                </div>
              ))
            ) : filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <CampaignItem key={campaign._id} campaign={campaign} />
              ))
            ) : (
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
            )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}