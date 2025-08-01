"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ProcessedCampaign } from "../hooks/useCampaignData";

interface CampaignListGridProps {
  campaigns: ProcessedCampaign[];
  searchQuery: string;
}

export function CampaignListGrid({ campaigns, searchQuery }: CampaignListGridProps) {
  const router = useRouter();

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {searchQuery ? `No campaigns found matching "${searchQuery}"` : "No campaigns found"}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {campaigns.map((campaign) => (
          <Card
            key={campaign._id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/campaign/${campaign._id}`)}
          >
            <div className="space-y-3">
              {campaign.campaignCoverImageUrl && (
                <div className="aspect-square relative overflow-hidden rounded-md bg-muted">
                  <img
                    src={campaign.campaignCoverImageUrl}
                    alt={campaign.campaignName}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              
              <div>
                <h3 className="font-semibold truncate">{campaign.campaignName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Music className="h-3 w-3" />
                  <span className="truncate">{campaign.songName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(campaign._creationTime).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  {campaign.videoCount} videos
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  campaign.status === 'completed' 
                    ? 'bg-green-100 text-green-700' 
                    : campaign.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {campaign.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}