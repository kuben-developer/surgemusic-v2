"use client";

import {
  FolderHeader,
  AvailableCampaignsPanel,
  FolderCampaignsPanel,
} from "./folder-manager";
import type { UseFolderManagerLogicReturn } from "../types/folder-manager.types";

interface DualPanelLayoutProps {
  folderLogic: UseFolderManagerLogicReturn;
}

export function DualPanelLayout({ folderLogic }: DualPanelLayoutProps) {
  const {
    selectedFolder,
    folders,
    folderCampaigns,
    allCampaigns,
    campaignsLoading,
    campaignSearchQuery,
    setCampaignSearchQuery,
    selectedCampaignIds,
    handleCampaignSelect,
    handleSelectAllCampaigns,
    handleBulkAddCampaigns,
    folderCampaignsLoading,
    handleRemoveCampaign,
    setShowDeleteDialog,
  } = folderLogic;

  return (
    <>
      {/* Folder Header */}
      <FolderHeader
        selectedFolder={selectedFolder}
        folderCampaignsCount={folderCampaigns?.campaigns?.length || 0}
        folders={folders}
        onDeleteFolder={() => setShowDeleteDialog(true)}
      />
      
      {/* Content Tabs */}
      <div className="flex-1 flex">
        {/* Available Campaigns Panel */}
        <AvailableCampaignsPanel
          allCampaigns={allCampaigns}
          campaignsLoading={campaignsLoading}
          campaignSearchQuery={campaignSearchQuery}
          onCampaignSearchChange={setCampaignSearchQuery}
          selectedCampaignIds={selectedCampaignIds}
          onCampaignSelect={handleCampaignSelect}
          onSelectAllCampaigns={handleSelectAllCampaigns}
          onBulkAddCampaigns={handleBulkAddCampaigns}
          folderCampaigns={folderCampaigns?.campaigns}
        />
        
        {/* Campaigns in Folder Panel */}
        <FolderCampaignsPanel
          folderCampaigns={folderCampaigns?.campaigns}
          folderCampaignsLoading={folderCampaignsLoading}
          onRemoveCampaign={handleRemoveCampaign}
        />
      </div>
    </>
  );
}