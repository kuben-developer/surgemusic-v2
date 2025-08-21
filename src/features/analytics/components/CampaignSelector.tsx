"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Campaign } from "../types/analytics.types";

interface CampaignSelectorProps {
  campaigns: Campaign[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function CampaignSelector({ campaigns, selected, onChange }: CampaignSelectorProps) {
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (campaignId: string) => {
    if (selected.includes(campaignId)) {
      onChange(selected.filter(id => id !== campaignId));
    } else {
      onChange([...selected, campaignId]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === campaigns.length) {
      onChange([]);
    } else {
      onChange(campaigns.map(c => c.id));
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  if (!isExpanded) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Campaign Filter</p>
            <p className="text-xs text-muted-foreground mt-1">
              {selected.length === 0 
                ? "All campaigns selected" 
                : `${selected.length} of ${campaigns.length} campaigns selected`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
          >
            Customize
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Select Campaigns</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selected.length === campaigns.length ? "Deselect All" : "Select All"}
          </Button>
          {selected.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              Clear ({selected.length})
            </Button>
          )}
        </div>

        {/* Campaign List */}
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {filteredCampaigns.map(campaign => (
              <div
                key={campaign.id}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={campaign.id}
                  checked={selected.includes(campaign.id)}
                  onCheckedChange={() => handleToggle(campaign.id)}
                />
                <label
                  htmlFor={campaign.id}
                  className="flex-1 text-sm cursor-pointer"
                >
                  <p className="font-medium">{campaign.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.videoCount} videos • {campaign.status}
                  </p>
                </label>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Summary */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {selected.length === 0 
              ? "Showing all campaigns" 
              : `Showing ${selected.length} of ${campaigns.length} campaigns`}
          </p>
        </div>
      </div>
    </Card>
  );
}