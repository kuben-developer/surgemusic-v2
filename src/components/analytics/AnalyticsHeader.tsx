import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, formatTimeAgo } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";

// Define Campaign type directly or import if available elsewhere
interface Campaign {
    id: string;
    campaignName: string;
}

interface AnalyticsHeaderProps {
    selectedCampaigns: string[];
    onCampaignChange: (campaignId: string, isChecked: boolean) => void;
    onResetCampaigns: () => void;
    allCampaigns: Campaign[] | undefined;
    dateRange: string;
    onDateRangeChange: (value: string) => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    campaignCount: number;
    reportName?: string;
    lastUpdatedAt?: number | null;
}

export function AnalyticsHeader({
    selectedCampaigns,
    onCampaignChange,
    onResetCampaigns,
    allCampaigns,
    dateRange,
    onDateRangeChange,
    onRefresh,
    isRefreshing,
    campaignCount,
    reportName,
    lastUpdatedAt
}: AnalyticsHeaderProps) {
    const [campaignSelectOpen, setCampaignSelectOpen] = useState(false);

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">

                <div className="flex flex-col space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">{reportName ? reportName : "Analytics Dashboard"}</h1>
                    <p className="text-muted-foreground">
                        Track performance across {campaignCount} campaign{campaignCount !== 1 ? 's' : ''}
                    </p>
                </div>

                {lastUpdatedAt && lastUpdatedAt > 0 ? <div className="flex items-center justify-end text-xs text-muted-foreground mb-1">
                    <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500/70 animate-pulse"></span>
                        Updated {formatTimeAgo(new Date(lastUpdatedAt))}
                    </span>
                </div>:null}
            </div>


            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Campaign Selection Dropdown */}
                <div className="flex-1">
                    {!reportName && <Select
                        onOpenChange={setCampaignSelectOpen}
                        open={campaignSelectOpen}
                    >
                        <SelectTrigger className="w-full md:w-[300px]">
                            <SelectValue placeholder={
                                selectedCampaigns.length === 0
                                    ? "All Campaigns"
                                    : `${selectedCampaigns.length} Campaign${selectedCampaigns.length !== 1 ? 's' : ''} Selected`
                            } />
                        </SelectTrigger>
                        <SelectContent>
                            <div className="p-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium">Select Campaigns</h4>
                                    <button
                                        className="text-sm text-primary hover:underline"
                                        onClick={onResetCampaigns} // Use the passed handler
                                    >
                                        Reset
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {allCampaigns?.map(campaign => (
                                        <div key={campaign.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`campaign-${campaign.id}`}
                                                checked={selectedCampaigns.includes(campaign.id)}
                                                onCheckedChange={(checked) => onCampaignChange(campaign.id, checked as boolean)}
                                            />
                                            <label
                                                htmlFor={`campaign-${campaign.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {campaign.campaignName}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SelectContent>
                    </Select>}
                </div>

                <div className="flex items-center gap-4">
                    <Select value={dateRange} onValueChange={onDateRangeChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="15">Last 15 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="60">Last 60 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="gap-2"
                    >
                        <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                        Refresh Analytics
                    </Button>
                </div>
            </div>
        </div>
    );
} 