"use client";

import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ArrowLeft, BarChart3 } from "lucide-react";
import { useCampaignContent } from "./hooks/useCampaignContent";
import { VideoCategoryTable } from "./components/VideoCategoryTable";
import { VideoGrid } from "./components/VideoGrid";
import { VideoStatsHeader } from "./components/VideoStatsHeader";
import { NicheTabsFilter } from "./components/NicheTabsFilter";
import { CampaignMediaSection } from "@/features/campaign/media";
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

  // Calculate stats for selected category (not affected by niche filter)
  const categoryVideoStats = useMemo(() => {
    if (!data?.content || !selectedCategory) return { withUrl: 0, total: 0 };
    return countVideosWithUrls(data.content, selectedCategory, null);
  }, [data?.content, selectedCategory]);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedNiche("all"); // Reset niche filter when changing category
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedNiche("all");
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
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/campaign")}
                className="hover:bg-muted -ml-2"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back to Campaigns
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/campaign/${campaignRecordId}/analytics`)}
                className="gap-2"
              >
                <BarChart3 className="size-4" />
                View Analytics
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">Campaign Content</h1>
              </div>
            </div>
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
            />

            {/* Video Grid */}
            <VideoGrid videos={filteredVideos} />
          </div>
        )}
      </div>
    </div>
  );
}
