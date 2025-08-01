"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { ListChecks } from "lucide-react";
import { Control, FieldValues, Path } from "react-hook-form";
import type { Campaign } from "../types/report.types";

interface CampaignSelectionCardProps<T extends FieldValues> {
  control: Control<T>;
  campaigns: Campaign[];
  isLoadingCampaigns: boolean;
  campaignsError: null;
  selectedCampaignIds: string[];
  allCampaignIds: string[];
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function CampaignSelectionCard<T extends FieldValues>({
  control,
  campaigns,
  isLoadingCampaigns,
  campaignsError,
  selectedCampaignIds,
  allCampaignIds,
  onSelectAll,
  onClearAll,
}: CampaignSelectionCardProps<T>) {
  return (
    <FormField
      control={control}
      name={"campaignIds" as Path<T>}
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
                  Error loading campaigns
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
                      onClick={onSelectAll}
                      disabled={isLoadingCampaigns || selectedCampaignIds.length === allCampaignIds.length}
                      className="text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onClearAll}
                      disabled={isLoadingCampaigns || selectedCampaignIds.length === 0}
                      className="text-xs"
                    >
                      Clear Selection
                    </Button>
                  </div>
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
                </>
              )}
              <FormMessage className="pt-2" />
            </CardContent>
          </Card>
        </FormItem>
      )}
    />
  );
}