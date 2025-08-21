"use client";

import { Card } from "@/components/ui/card";
import { Eye, Heart, MessageSquare, Share2, TrendingUp, Activity } from "lucide-react";
import type { AnalyticsMetrics, GrowthMetrics } from "../types/analytics.types";

interface MetricsOverviewProps {
  metrics: AnalyticsMetrics;
  growth: GrowthMetrics | null;
  engagementRate: string;
}

export function MetricsOverview({ metrics, growth, engagementRate }: MetricsOverviewProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const metricCards = [
    {
      label: "Total Views",
      value: metrics.views,
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      growth: growth?.views,
    },
    {
      label: "Total Likes",
      value: metrics.likes,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      growth: growth?.likes,
    },
    {
      label: "Comments",
      value: metrics.comments,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-50",
      growth: growth?.comments,
    },
    {
      label: "Shares",
      value: metrics.shares,
      icon: Share2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      growth: growth?.shares,
    },
    {
      label: "Total Posts",
      value: metrics.posts,
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      label: "Engagement Rate",
      value: engagementRate,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      isPercentage: true,
      growth: growth?.engagement,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              {metric.growth && (
                <div className={`flex items-center text-xs font-medium ${
                  metric.growth.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`h-3 w-3 mr-1 ${
                    !metric.growth.isPositive ? 'rotate-180' : ''
                  }`} />
                  {metric.growth.value}%
                </div>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold">
                {metric.isPercentage ? metric.value : formatNumber(metric.value as number)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}