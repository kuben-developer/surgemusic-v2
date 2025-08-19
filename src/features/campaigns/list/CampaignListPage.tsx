'use client';

import { FolderManagerDialog } from "@/features/campaigns/folders";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { CampaignsHeader } from "./components/CampaignsHeader";
import { FolderNavigation } from "@/features/campaigns/folders";
import { CampaignGridView } from "./components/CampaignGridView";
import { CampaignTableView } from "./components/CampaignTableView";
import { CampaignListLoader } from "./components/CampaignListLoader";
import { type ViewMode } from "@/features/campaigns";
import { useCampaignListData } from "./hooks/useCampaignData";

export default function CampaignListPage() {
  // State management for folder and campaign data
  const [selectedView, setSelectedView] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [folderManagerOpen, setFolderManagerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "failed">('all');
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month" | "year">('all');

  // Fetch folder and campaign data using Convex
  const folderData = useQuery(api.app.campaigns.getAllWithFolders);
  const isLoading = folderData === undefined;
  const error = null; // Convex handles errors differently

  // Transform data and memoized data processing
  const { processedData, dataSummary } = useCampaignListData({
    folderData,
    selectedView,
    searchQuery,
    statusFilter,
    dateFilter,
  });

  // Loading state
  if (isLoading) {
    return <CampaignListLoader />;
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
        viewMode={viewMode}
        setViewMode={setViewMode}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
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

      {/* Campaign View - Grid or Table */}
      {viewMode === 'grid' ? (
        <CampaignGridView
          campaigns={processedData.filteredCampaigns}
          searchQuery={searchQuery}
        />
      ) : (
        <CampaignTableView
          campaigns={processedData.filteredCampaigns}
          searchQuery={searchQuery}
        />
      )}

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