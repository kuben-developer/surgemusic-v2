"use client";

import { useParams, useRouter } from "next/navigation";
import { useFolderDetail } from "./hooks/useFolderDetail";
import { VideoTable } from "./components/VideoTable";
import { UploadVideoDialog } from "./components/UploadVideoDialog";
import { CalibrationSection } from "./components/CalibrationSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Folder, Scissors } from "lucide-react";
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
  } = useFolderDetail(folderId);

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
              {folder.videoCount} video(s)
              {(folder.clipCount ?? 0) > 0 && (
                <> &middot; {folder.completedClipCount ?? 0}/{folder.clipCount} clips</>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/podcast-clipper/${folderId}/clips`)}
          >
            <Scissors className="h-4 w-4 mr-2" />
            Clips
          </Button>
          <UploadVideoDialog folderId={folderId} />
        </div>
      </div>

      {/* Calibration */}
      <CalibrationSection
        folderId={folderId}
        calibrationStatus={folder.calibrationStatus}
        videos={videos ?? []}
        sceneTypes={sceneTypes}
        onStartCalibration={startCalibration}
      />

      {/* Videos */}
      <Tabs defaultValue="input">
        <TabsList>
          <TabsTrigger value="input">Input Videos</TabsTrigger>
        </TabsList>
        <TabsContent value="input" className="mt-4">
          <VideoTable
            videos={videos ?? []}
            selectedVideoIds={new Set()}
            onToggleSelect={() => {}}
            onToggleSelectAll={() => {}}
            onDeleteVideo={deleteVideo}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
