"use client";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FolderOpen } from "lucide-react";
import { FolderSidebar, WelcomeView } from "./folder-manager";
import { DualPanelLayout } from "./DualPanelLayout";
import type { UseFolderManagerLogicReturn } from "../types/folder-manager.types";

interface FolderManagerDialogContentProps {
  folderLogic: UseFolderManagerLogicReturn;
  onClose: () => void;
}

export function FolderManagerDialogContent({
  folderLogic,
  onClose,
}: FolderManagerDialogContentProps) {
  const {
    selectedFolderId,
    folders,
    isLoading,
    handleFolderSelect,
  } = folderLogic;

  return (
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
            <DualPanelLayout folderLogic={folderLogic} />
          )}
        </div>
      </div>
      
      <Separator />
      
      <DialogFooter className="px-6 py-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}