"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fadeInUp } from "../constants/metrics";
import type { DateRange } from "../types/analytics.types";

interface AnalyticsHeaderProps {
  campaignId: string;
  dateRange: DateRange;
  lastUpdatedAt?: number;
  onDateRangeChange: (value: DateRange) => void;
}

export function AnalyticsHeader({
  campaignId,
  dateRange,
  lastUpdatedAt,
  onDateRangeChange
}: AnalyticsHeaderProps) {
  return (
    <>
      {lastUpdatedAt && (
        <div className="flex mb-6 mr-1 items-center justify-end text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500/70 animate-pulse" />
            Updated {new Date(lastUpdatedAt).toLocaleString()}
          </span>
        </div>
      )}

      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link href={`/campaign-v2/${campaignId}`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Analytics Dashboard
          </h1>
        </div>

        <Tabs value={dateRange.toString()} onValueChange={(value) => onDateRangeChange(Number(value) as DateRange)}>
          <TabsList>
            <TabsTrigger value="7">7 Days</TabsTrigger>
            <TabsTrigger value="30">30 Days</TabsTrigger>
            <TabsTrigger value="90">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>
    </>
  );
}
