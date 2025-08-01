"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { FolderOpen, Loader2 } from "lucide-react";
import { useFolderManagerLogic } from "../hooks/useFolderManagerLogic";
import {
  FolderSidebar,
  FolderHeader,
  AvailableCampaignsPanel,
  FolderCampaignsPanel,
  WelcomeView
} from "./folder-manager";

interface FolderManagerDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FolderManagerDialog({ 
  children, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: FolderManagerDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
    
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = controlledOnOpenChange || setInternalOpen;

  // Use the folder manager logic hook
  const {
    selectedFolderId,
    showDeleteDialog,
    setShowDeleteDialog,
    isDeleting,
    campaignSearchQuery,
    setCampaignSearchQuery,
    selectedCampaignIds,
    folders,
    isLoading,
    allCampaigns,
    campaignsLoading,
    folderCampaigns,
    folderCampaignsLoading,
    selectedFolder,
    resetState,
    handleFolderSelect,
    handleDeleteFolder,
    handleRemoveCampaign,
    handleCampaignSelect,
    handleSelectAllCampaigns,
    handleBulkAddCampaigns,
  } = useFolderManagerLogic({ open });

  // Reset selection when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }
    onOpenChange(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {children && (
          <DialogTrigger asChild>
            {children}
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[1400px] max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FolderOpen className="h-6 w-6" />
              Folder Manager
            </DialogTitle>
            <DialogDescription>
              Organize your campaigns into folders for better management
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-1 min-h-[600px]">
            {/* Left Sidebar - Folders */}
            <FolderSidebar
              folders={folders}
              isLoading={isLoading}
              selectedFolderId={selectedFolderId}
              onFolderSelect={handleFolderSelect}
            />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {!selectedFolderId ? (
                <WelcomeView onCreateFolder={() => {}} />
              ) : (
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
                    {/* Available Campaigns */}
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
                    
                    {/* Campaigns in Folder */}
                    <FolderCampaignsPanel
                      folderCampaigns={folderCampaigns?.campaigns}
                      folderCampaignsLoading={folderCampaignsLoading}
                      onRemoveCampaign={handleRemoveCampaign}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          
          <Separator />
          
          <DialogFooter className="px-6 py-4">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the folder "{selectedFolder?.name}"? 
              This action cannot be undone. All campaigns will be removed from this folder but won't be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Folder"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}