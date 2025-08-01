"use client";

import { motion } from "framer-motion";
import { PerformanceChartCard } from "@/components/analytics/PerformanceChartCard";
import { TopContentCard } from "@/components/analytics/TopContentCard";
import { fadeInUp } from "../constants/analytics.constants";
import type { 
    AnalyticsContentData, 
    AnalyticsContentGrowth, 
    AnalyticsContentState,
    AnalyticsContentHandlers 
} from "../types/analytics-content.types";
import type { VideoMetric, MetricInfo } from "../../shared/types/report.types";

interface AnalyticsChartsSectionProps {
    data: AnalyticsContentData;
    growth: AnalyticsContentGrowth;
    state: Pick<AnalyticsContentState, 'activeMetric' | 'currentPage' | 'itemsPerPage' | 'dateRange'>;
    handlers: Pick<AnalyticsContentHandlers, 'onActiveMetricChange' | 'onPageChange'>;
    metricInfo: Record<string, MetricInfo>;
}

export function AnalyticsChartsSection({
    data,
    growth,
    state,
    handlers,
    metricInfo,
}: AnalyticsChartsSectionProps) {
    const { dailyData, totals, videoMetrics, hiddenVideoIds } = data;
    const { viewsGrowth, likesGrowth, commentsGrowth, sharesGrowth } = growth;
    const { activeMetric, currentPage, itemsPerPage, dateRange } = state;
    const { onActiveMetricChange, onPageChange } = handlers;

    // Filter out hidden videos from videoMetrics for display
    const visibleVideoMetrics = videoMetrics.filter(
        (vm: VideoMetric) => !hiddenVideoIds.includes(vm.videoInfo.id)
    );

    return (
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PerformanceChartCard
                dailyData={dailyData}
                totals={totals}
                activeMetric={activeMetric}
                setActiveMetric={onActiveMetricChange}
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
                onPageChange={onPageChange}
            />
        </motion.div>
    );
}