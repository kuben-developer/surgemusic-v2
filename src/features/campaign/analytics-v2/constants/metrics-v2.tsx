import React from "react";
import { BarChart2, Eye, Heart, MessageSquare, Share2, Bookmark } from "lucide-react";
import type { AdjustedTotals } from "../types/analytics-v2.types";

export interface KPIMetricConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  getValue: (totals: AdjustedTotals) => number;
}

export const KPI_METRICS_V2: KPIMetricConfig[] = [
  {
    key: "posts",
    label: "Posts",
    icon: <BarChart2 className="h-4 w-4" />,
    bgColor: "bg-violet-100 dark:bg-violet-900/20",
    iconColor: "text-violet-600 dark:text-violet-400",
    getValue: (totals) => totals.totalPosts,
  },
  {
    key: "views",
    label: "Views",
    icon: <Eye className="h-4 w-4" />,
    bgColor: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
    getValue: (totals) => totals.totalViews,
  },
  {
    key: "likes",
    label: "Likes",
    icon: <Heart className="h-4 w-4" />,
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
    getValue: (totals) => totals.totalLikes,
  },
  {
    key: "comments",
    label: "Comments",
    icon: <MessageSquare className="h-4 w-4" />,
    bgColor: "bg-red-100 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-400",
    getValue: (totals) => totals.totalComments,
  },
  {
    key: "shares",
    label: "Shares",
    icon: <Share2 className="h-4 w-4" />,
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    getValue: (totals) => totals.totalShares,
  },
  {
    key: "saves",
    label: "Saves",
    icon: <Bookmark className="h-4 w-4" />,
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    getValue: (totals) => totals.totalSaves,
  },
];

// Animation variants
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

export const chartVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
