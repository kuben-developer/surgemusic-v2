"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { ReportForm } from '../shared/components/ReportForm';
import { useEditReport } from './hooks/useEditReport';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportEditPage() {
    const params = useParams();
    const reportId = params.id as string;

    // Fetch existing report data
    const reportData = useQuery(api.reports.get, reportId ? { id: reportId as Id<"reports"> } : "skip");
    const isLoadingReport = reportData === undefined;
    const reportError = null;

    const { updateReport, isUpdating } = useEditReport(reportId);

    if (isLoadingReport) {
        return (
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-6">Edit Report</h1>
                <Skeleton className="h-10 w-1/3 mb-4" />
                <Skeleton className="h-40 w-full" />
            </div>
        );
    }

    if (reportError) {
        return (
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-6">Edit Report</h1>
                <p className="text-red-500">Error loading report data</p>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-6">Edit Report</h1>
                <p>Report not found.</p>
            </div>
        );
    }

    // Prepare initial data for the form
    // Use campaignIds from the report which are now cleaned up automatically
    const initialFormData = {
        name: reportData.name,
        campaignIds: reportData.campaignIds || reportData.campaigns.map((c: { _id: string }) => c._id)
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Edit Report: {reportData.name}</h1>
            <ReportForm 
                onSubmit={updateReport} 
                initialData={initialFormData}
                isLoading={isUpdating}
                submitButtonText="Update Report"
            />
        </div>
    );
}