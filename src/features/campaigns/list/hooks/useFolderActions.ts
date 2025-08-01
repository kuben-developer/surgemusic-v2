"use client";

import { useFolderCreate } from "./useFolderCreate";
import { useFolderModify } from "./useFolderModify";
import { useFolderCampaigns } from "./useFolderCampaigns";
import type { FolderActionsProps, FolderActionsReturn } from "../types/folder-actions.types";

export function useFolderActions({ folders }: FolderActionsProps): FolderActionsReturn {
  // Use focused hooks for specific operations
  const createActions = useFolderCreate({ folders });
  const modifyActions = useFolderModify({ 
    folders, 
    validateFolderName: createActions.validateFolderName,
    isDuplicateName: createActions.isDuplicateName 
  });
  const campaignActions = useFolderCampaigns();

  return {
    // Create folder actions
    ...createActions,
    
    // Modify folder actions (rename & delete)
    ...modifyActions,
    
    // Campaign actions
    ...campaignActions,
  };
}