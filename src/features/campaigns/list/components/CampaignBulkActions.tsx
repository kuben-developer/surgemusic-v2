"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

interface CampaignBulkActionsProps {
  totalCampaigns: number;
  selectedCount: number;
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onBulkAdd: () => Promise<void>;
}

export function CampaignBulkActions({
  totalCampaigns,
  selectedCount,
  isAllSelected,
  onSelectAll,
  onBulkAdd,
}: CampaignBulkActionsProps) {
  if (totalCampaigns === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={onSelectAll}
        />
        <span className="text-sm">
          {selectedCount > 0 
            ? `${selectedCount} selected`
            : 'Select all'
          }
        </span>
      </div>
      
      {selectedCount > 0 && (
        <Button
          onClick={onBulkAdd}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {selectedCount} Campaign{selectedCount !== 1 ? 's' : ''}
        </Button>
      )}
    </div>
  );
}