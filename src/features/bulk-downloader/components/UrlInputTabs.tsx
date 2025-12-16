"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoUrlsTab } from "./VideoUrlsTab";
import { ProfileUrlsTab } from "./ProfileUrlsTab";
import type { JobType } from "../types/bulk-downloader.types";

interface UrlInputTabsProps {
  onSubmit: (params: {
    type: JobType;
    rawUrls: string;
    uploadedBefore?: number;
  }) => Promise<unknown>;
  isSubmitting: boolean;
}

export function UrlInputTabs({ onSubmit, isSubmitting }: UrlInputTabsProps) {
  const [activeTab, setActiveTab] = useState<JobType>("videos");

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as JobType)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="videos">Video URLs</TabsTrigger>
        <TabsTrigger value="profiles">Profile URLs</TabsTrigger>
      </TabsList>

      <TabsContent value="videos" className="mt-4">
        <VideoUrlsTab
          onSubmit={(rawUrls) => onSubmit({ type: "videos", rawUrls })}
          isSubmitting={isSubmitting}
        />
      </TabsContent>

      <TabsContent value="profiles" className="mt-4">
        <ProfileUrlsTab
          onSubmit={(rawUrls, uploadedBefore) =>
            onSubmit({ type: "profiles", rawUrls, uploadedBefore })
          }
          isSubmitting={isSubmitting}
        />
      </TabsContent>
    </Tabs>
  );
}
