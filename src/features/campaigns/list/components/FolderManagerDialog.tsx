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
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
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
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Campaign search and management state
  const [campaignSearchQuery, setCampaignSearchQuery] = useState("");
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set());
    
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = controlledOnOpenChange || setInternalOpen;

  // Fetch folders using Convex
  const folders = useQuery(api.folders.list, open ? {} : "skip");
  const isLoading = folders === undefined;

  // Fetch all campaigns for search and assignment
  const allCampaigns = useQuery(api.campaigns.getAll, open ? {} : "skip");
  const campaignsLoading = allCampaigns === undefined;

  // Fetch campaigns in the selected folder
  const folderCampaigns = useQuery(
    api.folders.getCampaigns, 
    open && selectedFolderId ? { folderId: selectedFolderId as Id<"folders">, page: 1, limit: 100 } : "skip"
  );
  const folderCampaignsLoading = folderCampaigns === undefined;

  // Convex mutations
  const deleteFolderMutation = useMutation(api.folders.deleteFolder);
  const addCampaignsMutation = useMutation(api.folders.addCampaigns);
  const removeCampaignMutation = useMutation(api.folders.removeCampaign);

  // Reset selection when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedFolderId(null);
      setShowDeleteDialog(false);
      setCampaignSearchQuery("");
      setSelectedCampaignIds(new Set());
    }
    onOpenChange(newOpen);
  };

  const selectedFolder = folders?.find(folder => folder._id === selectedFolderId);

  // Set folder selection
  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
    setSelectedCampaignIds(new Set());
  };

  // Handle folder deletion
  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;
    
    setIsDeleting(true);
    try {
      await deleteFolderMutation({ id: selectedFolder._id as Id<"folders"> });
      setSelectedFolderId(null);
      setShowDeleteDialog(false);
      setIsDeleting(false);
      toast.success("✅ Folder deleted successfully");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      setIsDeleting(false);
      toast.error("❌ Failed to delete folder");
    }
  };

  // Handle removing campaign from folder
  const handleRemoveCampaign = async (campaignId: string) => {
    if (!selectedFolderId) return;
    
    try {
      await removeCampaignMutation({
        folderId: selectedFolderId as Id<"folders">,
        campaignId: campaignId as Id<"campaigns">,
      });
      toast.success("✅ Campaign removed successfully");
    } catch (error) {
      console.error("Failed to remove campaign from folder:", error);
      toast.error("❌ Failed to remove campaign");
    }
  };

  // Handle bulk campaign selection
  const handleCampaignSelect = (campaignId: string, checked: boolean) => {
    const newSelected = new Set(selectedCampaignIds);
    if (checked) {
      newSelected.add(campaignId);
    } else {
      newSelected.delete(campaignId);
    }
    setSelectedCampaignIds(newSelected);
  };

  // Handle select all campaigns
  const handleSelectAllCampaigns = (checked: boolean) => {
    if (checked && allCampaigns && folderCampaigns) {
      // Filter available campaigns (exclude those already in folder)
      const folderCampaignIds = new Set(folderCampaigns.campaigns?.map(c => c._id) || []);
      const availableCampaigns = allCampaigns.filter(campaign => !folderCampaignIds.has(campaign._id));
      setSelectedCampaignIds(new Set(availableCampaigns.map(c => c._id)));
    } else {
      setSelectedCampaignIds(new Set());
    }
  };

  // Handle bulk add campaigns
  const handleBulkAddCampaigns = async () => {
    if (!selectedFolderId || selectedCampaignIds.size === 0) return;
    
    try {
      await addCampaignsMutation({
        folderId: selectedFolderId as Id<"folders">,
        campaignIds: Array.from(selectedCampaignIds) as Id<"campaigns">[],
      });
      setSelectedCampaignIds(new Set());
      toast.success("✅ Campaigns added successfully");
    } catch (error) {
      console.error("Failed to add campaigns:", error);
      toast.error("❌ Failed to add campaigns");
    }
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