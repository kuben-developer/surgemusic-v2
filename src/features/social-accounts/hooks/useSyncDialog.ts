"use client"

import { useRef, useEffect } from "react";
import { toast } from "sonner";
import type { ProfileCheckResult } from '../types/social-accounts.types';

interface UseSyncDialogProps {
  isOpen: boolean;
  currentCheckIndex: number;
  profileCheckResults: ProfileCheckResult[];
  isSyncingInProgress: boolean;
}

export function useSyncDialog({ 
  isOpen, 
  currentCheckIndex, 
  profileCheckResults, 
  isSyncingInProgress 
}: UseSyncDialogProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const deletedItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto-scrolling effect
  useEffect(() => {
    if (!isOpen || currentCheckIndex < 0) return;
    
    const currentProfile = profileCheckResults[currentCheckIndex];
    if (!currentProfile) return;
    
    if (currentProfile.message === "Deleted") {
      const deletedIndex = profileCheckResults
        .filter(r => r.message === "Deleted")
        .findIndex(r => r.profileName === currentProfile.profileName);
      
      if (deletedIndex >= 0 && deletedItemRefs.current[deletedIndex]) {
        deletedItemRefs.current[deletedIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    } else {
      const activeIndex = profileCheckResults
        .filter(r => r.message !== "Deleted")
        .findIndex(r => r.profileName === currentProfile.profileName);
      
      if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
        itemRefs.current[activeIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [currentCheckIndex, isOpen, profileCheckResults]);

  // Initialize ref arrays when results change
  useEffect(() => {
    const activeCount = profileCheckResults.filter(r => r.message !== "Deleted").length;
    const deletedCount = profileCheckResults.filter(r => r.message === "Deleted").length;
    itemRefs.current = new Array(activeCount).fill(null) as (HTMLDivElement | null)[];
    deletedItemRefs.current = new Array(deletedCount).fill(null) as (HTMLDivElement | null)[];
  }, [profileCheckResults]);

  const handleClose = (open: boolean, onOpenChange: (open: boolean) => void) => {
    if (!open && isSyncingInProgress) {
      toast.info("Sync Canceled", {
        description: "Profile sync was closed before completion."
      });
    }
    onOpenChange(open);
  };

  const getProfileGroups = () => {
    const activeProfiles = isSyncingInProgress 
      ? profileCheckResults.filter(result => result.message !== "Deleted")
      : profileCheckResults.filter(result => result.message === "All Good");

    const deletedProfiles = profileCheckResults.filter(result => result.message === "Deleted");

    return { activeProfiles, deletedProfiles };
  };

  const setActiveRef = (el: HTMLDivElement | null, index: number) => {
    itemRefs.current[index] = el;
  };

  const setDeletedRef = (el: HTMLDivElement | null, index: number) => {
    deletedItemRefs.current[index] = el;
  };

  return {
    handleClose,
    getProfileGroups,
    setActiveRef,
    setDeletedRef,
  };
}