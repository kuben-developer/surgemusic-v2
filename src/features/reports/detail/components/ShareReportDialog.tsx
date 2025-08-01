"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CheckCheck, Copy } from "lucide-react";

interface ShareReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  isCopied: boolean;
  onCopyToClipboard: () => Promise<void>;
}

export function ShareReportDialog({
  open,
  onOpenChange,
  shareUrl,
  isCopied,
  onCopyToClipboard,
}: ShareReportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Anyone with this link can view your report without logging in.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <input
              id="link"
              defaultValue={shareUrl}
              readOnly
              className="w-full p-2 text-sm border rounded-md bg-muted"
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="px-3"
            onClick={onCopyToClipboard}
          >
            {isCopied ? (
              <CheckCheck className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}