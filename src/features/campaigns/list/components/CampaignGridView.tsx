"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Music, Sparkles, Shapes } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ProcessedCampaign } from "../hooks/useCampaignData";

interface CampaignGridViewProps {
  campaigns: ProcessedCampaign[];
  searchQuery: string;
}

const getRandomColor = () => {
  const colors = [
    "text-red-400",
    "text-blue-400",
    "text-green-400",
    "text-yellow-400",
    "text-purple-400",
    "text-pink-400",
    "text-indigo-400",
    "text-teal-400",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function CampaignGridView({ campaigns, searchQuery }: CampaignGridViewProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {campaigns.map((campaign, index) => (
        <Card
          key={campaign._id}
          className="group relative overflow-hidden border-primary/10 bg-card/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        >
          <CardContent className="p-0">
            <div className="relative aspect-[3/4] bg-muted/30">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60 z-10" />
              <div className="absolute bottom-4 left-4 right-4 z-20 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-background/50 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-medium border border-primary/10">
                    {campaign.videoCount} VIDEOS
                  </div>
                  <div className="bg-background/50 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-medium border border-primary/10">
                    {campaign.genre.toUpperCase()}
                  </div>
                </div>
                <h2 className="text-xl font-semibold line-clamp-1 drop-shadow-sm">
                  {campaign.campaignName}
                </h2>
              </div>
              {campaign.campaignCoverImageUrl ? (
                <Image
                  src={campaign.campaignCoverImageUrl}
                  alt={campaign.campaignName}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                  <Shapes className={`h-24 w-24 ${getRandomColor()}`} />
                </div>
              )}
            </div>
            <div className="p-5 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                  <p className="text-sm font-medium truncate">{campaign.songName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
                  <p className="text-sm text-muted-foreground truncate">{campaign.artistName}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {campaign.themes?.map((theme: string, index: number) => (
                  <div
                    key={index}
                    className="text-[10px] px-2.5 py-1 rounded-md bg-primary/5 text-foreground border border-primary/10"
                  >
                    {theme}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${campaign.isCompleted ? 'bg-green-600' : 'bg-orange-400 animate-pulse'}`} />
                  {campaign.isCompleted ? 'Completed' : 'In Progress'}
                </div>
                <div className="text-muted-foreground">
                  {new Date(campaign._creationTime).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-5 pt-0">
            <Button
              className="relative w-full gap-2 bg-primary/5 hover:bg-primary/10 text-foreground border border-primary/10 hover:border-primary/30 transition-colors"
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/campaign/${campaign._id}`)}
            >
              <Globe className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>View Campaign</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}