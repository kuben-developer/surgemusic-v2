"use client";

import { METRIC_INFO } from "../constants/metrics";

interface MetricInfoProps {
  activeMetric: string;
}

export function MetricInfo({ activeMetric }: MetricInfoProps) {
  const metricInfo = METRIC_INFO[activeMetric as keyof typeof METRIC_INFO];
  
  if (!metricInfo) {
    return (
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
          <div className="flex items-center justify-center h-6 w-6 text-muted-foreground">
            ?
          </div>
        </div>
        <div>
          <h4 className="font-medium">Unknown Metric</h4>
          <p className="text-xs text-muted-foreground">Invalid metric selected</p>
        </div>
      </div>
    );
  }

  // TypeScript assertion after null check - we know metricInfo is defined here
  const safeMetricInfo = metricInfo;
  
  return (
    <div className="flex items-center gap-3 mb-4">
      <div 
        className="h-10 w-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${safeMetricInfo.color}20` }}
      >
        <div 
          className="flex items-center justify-center h-6 w-6 text-primary" 
          style={{ color: safeMetricInfo.color }}
        >
          {safeMetricInfo.icon}
        </div>
      </div>
      <div>
        <h4 className="font-medium">{safeMetricInfo.label}</h4>
        <p className="text-xs text-muted-foreground">{safeMetricInfo.description}</p>
      </div>
    </div>
  );
}