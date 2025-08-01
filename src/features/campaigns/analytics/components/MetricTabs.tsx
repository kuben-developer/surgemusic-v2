"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { METRIC_INFO } from "../constants/metrics";

interface MetricTabsProps {
  activeMetric: string;
  onActiveMetricChange: (metric: string) => void;
}

export function MetricTabs({ activeMetric, onActiveMetricChange }: MetricTabsProps) {
  return (
    <div className="flex mb-4 bg-muted/50 rounded-lg p-1 backdrop-blur-sm">
      {Object.keys(METRIC_INFO).map((metric) => (
        <button
          key={metric}
          className={cn(
            "flex-1 py-2 px-3 text-sm rounded-md transition-all relative overflow-hidden",
            activeMetric === metric
              ? "text-white font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onActiveMetricChange(metric)}
        >
          {activeMetric === metric && (
            <motion.div
              className="absolute inset-0 rounded-md -z-10"
              layoutId="activeTab"
              style={{ backgroundColor: METRIC_INFO[metric as keyof typeof METRIC_INFO].color }}
              initial={false}
            />
          )}
          <div className="flex items-center justify-center gap-2">
            {METRIC_INFO[metric as keyof typeof METRIC_INFO].icon}
            <span>{METRIC_INFO[metric as keyof typeof METRIC_INFO].label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}