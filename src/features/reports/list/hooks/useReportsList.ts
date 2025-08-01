"use client";

import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import type { Report } from '../../shared/types/report.types';

export function useReportsList() {
    const reports = useQuery(api.reports.list);
    const isLoading = reports === undefined;
    const deleteReport = useMutation(api.reports.deleteReport);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

    const handleDelete = async () => {
        if (!reportToDelete) return;
        
        try {
            const data = await deleteReport({ id: reportToDelete._id as Id<"reports"> });
            toast.success(`Report "${data.name}" deleted successfully.`);
            closeDeleteDialog();
        } catch (error) {
            toast.error(`Failed to delete report: ${(error as Error).message}`);
            closeDeleteDialog();
        }
    };

    const openDeleteDialog = (report: Report) => {
        setReportToDelete(report);
        setIsDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setReportToDelete(null);
        setIsDeleteDialogOpen(false);
    };

    const error = null; // No error handling for Convex queries
    const refetch = () => {
        // No refetch for Convex queries - placeholder for UI consistency
    };

    return {
        reports,
        isLoading,
        error,
        refetch,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        reportToDelete,
        handleDelete,
        openDeleteDialog,
        closeDeleteDialog,
    };
}