"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import type { PodcastFolderId } from "../../shared/types/podcast-clipper.types";
import type { SceneTypeCropState } from "../types/calibration.types";

export function useSaveCropRegions(folderId: PodcastFolderId) {
  const saveCropsMutation = useMutation(api.app.podcastClipperDb.saveCropRegions);
  const [isSaving, setIsSaving] = useState(false);

  const saveCrops = async (sceneTypeCrops: SceneTypeCropState[]) => {
    setIsSaving(true);
    try {
      // Collect keyframe crops that have been customized
      const keyframeCrops = sceneTypeCrops.flatMap((st) =>
        st.keyframes
          .filter((kf) => kf.crop !== null)
          .map((kf) => ({
            keyframeId: kf.keyframeId,
            crop: kf.crop ?? undefined,
            altCrop: kf.altCrop ?? undefined,
          }))
      );

      await saveCropsMutation({
        folderId,
        crops: sceneTypeCrops.map((st) => ({
          sceneTypeId: st.sceneTypeDbId,
          crop: st.crop,
          altCrop: st.hasAltCrop && st.altCrop ? st.altCrop : undefined,
        })),
        keyframeCrops: keyframeCrops.length > 0 ? keyframeCrops : undefined,
      });
      toast.success("Crop regions saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save crops");
    } finally {
      setIsSaving(false);
    }
  };

  return { saveCrops, isSaving };
}
