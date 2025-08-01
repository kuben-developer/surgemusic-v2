"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface UseReportShareProps {
    reportId: string | null;
}

export function useReportShare({ reportId }: UseReportShareProps) {
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [isSharing, setIsSharing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    
    const shareReportMutation = useMutation(api.reports.share);

    const handleShareReport = async () => {
        if (!reportId) {
            toast.error("Invalid report ID");
            return;
        }
        
        setIsSharing(true);
        try {
            const response = await shareReportMutation({ 
                id: reportId as Id<"reports"> 
            });
            if (response && response.shareUrl) {
                setShareUrl(response.shareUrl);
                setIsShareDialogOpen(true);
            } else {
                throw new Error("Invalid response from share API");
            }
        } catch (error) {
            toast.error(`Failed to generate share link: ${(error as Error).message}`);
        } finally {
            setIsSharing(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            toast.success("Share link copied to clipboard!");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            toast.error("Failed to copy link to clipboard");
        }
    };

    return {
        isShareDialogOpen,
        setIsShareDialogOpen,
        shareUrl,
        isSharing,
        isCopied,
        handleShareReport,
        copyToClipboard,
    };
}