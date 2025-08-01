"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { fadeInUp } from "../constants/metrics";

interface AnalyticsHeaderProps {
  campaignId: string;
  dateRange: string;
  isRefreshing: boolean;
  lastUpdatedAt?: string;
  onDateRangeChange: (value: string) => void;
  onRefresh: () => void;
}

export function AnalyticsHeader({
  campaignId,
  dateRange,
  isRefreshing,
  lastUpdatedAt,
  onDateRangeChange,
  onRefresh
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
          <Link href={`/campaign/${campaignId}`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Analytics Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={onDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="15">Last 15 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh Analytics
          </Button>
        </div>
      </motion.div>
    </>
  );
}