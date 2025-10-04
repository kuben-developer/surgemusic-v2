"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, Globe, Heart, Users } from "lucide-react";
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
      icon: <Activity className="h-3.5 w-3.5" />,
      color: "#3B82F6",
    },
    {
      key: "engagement",
      label: "Engagement",
      icon: <Heart className="h-3.5 w-3.5" />,
      color: "#EF4444",
    },
    {
      key: "countries",
      label: "Countries",
      icon: <Globe className="h-3.5 w-3.5" />,
      color: "#10B981",
    },
    {
      key: "genders",
      label: "Genders",
      icon: <Users className="h-3.5 w-3.5" />,
      color: "#F59E0B",
    },
  ];

export function ChartTabs({ activeChart, onChartChange }: ChartTabsProps) {
  return (
    <div className="grid grid-cols-4 gap-1 bg-muted/30 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={cn(
              "p-1.5 text-xs rounded-md transition-all relative overflow-hidden cursor-pointer",
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
            <div className="flex items-center text-[10px] justify-center gap-1">
              {tab.icon}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>
  );
}
