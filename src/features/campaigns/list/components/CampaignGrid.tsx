"use client"

import { Button } from "@/components/ui/button";
import { Plus, Shapes } from "lucide-react";
import Link from "next/link";
import { CampaignCard } from "./CampaignCard";
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface ProcessedCampaign extends Doc<"campaigns"> {
  isCompleted: boolean;
  id?: any;
  createdAt?: number;
  updatedAt?: number;
}

interface CampaignGridProps {
  campaigns: ProcessedCampaign[];
  searchQuery: string;
}

export function CampaignGrid({ campaigns, searchQuery }: CampaignGridProps) {
  if (campaigns.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-muted/5 py-24">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
        <div className="relative flex flex-col items-center justify-center text-center">
          <Shapes className="h-16 w-16 text-primary/40 mb-4" />
          <h2 className="text-2xl font-semibold text-foreground/80 mb-2">
            {searchQuery ? 'No campaigns found' : 'No campaigns yet'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Create your first campaign to get started'
            }
          </p>
          {!searchQuery && (
            <Link href="/campaign/create">
              <Button
                className="relative group gap-2 px-6 py-2 h-auto bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="font-medium">Create Campaign</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {campaigns.map((campaign, index) => (
        <CampaignCard
          key={`campaign-${campaign._id}-${index}`}
          campaign={campaign}
        />
      ))}
    </div>
  );
}