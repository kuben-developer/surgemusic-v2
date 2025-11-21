"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMontages } from "./hooks/useMontages";
import { MontagesToolbar } from "./components/MontagesToolbar";
import { MontagesGrid } from "./components/MontagesGrid";
import { MontageConfigDialog } from "./components/MontageConfigDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Folder, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function MontagerFolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.folderId as Id<"montagerFolders">;

  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const folder = useQuery(api.app.montagerDb.getFolder, { folderId });
  const { videos, pendingConfigs, isLoading } = useMontages(folderId);

  const handleBack = () => {
    router.push("/montager");
  };

  const handleDownloadAll = async () => {
    if (videos.length === 0) return;

    try {
      for (const video of videos) {
        window.open(video.videoUrl, "_blank");
      }
      toast.success(`Opening ${videos.length} videos for download`);
    } catch (error) {
      toast.error("Failed to download videos");
    }
  };

  // Loading state
  if (folder === undefined || isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-[9/16] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Folder not found
  if (!folder) {
    return (
      <div className="container max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="text-center py-12">
          <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Folder not found</h3>
          <p className="text-muted-foreground mb-4">
            The montager folder you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button onClick={handleBack}>Back to Montager</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4">
      <div className="space-y-6">
        <MontagesToolbar
          folderName={folder.folderName}
          onBack={handleBack}
          onCreateConfig={() => setIsConfigDialogOpen(true)}
          onDownloadAll={handleDownloadAll}
          totalCount={videos.length}
          pendingConfigs={pendingConfigs.length}
        />

        {/* Montages Grid */}
        <MontagesGrid videos={videos} />

        {/* Config Creation Dialog */}
        <MontageConfigDialog
          open={isConfigDialogOpen}
          onOpenChange={setIsConfigDialogOpen}
          folderId={folderId}
          folderName={folder.folderName}
        />
      </div>
    </div>
  );
}
