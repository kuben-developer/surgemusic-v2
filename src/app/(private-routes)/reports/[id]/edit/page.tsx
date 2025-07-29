"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/trpc/react';
import { ReportForm } from '@/components/report-form';
import { toast } from "sonner";
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

// Define the type for form values, matching the ReportForm component
type ReportUpdateFormValues = {
    name: string;
    campaignIds?: string[];
};

export default function EditReportPage() {
    const router = useRouter();
    const params = useParams();
    const reportId = params.id as string; // Type assertion

    // Fetch existing report data
    const { data: reportData, isLoading: isLoadingReport, error: reportError } = api.report.get.useQuery(
        { id: reportId },
        {
            enabled: !!reportId, // Only run query if reportId is available
            staleTime: Infinity, // Don't refetch initial data automatically
        }
    );

    const updateMutation = api.report.update.useMutation({
        onSuccess: (data) => {
            toast.success(`Report "${data.name}" updated successfully.`);
            // Redirect to the report analytics page
            router.push(`/reports/${data.id}`);
        },
        onError: (error) => {
            toast.error(`Failed to update report: ${error.message}`);
        },
    });

    const handleUpdateSubmit = async (values: ReportUpdateFormValues) => {
        // Ensure campaignIds is defined if provided (API requires min 1 if updating)
        if (values.campaignIds && values.campaignIds.length === 0) {
             toast.error("Please select at least one campaign if modifying selection.");
             return; 
        }

        updateMutation.mutate({
            id: reportId,
            name: values.name,
            // Only include campaignIds if they are part of the values submitted
            // (React Hook Form might not include it if unchanged depending on setup)
            ...(values.campaignIds && { campaignIds: values.campaignIds }), 
        });
    };

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
                <p className="text-red-500">Error loading report data: {reportError.message}</p>
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
    const initialFormData = {
        name: reportData.name,
        campaignIds: reportData.campaigns.map(c => c.id) // Extract IDs for the form
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Edit Report: {reportData.name}</h1>
            <ReportForm 
                onSubmit={handleUpdateSubmit} 
                initialData={initialFormData}
                isLoading={updateMutation.isPending} // Use isPending
                submitButtonText="Update Report"
            />
        </div>
    );
} 