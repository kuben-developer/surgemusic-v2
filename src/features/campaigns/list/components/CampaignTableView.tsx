"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Music, Film, Shapes } from "lucide-react";
import Image from "next/image";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface CampaignTableViewProps {
  campaigns: Doc<"campaigns">[];
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

export function CampaignTableView({ campaigns, searchQuery }: CampaignTableViewProps) {
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

  const handleRowClick = (campaignId: string) => {
    router.push(`/campaign/${campaignId}`);
  };

  return (
    <div className="rounded-xl border border-primary/10 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="min-w-[200px] px-5 py-3">Campaign</TableHead>
              <TableHead className="min-w-[200px] px-5 py-3">Artist & Song</TableHead>
              <TableHead className="px-5 py-3">Genre</TableHead>
              <TableHead className="text-center px-5 py-3">Videos</TableHead>
              <TableHead className="px-5 py-3">Status</TableHead>
              <TableHead className="px-5 py-3">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow
                key={campaign._id}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => handleRowClick(campaign._id)}
              >
                <TableCell className="font-medium px-5 py-3">
                  <div className="flex items-start gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {campaign.campaignCoverImageUrl ? (
                        <Image
                          src={campaign.campaignCoverImageUrl}
                          alt={campaign.campaignName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                          <Shapes className={`h-6 w-6 ${getRandomColor()}`} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="line-clamp-1">{campaign.campaignName}</span>
                      <div className="flex flex-wrap gap-1">
                        {campaign.themes?.slice(0, 2).map((theme: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-[10px] px-2 py-0 h-5"
                          >
                            {theme}
                          </Badge>
                        ))}
                        {campaign.themes && campaign.themes.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-2 py-0 h-5"
                          >
                            +{campaign.themes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Music className="h-3 w-3 text-primary" />
                      <span className="text-sm line-clamp-1">{campaign.songName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {campaign.artistName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3">
                  <Badge variant="secondary" className="capitalize">
                    {campaign.genre}
                  </Badge>
                </TableCell>
                <TableCell className="text-center px-5 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Film className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{campaign.videoCount}</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        campaign.status === 'completed' ? 'bg-green-600' : 
                        campaign.status === 'failed' ? 'bg-red-600' : 
                        'bg-orange-400 animate-pulse'
                      }`}
                    />
                    <span className="text-sm">
                      {campaign.status === 'completed' ? 'Completed' : 
                       campaign.status === 'failed' ? 'Failed' : 
                       'In Progress'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3">
                  <span className="text-sm text-muted-foreground">
                    {new Date(campaign._creationTime).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}