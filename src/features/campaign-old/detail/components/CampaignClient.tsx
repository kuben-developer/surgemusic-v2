"use client"

import { useParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import type { Id } from "../../../../../convex/_generated/dataModel"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CampaignHeader } from "./CampaignHeader"
import { ProgressSection } from "./ProgressSection"
import { VideoSection } from "./VideoSection"
import { useVideoDownload } from "../hooks/useVideoDownload"
import { DownloadFeatureDialog } from "@/features/campaign-old/videos"

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function CampaignClient() {
  const params = useParams()
  const campaignId = params.id as string
  const [progress, setProgress] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const videosPerPage = 8

  const campaign = useQuery(api.app.campaigns.get, campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip")
  const isCampaignLoading = campaign === undefined

  const generatedVideos = useQuery(api.app.campaigns.getGeneratedVideos, campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip")
  const isVideosLoading = generatedVideos === undefined

  // Fetch user data for trial overlay logic
  const userData = useQuery(api.app.users.getCurrentUser)

  const {
    downloadingVideos,
    downloadingAll,
    handleDownloadVideo,
    handleDownloadAll,
    isDownloadDialogOpen,
    setIsDownloadDialogOpen,
  } = useVideoDownload({ campaign, generatedVideos })

  // Check if user qualifies for trial overlay
  const isFirstTimeUser = userData?.firstTimeUser ?? false
  const isTrial = userData?.isTrial ?? false
  const shouldShowTrialBanner =
    campaign &&
    campaign.status === 'completed' &&
    campaign.isFreeCampaign === true &&
    isFirstTimeUser &&
    !isTrial &&
    generatedVideos &&
    generatedVideos.length > 0

  const shouldShowTrialOverlay = shouldShowTrialBanner

  const handleTrialSuccess = () => {
    // The trial success will be handled by the webhook which updates user state
    // We can add additional logic here if needed
    window.location.reload()
  }

  useEffect(() => {
    if (!campaign) return;

    const getEstimatedMinutes = (count?: number): number => {
      if (!count || count <= 0) return 5;
      if (count <= 30) return 1;
      if (count <= 90) return 3;
      return 5;
    };

    const updateProgress = () => {
      if (campaign.status === 'completed') {
        setProgress(100);
        return;
      }

      const now = new Date();
      const createdAt = new Date(campaign._creationTime);
      const elapsedMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      // Calculate progress based on estimated generation window derived from video count.
      // 30 vids ≈ 1 min, 90 vids ≈ 3 min, 120+ vids ≈ 5 min
      const totalMinutes = getEstimatedMinutes(campaign.videoCount);
      const calculatedProgress = Math.min(90, (elapsedMinutes / totalMinutes) * 90);
      const progress = Number(calculatedProgress.toFixed(1));
      setProgress(progress);
      if (progress === 89.7) {
        // Reload the page to check if the campaign is completed
        window.location.reload();
      }
    };

    // Initial update
    updateProgress();

    // Update every second
    const interval = setInterval(updateProgress, 1000);

    return () => clearInterval(interval);
  }, [campaign]);

  if (isCampaignLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-12">
        <div className="space-y-8">
          <section className="bg-card rounded-xl p-8 shadow-sm border">
            <div className="space-y-6">
              <Skeleton className="h-10 w-64" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container max-w-7xl mx-auto py-12">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Campaign not found</h1>
          <p className="text-muted-foreground mt-2">The campaign you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <motion.div
        className="space-y-12"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Campaign Header */}
        <CampaignHeader 
          campaign={campaign}
          campaignId={campaignId}
          generatedVideos={generatedVideos}
        />

        {/* Progress Section */}
        <ProgressSection 
          campaign={campaign}
          progress={progress}
        />

        {/* Videos Section */}
        {(campaign.status as string) === 'completed' && (
          <VideoSection
            campaign={campaign}
            campaignId={campaignId}
            generatedVideos={generatedVideos}
            isVideosLoading={isVideosLoading}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            videosPerPage={videosPerPage}
            downloadingVideos={downloadingVideos}
            onDownloadVideo={handleDownloadVideo}
            onDownloadAll={handleDownloadAll}
            downloadingAll={downloadingAll}
            showTrialBanner={shouldShowTrialBanner || false}
            showTrialOverlay={shouldShowTrialOverlay || false}
            onTrialSuccess={handleTrialSuccess}
          />
        )}

        {/* Download gating dialog */}
        <DownloadFeatureDialog
          open={isDownloadDialogOpen}
          onOpenChange={setIsDownloadDialogOpen}
        />
      </motion.div>
    </div>
  )
}
