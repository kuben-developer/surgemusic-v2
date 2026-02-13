"use client";

import { Card } from "@/components/ui/card";
import { useCounterAnimation } from "../hooks/useCounterAnimation";
import type { KPIMetricConfig } from "../constants/metrics-v2";

interface KPIMetricCardV2Props {
  config: KPIMetricConfig;
  value: number;
  className?: string;
}

export function KPIMetricCardV2({ config, value, className = "" }: KPIMetricCardV2Props) {
  const animatedValue = useCounterAnimation(value, {
    duration: 1200,
    ease: "easeOut",
  });

  return (
    <Card
      className={`p-2.5 sm:p-4 space-y-1 sm:space-y-3 border border-primary/10 hover:border-primary/20 transition-colors ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] sm:text-xs font-medium text-muted-foreground">
          {config.label}
        </h3>
        <div
          className={`h-5 w-5 sm:h-7 sm:w-7 rounded-full ${config.bgColor} flex items-center justify-center`}
        >
          <div
            className={`${config.iconColor} [&>svg]:h-3 [&>svg]:w-3 sm:[&>svg]:h-3.5 sm:[&>svg]:w-3.5`}
          >
            {config.icon}
          </div>
        </div>
      </div>
      <p className="text-sm sm:text-xl font-bold tabular-nums">
        {animatedValue.toLocaleString()}
      </p>
    </Card>
  );
}
