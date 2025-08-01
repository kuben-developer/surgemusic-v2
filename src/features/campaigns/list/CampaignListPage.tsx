'use client';

import { FolderManagerDialog } from "./components/FolderManagerDialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { CampaignsHeader } from "./components/CampaignsHeader";
import { FolderNavigation } from "./components/FolderNavigation";
import { CampaignListGrid } from "./components/CampaignListGrid";
import { useCampaignListData, type FolderData } from "./hooks/useCampaignData";

export default function CampaignListPage() {
  // State management for folder and campaign data
  const [selectedView, setSelectedView] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [folderManagerOpen, setFolderManagerOpen] = useState(false);

  // Fetch folder and campaign data using Convex
  const folderData = useQuery(api.campaigns.getAllWithFolders);
  const isLoading = folderData === undefined;
  const error = null; // Convex handles errors differently

  // Transform data and memoized data processing
  const { processedData, dataSummary } = useCampaignListData({
    folderData,
    selectedView,
    searchQuery,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">Failed to load campaigns</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      {/* Header with title, stats, and actions */}
      <CampaignsHeader
        dataSummary={dataSummary}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onManageFolders={() => setFolderManagerOpen(true)}
      />

      {/* Folder Navigation */}
      <div className="my-8">
        <FolderNavigation
          folders={processedData.folders}
          allCampaigns={processedData.allCampaigns}
          selectedView={selectedView}
          onViewChange={setSelectedView}
        />
      </div>

      {/* Campaign Grid */}
      <CampaignListGrid
        campaigns={processedData.filteredCampaigns}
        searchQuery={searchQuery}
      />

      {/* Folder Manager Dialog */}
      <FolderManagerDialog
        open={folderManagerOpen}
        onOpenChange={(open) => {
          setFolderManagerOpen(open);
          // Convex automatically syncs data when dialog closes
          if (!open) {
            // No need to manually refetch with Convex
          }
        }}
      />
    </div>
  );
}