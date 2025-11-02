"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import JSZip from "jszip";
import type { Montage } from "../../shared/types/common.types";

export function useDownloadAllMontages() {
  const getMontageUrlAction = useAction(api.app.montager.getMontageUrl);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const downloadAll = async (montages: Montage[], folderName: string) => {
    if (montages.length === 0) {
      return;
    }

    setIsDownloading(true);
    setProgress({ current: 0, total: montages.length });

    try {
      const zip = new JSZip();
      const timestamp = Date.now();

      // Download each montage and add to zip
      for (let i = 0; i < montages.length; i++) {
        const montage = montages[i];
        if (!montage) continue;

        try {
          // Get presigned URL
          const url = await getMontageUrlAction({ key: montage.key });

          // Fetch the video file
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${montage.filename}`);
          }

          const blob = await response.blob();

          // Add to zip
          zip.file(montage.filename, blob);

          // Update progress
          setProgress({ current: i + 1, total: montages.length });
        } catch (error) {
          console.error(`Error downloading ${montage.filename}:`, error);
          // Continue with other files even if one fails
        }
      }

      // Generate and download zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipFilename = `montages_${folderName}_${timestamp}.zip`;

      // Use browser's native download (no need for file-saver library)
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = zipFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, downloadedCount: progress.current };
    } catch (error) {
      console.error("Error creating zip file:", error);
      throw error;
    } finally {
      setIsDownloading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return {
    downloadAll,
    isDownloading,
    progress,
  };
}
