"use client";

import {
  CheckCircle2,
  Clock,
  FileQuestion,
  AlertTriangle,
  VideoOff,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface CampaignSyncStatsProps {
  metadata: {
    posted: number;
    noPostId: number;
    noVideoUrl: number;
    scheduled: number;
    errors: string[];
  } | null | undefined;
}

export function CampaignSyncStats({ metadata }: CampaignSyncStatsProps) {
  if (!metadata) {
    return (
      <div className="text-sm text-muted-foreground">
        No sync statistics available
      </div>
    );
  }

  const stats = [
    {
      label: "Posted",
      value: metadata.posted,
      icon: CheckCircle2,
      variant: "default" as const,
      description: "Videos successfully posted",
    },
    {
      label: "Scheduled",
      value: metadata.scheduled,
      icon: Clock,
      variant: "secondary" as const,
      description: "Videos scheduled but not yet posted",
    },
    {
      label: "No Post ID",
      value: metadata.noPostId,
      icon: FileQuestion,
      variant: "outline" as const,
      description: "Videos without api_post_id",
    },
    {
      label: "No Video URL",
      value: metadata.noVideoUrl,
      icon: VideoOff,
      variant: "outline" as const,
      description: "Videos without video_url",
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Campaign Sync Status
      </h3>
      <div className="flex flex-wrap gap-2">
        {stats.map((stat) => (
          <TooltipProvider key={stat.label}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={stat.variant}
                  className="cursor-help gap-1.5 px-3 py-1.5"
                >
                  <stat.icon className="size-3.5" />
                  <span className="font-medium">{stat.value}</span>
                  <span className="text-muted-foreground">{stat.label}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{stat.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {/* Errors with special handling */}
        {metadata.errors.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="destructive"
                  className="cursor-help gap-1.5 px-3 py-1.5"
                >
                  <AlertTriangle className="size-3.5" />
                  <span className="font-medium">{metadata.errors.length}</span>
                  <span>Errors</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <div className="space-y-1.5">
                  <p className="font-semibold mb-2">Error Messages:</p>
                  <ul className="space-y-1 text-sm">
                    {metadata.errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
