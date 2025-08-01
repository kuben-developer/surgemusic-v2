"use client";

import { METRIC_INFO } from "../constants/metrics";

interface MetricInfoProps {
  activeMetric: string;
}

export function MetricInfo({ activeMetric }: MetricInfoProps) {
  const metricInfo = METRIC_INFO[activeMetric as keyof typeof METRIC_INFO];
  
  return (
    <div className="flex items-center gap-3 mb-4">
      <div 
        className="h-10 w-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${metricInfo.color}20` }}
      >
        <div 
          className="flex items-center justify-center h-6 w-6 text-primary" 
          style={{ color: metricInfo.color }}
        >
          {metricInfo.icon}
        </div>
      </div>
      <div>
        <h4 className="font-medium">{metricInfo.label}</h4>
        <p className="text-xs text-muted-foreground">{metricInfo.description}</p>
      </div>
    </div>
  );
}