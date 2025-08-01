"use client";

import { motion } from "framer-motion";
import { useVideoFiltering } from "@/features/campaigns/videos";
import { VideoSectionHeader } from "./VideoSectionHeader";
import { VideoPagination } from "./VideoPagination";
import { VideoSectionContent } from "./VideoSectionContent";
import { useVideoPagination } from "../hooks/useVideoPagination";
import type { VideoSectionProps } from "../types/campaign-detail.types";

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
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  currentPage,
  onPageChange,
  videosPerPage,
  downloadingVideos,
  onDownloadVideo,
  onDownloadAll,
}: VideoSectionProps) {
  if (!campaign) return null;

  // Use the filtering hook
  const { filteredVideos, totalScheduledCount } = useVideoFiltering(generatedVideos);
  
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
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          onDownloadAll={onDownloadAll}
          hasVideos={filteredVideos.length > 0}
        />

        {/* Pagination - Only for grid view */}
        {totalPagesExternal > 1 && viewMode === "grid" && (
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
          viewMode={viewMode}
          downloadingVideos={downloadingVideos}
          onDownloadVideo={onDownloadVideo}
          onDownloadAll={onDownloadAll}
          campaign={campaign}
          campaignId={campaignId}
          statusFilter={statusFilter}
          totalScheduledCount={totalScheduledCount}
        />
      </div>
    </motion.section>
  );
}