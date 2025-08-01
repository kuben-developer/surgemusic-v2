import React from "react";
import { BarChart2, TrendingUp, Eye, Heart, MessageSquare, Share2 } from "lucide-react";
import type { MetricInfo } from "../types/analytics.types";

// Metric info for consistent styling and icons
export const METRIC_INFO: Record<string, MetricInfo> = {
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

// KPI Metric configurations for the KPIMetrics component
export interface KPIMetricConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  getValue: (data: KPIMetricData) => string | number;
  getGrowth?: (data: KPIMetricData) => { value: number; isPositive: boolean } | null;
}

export interface KPIMetricData {
  totals: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  avgEngagementRate: string;
  generatedVideos?: Array<unknown>;
  viewsGrowth?: { value: number; isPositive: boolean };
  likesGrowth?: { value: number; isPositive: boolean };
  commentsGrowth?: { value: number; isPositive: boolean };
  sharesGrowth?: { value: number; isPositive: boolean };
  engagementGrowth?: { value: number; isPositive: boolean };
}

export const KPI_METRICS: KPIMetricConfig[] = [
  {
    key: "posts",
    label: "Total Posts",
    icon: <BarChart2 className="h-4 w-4" />,
    bgColor: "bg-violet-100 dark:bg-violet-900/20",
    iconColor: "text-violet-600 dark:text-violet-400",
    getValue: (data) => data.generatedVideos?.length || 0,
  },
  {
    key: "views",
    label: "Total Views",
    icon: <div className="h-4 w-4">👁️</div>,
    bgColor: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
    getValue: (data) => data.totals.views.toLocaleString(),
    getGrowth: (data) => data.viewsGrowth || null,
  },
  {
    key: "likes",
    label: "Total Likes",
    icon: <div className="h-4 w-4">❤️</div>,
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
    getValue: (data) => data.totals.likes.toLocaleString(),
    getGrowth: (data) => data.likesGrowth || null,
  },
  {
    key: "comments",
    label: "Comments",
    icon: <div className="h-4 w-4">💬</div>,
    bgColor: "bg-red-100 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-400",
    getValue: (data) => data.totals.comments.toLocaleString(),
    getGrowth: (data) => data.commentsGrowth || null,
  },
  {
    key: "shares",
    label: "Total Shares",
    icon: <div className="h-4 w-4">🔄</div>,
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    getValue: (data) => data.totals.shares.toLocaleString(),
    getGrowth: (data) => data.sharesGrowth || null,
  },
  {
    key: "engagement",
    label: "Eng. Rate",
    icon: <TrendingUp className="h-4 w-4" />,
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    getValue: (data) => `${data.avgEngagementRate}%`,
    getGrowth: (data) => data.engagementGrowth ?? null,
  },
];

// Animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const chartVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};