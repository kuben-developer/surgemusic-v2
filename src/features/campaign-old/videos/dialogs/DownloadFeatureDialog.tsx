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
import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface DownloadFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DownloadFeatureDialog({ open, onOpenChange }: DownloadFeatureDialogProps) {
  const router = useRouter();

  const handleViewPlans = () => {
    router.push("/pricing");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl">Upgrade to Starter Plan to Download Videos</DialogTitle>
          </div>
          <DialogDescription>
            Downloading videos is available on any paid plan. Free trial users and non-subscribed accounts cannot download videos.
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          Upgrade to the Starter plan or above to unlock all these features. Downloading is not available during the free trial.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button
            onClick={handleViewPlans}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          >
            View Plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
