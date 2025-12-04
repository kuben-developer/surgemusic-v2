"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import type { NicheStats, AirtableContent } from "../../shared/types/campaign.types";
import { MontagerVideoDialog } from "../dialogs/MontagerVideoDialog";
import { MissingAssetsDialog } from "../dialogs/MissingAssetsDialog";

interface NicheTabsFilterProps {
  niches: NicheStats[];
  selectedNiche: string;
  onSelectNiche: (niche: string) => void;
  totalWithUrl: number;
  totalCount: number;
  campaignId: string;
  categoryName: string;
  content: AirtableContent[];
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
  content,
  onVideosAdded,
}: NicheTabsFilterProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [missingAssetsDialogOpen, setMissingAssetsDialogOpen] = useState(false);

  // Validate campaign assets
  const validation = useQuery(api.app.campaignValidation.validateCampaignAssets, {
    campaignId,
  });

  // Get all airtable record IDs that already have montager videos assigned
  const assignedRecordIds = useQuery(api.app.montagerDb.getAssignedAirtableRecordIds);
  const assignedSet = useMemo(
    () => new Set(assignedRecordIds ?? []),
    [assignedRecordIds]
  );

  // Get selected niche stats
  const selectedNicheStats = niches.find((n) => n.niche === selectedNiche);

  // Get the records of empty Airtable records that don't have montager videos assigned yet
  // Sorted by date ascending (earliest first), records without dates go last
  const unassignedEmptyRecords = useMemo(() => {
    if (selectedNiche === "all") return [];

    return content
      .filter(
        (record) =>
          record.video_category === categoryName &&
          record.account_niche === selectedNiche &&
          !record.video_url &&
          !assignedSet.has(record.id)
      )
      .sort((a, b) => {
        // Sort by date ascending. Records without dates go to the end
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date); // ISO dates sort correctly with string comparison
      })
      .map((record) => ({ id: record.id, date: record.date }));
  }, [content, categoryName, selectedNiche, assignedSet]);

  const videosNeeded = unassignedEmptyRecords.length;
  const hasUnassignedVideos = videosNeeded > 0;

  const handleAddFromMontager = () => {
    // Check if validation data is loaded
    if (!validation) {
      return;
    }

    // If validation fails, show warning dialog
    if (!validation.isValid) {
      setMissingAssetsDialogOpen(true);
      return;
    }

    // All validations passed, open montager dialog
    setDialogOpen(true);
  };

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

        {/* Add from Montager button - only shows when there are unassigned videos */}
        {selectedNiche !== "all" && hasUnassignedVideos && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddFromMontager}
            disabled={!validation || assignedRecordIds === undefined}
            className="shrink-0"
          >
            <FolderPlus className="size-4 mr-2" />
            Add {videosNeeded} from Montager
          </Button>
        )}
      </div>

      {/* Missing Assets Warning Dialog */}
      {validation && !validation.isValid && (
        <MissingAssetsDialog
          open={missingAssetsDialogOpen}
          onOpenChange={setMissingAssetsDialogOpen}
          missingRequirements={validation.missingRequirements}
          hasAudioUrl={validation.hasAudioUrl}
          hasSrtUrl={validation.hasSrtUrl}
          hasCaptions={validation.hasCaptions}
        />
      )}

      {/* Montager Video Dialog */}
      {hasUnassignedVideos && (
        <MontagerVideoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          airtableRecords={unassignedEmptyRecords}
          campaignId={campaignId}
          categoryName={categoryName}
          nicheName={selectedNiche}
          onSuccess={onVideosAdded}
        />
      )}
    </div>
  );
}
