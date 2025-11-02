"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { ClipperClip, MontageConfigInput } from "../../shared/types/common.types";
import { distributeClipsToMontages, validateMontageRequest } from "../utils/clip-distribution.utils";

export function useMontageCreation() {
  const listClipsAction = useAction(api.app.clipper.listClips);
  const uploadConfigAction = useAction(api.app.montager.uploadMontageConfig);

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMontageConfig = async (input: MontageConfigInput) => {
    setIsCreating(true);
    setError(null);

    try {
      // Step 1: Fetch clips from all selected clipper folders
      const allClipsPromises = input.selectedClipperFolders.map((folderName) =>
        listClipsAction({ folderName })
      );

      const allClipsArrays = await Promise.all(allClipsPromises);
      const allClips: ClipperClip[] = allClipsArrays.flat();

      if (allClips.length === 0) {
        throw new Error("No clips found in selected folders");
      }

      // Step 2: Validate request
      const validation = validateMontageRequest(allClips.length, input.numberOfMontages);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Step 3: Distribute clips randomly across montages
      const montages = distributeClipsToMontages(allClips, input.numberOfMontages);

      // Step 4: Upload configuration to S3
      const result = await uploadConfigAction({
        folderName: input.folderName,
        configName: input.configName,
        montages,
        createdAt: new Date().toISOString(),
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        success: true,
        message: result.message,
        montagesCreated: montages.length,
        totalClipsUsed: montages.length * 14,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create montage configuration");
      setError(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createMontageConfig,
    isCreating,
    error,
  };
}
