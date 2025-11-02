"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Plus, Download } from "lucide-react";

interface MontagesToolbarProps {
  folderName: string;
  onBack: () => void;
  onRefresh: () => void;
  onCreateConfig: () => void;
  onDownloadAll: () => void;
  totalCount: number;
  isDownloading?: boolean;
  downloadProgress?: { current: number; total: number };
}

export function MontagesToolbar({
  folderName,
  onBack,
  onRefresh,
  onCreateConfig,
  onDownloadAll,
  totalCount,
  isDownloading = false,
  downloadProgress = { current: 0, total: 0 },
}: MontagesToolbarProps) {
  return (
    <div className="space-y-4 pb-6 border-b">
      {/* Header section */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{folderName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} {totalCount === 1 ? "montage" : "montages"}
          </p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
            disabled={isDownloading}
          >
            <RefreshCw className="size-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadAll}
            className="gap-2"
            disabled={totalCount === 0 || isDownloading}
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">
              {isDownloading
                ? `Downloading ${downloadProgress.current}/${downloadProgress.total}`
                : "Download All"}
            </span>
            <span className="sm:hidden">
              {isDownloading ? `${downloadProgress.current}/${downloadProgress.total}` : "Download"}
            </span>
          </Button>
          <Button
            size="sm"
            onClick={onCreateConfig}
            className="gap-2"
            disabled={isDownloading}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Create Config</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
