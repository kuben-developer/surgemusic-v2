"use client";

import { useParams, useRouter } from "next/navigation";
import { useFolderVideos } from "./hooks/useFolderVideos";
import { VideoGrid } from "./components/VideoGrid";
import { UploadVideoDialog } from "./components/UploadVideoDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Folder } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";

export function FolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.folderId as Id<"clipperFolders">;

  const { folder, videos, isLoading, deleteVideo } = useFolderVideos(folderId);

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="container max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="text-center py-12">
          <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Folder not found</h3>
          <p className="text-muted-foreground mb-4">
            The folder you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button onClick={() => router.push("/clipper")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Folders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/clipper")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Folder className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">{folder.folderName}</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                {videos?.length || 0} {(videos?.length || 0) === 1 ? "video" : "videos"}
              </p>
            </div>
          </div>
          <UploadVideoDialog folderId={folderId} />
        </div>

        {/* Videos */}
        {videos && <VideoGrid videos={videos} folderId={folderId} onDeleteVideo={deleteVideo} />}
      </div>
    </div>
  );
}
