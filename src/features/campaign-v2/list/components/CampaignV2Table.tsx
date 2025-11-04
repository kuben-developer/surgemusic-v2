"use client";

import { Music, Mic2 } from "lucide-react";
import type { AirtableCampaign } from "../../shared/types/campaign-v2.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CampaignV2TableProps {
  campaigns: AirtableCampaign[];
  onSelectCampaign: (campaignId: string) => void;
}

export function CampaignV2Table({ campaigns, onSelectCampaign }: CampaignV2TableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border rounded-lg">
        <Music className="size-12 mx-auto mb-3 opacity-30" />
        <h3 className="text-base font-semibold mb-1">No Campaigns Found</h3>
        <p className="text-sm">No active campaigns available in Airtable.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Campaign ID</TableHead>
            <TableHead className="w-[35%]">Artist</TableHead>
            <TableHead className="w-[30%]">Song</TableHead>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
