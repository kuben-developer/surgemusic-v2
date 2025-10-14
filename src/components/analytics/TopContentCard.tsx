import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopContentItem } from "./TopContentItem";
import type { VideoMetric } from "@/types/analytics.types";

interface TopContentCardProps {
    videoMetrics: VideoMetric[];
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (newPage: number) => void;
    hiddenVideoIds?: string[];
}

export function TopContentCard({
    videoMetrics,
    currentPage,
    itemsPerPage,
    onPageChange,
    hiddenVideoIds = [],
}: TopContentCardProps) {
    const filteredVideos = hiddenVideoIds.length > 0
        ? videoMetrics?.filter(video => video.videoInfo && !hiddenVideoIds.includes(video.videoInfo.id))
        : videoMetrics || [];

    const totalVideos = filteredVideos.length;
    const totalPages = Math.ceil(totalVideos / itemsPerPage);

    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            onPageChange(0);
        }
    }, [currentPage, totalPages, onPageChange]);

    const handlePrevious = () => {
        onPageChange(Math.max(0, currentPage - 1));
    };

    const handleNext = () => {
        onPageChange(Math.min(totalPages - 1, currentPage + 1));
    };

    const startItem = totalVideos > 0 ? currentPage * itemsPerPage + 1 : 0;
    const endItem = totalVideos > 0 ? Math.min((currentPage + 1) * itemsPerPage, totalVideos) : 0;

    const paginatedVideos = filteredVideos
        .sort((a, b) => b.views - a.views)
        .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    return (
        <Card className="p-4 md:p-6 border border-primary/10">
            <div className="mb-4 md:mb-6 space-y-1 md:space-y-2">
                <h3 className="text-base md:text-lg font-semibold">Top Performing Content</h3>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Videos with highest engagement across selected campaigns</p>
                <p className="text-xs text-muted-foreground sm:hidden">Highest engagement videos</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <div className="text-xs md:text-sm text-muted-foreground">
                    {totalVideos > 0 ? (
                        <>
                            <span className="hidden sm:inline">{`Showing ${startItem} - ${endItem} of ${totalVideos} videos`}</span>
                            <span className="sm:hidden">{`${startItem}-${endItem} of ${totalVideos}`}</span>
                        </>
                    ) : (
                        "No videos found"
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 0}
                        onClick={handlePrevious}
                        className="h-8 text-xs md:text-sm"
                    >
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages - 1}
                        onClick={handleNext}
                        className="h-8 text-xs md:text-sm"
                    >
                        Next
                    </Button>
                </div>
            </div>

            <div className="overflow-auto space-y-3 md:space-y-4">
                {paginatedVideos.length > 0 ? (
                    paginatedVideos.map((video, index) => (
                        <TopContentItem
                            key={video.id}
                            video={video}
                            rank={currentPage * itemsPerPage + index + 1}
                        />
                    ))
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        <p>No visible videos found for the selected criteria.</p>
                    </div>
                )}
            </div>
        </Card>
    );
}