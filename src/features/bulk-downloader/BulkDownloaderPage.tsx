"use client";

import { Download } from "lucide-react";
import { UrlInputTabs } from "./components/UrlInputTabs";
import { ActiveJobsSection } from "./components/ActiveJobsSection";
import { JobHistory } from "./components/JobHistory";
import { useBulkDownload } from "./hooks/useBulkDownload";
import { useJobHistory } from "./hooks/useJobHistory";

export function BulkDownloaderPage() {
  const { createJob, isCreating } = useBulkDownload();
  const { activeJobs, isLoading: isLoadingJobs } = useJobHistory();

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Bulk Downloader</h1>
            <p className="text-muted-foreground">
              Download TikTok videos in bulk by URL or profile
            </p>
          </div>
        </div>
      </div>

      {/* URL Input - Always visible */}
      <UrlInputTabs onSubmit={createJob} isSubmitting={isCreating} />

      {/* Active Jobs Section */}
      <ActiveJobsSection activeJobs={activeJobs} isLoading={isLoadingJobs} />

      {/* Job History */}
      <JobHistory />
    </div>
  );
}
