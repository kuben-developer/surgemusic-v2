"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
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
    const createMutation = useMutation(api.reports.create);
    const [isCreating, setIsCreating] = React.useState(false);

    const handleCreateSubmit = async (values: ReportCreateFormValues) => {
        // Ensure campaignIds is defined and not empty for the create API call
        if (!values.campaignIds || values.campaignIds.length === 0) {
            // This validation should ideally happen within the form component (Step 4.2/4.3)
            // For now, show a toast here.
             toast.error("Please select at least one campaign.");
             return; // Prevent submission
        }
        
        setIsCreating(true);
        try {
            const data = await createMutation({
                name: values.name,
                campaignIds: values.campaignIds.map(id => id as Id<"campaigns">), // Pass validated campaignIds
            });
            toast.success(`Report "${data.name}" created successfully.`);
            // Redirect to the report analytics page (assuming /reports/[id]/analytics)
            router.push(`/reports/${data._id}`);
        } catch (error) {
            toast.error(`Failed to create report: ${(error as Error).message}`);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Create New Report</h1>
            <ReportForm 
                onSubmit={handleCreateSubmit} 
                isLoading={isCreating}
                submitButtonText="Create Report"
            />
        </div>
    );
} 