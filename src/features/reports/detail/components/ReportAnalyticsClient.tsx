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
import { useState, useEffect } from "react";
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
import { useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EditVisibleVideosModal } from "@/components/analytics/EditVisibleVideosModal";
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { KpiMetricsGrid } from "@/components/analytics/KpiMetricsGrid";
import { PerformanceChartCard } from "@/components/analytics/PerformanceChartCard";
import { TopContentCard } from "@/components/analytics/TopContentCard";
import type { GrowthData, Report, ReportAnalyticsData, VideoMetric, MetricKey, MetricInfo, DailyData, Totals } from "../../shared/types/report.types";
import { calculateGrowth } from "../../shared/utils/report.utils";
import { CommentsSection } from "@/components/analytics/CommentsSection";

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
        color: "text-blue-500",
        description: "Total video views"
    },
    likes: {
        label: "Likes",
        icon: <Heart className="h-4 w-4" />,
        color: "text-red-500",
        description: "Total likes received"
    },
    comments: {
        label: "Comments",
        icon: <MessageSquare className="h-4 w-4" />,
        color: "text-green-500",
        description: "Total comments received"
    },
    shares: {
        label: "Shares",
        icon: <Share2 className="h-4 w-4" />,
        color: "text-purple-500",
        description: "Total shares received"
    }
};



// Loading skeleton component
const LoadingSkeleton = () => (
    <div className="container max-w-7xl mx-auto py-12 px-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/2 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
        </div>
    </div>
);

// Error state component
const ErrorState = ({ message }: { message: string }) => (
    <div className="container max-w-7xl mx-auto py-12 px-4">
        <div className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Error Loading Report</h1>
            <p className="text-muted-foreground mb-4">{message}</p>
            <Button asChild>
                <Link href="/reports">Back to Reports</Link>
            </Button>
        </div>
    </div>
);

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
    const report = useQuery(api.reports.get, reportId ? { id: reportId as Id<"reports"> } : "skip");
    const isLoadingReport = report === undefined;

    // Fetch report analytics data  
    const getReportAnalytics = useAction(api.analytics.getReportAnalytics);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
    
    const refetchAnalytics = async () => {
        if (!reportId) return;
        setIsLoadingAnalytics(true);
        try {
            const data = await getReportAnalytics({ id: reportId as Id<"reports">, days: parseInt(dateRange) });
            setAnalyticsData(data);
        } finally {
            setIsLoadingAnalytics(false);
        }
    };
    
    useEffect(() => {
        refetchAnalytics();
    }, [reportId, dateRange]);

    // Delete report mutation
    const deleteMutation = useMutation(api.reports.deleteReport);

    // Add the share report mutation
    const shareReport = useMutation(api.reports.share);

    // Add the update hidden videos mutation
    const updateHiddenVideosMutation = useMutation(api.reports.updateHiddenVideos);

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

    const handleDeleteReport = async () => {
        if (reportId) {
            try {
                const data = await deleteMutation({ id: reportId as Id<"reports"> });
                toast.success(`Report "${data.name}" deleted successfully.`);
                setIsDeleteDialogOpen(false);
                router.push('/reports');
            } catch (error) {
                toast.error(`Failed to delete report: ${(error as Error).message}`);
                setIsDeleteDialogOpen(false);
            }
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
    const handleShareReport = async () => {
        if (!reportId) return;

        setIsSharing(true);
        try {
            const data = await shareReport({ id: reportId as Id<"reports"> });
            setShareUrl(data.shareUrl);
            setIsSharing(false);
            setIsShareDialogOpen(true);
        } catch (error) {
            toast.error(`Failed to generate sharing link: ${(error as Error).message}`);
            setIsSharing(false);
        }
    };

    // Copy share link to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            toast.error("Failed to copy link");
        }
    };

    // Function to handle saving hidden videos
    const handleSaveHiddenVideos = async (newHiddenVideoIds: string[]) => {
        if (!reportId) return;

        try {
            await updateHiddenVideosMutation({
                reportId: reportId as Id<"reports">,
                hiddenVideoIds: newHiddenVideoIds as Id<"generatedVideos">[]
            });
            toast.success("Video visibility updated successfully");
            void refetchAnalytics();
            setIsEditVideosModalOpen(false);
        } catch (error) {
            toast.error(`Failed to update video visibility: ${(error as Error).message}`);
        }
    };

    // Loading state
    if (isLoadingReport || isLoadingAnalytics) {
        return <LoadingSkeleton />;
    }

    // Error state
    if (!report || !analyticsData) {
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
        (vm: any) => !hiddenVideoIds.includes(vm.videoInfo.id)
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
            <div className="container max-w-7xl mx-auto py-12 px-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">{report.name}</h1>
                    <p className="text-muted-foreground mb-6">This report has no campaigns associated with it.</p>
                    <div className="flex gap-4 justify-center">
                        <Button asChild variant="outline">
                            <Link href={`/reports/${reportId}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Report
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/reports">Back to Reports</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="container max-w-7xl mx-auto py-12 px-4 space-y-8"
        >
            <motion.div variants={fadeInUp} className="flex items-center justify-between">
                <div>
                    <Link href="/reports" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Reports
                    </Link>
                    <h1 className="text-3xl font-bold">{report.name}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditVideosModalOpen(true)}
                        className="gap-2"
                    >
                        <EyeOff className="h-4 w-4" />
                        Manage Videos
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShareReport}
                        disabled={isSharing}
                        className="gap-2"
                    >
                        {isSharing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating Link...
                            </>
                        ) : (
                            <>
                                <Share2 className="h-4 w-4" />
                                Share Report
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                    >
                        <Link href={`/reports/${reportId}/edit`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>
                    <Button
                        ref={deleteButtonRef}
                        onClick={() => setIsDeleteDialogOpen(true)}
                        variant="destructive"
                        size="sm"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
                        disabled={false}
                        aria-label="Delete report permanently"
                    >
                        {false ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>

            <AnalyticsHeader
                selectedCampaigns={selectedCampaigns}
                onCampaignChange={handleCampaignChange}
                onResetCampaigns={handleResetCampaigns}
                allCampaigns={report.campaigns.map((c: any) => ({
                    id: c.id,
                    campaignName: c.campaignName
                }))}
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onRefresh={refreshAnalytics}
                isRefreshing={isRefreshing}
                campaignCount={campaignCount}
                reportName={report.name}
                lastUpdatedAt={lastUpdatedAt}
            />

            <KpiMetricsGrid
                totals={totals}
                totalVideos={totalVideos}
                avgEngagementRate={avgEngagementRate}
                campaignsCount={campaignCount}
                viewsGrowth={viewsGrowth}
                likesGrowth={likesGrowth}
                commentsGrowth={commentsGrowth}
                sharesGrowth={sharesGrowth}
                engagementGrowth={engagementGrowth}
            />

            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                <TopContentCard
                    videoMetrics={visibleVideoMetrics}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </motion.div>

            {/* Comments Section */}
            <motion.div variants={fadeInUp}>
                <CommentsSection 
                    campaignIds={report.campaigns.map((c: any) => c.id)}
                />
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog 
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the report "{report.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteReport}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive"
                            disabled={false}
                            aria-label="Delete report permanently"
                        >
                            {false ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Report'
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
                            Anyone with this link can view your report without logging in.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <input
                                id="link"
                                defaultValue={shareUrl}
                                readOnly
                                className="w-full p-2 text-sm border rounded-md bg-muted"
                            />
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            className="px-3"
                            onClick={copyToClipboard}
                        >
                            {isCopied ? (
                                <CheckCheck className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Videos Modal */}
            <EditVisibleVideosModal
                allVideoMetrics={allVideoMetrics}
                initialHiddenVideoIds={hiddenVideoIds}
                onSave={handleSaveHiddenVideos}
                onCancel={() => setIsEditVideosModalOpen(false)}
                open={isEditVideosModalOpen}
                isSaving={false}
            />
        </motion.div>
    );
}