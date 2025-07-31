"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, FileText } from 'lucide-react';
import { toast } from "sonner";
import { ReportsTable } from './components/ReportsTable';
import { DeleteReportDialog } from './components/DeleteReportDialog';
import type { Report } from '../shared/types/report.types';

export default function ReportsListPage() {
    const reports = useQuery(api.reports.list);
    const isLoading = reports === undefined;

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

    const deleteReport = useMutation(api.reports.deleteReport);
    
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

    return (
        <>
            <div className="container max-w-7xl mx-auto py-12 px-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8 mb-12 pb-6 border-b">
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Reports</h1>
                        <p className="text-muted-foreground">
                            Analyze and manage your campaign reports.
                        </p>
                    </div>
                    <Button asChild size="lg" className="relative group gap-2 w-full sm:w-auto">
                        <Link href="/reports/create">
                            <PlusCircle className="h-5 w-5 transition-transform group-hover:scale-110" /> Create Report
                        </Link>
                    </Button>
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center min-h-[40vh]">
                        <Loader2 className="h-10 w-10 animate-spin text-primary/50 mb-4" />
                        <p className="text-muted-foreground">Loading reports...</p>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center bg-destructive/5 border border-destructive/20 rounded-lg p-8">
                        <FileText className="h-12 w-12 text-destructive/60 mb-4" />
                        <h2 className="text-2xl font-semibold mb-2 text-destructive">Error Loading Reports</h2>
                        <p className="text-destructive/80 mb-6">An error occurred</p>
                        <Button variant="destructive" onClick={() => refetch()}>Try Again</Button>
                    </div>
                )}

                {!isLoading && !error && reports && reports.length === 0 && (
                    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-muted/5 py-24">
                        <div className="absolute inset-0 bg-grid-slate-100/[0.05] dark:bg-grid-slate-700/[0.05] bg-[size:32px_32px] [mask-image:linear-gradient(transparent,white,transparent)]" />
                        <div className="relative flex flex-col items-center justify-center text-center z-10">
                            <FileText className="h-16 w-16 text-primary/40 mb-4" />
                            <h2 className="text-2xl font-semibold text-foreground/80 mb-2">No Reports Found</h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">It looks like you haven&apos;t created any reports yet. Get started by creating your first one.</p>
                            <Button size="lg" asChild className="relative group gap-2">
                                <Link href="/reports/create">
                                    <PlusCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                                    <span className="font-medium">Create Your First Report</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {!isLoading && !error && reports && reports.length > 0 && (
                    <ReportsTable 
                        reports={reports} 
                        onDeleteClick={openDeleteDialog}
                    />
                )}
            </div>
            
            <DeleteReportDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                report={reportToDelete}
                onConfirm={handleDelete}
            />
        </>
    );
}