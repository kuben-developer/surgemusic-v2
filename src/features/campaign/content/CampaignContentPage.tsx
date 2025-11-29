"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useCampaignContent } from "./hooks/useCampaignContent";
import { VideoCategoryTable } from "./components/VideoCategoryTable";
import { VideoGrid } from "./components/VideoGrid";
import { VideoStatsHeader } from "./components/VideoStatsHeader";
import { NicheTabsFilter } from "./components/NicheTabsFilter";
import { ViewToggle } from "./components/ViewToggle";
import type { VideoView } from "./components/ViewToggle";
import { ReadyToPublishGrid } from "./components/ReadyToPublishGrid";
import { CampaignMediaSection } from "@/features/campaign/media";
import { CampaignInfoCard } from "./components/CampaignInfoCard";
import { useState, useMemo } from "react";
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
  const [selectedNiche, setSelectedNiche] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("categories");
  const [videoView, setVideoView] = useState<VideoView>("published");

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
    if (!data?.content || !selectedCategory) return [];
    return filterByCategoryAndNiche(data.content, selectedCategory, selectedNiche);
  }, [data?.content, selectedCategory, selectedNiche]);

  // Get all airtable record IDs for the current category/niche (for querying montager videos)
  const categoryNicheRecordIds = useMemo(() => {
    if (!data?.content || !selectedCategory) return [];

    return data.content
      .filter((record) => {
        const matchesCategory = record.video_category === selectedCategory;
        const matchesNiche = selectedNiche === "all" || record.account_niche === selectedNiche;
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

  // Count published videos (with video_url)
  const publishedCount = useMemo(() => {
    return filteredVideos.filter((v) => v.video_url).length;
  }, [filteredVideos]);

  // Count processing and processed videos
  const processingCount = montagerVideosData?.processing?.length ?? 0;
  const processedCount = montagerVideosData?.processed?.length ?? 0;

  // Calculate unassigned record IDs for bulk upload
  // Records that: 1) don't have a video_url, 2) are not already assigned to montager videos
  const unassignedRecordIds = useMemo(() => {
    if (!data?.content || !selectedCategory) return [];

    // Get IDs of records that already have montager videos assigned
    const assignedRecordIds = new Set([
      ...(montagerVideosData?.processing?.map((v) => v.airtableRecordId) ?? []),
      ...(montagerVideosData?.processed?.map((v) => v.airtableRecordId) ?? []),
    ]);

    return data.content
      .filter((record) => {
        const matchesCategory = record.video_category === selectedCategory;
        const matchesNiche = selectedNiche === "all" || record.account_niche === selectedNiche;
        const hasNoVideo = !record.video_url;
        const notAssigned = !assignedRecordIds.has(record.id);
        return matchesCategory && matchesNiche && hasNoVideo && notAssigned;
      })
      .map((record) => record.id);
  }, [data?.content, selectedCategory, selectedNiche, montagerVideosData]);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedNiche("all"); // Reset niche filter when changing category
    setVideoView("published"); // Reset to published view
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedNiche("all");
    setVideoView("published");
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
              totalWithUrl={categoryVideoStats.withUrl}
              totalCount={categoryVideoStats.total}
              campaignId={campaignRecordId}
              categoryName={selectedCategory}
              content={data.content}
              onVideosAdded={handleVideosAdded}
            />

            {/* View Toggle */}
            <ViewToggle
              view={videoView}
              onViewChange={setVideoView}
              publishedCount={publishedCount}
              processingCount={processingCount}
              processedCount={processedCount}
            />

            {/* Conditional Video Content */}
            {videoView === "published" ? (
              <VideoGrid videos={filteredVideos} />
            ) : (
              <ReadyToPublishGrid
                processingVideos={montagerVideosData?.processing ?? []}
                processedVideos={montagerVideosData?.processed ?? []}
                isLoading={montagerVideosData === undefined}
                campaignId={campaignRecordId}
                unassignedRecordIds={unassignedRecordIds}
                onVideosAdded={handleVideosAdded}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
