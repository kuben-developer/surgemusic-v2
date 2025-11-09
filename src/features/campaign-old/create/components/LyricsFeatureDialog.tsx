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

interface LyricsFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureDescription?: string;
  isFirstTimeUser?: boolean;
}

export function LyricsFeatureDialog({
  open,
  onOpenChange,
  featureDescription = "Generate professional lyrics synchronized with your music.",
}: LyricsFeatureDialogProps) {
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
            <DialogTitle className="text-xl">Upgrade to Growth Plan to Access Lyrics</DialogTitle>
          </div>
          <DialogDescription>
            {featureDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          <div className="w-[85%] rounded-xl overflow-hidden border border-primary/30 bg-muted/30 shadow-sm">
            <Image
              src="/lyrics_feature.png"
              alt="Lyrics feature preview"
              width={800}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            Upgrade to the Growth plan or above to unlock all these features.
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
