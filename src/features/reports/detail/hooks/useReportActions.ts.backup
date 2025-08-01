"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface UseReportActionsProps {
  reportId: string | null;
  reportName?: string;
}

interface UseReportActionsReturn {
  // Delete state
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  handleDeleteReport: () => Promise<void>;
  
  // Share state
  isShareDialogOpen: boolean;
  setIsShareDialogOpen: (open: boolean) => void;
  shareUrl: string;
  isSharing: boolean;
  isCopied: boolean;
  handleShareReport: () => Promise<void>;
  copyToClipboard: () => Promise<void>;
  
  // Edit videos state
  isEditVideosModalOpen: boolean;
  setIsEditVideosModalOpen: (open: boolean) => void;
  handleSaveHiddenVideos: (newHiddenVideoIds: string[], refetchAnalytics: () => Promise<void>) => Promise<void>;
}

export function useReportActions({ 
  reportId, 
  reportName 
}: UseReportActionsProps): UseReportActionsReturn {
  const router = useRouter();
  
  // Delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Share state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Edit videos state
  const [isEditVideosModalOpen, setIsEditVideosModalOpen] = useState(false);

  // Mutations
  const deleteMutation = useMutation(api.reports.deleteReport);
  const shareReport = useMutation(api.reports.share);
  const updateHiddenVideosMutation = useMutation(api.reports.updateHiddenVideos);

  const handleDeleteReport = async () => {
    if (!reportId) return;
    
    try {
      const data = await deleteMutation({ id: reportId as Id<"reports"> });
      toast.success(`Report "${data.name}" deleted successfully.`);
      setIsDeleteDialogOpen(false);
      router.push('/reports');
    } catch (error) {
      toast.error(`Failed to delete report: ${(error as Error).message}`);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleShareReport = async () => {
    if (!reportId) return;

    setIsSharing(true);
    try {
      const data = await shareReport({ id: reportId as Id<"reports"> });
      setShareUrl(data.shareUrl);
      setIsSharing(false);
      setIsShareDialogOpen(true);
    } catch (error) {
      toast.error(`Failed to generate sharing link: ${(error as Error).message}`);
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleSaveHiddenVideos = async (
    newHiddenVideoIds: string[], 
    refetchAnalytics: () => Promise<void>
  ) => {
    if (!reportId) return;

    try {
      await updateHiddenVideosMutation({
        reportId: reportId as Id<"reports">,
        hiddenVideoIds: newHiddenVideoIds as Id<"generatedVideos">[]
      });
      toast.success("Video visibility updated successfully");
      void refetchAnalytics();
      setIsEditVideosModalOpen(false);
    } catch (error) {
      toast.error(`Failed to update video visibility: ${(error as Error).message}`);
    }
  };

  return {
    // Delete
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleDeleteReport,
    
    // Share
    isShareDialogOpen,
    setIsShareDialogOpen,
    shareUrl,
    isSharing,
    isCopied,
    handleShareReport,
    copyToClipboard,
    
    // Edit videos
    isEditVideosModalOpen,
    setIsEditVideosModalOpen,
    handleSaveHiddenVideos,
  };
}