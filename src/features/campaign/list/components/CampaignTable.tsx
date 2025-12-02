"use client";

import { Music, Mic2, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AirtableCampaign } from "../../shared/types/campaign.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CampaignTableProps {
  campaigns: AirtableCampaign[];
  onSelectCampaign: (campaignId: string) => void;
}

export function CampaignTable({ campaigns, onSelectCampaign }: CampaignTableProps) {
  const router = useRouter();

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <Music className="size-12 mx-auto mb-3 opacity-30" />
        <h3 className="text-base font-semibold mb-1">No Campaigns Found</h3>
        <p className="text-sm">No campaigns found in this category.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Campaign ID</TableHead>
            <TableHead className="w-[30%]">Artist</TableHead>
            <TableHead className="w-[25%]">Song</TableHead>
            <TableHead className="w-[15%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow
              key={campaign.id}
              className="cursor-pointer hover:bg-muted/50 h-10"
              onClick={() => onSelectCampaign(campaign.id)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Music className="size-4 text-primary" />
                  <span>{campaign.campaign_id}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mic2 className="size-3.5" />
                  <span>{campaign.artist || "—"}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {campaign.song || "—"}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/campaign/${campaign.id}/analytics`);
                  }}
                  className="gap-1.5"
                >
                  <BarChart3 className="size-4" />
                  Analytics
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
