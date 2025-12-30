"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CampaignMediaSection } from "@/features/campaign/media";

interface CampaignAssetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
}

export function CampaignAssetsDialog({
  open,
  onOpenChange,
  campaignId,
}: CampaignAssetsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Campaign Assets</DialogTitle>
        </DialogHeader>
        <CampaignMediaSection campaignId={campaignId} />
      </DialogContent>
    </Dialog>
  );
}
