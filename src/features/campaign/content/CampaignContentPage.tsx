"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, FolderPlus } from "lucide-react";
import { useCampaignContent } from "./hooks/useCampaignContent";
import { MontagerVideoDialog } from "./dialogs/MontagerVideoDialog";
import { MissingAssetsDialog } from "./dialogs/MissingAssetsDialog";
import { CampaignAssetsDialog } from "./dialogs/CampaignAssetsDialog";
import { ViewToggle } from "./components/ViewToggle";
import type { VideoView } from "./components/ViewToggle";
import { VideoGrid } from "./components/VideoGrid";
import { DateFilterTabs } from "./components/DateFilterTabs";
import { CampaignInfoCard } from "./components/CampaignInfoCard";
import { VideoCategoryCard } from "./components/VideoCategoryCard";
import { useState, useMemo, useEffect } from "react";

interface CategoryStatsWithCounts {
  category: string;
  totalCount: number;
  neededCount: number;
  processingCount: number;
  readyCount: number;
  scheduledCount: number;
  publishedCount: number;
}

export function CampaignContentPage() {
  const params = useParams();
  const router = useRouter();
  const campaignRecordId = params.id as string;
  const { data, isLoading, error } = useCampaignContent(campaignRecordId);

  // State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [videoView, setVideoView] = useState<VideoView>("processing");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [montagerDialogOpen, setMontagerDialogOpen] = useState(false);
  const [missingAssetsDialogOpen, setMissingAssetsDialogOpen] = useState(false);
  const [assetsDialogOpen, setAssetsDialogOpen] = useState(false);

  // Validate campaign assets for Montager
  const validation = useQuery(
    api.app.campaignValidation.validateCampaignAssets,
    selectedCategory ? { campaignId: campaignRecordId } : "skip"
  );

  // Get airtable record IDs that already have montager videos assigned for this campaign
  const assignedRecordIds = useQuery(
    api.app.montagerDb.getAssignedAirtableRecordIds,
    { campaignId: campaignRecordId }
  );
  const assignedSet = useMemo(
    () => new Set(assignedRecordIds ?? []),
    [assignedRecordIds]
  );

  // Get ALL record IDs for the campaign (for querying all montager videos)
  const allRecordIds = useMemo(() => {
    if (!data?.content) return [];
    return data.content.map((record) => record.id);
  }, [data?.content]);

  // Query montager videos for ALL records in the campaign
  const allMontagerVideosData = useQuery(
    api.app.montagerDb.getMontagerVideosByAirtableRecordIds,
    allRecordIds.length > 0
      ? { airtableRecordIds: allRecordIds }
      : "skip"
  );

  // Calculate comprehensive stats per category
  const categoryStatsWithCounts = useMemo((): CategoryStatsWithCounts[] => {
    if (!data?.content) return [];

    // Build a map of airtableRecordId -> montager video status
    const processingRecordIds = new Set(
      allMontagerVideosData?.processing?.map((v) => v.airtableRecordId) ?? []
    );
    const readyRecordIds = new Set(
      allMontagerVideosData?.processed?.map((v) => v.airtableRecordId) ?? []
    );

    // Group by category
    const categoryMap = new Map<string, {
      total: number;
      needed: number;
      processing: number;
      ready: number;
      scheduled: number;
      published: number;
    }>();

    data.content.forEach((record) => {
      const category = record.video_category || "Uncategorized";
      const current = categoryMap.get(category) ?? {
        total: 0, needed: 0, processing: 0, ready: 0, scheduled: 0, published: 0
      };

      current.total += 1;

      // Determine status
      if (record.api_post_id) {
        current.published += 1;
      } else if (record.video_url) {
        current.scheduled += 1;
      } else if (readyRecordIds.has(record.id)) {
        current.ready += 1;
      } else if (processingRecordIds.has(record.id)) {
        current.processing += 1;
      } else if (record.status === "planned") {
        current.needed += 1;
      }

      categoryMap.set(category, current);
    });

    // Convert to array and sort by needed count (highest first), then by name
    return Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category,
        totalCount: stats.total,
        neededCount: stats.needed,
        processingCount: stats.processing,
        readyCount: stats.ready,
        scheduledCount: stats.scheduled,
        publishedCount: stats.published,
      }))
      .sort((a, b) => {
        // Sort by needed count descending, then by name
        if (b.neededCount !== a.neededCount) {
          return b.neededCount - a.neededCount;
        }
        return a.category.localeCompare(b.category);
      });
  }, [data?.content, allMontagerVideosData]);

  // Set initial category when data loads
  useEffect(() => {
    const firstCategory = categoryStatsWithCounts[0]?.category;
    if (firstCategory && selectedCategory === null) {
      setSelectedCategory(firstCategory);
    }
  }, [categoryStatsWithCounts, selectedCategory]);

  // Get current category stats
  const currentCategoryStats = useMemo(() => {
    return categoryStatsWithCounts.find((c) => c.category === selectedCategory);
  }, [categoryStatsWithCounts, selectedCategory]);

  // Filter videos by selected category only
  const filteredVideos = useMemo(() => {
    if (!data?.content || !selectedCategory) return [];
    return data.content.filter(
      (record) => record.video_category === selectedCategory
    );
  }, [data?.content, selectedCategory]);

  // Get montager videos for selected category
  const montagerVideosForCategory = useMemo(() => {
    if (!allMontagerVideosData || !filteredVideos.length) {
      return { processing: [], processed: [] };
    }

    const categoryRecordIds = new Set(filteredVideos.map((v) => v.id));

    return {
      processing: allMontagerVideosData.processing?.filter(
        (v) => v.airtableRecordId && categoryRecordIds.has(v.airtableRecordId)
      ) ?? [],
      processed: allMontagerVideosData.processed?.filter(
        (v) => v.airtableRecordId && categoryRecordIds.has(v.airtableRecordId)
      ) ?? [],
    };
  }, [allMontagerVideosData, filteredVideos]);

  // Count processing and processed videos for current category
  const processingCount = montagerVideosForCategory.processing.length;
  const processedCount = montagerVideosForCategory.processed.length;

  // Filter Airtable videos by selected date for Scheduled/Published tabs only
  const dateFilteredAirtableVideos = useMemo(() => {
    if (selectedDateFilter === null) return filteredVideos;
    if (selectedDateFilter === "unscheduled") {
      return filteredVideos.filter((v) => !v.date);
    }
    return filteredVideos.filter((v) => v.date === selectedDateFilter);
  }, [filteredVideos, selectedDateFilter]);

  // Count scheduled videos (has video_url but no api_post_id - from Airtable)
  const scheduledCount = useMemo(() => {
    return dateFilteredAirtableVideos.filter((v) => v.video_url && !v.api_post_id).length;
  }, [dateFilteredAirtableVideos]);

  // Count published videos (has api_post_id - from Airtable)
  const publishedCount = useMemo(() => {
    return dateFilteredAirtableVideos.filter((v) => v.api_post_id).length;
  }, [dateFilteredAirtableVideos]);

  // Calculate unassigned record IDs for bulk upload
  const unassignedRecordIds = useMemo(() => {
    if (!data?.content || !selectedCategory) return [];

    const assignedRecordIdsSet = new Set([
      ...(montagerVideosForCategory.processing?.map((v) => v.airtableRecordId) ?? []),
      ...(montagerVideosForCategory.processed?.map((v) => v.airtableRecordId) ?? []),
    ]);

    return data.content
      .filter((record) => {
        const matchesCategory = record.video_category === selectedCategory;
        const isPlanned = record.status === "planned";
        const notAssigned = !assignedRecordIdsSet.has(record.id);
        return matchesCategory && isPlanned && notAssigned;
      })
      .map((record) => record.id);
  }, [data?.content, selectedCategory, montagerVideosForCategory]);

  // Calculate date stats from Airtable content (for Scheduled/Published tabs)
  const dateStats = useMemo(() => {
    const statsMap = new Map<string | null, {
      total: number;
      needed: number;
      processing: number;
      ready: number;
      scheduled: number;
      published: number;
    }>();

    filteredVideos.forEach((record) => {
      if (!record.video_url && !record.api_post_id) return;

      const date = record.date ?? null;
      const current = statsMap.get(date) ?? {
        total: 0, needed: 0, processing: 0, ready: 0, scheduled: 0, published: 0
      };
      current.total += 1;

      if (record.api_post_id) {
        current.published += 1;
      } else if (record.video_url) {
        current.scheduled += 1;
      }

      statsMap.set(date, current);
    });

    return Array.from(statsMap.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  }, [filteredVideos]);

  // Get unassigned empty records for Montager
  const unassignedEmptyRecords = useMemo(() => {
    if (!data?.content || !selectedCategory) return [];

    return data.content
      .filter(
        (record) =>
          record.video_category === selectedCategory &&
          record.status === "planned" &&
          !assignedSet.has(record.id)
      )
      .map((record) => ({ id: record.id, date: record.date }));
  }, [data?.content, selectedCategory, assignedSet]);

  const videosNeeded = unassignedEmptyRecords.length;
  const hasUnassignedVideos = videosNeeded > 0;

  // Only show date filter for scheduled/published views
  const showDateFilter = (videoView === "scheduled" || videoView === "published") && dateStats.length > 0;

  const handleAddFromMontager = () => {
    if (!validation) return;

    if (!validation.isValid) {
      setMissingAssetsDialogOpen(true);
      return;
    }

    setMontagerDialogOpen(true);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setVideoView("processing");
    setSelectedDateFilter(null);
  };

  const handleVideosAdded = () => {
    // Videos assigned successfully - Convex handles real-time updates
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto py-12 px-4">
        <div className="text-center py-16 text-destructive border border-destructive/50 rounded-lg bg-destructive/5">
          <AlertCircle className="size-12 mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-1">Error Loading Content</h3>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/campaign")}
            className="hover:bg-muted -ml-2"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Campaigns
          </Button>
          <CampaignInfoCard
            campaignName={data.campaign_name}
            artist={data.artist}
            song={data.song}
            campaignId={campaignRecordId}
            onOpenAssets={() => setAssetsDialogOpen(true)}
          />
        </div>

        {/* Video Category Cards */}
        {categoryStatsWithCounts.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryStatsWithCounts.map((cat) => (
                <VideoCategoryCard
                  key={cat.category}
                  category={cat.category}
                  totalCount={cat.totalCount}
                  neededCount={cat.neededCount}
                  processingCount={cat.processingCount}
                  readyCount={cat.readyCount}
                  scheduledCount={cat.scheduledCount}
                  publishedCount={cat.publishedCount}
                  isSelected={selectedCategory === cat.category}
                  onClick={() => handleCategoryChange(cat.category)}
                />
              ))}
            </div>

            {/* Selected Category Content */}
            {selectedCategory && (
              <div className="space-y-6 border-t pt-6">
                {/* View Toggle with Add from Montager button */}
                <div className="flex items-center justify-between gap-4">
                  <ViewToggle
                    view={videoView}
                    onViewChange={setVideoView}
                    processingCount={processingCount}
                    readyCount={processedCount}
                    scheduledCount={scheduledCount}
                    publishedCount={publishedCount}
                  />

                  {/* Add from Montager button */}
                  {hasUnassignedVideos && (videoView === "processing" || videoView === "ready") && (
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

                {/* Date Filter - Only for Scheduled/Published tabs */}
                {showDateFilter && (
                  <DateFilterTabs
                    dateStats={dateStats}
                    selectedDate={selectedDateFilter}
                    onSelectDate={setSelectedDateFilter}
                  />
                )}

                {/* Video Content - 4-way rendering */}
                {videoView === "processing" && (
                  <VideoGrid
                    variant="processing"
                    montagerVideos={montagerVideosForCategory.processing}
                    isLoading={allMontagerVideosData === undefined}
                  />
                )}
                {videoView === "ready" && (
                  <VideoGrid
                    variant="ready"
                    montagerVideos={montagerVideosForCategory.processed}
                    isLoading={allMontagerVideosData === undefined}
                    campaignId={campaignRecordId}
                    unassignedRecordIds={unassignedRecordIds}
                    onVideosAdded={handleVideosAdded}
                  />
                )}
                {videoView === "scheduled" && (
                  <VideoGrid
                    variant="scheduled"
                    airtableVideos={dateFilteredAirtableVideos.filter((v) => v.video_url && !v.api_post_id)}
                  />
                )}
                {videoView === "published" && (
                  <VideoGrid
                    variant="published"
                    airtableVideos={dateFilteredAirtableVideos.filter((v) => !!v.api_post_id)}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {categoryStatsWithCounts.length === 0 && (
          <div className="text-center py-16 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">No video categories found for this campaign.</p>
          </div>
        )}

        {/* Dialogs */}
        <CampaignAssetsDialog
          open={assetsDialogOpen}
          onOpenChange={setAssetsDialogOpen}
          campaignId={campaignRecordId}
        />

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

        {hasUnassignedVideos && selectedCategory && (
          <MontagerVideoDialog
            open={montagerDialogOpen}
            onOpenChange={setMontagerDialogOpen}
            airtableRecords={unassignedEmptyRecords}
            campaignId={campaignRecordId}
            categoryName={selectedCategory}
            onSuccess={handleVideosAdded}
          />
        )}
      </div>
    </div>
  );
}
