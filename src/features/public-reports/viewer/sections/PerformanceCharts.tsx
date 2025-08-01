import { motion } from "framer-motion";
import { PerformanceChartCard } from '@/components/analytics/PerformanceChartCard';
import { TopContentCard } from '@/components/analytics/TopContentCard';
import { Card } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import type { MetricKey, GrowthResult } from '../types';
import type { DailyData, Totals, VideoMetric } from '@/components/analytics/types';
import { metricInfo } from '../utils/metric-info';

interface PerformanceChartsProps {
  dailyData: DailyData[];
  totals: Totals | undefined;
  activeMetric: MetricKey;
  setActiveMetric: (metric: MetricKey) => void;
  dateRange: string;
  viewsGrowth: GrowthResult;
  likesGrowth: GrowthResult;
  commentsGrowth: GrowthResult;
  sharesGrowth: GrowthResult;
  visibleVideoMetrics: VideoMetric[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  hiddenVideoIds: string[];
}

export function PerformanceCharts({
  dailyData,
  totals,
  activeMetric,
  setActiveMetric,
  dateRange,
  viewsGrowth,
  likesGrowth,
  commentsGrowth,
  sharesGrowth,
  visibleVideoMetrics,
  currentPage,
  itemsPerPage,
  onPageChange,
  hiddenVideoIds
}: PerformanceChartsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <PerformanceChartCard
        dailyData={dailyData}
        totals={totals || { views: 0, likes: 0, comments: 0, shares: 0 }}
        activeMetric={activeMetric}
        setActiveMetric={setActiveMetric}
        metricInfo={metricInfo}
        dateRange={dateRange}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        sharesGrowth={sharesGrowth}
      />

      {visibleVideoMetrics.length > 0 ? (
        <TopContentCard
          videoMetrics={visibleVideoMetrics}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          hiddenVideoIds={hiddenVideoIds}
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
  );
}