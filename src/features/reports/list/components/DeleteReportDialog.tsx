import React from 'react';
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
import { Loader2 } from 'lucide-react';
import type { Report } from '../../shared/types/report.types';

interface DeleteReportDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    report: Report | null;
    onConfirm: () => Promise<void>;
    isDeleting?: boolean;
}

export function DeleteReportDialog({
    isOpen,
    onOpenChange,
    report,
    onConfirm,
    isDeleting = false
}: DeleteReportDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the report
                        named &quot;<span className="font-semibold">{report?.name}</span>&quot;.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm} 
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                            </>
                         ) : "Delete Report"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}