"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn, formatTimeAgo } from "@/lib/utils";
import { RefreshCcw, ChevronDown, Search, X } from "lucide-react";
import { useState } from "react";

// Define Campaign type directly or import if available elsewhere
interface Campaign {
    id: string;
    campaignName: string;
    createdAt: number;
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
    isAdmin?: boolean;
    showAdvancedAnalytics?: boolean;
    onToggleAdvancedAnalytics?: () => void;
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
    lastUpdatedAt,
    isAdmin = false,
    showAdvancedAnalytics = false,
    onToggleAdvancedAnalytics
}: AnalyticsHeaderProps) {
    const [campaignSelectOpen, setCampaignSelectOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter and sort campaigns based on search query (latest first)
    const filteredCampaigns = (allCampaigns?.filter(campaign =>
        campaign.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []).sort((a, b) => b.createdAt - a.createdAt);

    // Handle select all
    const handleSelectAll = () => {
        if (allCampaigns) {
            const allIds = allCampaigns.map(c => c.id);
            allIds.forEach(id => {
                if (!selectedCampaigns.includes(id)) {
                    onCampaignChange(id, true);
                }
            });
        }
    };

    // Handle clear all
    const handleClearAll = () => {
        onResetCampaigns();
    };

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
                </div> : null}
            </div>


            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Campaign Selection Dropdown */}
                <div className="flex-1">
                    {!reportName && <Popover open={campaignSelectOpen} onOpenChange={setCampaignSelectOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={campaignSelectOpen}
                                className="w-full md:w-[300px] justify-between"
                            >
                                <span className="truncate">
                                    {selectedCampaigns.length === 0
                                        ? "All Campaigns"
                                        : `${selectedCampaigns.length} Campaign${selectedCampaigns.length !== 1 ? 's' : ''} Selected`}
                                </span>
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] max-h-[500px] p-0 flex flex-col" align="start" side="bottom" sideOffset={8}>
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                                <h4 className="font-semibold text-sm">Select Campaigns</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-primary hover:underline hover:bg-transparent"
                                    onClick={handleClearAll}
                                >
                                    Clear All
                                </Button>
                            </div>

                            {/* Search */}
                            <div className="p-3 border-b shrink-0">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search campaigns..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 h-9"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="px-3 py-2 border-b shrink-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start h-8 text-xs font-normal"
                                    onClick={handleSelectAll}
                                >
                                    Select All ({allCampaigns?.length || 0})
                                </Button>
                            </div>

                            {/* Campaign List - Scrollable */}
                            <div className="flex-1 overflow-y-auto min-h-0">
                                <div className="p-2">
                                    {filteredCampaigns.length === 0 ? (
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                            No campaigns found
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {filteredCampaigns.map(campaign => (
                                                <div
                                                    key={campaign.id}
                                                    className="flex items-center space-x-2 rounded-md px-2 py-2 hover:bg-accent transition-colors"
                                                >
                                                    <Checkbox
                                                        id={`campaign-${campaign.id}`}
                                                        checked={selectedCampaigns.includes(campaign.id)}
                                                        onCheckedChange={(checked) => onCampaignChange(campaign.id, checked as boolean)}
                                                    />
                                                    <label
                                                        htmlFor={`campaign-${campaign.id}`}
                                                        className="flex-1 cursor-pointer select-none"
                                                    >
                                                        <div className="text-sm font-medium leading-tight">
                                                            {campaign.campaignName}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-0.5">
                                                            Created {formatTimeAgo(new Date(campaign.createdAt))}
                                                        </div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer with Done button */}
                            <div className="px-3 py-3 border-t bg-muted/30 shrink-0">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                    <span>
                                        {selectedCampaigns.length === 0
                                            ? "Showing all campaigns"
                                            : `${selectedCampaigns.length} selected`}
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setCampaignSelectOpen(false)}
                                >
                                    Done
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>}
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

                    {isAdmin && onToggleAdvancedAnalytics && (
                        <Button
                            variant="outline"
                            onClick={onToggleAdvancedAnalytics}
                            className="gap-2"
                        >
                            {showAdvancedAnalytics ? "Show Normal Analytics" : "Show Advanced Analytics"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
} 