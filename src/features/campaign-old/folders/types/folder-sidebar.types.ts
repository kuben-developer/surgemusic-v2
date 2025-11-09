export interface Folder {
  _id: string;
  name: string;
  campaignCount: number;
}

export interface FolderSidebarProps {
  folders?: Folder[];
  isLoading: boolean;
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string) => void;
  
  // Create folder state
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  isCreating: boolean;
  onCreateFolder: () => Promise<void>;
}