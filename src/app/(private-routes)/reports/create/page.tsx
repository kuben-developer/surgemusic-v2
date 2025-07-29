"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { ReportForm } from '@/components/report-form';
import { toast } from "sonner";

// Define the type for form values, matching the ReportForm component
// Need campaignIds here as the API expects it.
type ReportCreateFormValues = {
    name: string;
    campaignIds?: string[]; 
};

export default function CreateReportPage() {
    const router = useRouter();
    const createMutation = api.report.create.useMutation({
        onSuccess: (data) => {
            toast.success(`Report "${data.name}" created successfully.`);
            // Redirect to the report analytics page (assuming /reports/[id]/analytics)
            router.push(`/reports/${data.id}`); 
        },
        onError: (error) => {
            toast.error(`Failed to create report: ${error.message}`);
        },
    });

    const handleCreateSubmit = async (values: ReportCreateFormValues) => {
        // Ensure campaignIds is defined and not empty for the create API call
        if (!values.campaignIds || values.campaignIds.length === 0) {
            // This validation should ideally happen within the form component (Step 4.2/4.3)
            // For now, show a toast here.
             toast.error("Please select at least one campaign.");
             return; // Prevent submission
        }
        
        createMutation.mutate({
            name: values.name,
            campaignIds: values.campaignIds, // Pass validated campaignIds
        });
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Create New Report</h1>
            <ReportForm 
                onSubmit={handleCreateSubmit} 
                isLoading={createMutation.isPending} // Use isPending
                submitButtonText="Create Report"
            />
        </div>
    );
} 