'use client';

import { KpiMetricsGrid } from '@/components/analytics/KpiMetricsGrid';
import { PerformanceChartCard, MetricKey, MetricInfo } from '@/components/analytics/PerformanceChartCard';
import { TopContentCard } from '@/components/analytics/TopContentCard';
import { CommentsSection } from '@/components/analytics/CommentsSection';
import { AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/react';
import { motion } from "framer-motion";
import { AlertCircle, Ban, Clock, Eye, Heart, Link2Off, MessageSquare, RefreshCw, Server, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from "next-themes"
import { ThemeSwitcher } from "@/components/theme-switcher";

// Type for error handling
type ErrorType = 'NOT_FOUND' | 'EXPIRED' | 'SERVER_ERROR' | 'NETWORK' | 'UNKNOWN';

// Helper to determine error type from error message
const getErrorType = (error: any): ErrorType => {
  if (!error) return 'UNKNOWN';

  const message = error.message?.toLowerCase() || '';

  if (message.includes('not found') || message.includes('no such')) {
    return 'NOT_FOUND';
  } else if (message.includes('expired')) {
    return 'EXPIRED';
  } else if (message.includes('network') || message.includes('fetch')) {
    return 'NETWORK';
  } else if (message.includes('server') || message.includes('internal')) {
    return 'SERVER_ERROR';
  }

  return 'UNKNOWN';
};

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
const calculateGrowth = (data: any[], metric: MetricKey | 'engagement'): { value: number, isPositive: boolean } => {
  if (!data || data.length < 2) return { value: 0, isPositive: true };

  const halfPoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, halfPoint);
  const secondHalf = data.slice(halfPoint);

  const calculateTotal = (arr: any[]) => arr.reduce((sum, day) => {
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

export function PublicReportContent() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.share_id as string;
  const [dateRange, setDateRange] = useState<string>("30");
  const [retryCount, setRetryCount] = useState(0);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("views");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5; // Number of items to show per page in the top content section

  // Validate share ID format
  useEffect(() => {
    const validShareIdRegex = /^[a-zA-Z0-9_-]{16,64}$/;
    if (shareId && !validShareIdRegex.test(shareId)) {
      toast.error("Invalid share ID format");
      router.push('/public/reports');
    }
  }, [shareId, router]);

  // Use TRPC to fetch the shared report data
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isRefetching
  } = api.public.getSharedReport.useQuery({
    shareId,
    days: parseInt(dateRange, 10)
  }, {
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
    enabled: !!shareId && shareId.length >= 16
  });

  // Log errors in console
  useEffect(() => {
    if (error) {
      console.error("Error fetching shared report:", error);
    }
  }, [error]);

  // Handle retry logic
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
    toast.info("Retrying to fetch report data...");
  };

  // Calculate growth metrics for visualizations
  const viewsGrowth = data?.dailyData ? calculateGrowth(data.dailyData, 'views') : { value: 0, isPositive: true };
  const likesGrowth = data?.dailyData ? calculateGrowth(data.dailyData, 'likes') : { value: 0, isPositive: true };
  const commentsGrowth = data?.dailyData ? calculateGrowth(data.dailyData, 'comments') : { value: 0, isPositive: true };
  const sharesGrowth = data?.dailyData ? calculateGrowth(data.dailyData, 'shares') : { value: 0, isPositive: true };
  const engagementGrowth = data?.dailyData ? calculateGrowth(data.dailyData, 'engagement') : { value: 0, isPositive: true };

  // Filter out hidden videos from videoMetrics for display
  const visibleVideoMetrics = data?.videoMetrics?.filter(
    vm => !data.hiddenVideoIds?.includes(vm.videoInfo.id)
  ) || [];

  // Calculate totals from visible videos only
  const totals = data?.totals

  const totalVideos = data?.totals.totalVideos
  const campaignCount = data?.campaigns?.length || 0;

  // Loading state with progressive enhancement
  if (isLoading || isRefetching) {
    return (
      <>
        <Header />
        <div className="space-y-8 animate-pulse">
          <div className="flex items-center justify-center space-x-3 py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span className="text-lg">
              {isRefetching ? "Refreshing report data..." : "Loading shared report..."}
            </span>
          </div>

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
      </>
    );
  }

  // Error state with specific error messages based on error type
  if (isError) {
    const errorType = getErrorType(error);

    let icon = <AlertCircle className="h-6 w-6" />;
    let title = "Error";
    let description = "An error occurred while loading the report.";

    switch (errorType) {
      case 'NOT_FOUND':
        icon = <Ban className="h-6 w-6" />;
        title = "Report Not Found";
        description = "The shared report you're looking for doesn't exist or has been deleted.";
        break;
      case 'EXPIRED':
        icon = <Clock className="h-6 w-6" />;
        title = "Share Link Expired";
        description = "This report share link has expired or been revoked by the owner.";
        break;
      case 'NETWORK':
        icon = <Link2Off className="h-6 w-6" />;
        title = "Network Error";
        description = "Unable to connect to the server. Please check your internet connection.";
        break;
      case 'SERVER_ERROR':
        icon = <Server className="h-6 w-6" />;
        title = "Server Error";
        description = "Our server encountered an issue. The team has been notified.";
        break;
    }

    return (
      <>
        <Header />
        <div className="container max-w-xl mx-auto py-8">
          <Card className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                {icon}
              </div>
              <AlertTitle className="text-xl font-semibold">{title}</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                {error?.message || description}
              </AlertDescription>
              <div className="flex gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/public/reports')}
                >
                  Back to Reports
                </Button>
                <Button
                  onClick={handleRetry}
                  disabled={retryCount >= 3}
                >
                  {retryCount >= 3 ? "Too Many Retries" : "Try Again"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // Empty data state
  if (!data || !data.reportName) {
    return (
      <>
        <Header />
        <div className="container max-w-xl mx-auto py-8">
          <Card className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <AlertCircle className="h-6 w-6" />
              </div>
              <AlertTitle className="text-xl font-semibold">No Data Available</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                This report doesn't contain any data or may have been deleted.
              </AlertDescription>
              <Button
                variant="outline"
                onClick={() => router.push('/public/reports')}
                className="mt-4"
              >
                Back to Reports
              </Button>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // Content state with visualizations
  return (
    <>
      <Header />
      <motion.div
        className="pt-8 pb-16 space-y-8"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Report Header */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{data.reportName}</h1>
            <p className="text-muted-foreground">
              Report created on {new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }).format(new Date(data.reportCreatedAt))}
            </p>
          </div>

          {/* Date range selector */}
          <div className="mt-2 sm:mt-0 inline-flex items-center rounded-md border px-3 py-1 text-sm">
            <span className="mr-2 text-muted-foreground">Time Range:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent outline-none"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </motion.div>

        {/* KPI Metrics Grid */}
        <motion.section variants={fadeInUp} className="space-y-2">
          <h2 className="text-xl font-semibold">Performance Summary</h2>
          <KpiMetricsGrid
            campaignsCount={campaignCount}
            totalVideos={totalVideos}
            totals={totals}
            viewsGrowth={viewsGrowth}
            likesGrowth={likesGrowth}
            commentsGrowth={commentsGrowth}
            engagementGrowth={engagementGrowth}
            avgEngagementRate={data.avgEngagementRate}
            sharesGrowth={sharesGrowth}
          />
        </motion.section>

        {/* Performance Charts and Top Content */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <PerformanceChartCard
            dailyData={data.dailyData || []}
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

          {/* Top Content */}
          {visibleVideoMetrics.length > 0 ? (
            <TopContentCard
              videoMetrics={visibleVideoMetrics}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              hiddenVideoIds={data.hiddenVideoIds || []}
            />
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
        </motion.div>

        {/* Comments Section */}
        <motion.div variants={fadeInUp}>
          <CommentsSection 
            campaignIds={data.campaigns?.map(c => c.id)}
          />
        </motion.div>

        {/* Report Footer */}
        <motion.div variants={fadeInUp} className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>This report is shared in read-only mode. Contact the owner for more information.</p>
        </motion.div>
      </motion.div>
    </>
  );
}

function Header() {
  const { resolvedTheme } = useTheme()
  const logoSrc = resolvedTheme === "dark" ? "/surge_white.png" : "/surge_black.png"
  return (
    <div className="pb-6 border-b mb-8 flex items-center justify-between">
      <Image
        src={logoSrc}
        alt="Surge Logo"
        width={120}
        height={40}
        priority
      />
      <ThemeSwitcher />
    </div>
  );
} 