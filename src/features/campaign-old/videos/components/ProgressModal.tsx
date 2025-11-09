"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import type { SchedulingProgress } from "../types/schedule.types";

interface ProgressModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  progress: SchedulingProgress;
}

export function ProgressModal({ isOpen, onOpenChange, progress }: ProgressModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Scheduling in Progress</DialogTitle>
          <DialogDescription>
            Please keep this window open until scheduling is complete
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-200 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Please don't close this window</p>
              <p className="text-xs mt-1 text-amber-700 dark:text-amber-300">
                Your posts are being scheduled in batches. This process may take a few minutes to complete.
              </p>
            </div>
          </div>

          <div className="bg-muted/10 rounded-md p-4 border border-primary/10">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Scheduling progress</span>
              <span className="text-sm font-medium">
                {progress.completed} of {progress.total}
              </span>
            </div>

            <div className="w-full bg-muted/20 rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%`
                }}
              />
            </div>

            <div className="flex justify-between mt-3">
              <p className="text-sm text-muted-foreground">
                {progress.completed < progress.total
                  ? `Processing batch ${Math.floor(progress.completed / 5) + 1} of ${Math.ceil(progress.total / 5)}`
                  : "All posts scheduled successfully!"}
              </p>

              {progress.inProgress && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-xs">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}