"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, PlusCircle } from 'lucide-react';

interface ReportsListStatesProps {
    isLoading: boolean;
    error: Error | null;
    isEmpty: boolean;
    onRetry?: () => void;
}

export function ReportsListStates({ 
    isLoading, 
    error, 
    isEmpty, 
    onRetry 
}: ReportsListStatesProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary/50 mb-4" />
                <p className="text-muted-foreground">Loading reports...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-center bg-destructive/5 border border-destructive/20 rounded-lg p-8">
                <FileText className="h-12 w-12 text-destructive/60 mb-4" />
                <h2 className="text-2xl font-semibold mb-2 text-destructive">Error Loading Reports</h2>
                <p className="text-destructive/80 mb-6">An error occurred</p>
                <Button variant="destructive" onClick={onRetry}>Try Again</Button>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-muted/5 py-24">
                <div className="absolute inset-0 bg-grid-slate-100/[0.05] dark:bg-grid-slate-700/[0.05] bg-[size:32px_32px] [mask-image:linear-gradient(transparent,white,transparent)]" />
                <div className="relative flex flex-col items-center justify-center text-center z-10">
                    <FileText className="h-16 w-16 text-primary/40 mb-4" />
                    <h2 className="text-2xl font-semibold text-foreground/80 mb-2">No Reports Found</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        It looks like you haven&apos;t created any reports yet. Get started by creating your first one.
                    </p>
                    <Button size="lg" asChild className="relative group gap-2">
                        <Link href="/reports/create">
                            <PlusCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                            <span className="font-medium">Create Your First Report</span>
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}