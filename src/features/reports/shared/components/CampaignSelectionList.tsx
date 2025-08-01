"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import type { Control, FieldValues, Path } from "react-hook-form";
import type { Campaign } from "../types/report.types";

interface CampaignSelectionListProps<T extends FieldValues> {
    control: Control<T>;
    campaigns: Campaign[];
}

export function CampaignSelectionList<T extends FieldValues>({
    control,
    campaigns,
}: CampaignSelectionListProps<T>) {
    return (
        <ScrollArea className="h-60 w-full rounded-md border">
            <div className="p-4">
                {campaigns.map((campaign: Campaign) => (
                    <FormField
                        key={campaign._id}
                        control={control}
                        name={"campaignIds" as Path<T>}
                        render={({ field }) => {
                            return (
                                <FormItem
                                    key={campaign._id}
                                    className="flex flex-row items-center space-x-3 space-y-0 py-2 border-b last:border-b-0"
                                >
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(campaign._id)}
                                            onCheckedChange={(checked) => {
                                                const currentIds = field.value ?? [];
                                                return checked
                                                    ? field.onChange([...currentIds, campaign._id])
                                                    : field.onChange(
                                                        currentIds.filter(
                                                            (value: string) => value !== campaign._id
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
    );
}