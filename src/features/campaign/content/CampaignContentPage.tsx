"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowLeft, FolderPlus } from "lucide-react";
import { useCampaignContent } from "./hooks/useCampaignContent";
import { MontagerVideoDialog } from "./dialogs/MontagerVideoDialog";
import { MissingAssetsDialog } from "./dialogs/MissingAssetsDialog";
import { VideoCategoryTable } from "./components/VideoCategoryTable";
import { VideoStatsHeader } from "./components/VideoStatsHeader";
import { NicheTabsFilter } from "./components/NicheTabsFilter";
import { ViewToggle } from "./components/ViewToggle";
import type { VideoView } from "./components/ViewToggle";
import { ProcessingGrid } from "./components/ProcessingGrid";
import { ReadyToPublishGrid } from "./components/ReadyToPublishGrid";
import { ScheduledGrid } from "./components/ScheduledGrid";
import { PublishedGrid } from "./components/PublishedGrid";
import { DateFilterTabs } from "./components/DateFilterTabs";
import { CampaignMediaSection } from "@/features/campaign/media";
import { CampaignInfoCard } from "./components/CampaignInfoCard";
import { useState, useMemo, useEffect } from "react";
import {
  calculateCategoryStats,
  filterByCategoryAndNiche,
  calculateNicheStats,
  countVideosWithUrls,
} from "../shared/utils/video-stats.utils";

export function CampaignContentPage() {
  const params = useParams();
  const router = useRouter();
  const campaignRecordId = params.id as string;
  const { data, isLoading, error } = useCampaignContent(campaignRecordId);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("categories");
  const [videoView, setVideoView] = useState<VideoView>("processing");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [montagerDialogOpen, setMontagerDialogOpen] = useState(false);
  const [missingAssetsDialogOpen, setMissingAssetsDialogOpen] = useState(false);

  // Validate campaign assets for Montager
  const validation = useQuery(
    api.app.campaignValidation.validateCampaignAssets,
    selectedCategory ? { campaignId: campaignRecordId } : "skip"
  );

  // Get all airtable record IDs that already have montager videos assigned
  const assignedRecordIds = useQuery(api.app.montagerDb.getAssignedAirtableRecordIds);
  const assignedSet = useMemo(
    () => new Set(assignedRecordIds ?? []),
    [assignedRecordIds]
  );

  // Calculate category stats
  const categoryStats = useMemo(() => {
    if (!data?.content) return [];
    return calculateCategoryStats(data.content);
  }, [data?.content]);

  // Calculate niche stats for selected category
  const nicheStats = useMemo(() => {
    if (!data?.content || !selectedCategory) return [];
    return calculateNicheStats(data.content, selectedCategory);
  }, [data?.content, selectedCategory]);

  // Filter videos by category and niche
  const filteredVideos = useMemo(() => {
    if (!data?.content || !selectedCategory || !selectedNiche) return [];
    return filterByCategoryAndNiche(data.content, selectedCategory, selectedNiche);
  }, [data?.content, selectedCategory, selectedNiche]);

  // Get all airtable record IDs for the current category/niche (for querying montager videos)
  const categoryNicheRecordIds = useMemo(() => {
    if (!data?.content || !selectedCategory || !selectedNiche) return [];

    return data.content
      .filter((record) => {
        const matchesCategory = record.video_category === selectedCategory;
        const matchesNiche = record.account_niche === selectedNiche;
        return matchesCategory && matchesNiche;
      })
      .map((record) => record.id);
  }, [data?.content, selectedCategory, selectedNiche]);

  // Query montager videos for the Ready to Publish tab
  const montagerVideosData = useQuery(
    api.app.montagerDb.getMontagerVideosByAirtableRecordIds,
    categoryNicheRecordIds.length > 0
      ? { airtableRecordIds: categoryNicheRecordIds }
      : "skip"
  );

  // Calculate stats for selected category (not affected by niche filter)
  const categoryVideoStats = useMemo(() => {
    if (!data?.content || !selectedCategory) return { withUrl: 0, total: 0 };
    return countVideosWithUrls(data.content, selectedCategory, null);
  }, [data?.content, selectedCategory]);

  // Filter montager videos by selected date
  const dateFilteredProcessingVideos = useMemo(() => {
    const videos = montagerVideosData?.processing ?? [];
    if (selectedDateFilter === null) return videos;
    if (selectedDateFilter === "unscheduled") {
      return videos.filter((v) => !v.scheduledDate);
    }
    return videos.filter((v) => v.scheduledDate === selectedDateFilter);
  }, [montagerVideosData?.processing, selectedDateFilter]);

  const dateFilteredProcessedVideos = useMemo(() => {
    const videos = montagerVideosData?.processed ?? [];
    if (selectedDateFilter === null) return videos;
    if (selectedDateFilter === "unscheduled") {
      return videos.filter((v) => !v.scheduledDate);
    }
    return videos.filter((v) => v.scheduledDate === selectedDateFilter);
  }, [montagerVideosData?.processed, selectedDateFilter]);

  // Count processing and processed videos (from montager) - filtered by date
  const processingCount = dateFilteredProcessingVideos.length;
  const processedCount = dateFilteredProcessedVideos.length;

  // Filter Airtable videos by selected date for counts
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
  // Records that: 1) don't have a video_url, 2) are not already assigned to montager videos
  // Also filtered by selected date when a specific date is selected
  const unassignedRecordIds = useMemo(() => {
    if (!data?.content || !selectedCategory || !selectedNiche) return [];

    // Get IDs of records that already have montager videos assigned
    const assignedRecordIds = new Set([
      ...(montagerVideosData?.processing?.map((v) => v.airtableRecordId) ?? []),
      ...(montagerVideosData?.processed?.map((v) => v.airtableRecordId) ?? []),
    ]);

    return data.content
      .filter((record) => {
        const matchesCategory = record.video_category === selectedCategory;
        const matchesNiche = record.account_niche === selectedNiche;
        const hasNoVideo = !record.video_url;
        const notAssigned = !assignedRecordIds.has(record.id);

        // Filter by selected date if a specific date is selected
        let matchesDate = true;
        if (selectedDateFilter !== null) {
          if (selectedDateFilter === "unscheduled") {
            matchesDate = !record.date;
          } else {
            matchesDate = record.date === selectedDateFilter;
          }
        }

        return matchesCategory && matchesNiche && hasNoVideo && notAssigned && matchesDate;
      })
      .map((record) => record.id);
  }, [data?.content, selectedCategory, selectedNiche, montagerVideosData, selectedDateFilter]);

  // Calculate combined date stats from Airtable content and montager videos
  const dateStats = useMemo(() => {
    const statsMap = new Map<string | null, {
      total: number;
      needed: number;
      processing: number;
      ready: number;
      scheduled: number;
      published: number;
    }>();

    // Get IDs of records that already have montager videos assigned
    const assignedRecordIds = new Set([
      ...(montagerVideosData?.processing?.map((v) => v.airtableRecordId) ?? []),
      ...(montagerVideosData?.processed?.map((v) => v.airtableRecordId) ?? []),
    ]);

    // Count Airtable content by status
    // Skip records assigned to montager - they'll be counted in the montager loops
    filteredVideos.forEach((record) => {
      // Skip records that are assigned to montager videos (they're counted separately)
      if (assignedRecordIds.has(record.id)) return;

      const date = record.date ?? null;
      const current = statsMap.get(date) ?? {
        total: 0, needed: 0, processing: 0, ready: 0, scheduled: 0, published: 0
      };
      current.total += 1;

      if (record.api_post_id) {
        // Published - has api_post_id
        current.published += 1;
      } else if (record.video_url) {
        // Scheduled - has video_url but no api_post_id
        current.scheduled += 1;
      } else {
        // Needed - no video and not assigned to montager
        current.needed += 1;
      }

      statsMap.set(date, current);
    });

    // Count processing videos from montagerVideos
    (montagerVideosData?.processing ?? []).forEach((video) => {
      const date = video.scheduledDate ?? null;
      const current = statsMap.get(date) ?? {
        total: 0, needed: 0, processing: 0, ready: 0, scheduled: 0, published: 0
      };
      current.total += 1;
      current.processing += 1;
      statsMap.set(date, current);
    });

    // Count ready videos from montagerVideos
    (montagerVideosData?.processed ?? []).forEach((video) => {
      const date = video.scheduledDate ?? null;
      const current = statsMap.get(date) ?? {
        total: 0, needed: 0, processing: 0, ready: 0, scheduled: 0, published: 0
      };
      current.total += 1;
      current.ready += 1;
      statsMap.set(date, current);
    });

    return Array.from(statsMap.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  }, [filteredVideos, montagerVideosData]);

  // Get unassigned empty records for Montager - filtered by selected date
  // When a specific date is selected: only show records for that date
  // When "All Dates": use existing logic (earliest dates first)
  const unassignedEmptyRecords = useMemo(() => {
    if (!data?.content || !selectedCategory || !selectedNiche) return [];

    let records = data.content
      .filter(
        (record) =>
          record.video_category === selectedCategory &&
          record.account_niche === selectedNiche &&
          !record.video_url &&
          !assignedSet.has(record.id)
      );

    // Filter by selected date if a specific date is selected
    if (selectedDateFilter !== null) {
      if (selectedDateFilter === "unscheduled") {
        records = records.filter((r) => !r.date);
      } else {
        records = records.filter((r) => r.date === selectedDateFilter);
      }
    }

    // Sort by date ascending (earliest first). Records without dates go to the end
    return records
      .sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      })
      .map((record) => ({ id: record.id, date: record.date }));
  }, [data?.content, selectedCategory, selectedNiche, assignedSet, selectedDateFilter]);

  const videosNeeded = unassignedEmptyRecords.length;
  const hasUnassignedVideos = videosNeeded > 0;

  const handleAddFromMontager = () => {
    if (!validation) return;

    if (!validation.isValid) {
      setMissingAssetsDialogOpen(true);
      return;
    }

    setMontagerDialogOpen(true);
  };

  // Reset date filter when category or niche changes
  useEffect(() => {
    setSelectedDateFilter(null);
  }, [selectedCategory, selectedNiche]);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    // Set to first niche of this category
    const categoryNiches = calculateNicheStats(data?.content ?? [], category);
    setSelectedNiche(categoryNiches[0]?.niche ?? "");
    setVideoView("processing"); // Reset to processing view
    setSelectedDateFilter(null); // Reset date filter
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedNiche("");
    setVideoView("processing");
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
          <div className="rounded-lg border p-8">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
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
        {!selectedCategory && (
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
            />
          </div>
        )}

        {/* Tabs for Categories and Campaign Assets */}
        {!selectedCategory && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="categories" className="cursor-pointer">Categories</TabsTrigger>
              <TabsTrigger value="media" className="cursor-pointer">Campaign Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="space-y-4">
              <VideoCategoryTable
                categories={categoryStats}
                onSelectCategory={handleSelectCategory}
              />
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <CampaignMediaSection campaignId={campaignRecordId} />
            </TabsContent>
          </Tabs>
        )}

        {/* Video Grid View */}
        {selectedCategory && (
          <div className="space-y-6">
            {/* Stats Header */}
            <VideoStatsHeader
              category={selectedCategory}
              withUrlCount={categoryVideoStats.withUrl}
              totalCount={categoryVideoStats.total}
              onBack={handleBack}
            />

            {/* Niche Tabs */}
            <NicheTabsFilter
              niches={nicheStats}
              selectedNiche={selectedNiche}
              onSelectNiche={setSelectedNiche}
            />

            {/* Date Filter - Calendar on top */}
            {dateStats.length > 0 && (
              <DateFilterTabs
                dateStats={dateStats}
                selectedDate={selectedDateFilter}
                onSelectDate={setSelectedDateFilter}
              />
            )}

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

              {/* Add from Montager button - only shows when there are unassigned videos */}
              {hasUnassignedVideos && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddFromMontager}
                  disabled={!validation || assignedRecordIds === undefined}
                  className="shrink-0"
                >
                  <FolderPlus className="size-4 mr-2" />
                  Add {videosNeeded} from Montager
                  {selectedDateFilter && selectedDateFilter !== "unscheduled" && (
                    <span className="ml-1 text-muted-foreground">
                      ({selectedDateFilter})
                    </span>
                  )}
                </Button>
              )}
            </div>

            {/* Conditional Video Content - 4-way rendering */}
            {videoView === "processing" && (
              <ProcessingGrid
                processingVideos={montagerVideosData?.processing ?? []}
                isLoading={montagerVideosData === undefined}
                selectedDateFilter={selectedDateFilter}
              />
            )}
            {videoView === "ready" && (
              <ReadyToPublishGrid
                processedVideos={montagerVideosData?.processed ?? []}
                isLoading={montagerVideosData === undefined}
                campaignId={campaignRecordId}
                unassignedRecordIds={unassignedRecordIds}
                onVideosAdded={handleVideosAdded}
                selectedDateFilter={selectedDateFilter}
              />
            )}
            {videoView === "scheduled" && (
              <ScheduledGrid
                videos={dateFilteredAirtableVideos.filter((v) => v.video_url && !v.api_post_id)}
              />
            )}
            {videoView === "published" && (
              <PublishedGrid
                videos={dateFilteredAirtableVideos.filter((v) => !!v.api_post_id)}
              />
            )}

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
                open={montagerDialogOpen}
                onOpenChange={setMontagerDialogOpen}
                airtableRecords={unassignedEmptyRecords}
                campaignId={campaignRecordId}
                categoryName={selectedCategory}
                nicheName={selectedNiche}
                onSuccess={handleVideosAdded}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
