"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFolderDetail } from "./hooks/useFolderDetail";
import { VideoTable } from "./components/VideoTable";
import { ReframedVideoTable } from "./components/ReframedVideoTable";
import { UploadVideoDialog } from "./components/UploadVideoDialog";
import { CalibrationSection } from "./components/CalibrationSection";
import { ReframeSection } from "./components/ReframeSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Folder } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

export function FolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.folderId as Id<"podcastClipperFolders">;

  const {
    folder,
    videos,
    sceneTypes,
    isLoading,
    deleteVideo,
    startCalibration,
    startReframe,
  } = useFolderDetail(folderId);

  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());

  const toggleSelect = (videoId: string) => {
    setSelectedVideoIds((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        next.add(videoId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!videos) return;
    const uploadedVideos = videos.filter(
      (v) => v.status === "uploaded" && !v.reframedVideoUrl
    );
    const allSelected = uploadedVideos.every((v) => selectedVideoIds.has(v._id));
    if (allSelected) {
      setSelectedVideoIds(new Set());
    } else {
      setSelectedVideoIds(new Set(uploadedVideos.map((v) => v._id)));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="text-center py-12">
        <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Folder not found</h3>
        <p className="text-muted-foreground mb-4">
          The folder you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Button onClick={() => router.push("/podcast-clipper")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Folders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/podcast-clipper")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Folder className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">{folder.folderName}</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              {folder.videoCount} video(s) &middot; {folder.reframedCount} reframed
            </p>
          </div>
        </div>
        <UploadVideoDialog folderId={folderId} />
      </div>

      {/* Calibration */}
      <CalibrationSection
        folderId={folderId}
        calibrationStatus={folder.calibrationStatus}
        videos={videos ?? []}
        sceneTypes={sceneTypes}
        onStartCalibration={startCalibration}
      />

      {/* Videos with tabs */}
      <Tabs defaultValue="input">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="input">Input Videos</TabsTrigger>
            <TabsTrigger value="reframed">Reframed</TabsTrigger>
          </TabsList>
          <ReframeSection
            calibrationStatus={folder.calibrationStatus}
            selectedVideoIds={selectedVideoIds}
            onStartReframe={startReframe}
          />
        </div>
        <TabsContent value="input" className="mt-4">
          <VideoTable
            videos={videos ?? []}
            selectedVideoIds={selectedVideoIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onDeleteVideo={deleteVideo}
          />
        </TabsContent>
        <TabsContent value="reframed" className="mt-4">
          <ReframedVideoTable videos={videos ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
