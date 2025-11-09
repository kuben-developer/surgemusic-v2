"use client";

import { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useFolderManagerLogic } from "../hooks/useFolderManagerLogic";
import { FolderManagerDialogContent } from "../components/FolderManagerDialogContent";
import { FolderDeleteDialog } from "./FolderDeleteDialog";
import type { FolderManagerDialogProps } from "../types/folder-manager.types";

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
  const folderLogic = useFolderManagerLogic({ open });

  // Reset selection when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      folderLogic.resetState();
    }
    onOpenChange(newOpen);
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {children && (
          <DialogTrigger asChild>
            {children}
          </DialogTrigger>
        )}
        <FolderManagerDialogContent 
          folderLogic={folderLogic}
          onClose={handleClose}
        />
      </Dialog>

      <FolderDeleteDialog
        open={folderLogic.showDeleteDialog}
        onOpenChange={folderLogic.setShowDeleteDialog}
        folder={folderLogic.selectedFolder}
        isDeleting={folderLogic.isDeleting}
        onDelete={folderLogic.handleDeleteFolder}
      />
    </>
  );
}