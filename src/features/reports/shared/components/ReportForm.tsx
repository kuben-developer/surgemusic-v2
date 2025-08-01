"use client";

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileText, Save } from "lucide-react";

// Import new components and hooks
import { useCampaignSelection } from "../hooks/useCampaignSelection";
import { CampaignSelectionCard } from "./CampaignSelectionCard";

// Define the Zod schema for the form
const reportFormSchema = z.object({
    name: z.string().min(1, { message: "Report name cannot be empty." }),
    campaignIds: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one campaign.",
    }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSubmit: (values: ReportFormValues) => Promise<void>;
    initialData?: Partial<ReportFormValues & { campaignIds: string[] }>;
    isLoading?: boolean;
    submitButtonText?: string;
}

export function ReportForm({ 
    onSubmit,
    initialData = {},
    isLoading = false,
    submitButtonText = "Save Report"
}: ReportFormProps) {
    
    // Use custom hook for campaign selection
    const {
        campaigns,
        isLoadingCampaigns,
        campaignsError,
        allCampaignIds,
        selectAll,
        clearAll,
    } = useCampaignSelection();

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: { 
            name: initialData.name ?? "", 
            campaignIds: initialData.campaignIds ?? [] 
        },
    });

    // Watch campaignIds for checkbox updates
    const selectedCampaignIds = form.watch("campaignIds", initialData.campaignIds ?? []);

    const handleSelectAll = () => {
        selectAll(form.setValue);
    };

    const handleClearAll = () => {
        clearAll(form.setValue);
    };

    // Reset form if initialData changes (e.g., on edit page load)
    React.useEffect(() => {
        if (!isLoading && initialData.name !== undefined) {
            form.reset({
                name: initialData.name,
                campaignIds: initialData.campaignIds ?? []
            });
        }
    }, [initialData, form, isLoading]);

    // Wrapper for the onSubmit prop to handle form state and potential errors
    const handleFormSubmit = async (values: ReportFormValues) => {
        try {
            await onSubmit(values);
        } catch (error) {
            console.error("Form submission error:", error);
            toast.error("An unexpected error occurred."); 
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center">
                                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                                Report Name
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Q3 Marketing Performance" {...field} />
                            </FormControl>
                            <FormDescription>
                                Give your report a descriptive name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Campaign Selection */}
                <CampaignSelectionCard
                    control={form.control}
                    campaigns={campaigns}
                    isLoadingCampaigns={isLoadingCampaigns}
                    campaignsError={campaignsError}
                    selectedCampaignIds={selectedCampaignIds}
                    allCampaignIds={allCampaignIds}
                    onSelectAll={handleSelectAll}
                    onClearAll={handleClearAll}
                />

                <Button 
                    type="submit" 
                    disabled={isLoading || isLoadingCampaigns || (campaigns && campaigns.length === 0)} 
                    className="flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="animate-spin h-4 w-4 border-b-2 border-current rounded-full inline-block"></span>
                            Saving...
                        </>
                    ) : (
                        <>
                           <Save className="h-4 w-4" />
                           {submitButtonText}
                        </>
                    )}
                </Button>
            </form>
        </Form>
    );
}