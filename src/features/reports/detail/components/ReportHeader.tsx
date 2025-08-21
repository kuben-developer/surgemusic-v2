"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, EyeOff, Loader2, Pencil, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

interface ReportHeaderProps {
  reportId: string;
  reportName: string;
  onManageVideos: () => void;
  onShare: () => void;
  onDelete: () => void;
  isSharing: boolean;
}

export function ReportHeader({
  reportId,
  reportName,
  onManageVideos,
  onShare,
  onDelete,
  isSharing,
}: ReportHeaderProps) {
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex items-center justify-between">
      <div>
        <Link
          href="/reports"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Reports
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onManageVideos}
          className="gap-2"
        >
          <EyeOff className="h-4 w-4" />
          Manage Videos
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          disabled={isSharing}
          className="gap-2"
        >
          {isSharing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Link...
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              Share Report
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <Link href={`/reports/${reportId}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
        <Button
          ref={deleteButtonRef}
          onClick={onDelete}
          variant="destructive"
          size="sm"
          className="bg-destructive hover:bg-destructive/90 focus:ring-destructive"
          aria-label="Delete report permanently"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}