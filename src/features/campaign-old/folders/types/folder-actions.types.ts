import type { Doc } from "../../../../../convex/_generated/dataModel";

export interface FolderActionsProps {
  folders?: Doc<"folders">[];
}

export interface FolderActionsReturn {
  // Create folder state
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  isCreating: boolean;
  handleCreateFolder: () => Promise<void>;
  
  // Rename folder state
  showRenameForm: boolean;
  setShowRenameForm: (show: boolean) => void;
  renameFolderName: string;
  setRenameFolderName: (name: string) => void;
  isRenaming: boolean;
  handleRenameFolder: (selectedFolder: Doc<"folders">) => Promise<void>;
  
  // Delete folder state
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  isDeleting: boolean;
  handleDeleteFolder: (selectedFolder: Doc<"folders">) => Promise<void>;
  
  // Campaign actions
  handleAddCampaign: (campaignId: string, selectedFolderId: string) => Promise<void>;
  handleRemoveCampaign: (campaignId: string, selectedFolderId: string) => Promise<void>;
  handleBulkAddCampaigns: (campaignIds: string[], selectedFolderId: string) => Promise<void>;
  
  // Validation helpers
  validateFolderName: (name: string) => string | null;
  isDuplicateName: (name: string, excludeId?: string) => boolean;
}