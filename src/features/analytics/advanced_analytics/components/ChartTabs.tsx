"use client";

import { motion } from "framer-motion";
import { Activity, Heart, Globe, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChartType } from "../types/advanced-analytics.types";

interface ChartTabsProps {
  activeChart: ChartType;
  onChartChange: (chart: ChartType) => void;
}

const tabs: Array<{
  key: ChartType;
  label: string;
  icon: React.ReactNode;
  color: string;
}> = [
  {
    key: "retention",
    label: "Retention",
    icon: <Activity className="h-4 w-4" />,
    color: "#3B82F6",
  },
  {
    key: "engagement",
    label: "Engagement",
    icon: <Heart className="h-4 w-4" />,
    color: "#EF4444",
  },
  {
    key: "countries",
    label: "Countries",
    icon: <Globe className="h-4 w-4" />,
    color: "#10B981",
  },
  {
    key: "genders",
    label: "Genders",
    icon: <Users className="h-4 w-4" />,
    color: "#F59E0B",
  },
];

export function ChartTabs({ activeChart, onChartChange }: ChartTabsProps) {
  return (
    <div className="flex mb-4 bg-muted/50 rounded-lg p-1 backdrop-blur-sm">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={cn(
            "flex-1 py-2 px-3 text-sm rounded-md transition-all relative overflow-hidden",
            activeChart === tab.key
              ? "text-white font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onChartChange(tab.key)}
        >
          {activeChart === tab.key && (
            <motion.div
              className="absolute inset-0 rounded-md -z-10"
              layoutId="activeChartTab"
              style={{ backgroundColor: tab.color }}
              initial={false}
            />
          )}
          <div className="flex items-center justify-center gap-2">
            {tab.icon}
            <span>{tab.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
