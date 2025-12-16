"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { JobProgressCard } from "./JobProgressCard";
import type { BulkDownloadJob } from "../types/bulk-downloader.types";

interface ActiveJobsSectionProps {
  activeJobs: BulkDownloadJob[] | undefined;
  isLoading: boolean;
}

export function ActiveJobsSection({ activeJobs, isLoading }: ActiveJobsSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading active jobs...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!activeJobs || activeJobs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Active Downloads</h2>
          <p className="text-sm text-muted-foreground">
            {activeJobs.length} job{activeJobs.length !== 1 ? "s" : ""} in progress
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {activeJobs.map((job) => (
          <JobProgressCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
}
