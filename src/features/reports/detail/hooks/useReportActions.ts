import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

export function useReportActions(reportId: string) {
    const router = useRouter();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [isSharing, setIsSharing] = useState(false);

    const deleteMutation = useMutation(api.reports.deleteReport);
    const shareReport = useMutation(api.reports.share);
    const updateHiddenVideosMutation = useMutation(api.reports.updateHiddenVideos);

    const handleDeleteReport = async () => {
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

    const handleUpdateHiddenVideos = async (newHiddenVideoIds: string[]) => {
        try {
            await updateHiddenVideosMutation({
                reportId: reportId as Id<"reports">,
                hiddenVideoIds: newHiddenVideoIds as Id<"generatedVideos">[]
            });
            toast.success("Video visibility updated successfully");
            return true;
        } catch (error) {
            toast.error(`Failed to update video visibility: ${(error as Error).message}`);
            return false;
        }
    };

    return {
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isShareDialogOpen,
        setIsShareDialogOpen,
        shareUrl,
        isSharing,
        handleDeleteReport,
        handleShareReport,
        handleUpdateHiddenVideos
    };
}