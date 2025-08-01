"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export function ReportsListHeader() {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8 mb-12 pb-6 border-b">
            <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground">
                    Analyze and manage your campaign reports.
                </p>
            </div>
            <Button asChild size="lg" className="relative group gap-2 w-full sm:w-auto">
                <Link href="/reports/create">
                    <PlusCircle className="h-5 w-5 transition-transform group-hover:scale-110" /> 
                    Create Report
                </Link>
            </Button>
        </div>
    );
}