import { useState, useEffect } from "react";
import type { VideoMetric } from "./types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { 
    ArrowDown, 
    ArrowUp, 
    Eye, 
    EyeOff, 
    MessageSquare, 
    Share2, 
    ThumbsUp, 
    Loader2,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Define sort fields and their display names
type SortField = "views" | "likes" | "comments" | "shares" | "date";

interface SortConfig {
    field: SortField;
    direction: "asc" | "desc";
}

interface EditVisibleVideosModalProps {
    allVideoMetrics: VideoMetric[];
    initialHiddenVideoIds: string[];
    onSave: (hiddenVideoIds: string[]) => void;
    onCancel: () => void;
    open: boolean;
    isSaving?: boolean;
}

export function EditVisibleVideosModal({
    allVideoMetrics,
    initialHiddenVideoIds,
    onSave,
    onCancel,
    open,
    isSaving = false,
}: EditVisibleVideosModalProps) {
    // Track which videos are hidden with state
    const [hiddenVideoIds, setHiddenVideoIds] = useState<string[]>(initialHiddenVideoIds);

    // Add search state for filtering
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [itemsPerPage, setItemsPerPage] = useState<number>(5);

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setHiddenVideoIds(initialHiddenVideoIds);
            setSearchQuery("");
            setCurrentPage(0);
        }
    }, [open, initialHiddenVideoIds]);

    // Add sort state
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: "views",
        direction: "desc"
    });

    // Toggle a video's hidden status
    const toggleVideoVisibility = (videoId: string) => {
        setHiddenVideoIds((prev) =>
            prev.includes(videoId)
                ? prev.filter((id) => id !== videoId)
                : [...prev, videoId]
        );
    };

    // Handle save action
    const handleSave = () => {
        onSave(hiddenVideoIds);
    };

    // Handle sort action
    const handleSort = (field: SortField) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc"
        }));
    };

    // Filter videos based on search query
    const filteredVideos = allVideoMetrics.filter(video => {
        if (!searchQuery) return true;
        
        const lowerCaseQuery = searchQuery.toLowerCase();
        return (
            video.videoInfo?.videoName?.toLowerCase().includes(lowerCaseQuery) ||
            video.videoInfo?.campaign?.campaignName?.toLowerCase().includes(lowerCaseQuery)
        );
    });

    // Apply sorting to filtered video metrics
    const sortedVideos = [...filteredVideos].sort((a, b) => {
        const direction = sortConfig.direction === "asc" ? 1 : -1;

        switch (sortConfig.field) {
            case "views":
                return (a.views - b.views) * direction;
            case "likes":
                return (a.likes - b.likes) * direction;
            case "comments":
                return (a.comments - b.comments) * direction;
            case "shares":
                return (a.shares - b.shares) * direction;
            case "date":
                return (new Date(a.videoInfo?.createdAt || 0).getTime() - new Date(b.videoInfo?.createdAt || 0).getTime()) * direction;
            default:
                return 0;
        }
    });

    // Pagination calculations
    const totalVideos = sortedVideos.length;
    const totalPages = Math.ceil(totalVideos / itemsPerPage);

    // Ensure current page is valid when filtered results change
    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1);
        }
    }, [sortedVideos.length, itemsPerPage, currentPage, totalPages]);

    // Pagination navigation handlers
    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(0, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
    };

    // Apply pagination to the sorted and filtered videos
    const paginatedVideos = sortedVideos.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    // Calculate pagination information
    const startItem = totalVideos > 0 ? currentPage * itemsPerPage + 1 : 0;
    const endItem = totalVideos > 0 ? Math.min((currentPage + 1) * itemsPerPage, totalVideos) : 0;

    // Helper to render sort indicator
    const renderSortIndicator = (field: SortField) => {
        if (sortConfig.field !== field) return null;

        return sortConfig.direction === "desc"
            ? <ArrowDown className="h-3 w-3 ml-1" />
            : <ArrowUp className="h-3 w-3 ml-1" />;
    };

    // Count of visible videos (not in hiddenVideoIds)
    const visibleCount = allVideoMetrics.length - hiddenVideoIds.length;
    const totalCount = allVideoMetrics.length;
    
    // Count of visible videos from the filtered results
    const filteredVisibleCount = sortedVideos.filter(video => video.videoInfo?.id && !hiddenVideoIds.includes(video.videoInfo.id)).length;
    const filteredCount = sortedVideos.length;

    // Bulk selection functions
    const selectAllVisible = () => {
        // Remove all currently filtered/visible videos from hiddenVideoIds
        const visibleVideoIds = sortedVideos.map(video => video.videoInfo?.id).filter(Boolean);
        setHiddenVideoIds(prev => prev.filter(id => !visibleVideoIds.includes(id)));
    };

    const deselectAllVisible = () => {
        // Add all currently filtered/visible videos to hiddenVideoIds
        const visibleVideoIds = sortedVideos.map(video => video.videoInfo?.id).filter(Boolean);
        setHiddenVideoIds(prev => {
            // Create a Set of all hidden IDs to avoid duplicates
            const hiddenSet = new Set(prev);
            visibleVideoIds.forEach(id => id && hiddenSet.add(id));
            return Array.from(hiddenSet);
        });
    };

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        const newItemsPerPage = parseInt(value);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(0); // Reset to first page when changing items per page
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="sm:max-w-[620px]">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                        <span>Manage Visible Videos</span>
                        <Badge variant="outline" className="ml-2">
                            {visibleCount} of {totalCount} visible
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                {/* Search input */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search videos or campaigns..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Sort controls and bulk actions */}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                        <div className="text-sm text-muted-foreground mr-2 flex items-center">Sort by:</div>
                        {[
                            { field: "views", label: "Views" },
                            { field: "likes", label: "Likes" },
                            { field: "comments", label: "Comments" },
                            { field: "shares", label: "Shares" },
                            { field: "date", label: "Date" }
                        ].map(({ field, label }) => (
                            <Button
                                key={field}
                                variant={sortConfig.field === field ? "secondary" : "outline"}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleSort(field as SortField)}
                            >
                                {label}
                                {renderSortIndicator(field as SortField)}
                            </Button>
                        ))}
                    </div>
                    
                    {/* Bulk selection actions with filtered count */}
                    <div className="flex justify-between items-center mt-1">
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={selectAllVisible}
                            >
                                Select All
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={deselectAllVisible}
                            >
                                Deselect All
                            </Button>
                        </div>
                        
                        {/* {searchQuery && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                                {filteredVisibleCount} of {filteredCount} visible in search
                            </Badge>
                        )} */}
                    </div>
                </div>

                {/* Pagination controls */}
                <div className="flex justify-between items-center text-sm border-b pb-2">
                    <div className="text-muted-foreground">
                        {totalVideos > 0 ? (
                            `Showing ${startItem} - ${endItem} of ${totalVideos} videos`
                        ) : (
                            "No videos found"
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 mr-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Items per page:</span>
                            <Select 
                                value={itemsPerPage.toString()} 
                                onValueChange={handleItemsPerPageChange}
                            >
                                <SelectTrigger className="h-7 w-16 text-xs">
                                    <SelectValue placeholder={itemsPerPage.toString()} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="15">15</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2"
                            disabled={currentPage === 0}
                            onClick={handlePreviousPage}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2"
                            disabled={currentPage >= totalPages - 1 || totalPages === 0}
                            onClick={handleNextPage}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto py-4">
                    <div className="space-y-4">
                        {paginatedVideos.map((video) => {
                            const isHidden = video.videoInfo?.id ? hiddenVideoIds.includes(video.videoInfo.id) : false;
                            return (
                                <div
                                    key={video.id}
                                    className={cn(
                                        "flex items-center space-x-4 rounded-md border p-3 transition-colors",
                                        isHidden
                                            ? "bg-muted/50 hover:bg-muted/70"
                                            : "hover:bg-accent/50"
                                    )}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`video-${video.id}`}
                                            checked={!isHidden}
                                            onCheckedChange={() => video.videoInfo?.id && toggleVideoVisibility(video.videoInfo.id)}
                                        />
                                        <Label
                                            htmlFor={`video-${video.id}`}
                                            className="text-xs font-medium cursor-pointer"
                                        >
                                            {isHidden ? (
                                                <span className="flex items-center text-muted-foreground">
                                                    <EyeOff className="h-3 w-3 mr-1" />
                                                    Hidden
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Visible
                                                </span>
                                            )}
                                        </Label>
                                    </div>
                                    {video.videoInfo?.videoUrl && (
                                        <div className="h-20 w-20 overflow-hidden rounded-lg border border-border shadow-sm transition-all hover:shadow-md">
                                            <video
                                                src={video.videoInfo?.videoUrl}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <h4 className={cn(
                                                "text-sm font-semibold truncate mr-2 group-hover:text-primary transition-colors",
                                                isHidden && "text-muted-foreground"
                                            )}>
                                                {video.videoInfo?.videoName || "Untitled Video"}
                                            </h4>
                                            {video.videoInfo?.createdAt && (
                                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground whitespace-nowrap">
                                                    {(video.videoInfo.createdAt instanceof Date ? video.videoInfo.createdAt : new Date(video.videoInfo.createdAt)).toLocaleDateString("en-US", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                        hour12: true
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-3 text-xs">
                                            <span className="flex items-center bg-primary/5 px-2 py-1 rounded-md text-muted-foreground">
                                                <Eye className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                                                <span className="font-medium">{video.views.toLocaleString()}</span>
                                            </span>
                                            <span className="flex items-center bg-primary/5 px-2 py-1 rounded-md text-muted-foreground">
                                                <ThumbsUp className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                                                <span className="font-medium">{video.likes.toLocaleString()}</span>
                                            </span>
                                            <span className="flex items-center bg-primary/5 px-2 py-1 rounded-md text-muted-foreground">
                                                <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                                                <span className="font-medium">{video.comments.toLocaleString()}</span>
                                            </span>
                                            <span className="flex items-center bg-primary/5 px-2 py-1 rounded-md text-muted-foreground">
                                                <Share2 className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                                                <span className="font-medium">{video.shares.toLocaleString()}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {paginatedVideos.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground">
                                <p>No videos found matching the current criteria.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination controls for mobile (smaller screens) */}
                <div className="sm:hidden flex justify-between items-center pb-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-20"
                        disabled={currentPage === 0}
                        onClick={handlePreviousPage}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                        Page {totalPages > 0 ? currentPage + 1 : 0} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-20"
                        disabled={currentPage >= totalPages - 1 || totalPages === 0}
                        onClick={handleNextPage}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            `Save Changes (${visibleCount} videos)`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 