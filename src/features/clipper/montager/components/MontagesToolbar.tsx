"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Download, Clock } from "lucide-react";

interface MontagesToolbarProps {
  folderName: string;
  onBack: () => void;
  onCreateConfig: () => void;
  onDownloadAll: () => void;
  totalCount: number;
  pendingConfigs: number;
}

export function MontagesToolbar({
  folderName,
  onBack,
  onCreateConfig,
  onDownloadAll,
  totalCount,
  pendingConfigs,
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{folderName}</h1>
            {pendingConfigs > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="size-3" />
                {pendingConfigs} pending
              </Badge>
            )}
          </div>
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
            onClick={onDownloadAll}
            className="gap-2"
            disabled={totalCount === 0}
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Download All</span>
            <span className="sm:hidden">Download</span>
          </Button>
          <Button
            size="sm"
            onClick={onCreateConfig}
            className="gap-2"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Create Montages</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
