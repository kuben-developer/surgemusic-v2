"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Eye, Pencil, Trash2, Loader2, FileText } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Define the type for a single report based on your API output
// Adjust this based on the actual structure returned by api.report.list
type Report = {
    id: string;
    name: string;
    createdAt: Date;
    campaigns: { id: string; campaignName: string }[];
};

export default function ReportsPage() {
    const utils = api.useUtils();
    const { data: reports, isLoading, error, refetch } = api.report.list.useQuery();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

    const deleteMutation = api.report.delete.useMutation({
        onSuccess: (data) => {
            toast.success(`Report "${data.name}" deleted successfully.`);
            refetch();
            closeDeleteDialog();
        },
        onError: (error) => {
            toast.error(`Failed to delete report: ${error.message}`);
            closeDeleteDialog();
        },
    });

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    const openDeleteDialog = (report: Report) => {
        setReportToDelete(report);
        setIsDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setReportToDelete(null);
        setIsDeleteDialogOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (reportToDelete) {
            deleteMutation.mutate({ id: reportToDelete.id });
        }
    };

    return (
        <TooltipProvider>
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
                        <p className="text-destructive/80 mb-6">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
                        <Button variant="destructive" onClick={() => refetch()}>Try Again</Button>
                     </div>
                )}

                {!isLoading && !error && reports && reports.length === 0 && (
                    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-muted/5 py-24">
                        <div className="absolute inset-0 bg-grid-slate-100/[0.05] dark:bg-grid-slate-700/[0.05] bg-[size:32px_32px] [mask-image:linear-gradient(transparent,white,transparent)]" />
                        <div className="relative flex flex-col items-center justify-center text-center z-10">
                            <FileText className="h-16 w-16 text-primary/40 mb-4" />
                            <h2 className="text-2xl font-semibold text-foreground/80 mb-2">No Reports Found</h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">It looks like you haven't created any reports yet. Get started by creating your first one.</p>
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
                    <div className="border rounded-lg overflow-hidden">
                         <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="w-[40%]">Name</TableHead>
                                    <TableHead className="text-center">Campaigns</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((report) => (
                                   <TableRow key={report.id} className="hover:bg-muted/20">
                                        <TableCell className="font-medium py-3">{report.name}</TableCell>
                                        <TableCell className="text-center py-3">{report.campaigns.length}</TableCell>
                                        <TableCell className="text-muted-foreground py-3">{formatDate(report.createdAt)}</TableCell>
                                        <TableCell className="text-right py-2 pr-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                         <Button variant="ghost" size="icon" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-100/50">
                                                            <Link href={`/reports/${report.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                                <span className="sr-only">View Report</span>
                                                            </Link>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>View Report</TooltipContent>
                                                </Tooltip>
                                                 <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" asChild className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100/50">
                                                            <Link href={`/reports/${report.id}/edit`}>
                                                                <Pencil className="h-4 w-4" />
                                                                <span className="sr-only">Edit Report</span>
                                                             </Link>
                                                        </Button>
                                                     </TooltipTrigger>
                                                    <TooltipContent>Edit Report</TooltipContent>
                                                </Tooltip>
                                                 <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => openDeleteDialog(report)} 
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-100/50"
                                                            disabled={deleteMutation.isPending && reportToDelete?.id === report.id}
                                                        >
                                                            {deleteMutation.isPending && reportToDelete?.id === report.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                            <span className="sr-only">Delete Report</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Delete Report</TooltipContent>
                                                </Tooltip>
                                             </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
                
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the report
                                named "<span className="font-semibold">{reportToDelete?.name}</span>".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleDeleteConfirm} 
                                disabled={deleteMutation.isPending}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {deleteMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                                    </>
                                 ) : "Delete Report"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </TooltipProvider>
    );
} 