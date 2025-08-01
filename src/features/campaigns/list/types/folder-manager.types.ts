import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

export interface UseFolderManagerLogicReturn {
  // State
  selectedFolderId: string | null;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  isDeleting: boolean;
  campaignSearchQuery: string;
  setCampaignSearchQuery: (query: string) => void;
  selectedCampaignIds: Set<string>;

  // Data
  folders: Doc<"folders">[] | undefined;
  isLoading: boolean;
  allCampaigns: Doc<"campaigns">[] | undefined;
  campaignsLoading: boolean;
  folderCampaigns: 
    | {
        campaigns: Doc<"campaigns">[] | undefined;
        pagination: {
          page: number;
          limit: number;
          totalCount: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
      }
    | undefined;
  folderCampaignsLoading: boolean;
  selectedFolder: Doc<"folders"> | undefined;

  // Actions
  resetState: () => void;
  handleFolderSelect: (folderId: string) => void;
  handleDeleteFolder: () => Promise<void>;
  handleRemoveCampaign: (campaignId: string) => Promise<void>;
  handleCampaignSelect: (campaignId: string, checked: boolean) => void;
  handleSelectAllCampaigns: (checked: boolean) => void;
  handleBulkAddCampaigns: () => Promise<void>;
}

export interface FolderManagerDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}