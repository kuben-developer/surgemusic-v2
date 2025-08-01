import { motion } from "framer-motion";
import { KpiMetricsGrid } from "@/components/analytics/KpiMetricsGrid";
import { fadeInUp } from '../../constants/metrics.constants';

interface KpiSectionProps {
  campaignCount: number;
  totalVideos: number;
  totals: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    totalVideos: number;
  };
  viewsGrowth: { value: number; isPositive: boolean };
  likesGrowth: { value: number; isPositive: boolean };
  commentsGrowth: { value: number; isPositive: boolean };
  engagementGrowth: { value: number; isPositive: boolean };
  avgEngagementRate: string;
}

/**
 * KPI metrics section component
 * Displays key performance indicators in a grid layout
 */
export function KpiSection({
  campaignCount,
  totalVideos,
  totals,
  viewsGrowth,
  likesGrowth,
  commentsGrowth,
  engagementGrowth,
  avgEngagementRate
}: KpiSectionProps) {
  return (
    <motion.div variants={fadeInUp}>
      <KpiMetricsGrid
        campaignsCount={campaignCount}
        totalVideos={totalVideos}
        totals={totals}
        viewsGrowth={viewsGrowth}
        likesGrowth={likesGrowth}
        commentsGrowth={commentsGrowth}
        engagementGrowth={engagementGrowth}
        avgEngagementRate={avgEngagementRate}
      />
    </motion.div>
  );
}