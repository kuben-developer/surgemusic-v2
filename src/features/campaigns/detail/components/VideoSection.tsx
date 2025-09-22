"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { filterVideosByStatus } from "@/features/campaigns/videos";
import { VideoSectionHeader } from "./VideoSectionHeader";
import { VideoPagination } from "./VideoPagination";
import { VideoSectionContent } from "./VideoSectionContent";
import { TrialPromotionBanner } from "./TrialPromotionBanner";
import { useVideoPagination } from "../hooks/useVideoPagination";
import type { VideoSectionProps } from "../types/campaign-detail.types";
import { ScheduleTableDialog } from "@/features/campaigns/videos";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export function VideoSection({
  campaign,
  campaignId,
  generatedVideos,
  isVideosLoading,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  onPageChange,
  videosPerPage,
  downloadingVideos,
  onDownloadVideo,
  onDownloadAll,
  downloadingAll,
  showTrialBanner = false,
  showTrialOverlay = false,
  onTrialSuccess,
}: VideoSectionProps) {
  if (!campaign) return null;

  // Local state for schedule selection dialog
  const [isScheduleTableOpen, setIsScheduleTableOpen] = useState(false);

  // Filter videos based on current status filter
  const allVideos = generatedVideos ?? [];
  const filteredVideos = filterVideosByStatus(allVideos, statusFilter);
  const totalScheduledCount = allVideos.filter((v) => {
    const isScheduled = Boolean(
      (v.tiktokUpload?.scheduledAt !== null && v.tiktokUpload?.scheduledAt !== undefined) ||
      (v.instagramUpload?.scheduledAt !== null && v.instagramUpload?.scheduledAt !== undefined) ||
      (v.youtubeUpload?.scheduledAt !== null && v.youtubeUpload?.scheduledAt !== undefined)
    );
    return isScheduled;
  }).length;
  
  // Use pagination hook for grid view
  const { 
    currentPage: paginationCurrentPage, 
    totalPages, 
    currentVideos, 
    handlePageChange: paginationHandlePageChange 
  } = useVideoPagination({ 
    videos: filteredVideos, 
    videosPerPage 
  });

  // Use external pagination for consistency with parent component
  const effectiveCurrentPage = currentPage;
  const effectiveHandlePageChange = onPageChange;

  // Calculate pagination data using external current page
  const totalPagesExternal = Math.ceil(filteredVideos.length / videosPerPage);
  const indexOfLastVideo = effectiveCurrentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideosExternal = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);

  return (
    <motion.section
      id="videos-section"
      variants={fadeInUp}
      className="bg-card rounded-xl p-8 shadow-sm border"
    >
      <div className="space-y-6">
        <VideoSectionHeader
          videosCount={filteredVideos.length}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          onOpenScheduleDialog={() => setIsScheduleTableOpen(true)}
          onDownloadAll={onDownloadAll}
          hasVideos={filteredVideos.length > 0}
          downloadingAll={downloadingAll}
          campaign={campaign}
        />

        {/* Trial Promotion Banner */}
        {showTrialBanner && onTrialSuccess && (
          <TrialPromotionBanner
            isVisible={showTrialBanner}
            onTrialSuccess={onTrialSuccess}
          />
        )}

        {/* Pagination */}
        {totalPagesExternal > 1 && (
          <VideoPagination
            currentPage={effectiveCurrentPage}
            totalPages={totalPagesExternal}
            onPageChange={effectiveHandlePageChange}
            className="mb-6 mt-6"
          />
        )}

        <VideoSectionContent
          isVideosLoading={isVideosLoading}
          generatedVideos={generatedVideos}
          filteredVideos={filteredVideos}
          currentVideos={currentVideosExternal}
          downloadingVideos={downloadingVideos}
          onDownloadVideo={onDownloadVideo}
          onDownloadAll={onDownloadAll}
          campaign={campaign}
          campaignId={campaignId}
          statusFilter={statusFilter}
          totalScheduledCount={totalScheduledCount}
          showTrialOverlay={showTrialOverlay}
        />

        {/* Schedule selection dialog embedding table view */}
        <ScheduleTableDialog
          isOpen={isScheduleTableOpen}
          onOpenChange={setIsScheduleTableOpen}
          videos={allVideos}
          downloadingVideos={downloadingVideos}
          handleDownloadVideo={onDownloadVideo}
          handleDownloadAll={onDownloadAll}
          songName={campaign?.songName || ""}
          artistName={campaign?.artistName || ""}
          genre={campaign?.genre || ""}
          statusFilter={statusFilter}
          totalVideosCount={filteredVideos.length}
          totalScheduledCount={totalScheduledCount}
          campaignId={campaignId}
          showTrialOverlay={showTrialOverlay}
        />
      </div>
    </motion.section>
  );
}
