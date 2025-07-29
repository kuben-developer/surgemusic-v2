"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import {
    Eye,
    Heart,
    MessageSquare,
    Share2,
    Pencil,
    Trash2,
    ChevronLeft,
    Loader2,
    RefreshCcw,
    Copy,
    CheckCheck,
    EyeOff,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { KpiMetricsGrid } from "@/components/analytics/KpiMetricsGrid";
import { PerformanceChartCard } from "@/components/analytics/PerformanceChartCard";
import type { MetricKey, MetricInfo } from "@/components/analytics/PerformanceChartCard";
import { TopContentCard } from "@/components/analytics/TopContentCard";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EditVisibleVideosModal } from "@/components/analytics/EditVisibleVideosModal";
import { CommentsSection } from "@/components/analytics/CommentsSection";

// Define the types for our analytics data
interface Campaign {
    id: string;
    campaignName: string;
}

interface VideoInfo {
    id: string;
    postId: string | null;
    videoUrl: string;
    videoName: string;
    videoType: string;
    createdAt: Date;
    campaign: Campaign;
}

interface VideoMetric {
    id: string;
    videoInfo: VideoInfo;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: string;
}

interface Report {
    id: string;
    name: string;
    createdAt: Date;
    campaigns: Campaign[];
}

interface DailyData {
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
}

interface Totals {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    [key: string]: number; // Allow indexing by string
}

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

// Metric info for consistent styling and icons
const metricInfo: Record<MetricKey, MetricInfo> = {
    views: {
        label: "Views",
        icon: <Eye className="h-4 w-4" />,
        color: "#10B981",
        description: "Total number of content views"
    },
    likes: {
        label: "Likes",
        icon: <Heart className="h-4 w-4" />,
        color: "#F59E0B",
        description: "Engagement through likes"
    },
    comments: {
        label: "Comments",
        icon: <MessageSquare className="h-4 w-4" />,
        color: "#EF4444",
        description: "User feedback and comments"
    },
    shares: {
        label: "Shares",
        icon: <Share2 className="h-4 w-4" />,
        color: "#3B82F6",
        description: "Content redistribution"
    }
};

// Helper function to calculate growth percentages
const calculateGrowth = (data: DailyData[], metric: MetricKey | 'engagement'): { value: number, isPositive: boolean } => {
    if (!data || data.length < 2) return { value: 0, isPositive: true };

    const halfPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, halfPoint);
    const secondHalf = data.slice(halfPoint);

    const calculateTotal = (arr: DailyData[]) => arr.reduce((sum, day) => {
        if (metric === 'engagement') {
            const dailyEng = ((day.likes + day.comments + day.shares) / Math.max(day.views, 1)) * 100;
            return sum + (isNaN(dailyEng) ? 0 : dailyEng);
        } else {
            return sum + (day[metric as MetricKey] || 0);
        }
    }, 0);

    const firstHalfTotal = calculateTotal(firstHalf);
    const secondHalfTotal = calculateTotal(secondHalf);

    if (metric === 'engagement') {
        const firstHalfAvg = firstHalf.length > 0 ? firstHalfTotal / firstHalf.length : 0;
        const secondHalfAvg = secondHalf.length > 0 ? secondHalfTotal / secondHalf.length : 0;
        if (firstHalfAvg === 0) return { value: secondHalfAvg > 0 ? 100 : 0, isPositive: true };
        const growthPercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
        return {
            value: Math.abs(Math.round(growthPercent * 10) / 10),
            isPositive: growthPercent >= 0
        };
    } else {
        if (firstHalfTotal === 0) return { value: secondHalfTotal > 0 ? 100 : 0, isPositive: true };
        const growthPercent = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
        return {
            value: Math.abs(Math.round(growthPercent * 10) / 10),
            isPositive: growthPercent >= 0
        };
    }
};

export function ReportAnalyticsClient() {
    const params = useParams();
    const router = useRouter();
    const reportId = params.id as string;
    const [dateRange, setDateRange] = useState<string>("30");
    const [activeMetric, setActiveMetric] = useState<MetricKey>("views");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5; // Number of items to show per page
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
    const deleteButtonRef = useRef<HTMLButtonElement>(null);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [isSharing, setIsSharing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isEditVideosModalOpen, setIsEditVideosModalOpen] = useState(false);

    // Fetch report details
    const { data: report, isLoading: isLoadingReport } = api.reports.get.useQuery(
        { id: reportId },
        { enabled: !!reportId }
    );

    // Fetch report analytics data
    const {
        data: analyticsData,
        isLoading: isLoadingAnalytics,
        refetch: refetchAnalytics
    } = api.reports.getAnalytics.useQuery(
        {
            id: reportId,
            days: parseInt(dateRange)
        },
        { enabled: !!reportId }
    );

    // Delete report mutation
    const deleteMutation = api.reports.delete.useMutation({
        onSuccess: (data: { name: string }) => {
            toast.success(`Report "${data.name}" deleted successfully.`);
            setIsDeleteDialogOpen(false);
            router.push('/reports');
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete report: ${error.message}`);
            setIsDeleteDialogOpen(false);
        },
    });

    // Add the share report mutation
    const { mutate: shareReport } = api.reports.share.useMutation({
        onSuccess: (data: { shareUrl: string }) => {
            setShareUrl(data.shareUrl);
            setIsSharing(false);
            setIsShareDialogOpen(true);
        },
        onError: (error: Error) => {
            toast.error(`Failed to generate sharing link: ${error.message}`);
            setIsSharing(false);
        }
    });

    // Add the update hidden videos mutation
    const updateHiddenVideosMutation = api.reports.updateHiddenVideos.useMutation({
        onSuccess: () => {
            toast.success("Video visibility updated successfully");
            void refetchAnalytics();
            setIsEditVideosModalOpen(false);
        },
        onError: (error: Error) => {
            toast.error(`Failed to update video visibility: ${error.message}`);
        }
    });

    // Handle keyboard events for the delete dialog
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Close dialog on Escape key
            if (e.key === 'Escape' && isDeleteDialogOpen) {
                setIsDeleteDialogOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDeleteDialogOpen]);

    // Focus management for dialog
    useEffect(() => {
        if (!isDeleteDialogOpen && deleteButtonRef.current) {
            // Return focus to delete button when dialog closes
            deleteButtonRef.current.focus();
        }
    }, [isDeleteDialogOpen]);

    const handleDateRangeChange = (value: string) => {
        setDateRange(value);
    };

    const handleDeleteReport = () => {
        if (reportId) {
            deleteMutation.mutate({ id: reportId });
        }
    };

    const refreshAnalytics = async () => {
        setIsRefreshing(true);
        try {
            await refetchAnalytics();
            toast.success("Analytics data refreshed");
        } catch (error) {
            toast.error("Failed to refresh analytics data");
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleCampaignChange = (campaignId: string, isChecked: boolean) => {
        // This function is just a placeholder since we're not implementing campaign filtering
        // in this report view. The component requires it, but it won't actually filter
        console.log("Campaign change:", campaignId, isChecked);
    };

    const handleResetCampaigns = () => {
        // This function is just a placeholder since we're not implementing campaign filtering
        // in this report view. The component requires it, but it won't actually reset
        console.log("Reset campaigns");
    };

    // Function to handle sharing the report
    const handleShareReport = () => {
        if (!reportId) return;

        setIsSharing(true);
        shareReport({ id: reportId });
    };

    // Function to copy the share URL to clipboard
    const copyToClipboard = () => {
        if (!shareUrl) return;

        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                setIsCopied(true);
                toast.success("Link copied to clipboard");
                setTimeout(() => setIsCopied(false), 3000);
            })
            .catch((err) => {
                toast.error("Failed to copy link");
                console.error("Failed to copy: ", err);
            });
    };

    // Function to handle saving hidden videos
    const handleSaveHiddenVideos = (newHiddenVideoIds: string[]) => {
        if (!reportId) return;

        updateHiddenVideosMutation.mutate({
            reportId,
            hiddenVideoIds: newHiddenVideoIds
        });
    };

    // Loading state
    if ((isLoadingReport || isLoadingAnalytics) && (!report || !analyticsData)) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 bg-muted rounded-lg w-1/3"></div>
                    <div className="h-8 bg-muted rounded-lg w-1/4"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 bg-muted rounded-lg" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-[500px] bg-muted rounded-lg" />
                    <div className="h-[500px] bg-muted rounded-lg" />
                </div>
            </div>
        );
    }

    // Error state
    if (!isLoadingReport && !isLoadingAnalytics && (!report || !analyticsData)) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-2">Report Not Found</h1>
                <p className="text-muted-foreground mb-4">Could not load the requested report.</p>
                <Button asChild>
                    <Link href="/reports">Back to Reports</Link>
                </Button>
            </div>
        );
    }

    // Process data
    const { dailyData = [], avgEngagementRate = "0", videoMetrics = [], hiddenVideoIds = [], lastUpdatedAt, totals = { views: 0, likes: 0, comments: 0, shares: 0 } } = analyticsData ?? {};

    // Store all videos (including hidden ones) for the modal
    const allVideoMetrics = [...videoMetrics];

    console.log("analyticsData", analyticsData);

    // Filter out hidden videos from videoMetrics for display
    const visibleVideoMetrics = videoMetrics.filter(
        vm => !hiddenVideoIds.includes(vm.videoInfo.id)
    );

    const viewsGrowth = calculateGrowth(dailyData, 'views');
    const likesGrowth = calculateGrowth(dailyData, 'likes');
    const commentsGrowth = calculateGrowth(dailyData, 'comments');
    const sharesGrowth = calculateGrowth(dailyData, 'shares');
    const engagementGrowth = calculateGrowth(dailyData, 'engagement');

    const totalVideos = visibleVideoMetrics.length;
    const campaignCount = report?.campaigns.length || 0;

    // Handle the case where the report has no campaigns
    if (campaignCount === 0) {
        return (
            <div className="pt-8 pb-16 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="p-0" asChild>
                                <Link href="/reports">
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="sr-only">Back to Reports</span>
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-bold">{report?.name}</h1>
                        </div>
                        <p className="text-muted-foreground">This report has no campaigns</p>
                    </div>
                    <div className="flex gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" asChild>
                                        <Link href={`/reports/${reportId}/edit`}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit Report
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit report name and included campaigns</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                        ref={deleteButtonRef}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Report
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Permanently delete this report</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <Card className="p-8 text-center">
                    <div className="space-y-4 max-w-md mx-auto">
                        <h2 className="text-xl font-semibold">No Analytics Available</h2>
                        <p className="text-muted-foreground">
                            This report doesn't have any campaigns assigned to it.
                            Please edit the report to add campaigns for analytics visualization.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href={`/reports/${reportId}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Report
                            </Link>
                        </Button>
                    </div>
                </Card>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Report</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <span className="font-semibold">{report?.name}</span>?
                                <br /><br />
                                This will permanently remove the report and all associated analytics views.
                                <br />
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteReport}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
                                disabled={deleteMutation.isPending}
                                aria-label="Delete report permanently"
                            >
                                {deleteMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>Delete</>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
    }

    return (
        <div className="pt-8 pb-16 space-y-8">
            {/* Report Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" asChild>
                            <Link href="/reports" className="flex items-center">
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">Back to Reports</span>
                            </Link>
                        </Button>

                    </div>
                </div>
                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" asChild>
                                    <Link href={`/reports/${reportId}/edit`}>
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit Report
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit report name and included campaigns</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    onClick={handleShareReport}
                                    disabled={isSharing}
                                >
                                    {isSharing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Share Report
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Create a shareable link for this report</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditVideosModalOpen(true)}
                                    ref={deleteButtonRef}
                                >
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Hide Videos
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Hide videos from the report</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    ref={deleteButtonRef}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Report
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Permanently delete this report</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Analytics Header with date selector */}
            <AnalyticsHeader
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                selectedCampaigns={selectedCampaigns}
                onCampaignChange={handleCampaignChange}
                onResetCampaigns={handleResetCampaigns}
                allCampaigns={report?.campaigns}
                onRefresh={refreshAnalytics}
                isRefreshing={isRefreshing}
                campaignCount={campaignCount}
                reportName={report?.name}
                lastUpdatedAt={lastUpdatedAt}
            />

            {/* KPI Metrics */}
            <KpiMetricsGrid
                totals={totals}
                campaignsCount={campaignCount}
                totalVideos={totalVideos}
                viewsGrowth={viewsGrowth}
                likesGrowth={likesGrowth}
                commentsGrowth={commentsGrowth}
                engagementGrowth={engagementGrowth}
                avgEngagementRate={avgEngagementRate}
                sharesGrowth={sharesGrowth}
            />

            {/* Performance Charts and Top Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PerformanceChartCard
                    dailyData={dailyData}
                    totals={totals}
                    activeMetric={activeMetric}
                    setActiveMetric={setActiveMetric}
                    metricInfo={metricInfo}
                    dateRange={dateRange}
                    viewsGrowth={viewsGrowth}
                    likesGrowth={likesGrowth}
                    commentsGrowth={commentsGrowth}
                    sharesGrowth={sharesGrowth}
                />

                {/* Show top content only if there are visible videos */}
                {visibleVideoMetrics.length > 0 ? (
                    <div className="flex flex-col">
                        <TopContentCard
                            videoMetrics={visibleVideoMetrics}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            hiddenVideoIds={hiddenVideoIds}
                        />
                    </div>
                ) : (
                    <Card className="p-6 border border-primary/10">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold">Top Performing Content</h3>
                            <p className="text-sm text-muted-foreground">No videos found for this report</p>
                        </div>
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="rounded-full bg-muted p-3 mb-3">
                                <Eye className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h4 className="text-lg font-medium mb-2">No Content Available</h4>
                            <p className="text-sm text-muted-foreground max-w-md">
                                There's no content data available for the selected report and time period.
                            </p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Comments Section */}
            <CommentsSection 
                campaignIds={report?.campaigns.map((c: Campaign) => c.id)}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Report</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold">{report?.name}</span>?
                            <br /><br />
                            This will permanently remove the report and all associated analytics views.
                            <br />
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteReport}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
                            disabled={deleteMutation.isPending}
                            aria-label="Delete report permanently"
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>Delete</>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Share Dialog */}
            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share Report</DialogTitle>
                        <DialogDescription>
                            Anyone with this link can view the report without needing to log in.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 mt-4">
                        <div className="grid flex-1 gap-2">
                            <Input
                                id="shareUrl"
                                readOnly
                                value={shareUrl}
                                className="w-full"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            className="px-3"
                            onClick={copyToClipboard}
                        >
                            {isCopied ? (
                                <><CheckCheck className="h-4 w-4 mr-2" /> Copied</>
                            ) : (
                                <><Copy className="h-4 w-4 mr-2" /> Copy</>
                            )}
                        </Button>
                    </div>
                    <DialogFooter className="sm:justify-start mt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsShareDialogOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Visible Videos Modal */}
            <EditVisibleVideosModal
                allVideoMetrics={allVideoMetrics}
                initialHiddenVideoIds={hiddenVideoIds}
                onSave={handleSaveHiddenVideos}
                onCancel={() => setIsEditVideosModalOpen(false)}
                open={isEditVideosModalOpen}
                isSaving={updateHiddenVideosMutation.isPending}
            />
        </div>
    );
} 