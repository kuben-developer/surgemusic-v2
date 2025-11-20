"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import type { NicheStats } from "../../shared/types/campaign.types";
import { MontagerVideoDialog } from "../dialogs/MontagerVideoDialog";

interface NicheTabsFilterProps {
  niches: NicheStats[];
  selectedNiche: string;
  onSelectNiche: (niche: string) => void;
  totalWithUrl: number;
  totalCount: number;
  campaignId: string;
  categoryName: string;
  onVideosAdded?: () => void;
}

export function NicheTabsFilter({
  niches,
  selectedNiche,
  onSelectNiche,
  totalWithUrl,
  totalCount,
  campaignId,
  categoryName,
  onVideosAdded,
}: NicheTabsFilterProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get selected niche stats
  const selectedNicheStats = niches.find((n) => n.niche === selectedNiche);
  const isNicheIncomplete =
    selectedNiche !== "all" &&
    selectedNicheStats &&
    selectedNicheStats.withUrlCount < selectedNicheStats.totalCount;
  const videosNeeded = selectedNicheStats
    ? selectedNicheStats.totalCount - selectedNicheStats.withUrlCount
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <Tabs value={selectedNiche} onValueChange={onSelectNiche} className="flex-1">
          <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All
              <span className="ml-2 text-xs font-mono opacity-70">
                {totalWithUrl}/{totalCount}
              </span>
            </TabsTrigger>
            {niches.map((niche) => (
              <TabsTrigger
                key={niche.niche}
                value={niche.niche}
                className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {niche.niche}
                <span className="ml-2 text-xs font-mono opacity-70">
                  {niche.withUrlCount}/{niche.totalCount}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Add from Montager button - only shows for incomplete niches */}
        {isNicheIncomplete && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialogOpen(true)}
            className="shrink-0"
          >
            <FolderPlus className="size-4 mr-2" />
            Add {videosNeeded} from Montager
          </Button>
        )}
      </div>

      {/* Montager Video Dialog */}
      {isNicheIncomplete && (
        <MontagerVideoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          campaignId={campaignId}
          categoryName={categoryName}
          nicheName={selectedNiche}
          videosNeeded={videosNeeded}
          onSuccess={onVideosAdded}
        />
      )}
    </div>
  );
}
