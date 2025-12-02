import React from "react";
import { BarChart2, Eye, Heart, MessageSquare, Share2, Sparkles } from "lucide-react";
import type { AggregateTotals } from "../types/analytics-page.types";

/**
 * KPI Metric configuration for the overview
 */
export interface KPIMetricConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  getValue: (data: AggregateTotals) => string | number;
}

/**
 * KPI Metrics configuration for the overview page
 * Follows the same pattern as campaign/analytics but for aggregate data
 */
export const OVERVIEW_KPI_METRICS: KPIMetricConfig[] = [
  {
    key: "campaigns",
    label: "Campaigns",
    icon: <Sparkles className="h-4 w-4" />,
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    getValue: (data) => data.campaigns.toLocaleString(),
  },
  {
    key: "posts",
    label: "Posts",
    icon: <BarChart2 className="h-4 w-4" />,
    bgColor: "bg-violet-100 dark:bg-violet-900/20",
    iconColor: "text-violet-600 dark:text-violet-400",
    getValue: (data) => data.posts.toLocaleString(),
  },
  {
    key: "views",
    label: "Views",
    icon: <Eye className="h-4 w-4" />,
    bgColor: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
    getValue: (data) => data.views.toLocaleString(),
  },
  {
    key: "likes",
    label: "Likes",
    icon: <Heart className="h-4 w-4" />,
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
    getValue: (data) => data.likes.toLocaleString(),
  },
  {
    key: "comments",
    label: "Comments",
    icon: <MessageSquare className="h-4 w-4" />,
    bgColor: "bg-red-100 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-400",
    getValue: (data) => data.comments.toLocaleString(),
  },
  {
    key: "shares",
    label: "Shares",
    icon: <Share2 className="h-4 w-4" />,
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    getValue: (data) => data.shares.toLocaleString(),
  },
];

/**
 * Sparkline colors for different metrics
 */
export const SPARKLINE_COLORS = {
  views: "#3B82F6",    // Blue
  likes: "#EF4444",    // Red
  comments: "#10B981", // Green
  shares: "#A855F7",   // Purple
} as const;

/**
 * Default sparkline color (views)
 */
export const DEFAULT_SPARKLINE_COLOR = SPARKLINE_COLORS.views;

/**
 * Animation variants (matching campaign/analytics pattern)
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

