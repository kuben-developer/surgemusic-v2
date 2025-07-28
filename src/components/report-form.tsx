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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ListChecks, Save } from "lucide-react";

// Define the Zod schema for the form
// Campaign IDs are optional initially, can be handled by specific create/update schemas if needed
const reportFormSchema = z.object({
    name: z.string().min(1, { message: "Report name cannot be empty." }),
    campaignIds: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one campaign.",
    }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
    onSubmit: (values: ReportFormValues) => Promise<void>; // Function to handle actual API call
    initialData?: Partial<ReportFormValues & { campaignIds: string[] }>; // Ensure campaignIds is string[]
    isLoading?: boolean;                               // To disable button during submission
    submitButtonText?: string;
}

export function ReportForm({ 
    onSubmit,
    initialData = {},
    isLoading = false,
    submitButtonText = "Save Report"
}: ReportFormProps) {
    
    // Fetch campaigns for selection
    const { data: campaigns, isLoading: isLoadingCampaigns, error: campaignsError } = api.campaign.getAll.useQuery();

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportFormSchema),
        // Ensure defaultValues for campaignIds is an array
        defaultValues: { 
            name: initialData.name ?? "", 
            campaignIds: initialData.campaignIds ?? [] 
        },
    });

    // Watch campaignIds for checkbox updates
    const selectedCampaignIds = form.watch("campaignIds", initialData.campaignIds ?? []);
    const allCampaignIds = React.useMemo(() => campaigns?.map(c => c.id) ?? [], [campaigns]);

    const selectAll = () => {
        form.setValue("campaignIds", allCampaignIds, { shouldValidate: true });
    };

    const clearAll = () => {
        form.setValue("campaignIds", [], { shouldValidate: true });
    };

    // Reset form if initialData changes (e.g., on edit page load)
    React.useEffect(() => {
        // Only reset if not currently loading and initial data is actually provided
        if (!isLoading && initialData.name !== undefined) {
            form.reset({
                name: initialData.name,
                campaignIds: initialData.campaignIds ?? []
            });
        }
        // Add isLoading to dependency array to re-evaluate when loading state changes
    }, [initialData, form, isLoading]);

    // Wrapper for the onSubmit prop to handle form state and potential errors
    const handleFormSubmit = async (values: ReportFormValues) => {
        try {
            // campaignIds is now guaranteed by zod schema to be string[]
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

                {/* --- Campaign Selection --- */}
                <FormField
                    control={form.control}
                    name="campaignIds"
                    render={() => (
                        <FormItem>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <ListChecks className="mr-2 h-5 w-5 text-green-600" />
                                        Select Campaigns
                                    </CardTitle>
                                    <CardDescription>
                                        Choose the campaigns to include in this report. At least one campaign must be selected.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingCampaigns && (
                                        <div className="space-y-2">
                                            <Skeleton className="h-6 w-full" />
                                            <Skeleton className="h-6 w-full" />
                                            <Skeleton className="h-6 w-2/3" />
                                        </div>
                                    )}
                                    {campaignsError && (
                                        <p className="text-sm font-medium text-destructive">
                                            Error loading campaigns: {campaignsError.message}
                                        </p>
                                    )}
                                    {campaigns && campaigns.length === 0 && !isLoadingCampaigns && (
                                         <div className="p-4 border rounded-md bg-muted text-muted-foreground text-center">
                                            No campaigns found. Please create a campaign first.
                                        </div>
                                    )}
                                    {campaigns && campaigns.length > 0 && (
                                        <>
                                            <div className="mb-4 flex justify-between items-center">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={selectAll}
                                                    disabled={isLoadingCampaigns || selectedCampaignIds.length === allCampaignIds.length}
                                                    className="text-xs"
                                                >
                                                    Select All
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearAll}
                                                    disabled={isLoadingCampaigns || selectedCampaignIds.length === 0}
                                                    className="text-xs"
                                                >
                                                    Clear Selection
                                                </Button>
                                            </div>
                                            <ScrollArea className="h-60 w-full rounded-md border">
                                                <div className="p-4">
                                                    {campaigns.map((campaign) => (
                                                        <FormField
                                                            key={campaign.id}
                                                            control={form.control}
                                                            name="campaignIds"
                                                            render={({ field }) => {
                                                                return (
                                                                    <FormItem
                                                                        key={campaign.id}
                                                                        className="flex flex-row items-center space-x-3 space-y-0 py-2 border-b last:border-b-0"
                                                                    >
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(campaign.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    const currentIds = field.value ?? [];
                                                                                    return checked
                                                                                        ? field.onChange([...currentIds, campaign.id])
                                                                                        : field.onChange(
                                                                                            currentIds.filter(
                                                                                                (value) => value !== campaign.id
                                                                                            )
                                                                                        );
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal flex-1 cursor-pointer">
                                                                            {campaign.campaignName}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </>
                                    )}
                                    <FormMessage className="pt-2" />
                                </CardContent>
                            </Card>
                        </FormItem>
                    )}
                />
                 {/* --- End Campaign Selection --- */}

                <Button type="submit" disabled={isLoading || isLoadingCampaigns || (campaigns && campaigns.length === 0)} className="flex items-center gap-2">
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