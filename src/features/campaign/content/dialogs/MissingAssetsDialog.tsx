"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileAudio, FileText, MessageSquareText } from "lucide-react";

interface MissingAssetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingRequirements: string[];
  hasAudioUrl: boolean;
  hasSrtUrl: boolean;
  hasCaptions: boolean;
}

export function MissingAssetsDialog({
  open,
  onOpenChange,
  missingRequirements,
  hasAudioUrl,
  hasSrtUrl,
  hasCaptions,
}: MissingAssetsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
            <div>
              <DialogTitle>Missing Required Assets</DialogTitle>
              <DialogDescription>
                Please add the following assets before generating videos
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Audio URL */}
          <div
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              hasAudioUrl ? "bg-green-50 dark:bg-green-950/20 border-green-200" : "bg-red-50 dark:bg-red-950/20 border-red-200"
            }`}
          >
            <FileAudio className={`size-5 ${hasAudioUrl ? "text-green-600" : "text-red-600"}`} />
            <div className="flex-1">
              <div className="text-sm font-medium">Audio File</div>
              <div className="text-xs text-muted-foreground">
                {hasAudioUrl ? "✓ Audio uploaded" : "✗ Audio file required"}
              </div>
            </div>
          </div>

          {/* SRT URL */}
          <div
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              hasSrtUrl ? "bg-green-50 dark:bg-green-950/20 border-green-200" : "bg-red-50 dark:bg-red-950/20 border-red-200"
            }`}
          >
            <FileText className={`size-5 ${hasSrtUrl ? "text-green-600" : "text-red-600"}`} />
            <div className="flex-1">
              <div className="text-sm font-medium">SRT File</div>
              <div className="text-xs text-muted-foreground">
                {hasSrtUrl ? "✓ SRT file uploaded" : "✗ SRT file required"}
              </div>
            </div>
          </div>

          {/* Captions */}
          <div
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              hasCaptions ? "bg-green-50 dark:bg-green-950/20 border-green-200" : "bg-red-50 dark:bg-red-950/20 border-red-200"
            }`}
          >
            <MessageSquareText className={`size-5 ${hasCaptions ? "text-green-600" : "text-red-600"}`} />
            <div className="flex-1">
              <div className="text-sm font-medium">Captions</div>
              <div className="text-xs text-muted-foreground">
                {hasCaptions ? "✓ Captions added" : "✗ At least 1 caption required"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-sm text-blue-900 dark:text-blue-100">
          <strong>Next steps:</strong> Go to the Campaign Assets tab to upload the missing files and add captions.
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
