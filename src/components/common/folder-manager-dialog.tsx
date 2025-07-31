"use client"

import { useState, useMemo } from "react";
import { Button } from "../ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FolderOpen, 
  Plus, 
  Folder, 
  Loader2, 
  Edit, 
  Trash2, 
  Search,
  Music,
  Sparkles,
  X,
  Check,
  ChevronRight,
  Users,
  Settings,
  Archive,
  MoreHorizontal
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { toast } from "sonner"
import Image from "next/image";

interface FolderManagerDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface FolderData {
  id: string;
  name: string;
  campaignCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CampaignData {
  id: string;
  campaignName: string;
  songName: string;
  artistName: string;
  campaignCoverImageUrl: string | null;
  videoCount: number;
  genre: string;
  themes: string[];
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function FolderManagerDialog({ 
  children, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: FolderManagerDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameFolderName, setRenameFolderName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRenameForm, setShowRenameForm] = useState(false);
  
  // Campaign search and management state
  const [campaignSearchQuery, setCampaignSearchQuery] = useState("");
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set());
    
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = controlledOnOpenChange || setInternalOpen;

  // Fetch folders using Convex
  const folders = useQuery(api.folders.list, open ? {} : "skip");
  const isLoading = folders === undefined;
  const error = null; // Convex doesn't have error state
  const refetch = () => {}; // Convex auto-refreshes

  // Fetch all campaigns for search and assignment
  const allCampaigns = useQuery(api.campaigns.getAll, open ? {} : "skip");
  const campaignsLoading = allCampaigns === undefined;

  // Fetch campaigns in the selected folder
  const folderCampaigns = useQuery(
    api.folders.getCampaigns, 
    open && selectedFolderId ? { folderId: selectedFolderId as Id<"folders">, page: 1, limit: 100 } : "skip"
  );
  const folderCampaignsLoading = folderCampaigns === undefined;
  const refetchFolderCampaigns = () => {}; // Convex auto-refreshes

  // Filter campaigns based on search query and exclude those already in the selected folder
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
    
    // Exclude campaigns already in the selected folder
    if (selectedFolderId && folderCampaigns?.campaigns) {
      const folderCampaignIds = new Set(folderCampaigns.campaigns.map(c => c._id));
      filtered = filtered.filter(campaign => !folderCampaignIds.has(campaign._id));
    }
    
    return filtered;
  }, [allCampaigns, campaignSearchQuery, selectedFolderId, folderCampaigns]);

  // Convex mutations
  const createFolderMutation = useMutation(api.folders.create);

  const updateFolderMutation = useMutation(api.folders.update);

  const deleteFolderMutation = useMutation(api.folders.deleteFolder);

  const addCampaignMutation = useMutation(api.folders.addCampaign);

  const addCampaignsMutation = useMutation(api.folders.addCampaigns);

  const removeCampaignMutation = useMutation(api.folders.removeCampaign);

  // Reset selection when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedFolderId(null);
      setNewFolderName("");
      setRenameFolderName("");
      setShowDeleteDialog(false);
      setShowCreateForm(false);
      setShowRenameForm(false);
      setCampaignSearchQuery("");
      setSelectedCampaignIds(new Set());
    }
    onOpenChange(newOpen);
  };

  const selectedFolder = folders?.find(folder => folder._id === selectedFolderId);

  // Set rename input when folder is selected
  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
    setShowRenameForm(false);
    setSelectedCampaignIds(new Set());
    const folder = folders?.find(f => f._id === folderId);
    if (folder) {
      setRenameFolderName(folder.name);
    }
  };

  // Validation helper
  const validateFolderName = (name: string): string | null => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return "Folder name cannot be empty.";
    }
    if (trimmedName.length > 100) {
      return "Folder name must be less than 100 characters.";
    }
    return null;
  };

  // Check for duplicate folder names
  const isDuplicateName = (name: string, excludeId?: string): boolean => {
    if (!folders) return false;
    return folders.some(folder => 
      folder.name.toLowerCase() === name.toLowerCase() && 
      folder._id !== excludeId
    );
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    const validationError = validateFolderName(newFolderName);
    if (validationError) {
      toast.error("Invalid folder name", {
        description: validationError,
      });
      return;
    }

    if (isDuplicateName(newFolderName.trim())) {
      toast.error("Duplicate folder name", {
        description: "A folder with this name already exists.",
      });
      return;
    }
    
    setIsCreating(true);
    try {
      await createFolderMutation({ name: newFolderName.trim() });
      setNewFolderName("");
      setShowCreateForm(false);
      setIsCreating(false);
      toast.success("✅ Folder created successfully");
    } catch (error) {
      console.error("Failed to create folder:", error);
      setIsCreating(false);
      toast.error("❌ Failed to create folder");
    }
  };

  // Handle folder renaming
  const handleRenameFolder = async () => {
    if (!selectedFolder) return;

    const validationError = validateFolderName(renameFolderName);
    if (validationError) {
      toast.error("Invalid folder name", {
        description: validationError,
      });
      return;
    }

    if (isDuplicateName(renameFolderName.trim(), selectedFolder._id)) {
      toast.error("Duplicate folder name", {
        description: "A folder with this name already exists.",
      });
      return;
    }
    
    setIsRenaming(true);
    try {
      await updateFolderMutation({ 
        id: selectedFolder._id as Id<"folders">, 
        name: renameFolderName.trim() 
      });
      setRenameFolderName("");
      setIsRenaming(false);
      setShowRenameForm(false);
      toast.success("✅ Folder renamed successfully");
    } catch (error) {
      console.error("Failed to update folder:", error);
      setIsRenaming(false);
      toast.error("❌ Failed to rename folder");
    }
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

  // Handle adding campaign to folder
  const handleAddCampaign = async (campaignId: string) => {
    if (!selectedFolderId) return;
    
    try {
      await addCampaignMutation({
        folderId: selectedFolderId as Id<"folders">,
        campaignId: campaignId as Id<"campaigns">,
      });
      toast.success("✅ Campaign added successfully");
    } catch (error) {
      console.error("Failed to add campaign to folder:", error);
      toast.error("❌ Failed to add campaign");
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
    if (checked) {
      setSelectedCampaignIds(new Set(filteredAvailableCampaigns.map(c => c._id)));
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

  // Campaign card component for available campaigns
  const CampaignCard = ({ campaign, isSelected, onSelect }: { 
    campaign: any; // Using any for Convex campaign type 
    isSelected: boolean;
    onSelect: (checked: boolean) => void;
  }) => (
    <div 
      className={cn(
        "group flex m-2 items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer",
        isSelected && "ring-1 ring-primary bg-accent/50"
      )}
      onClick={() => onSelect(!isSelected)}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onSelect}
        className="flex-shrink-0 pointer-events-none"
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
            <Music className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{campaign.campaignName}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Music className="h-3 w-3" />
          <span className="truncate">{campaign.songName}</span>
          <span>•</span>
          <Sparkles className="h-3 w-3" />
          <span className="truncate">{campaign.artistName}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            {campaign.genre}
          </Badge>
          <div className={`w-2 h-2 rounded-full ${campaign.status === 'completed' ? 'bg-green-600' : 'bg-orange-400'}`} />
          <span className="text-xs text-muted-foreground">{campaign.videoCount || 0} videos</span>
        </div>
      </div>
    </div>
  );

  // Campaign card component for campaigns in folder
  const FolderCampaignCard = ({ campaign, onRemove }: { campaign: any; onRemove: () => void }) => (
    <div className="group flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {campaign.campaignCoverImageUrl ? (
          <Image
            src={campaign.campaignCoverImageUrl}
            alt={campaign.campaignName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{campaign.campaignName}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="truncate">{campaign.songName}</span>
          <span>•</span>
          <span className="truncate">{campaign.artistName}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Badge variant="secondary" className="text-xs">
            {campaign.genre}
          </Badge>
          <div className={`w-1.5 h-1.5 rounded-full ${campaign.status === 'completed' ? 'bg-green-600' : 'bg-orange-400'}`} />
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onRemove}
        disabled={false}
        className="opacity-60 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all flex-shrink-0 h-8 w-8 p-0"
        title="Remove from folder"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

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
            <div className="w-80 border-r bg-muted/30">
              {/* Folder Header */}
              <div className="p-4 border-b bg-background/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Folders</h3>
                  <Badge variant="outline" className="text-xs">
                    {folders?.length || 0}
                  </Badge>
                </div>
                
                {/* Create Folder Button */}
                {!showCreateForm ? (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Folder name..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      maxLength={100}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newFolderName.trim()) {
                          handleCreateFolder();
                        } else if (e.key === 'Escape') {
                          setShowCreateForm(false);
                          setNewFolderName("");
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateFolder}
                        disabled={!newFolderName.trim() || isCreating}
                        size="sm"
                        className="flex-1"
                      >
                        {isCreating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewFolderName("");
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Folder List */}
              <ScrollArea className="h-[500px]">
                <div className="p-2">
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg mb-2">
                        <Skeleton className="h-4 w-4" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))
                  ) : error ? (
                    // Error state
                    <div className="text-center py-8 px-4">
                      <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                        <X className="h-6 w-6 text-destructive" />
                      </div>
                      <p className="text-sm text-destructive mb-1">Failed to load folders</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        An unexpected error occurred
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => refetch()}
                        className="h-8"
                      >
                        <Loader2 className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  ) : folders && folders.length > 0 ? (
                    // Folder list
                    folders.map((folder) => (
                      <div
                        key={folder._id}
                        className={cn(
                          "group flex items-center justify-between p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200",
                          "hover:bg-accent hover:text-accent-foreground",
                          selectedFolderId === folder._id 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => handleFolderSelect(folder._id)}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Folder className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {folder.name}
                            </p>
                            <p className="text-xs opacity-70">
                              {folder.campaignCount} campaign{folder.campaignCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        {selectedFolderId === folder._id && (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  ) : (
                    // Empty state
                    <div className="text-center py-12 px-4">
                      <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground mb-2">No folders yet</p>
                      <p className="text-xs text-muted-foreground">
                        Create your first folder to organize campaigns
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {!selectedFolderId ? (
                // Welcome state
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                      <FolderOpen className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Select a folder to manage</h3>
                    <p className="text-muted-foreground mb-6">
                      Choose a folder from the sidebar to view and manage its campaigns, or create a new folder to get started.
                    </p>
                    <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Folder
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Folder Header */}
                  <div className="p-6 border-b bg-background/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Folder className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold">{selectedFolder?.name}</h2>
                          <p className="text-sm text-muted-foreground">
                            {folderCampaigns?.campaigns?.length || 0} campaign{(folderCampaigns?.campaigns?.length || 0) !== 1 ? 's' : ''} in this folder
                          </p>
                        </div>
                      </div>
                      
                      {/* Folder Actions */}
                      <div className="flex items-center gap-2">
                        {!showRenameForm ? (
                          <Button
                            onClick={() => setShowRenameForm(true)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              value={renameFolderName}
                              onChange={(e) => setRenameFolderName(e.target.value)}
                              className="w-40"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && renameFolderName.trim()) {
                                  handleRenameFolder();
                                } else if (e.key === 'Escape') {
                                  setShowRenameForm(false);
                                  setRenameFolderName(selectedFolder?.name || "");
                                }
                              }}
                              autoFocus
                            />
                            <Button
                              onClick={handleRenameFolder}
                              disabled={!renameFolderName.trim() || isRenaming}
                              size="sm"
                            >
                              {isRenaming ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() => {
                                setShowRenameForm(false);
                                setRenameFolderName(selectedFolder?.name || "");
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        <Button
                          onClick={() => setShowDeleteDialog(true)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Tabs */}
                  <div className="flex-1 flex">
                    {/* Available Campaigns */}
                    <div className="flex-1 p-6 border-r">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">Add Campaigns</h3>
                          <Badge variant="outline">
                            {filteredAvailableCampaigns.length} available
                          </Badge>
                        </div>
                        
                        {/* Search and Bulk Actions */}
                        <div className="space-y-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search campaigns..."
                              value={campaignSearchQuery}
                              onChange={(e) => setCampaignSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          
                          {filteredAvailableCampaigns.length > 0 && (
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={selectedCampaignIds.size === filteredAvailableCampaigns.length && filteredAvailableCampaigns.length > 0}
                                  onCheckedChange={handleSelectAllCampaigns}
                                />
                                <span className="text-sm">
                                  {selectedCampaignIds.size > 0 
                                    ? `${selectedCampaignIds.size} selected`
                                    : 'Select all'
                                  }
                                </span>
                              </div>
                              
                              {selectedCampaignIds.size > 0 && (
                                <Button
                                  onClick={handleBulkAddCampaigns}
                                  disabled={false}
                                  size="sm"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add {selectedCampaignIds.size} Campaign{selectedCampaignIds.size !== 1 ? 's' : ''}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Available Campaigns List */}
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-2">
                            {campaignsLoading ? (
                              // Loading skeleton
                              Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Skeleton className="h-4 w-4" />
                                  <Skeleton className="h-12 w-12 rounded-md" />
                                  <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                  </div>
                                </div>
                              ))
                            ) : filteredAvailableCampaigns.length > 0 ? (
                              filteredAvailableCampaigns.map((campaign) => (
                                <CampaignCard
                                  key={campaign._id}
                                  campaign={campaign}
                                  isSelected={selectedCampaignIds.has(campaign._id)}
                                  onSelect={(checked) => handleCampaignSelect(campaign._id, checked)}
                                />
                              ))
                            ) : (
                              <div className="text-center py-12">
                                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground mb-2">
                                  {campaignSearchQuery ? 'No campaigns found' : 'No available campaigns'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {campaignSearchQuery 
                                    ? 'Try adjusting your search terms' 
                                    : 'All campaigns are already in this folder'
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                    
                    {/* Campaigns in Folder */}
                    <div className="w-[400px] p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">In This Folder</h3>
                          <Badge variant="outline">
                            {folderCampaigns?.campaigns?.length || 0}
                          </Badge>
                        </div>
                        
                        <ScrollArea className="h-[480px]">
                          <div className="space-y-2">
                            {folderCampaignsLoading ? (
                              // Loading skeleton
                              Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Skeleton className="h-10 w-10 rounded-md" />
                                  <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                  </div>
                                  <Skeleton className="h-8 w-8" />
                                </div>
                              ))
                            ) : folderCampaigns?.campaigns && folderCampaigns.campaigns.length > 0 ? (
                              folderCampaigns.campaigns.map((campaign) => (
                                <FolderCampaignCard
                                  key={campaign._id}
                                  campaign={campaign}
                                  onRemove={() => handleRemoveCampaign(campaign._id)}
                                />
                              ))
                            ) : (
                              <div className="text-center py-12">
                                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground mb-2">
                                  No campaigns in this folder
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Add campaigns from the left panel
                                </p>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
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