"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useClipsData } from "./hooks/useClipsData";
import { useClipsSorting } from "./hooks/useClipsSorting";
import { useClipSelection } from "./hooks/useClipSelection";
import { useClipsPagination } from "./hooks/useClipsPagination";
import { ClipsToolbar } from "./components/ClipsToolbar";
import { ClipsGrid } from "./components/ClipsGrid";
import { ClipsPagination } from "./components/ClipsPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Id } from "../../../../convex/_generated/dataModel";

export function ClipsPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.folderId as Id<"clipperFolders">;
  const inputVideoName = params.inputVideoName as string;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { video, folder, clips, isLoading, activeClips, softDeleteClips } = useClipsData(
    folderId,
    inputVideoName
  );

  const { sortedClips, sortOptions, setSortField } = useClipsSorting(clips);
  const { currentPage, totalPages, paginatedRange, handlePageChange, isPending } =
    useClipsPagination({ totalItems: sortedClips.length });
  const {
    selectedIndices,
    selectedSet,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  } = useClipSelection();


  const handleBack = () => {
    router.push(`/clipper/${folderId}`);
  };

  const handleDelete = async () => {
    if (selectedIndices.length === 0) return;

    setIsDeleting(true);
    try {
      await softDeleteClips(selectedIndices);
      toast.success(`Deleted ${selectedIndices.length} clips`);
      clearSelection();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete clips";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <Skeleton key={i} className="aspect-[9/16] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video || !folder) {
    return (
      <div className="container max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4">
        <div className="text-center py-12">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Video not found</h3>
          <p className="text-muted-foreground mb-4">
            The video you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button onClick={handleBack}>Back to Folder</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4">
      <div className="space-y-6">
        <ClipsToolbar
          onBack={handleBack}
          selectedCount={selectedCount}
          totalCount={activeClips}
          onDelete={() => setIsDeleteDialogOpen(true)}
          sortOptions={sortOptions}
          onSortChange={setSortField}
          videoName={video.inputVideoName}
        />

        <ClipsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isPending={isPending}
        />

        <div className={isPending ? "opacity-60 transition-opacity" : ""}>
          <ClipsGrid
            allClips={sortedClips}
            visibleRange={paginatedRange}
            selectedSet={selectedSet}
            onToggleSelection={toggleSelection}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Clips</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} selected{" "}
              {selectedCount === 1 ? "clip" : "clips"}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
