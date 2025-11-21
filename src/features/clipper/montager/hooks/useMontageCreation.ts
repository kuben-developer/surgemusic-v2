"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import type { MontagerFolderId, ClipperFolderId } from "../../shared/types/common.types";

interface CreateConfigInput {
  folderId: MontagerFolderId;
  clipperFolderIds: ClipperFolderId[];
  numberOfMontages: number;
}

export function useMontageCreation() {
  const createConfigMutation = useMutation(api.app.montagerDb.createConfig);

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMontageConfig = async (input: CreateConfigInput) => {
    setIsCreating(true);
    setError(null);

    try {
      // Validate input
      if (input.clipperFolderIds.length === 0) {
        throw new Error("Please select at least one clipper folder");
      }

      if (input.numberOfMontages < 1 || input.numberOfMontages > 1000) {
        throw new Error("Number of montages must be between 1 and 1000");
      }

      // Create the config in Convex - random selection happens on API call
      const result = await createConfigMutation({
        folderId: input.folderId,
        clipperFolderIds: input.clipperFolderIds,
        numberOfMontages: input.numberOfMontages,
      });

      toast.success(`Configuration created with ${result.totalClipsAvailable} clips available`);

      return {
        success: true,
        configId: result.configId,
        totalClipsAvailable: result.totalClipsAvailable,
        montagesRequested: input.numberOfMontages,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create montage configuration");
      setError(error);
      toast.error(error.message);
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
