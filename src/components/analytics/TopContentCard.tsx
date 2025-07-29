import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TopContentItem } from "./TopContentItem";
import type { VideoMetric } from "./TopContentItem";

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
        ? videoMetrics?.filter(video => !hiddenVideoIds.includes(video.videoInfo.id))
        : videoMetrics || [];

    const totalVideos = filteredVideos.length;
    const totalPages = Math.ceil(totalVideos / itemsPerPage);

    if (currentPage >= totalPages && totalPages > 0) {
        onPageChange(0);
    }

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
        <Card className="p-6 border border-primary/10">
            <div className="mb-6 space-y-2">
                <h3 className="text-lg font-semibold">Top Performing Content</h3>
                <p className="text-sm text-muted-foreground">Videos with highest engagement across selected campaigns</p>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">
                    {totalVideos > 0 ? (
                        `Showing ${startItem} - ${endItem} of ${totalVideos} videos`
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
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages - 1}
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </div>
            </div>

            <div className="overflow-auto space-y-4">
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