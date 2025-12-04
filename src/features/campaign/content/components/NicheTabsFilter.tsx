"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NicheStats } from "../../shared/types/campaign.types";

interface NicheTabsFilterProps {
  niches: NicheStats[];
  selectedNiche: string;
  onSelectNiche: (niche: string) => void;
}

export function NicheTabsFilter({
  niches,
  selectedNiche,
  onSelectNiche,
}: NicheTabsFilterProps) {
  return (
    <Tabs value={selectedNiche} onValueChange={onSelectNiche} className="flex-1">
      <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
        {niches.map((niche) => (
          <TabsTrigger
            key={niche.niche}
            value={niche.niche}
            className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {niche.niche}
            <span className="ml-2 text-xs font-mono opacity-70">
              {niche.withUrlCount}/{niche.totalCount}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
