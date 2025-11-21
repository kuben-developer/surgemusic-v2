"use client";

import { useState } from "react";
import { Film, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MontageVideoCard } from "./MontageVideoCard";
import type { MontagerVideoDb } from "../../shared/types/common.types";

const VIDEOS_PER_PAGE = 12;

interface MontagesGridProps {
  videos: MontagerVideoDb[];
}

export function MontagesGrid({ videos }: MontagesGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (videos.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Film className="mb-4 size-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">No montages yet</h3>
        <p className="text-sm text-muted-foreground">
          Create montages to get started
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
  const endIndex = startIndex + VIDEOS_PER_PAGE;
  const currentVideos = videos.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-b pb-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, videos.length)} of {videos.length} montages
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>

            {getPageNumbers().map((page, index) => (
              page === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className="size-8"
                  onClick={() => handlePageClick(page)}
                >
                  {page}
                </Button>
              )
            ))}

            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {currentVideos.map((video) => (
          <MontageVideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}
