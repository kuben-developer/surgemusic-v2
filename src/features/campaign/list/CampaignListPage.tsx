"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignTable } from "./components/CampaignTable";
import { useCampaignList } from "./hooks/useCampaignList";

const STATUS_TABS = [
  { value: "Active", label: "Active" },
  { value: "Planned", label: "Planned" },
  { value: "Done", label: "Done" },
] as const;

function TabSkeleton() {
  return (
    <div className="rounded-lg border p-8">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

export function CampaignListPage() {
  const router = useRouter();
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(["Active"]),
  );

  const active = useCampaignList("Active");
  const planned = useCampaignList("Planned", !visitedTabs.has("Planned"));
  const done = useCampaignList("Done", !visitedTabs.has("Done"));

  const dataByStatus = {
    Active: active,
    Planned: planned,
    Done: done,
  } as const;

  const getTabData = (status: string) =>
    dataByStatus[status as keyof typeof dataByStatus] ?? { campaigns: [], isLoading: false };

  const handleTabChange = useCallback((tab: string) => {
    setVisitedTabs((prev) => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  }, []);

  const handleSelectCampaign = useCallback(
    (campaignId: string) => {
      router.push(`/campaign/${campaignId}`);
    },
    [router],
  );

  if (active.isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <TabSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your campaigns
          </p>
        </div>

        <Tabs defaultValue="Active" onValueChange={handleTabChange}>
          <TabsList>
            {STATUS_TABS.map((tab) => {
              const data = getTabData(tab.value);
              const count = data.isLoading ? "..." : data.campaigns.length;
              return (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                  {count !== "..." && count > 0 && (
                    <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs">
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {STATUS_TABS.map((tab) => {
            const data = getTabData(tab.value);
            return (
              <TabsContent key={tab.value} value={tab.value}>
                {data.isLoading ? (
                  <TabSkeleton />
                ) : (
                  <CampaignTable
                    campaigns={data.campaigns}
                    onSelectCampaign={handleSelectCampaign}
                  />
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
