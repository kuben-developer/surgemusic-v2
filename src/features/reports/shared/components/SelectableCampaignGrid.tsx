"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectableCampaignCard } from "./SelectableCampaignCard";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface SelectableCampaignGridProps {
  campaigns: Doc<"campaigns">[];
  selectedIds: Set<string>;
  isLoading: boolean;
  emptyState: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent) => void;
  onItemClick: (index: number, campaign: Doc<"campaigns">, e: React.MouseEvent) => void;
  onItemSelect: (campaignId: string, selected: boolean) => void;
  itemRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  selectionRect?: React.ReactNode;
}

export function SelectableCampaignGrid({
  campaigns,
  selectedIds,
  isLoading,
  emptyState,
  containerRef,
  onMouseDown,
  onItemClick,
  onItemSelect,
  itemRefs,
  selectionRect,
}: SelectableCampaignGridProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6">
          <div 
            ref={containerRef}
            className="relative select-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            onMouseDown={onMouseDown}
          >
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-3">
                  <div className="flex gap-3">
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 mr-3" />
                      <Skeleton className="w-16 h-16 rounded-md" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : campaigns.length > 0 ? (
              campaigns.map((campaign, index) => (
                <SelectableCampaignCard
                  key={campaign._id}
                  campaign={campaign}
                  isSelected={selectedIds.has(campaign._id)}
                  onSelect={onItemSelect}
                  onClick={(e) => onItemClick(index, campaign, e)}
                  cardRef={(el) => {
                    if (el) itemRefs.current.set(campaign._id, el);
                    else itemRefs.current.delete(campaign._id);
                  }}
                />
              ))
            ) : (
              emptyState
            )}
            
            {selectionRect}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}