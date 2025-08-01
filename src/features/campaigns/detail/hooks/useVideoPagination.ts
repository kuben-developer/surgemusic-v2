import { useMemo, useState } from "react";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface UseVideoPaginationProps {
  videos: Doc<"generatedVideos">[];
  videosPerPage: number;
}

export function useVideoPagination({ videos, videosPerPage }: UseVideoPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(videos.length / videosPerPage);
    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

    return {
      totalPages,
      currentVideos,
      totalVideos: videos.length,
    };
  }, [videos, videosPerPage, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when videos change (e.g., when filter changes)
  const resetPage = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    ...paginationData,
    handlePageChange,
    resetPage,
  };
}