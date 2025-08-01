import { useState } from "react";
import { toast } from "sonner";
import JSZip from 'jszip';
import type { Doc } from "../../../../../convex/_generated/dataModel";

interface UseVideoDownloadProps {
  campaign?: Doc<"campaigns">;
  generatedVideos?: Doc<"generatedVideos">[];
}

export function useVideoDownload({ campaign, generatedVideos }: UseVideoDownloadProps) {
  const [downloadingVideos, setDownloadingVideos] = useState<{ [key: string]: boolean }>({});
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownloadVideo = async (videoUrl: string, videoName: string, videoId: string) => {
    if (!videoUrl) {
      toast.error("Video URL not found");
      return;
    }

    setDownloadingVideos(prev => ({ ...prev, [videoId]: true }));

    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoName}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Video downloaded successfully");
    } catch (error) {
      console.error("Error downloading video:", error);
      toast.error("Error downloading video. Please try again later.");
    } finally {
      setDownloadingVideos(prev => ({ ...prev, [videoId]: false }));
    }
  };

  const handleDownloadAll = async () => {
    if (!generatedVideos?.length || !campaign) {
      toast.error("No videos to download");
      return;
    }

    setDownloadingAll(true);
    setProgress(0);

    try {
      const zip = new JSZip();
      const totalVideos = generatedVideos.length;

      toast.info("Starting download of all videos...");

      for (let i = 0; i < generatedVideos.length; i++) {
        const video = generatedVideos[i];
        try {
          const response = await fetch(video.video.url);
          const blob = await response.blob();
          zip.file(`${video.video.name}.mp4`, blob);
          
          // Update progress
          const currentProgress = Math.round(((i + 1) / totalVideos) * 100);
          setProgress(currentProgress);
        } catch (error) {
          console.error(`Error downloading video ${video.video.name}:`, error);
          // Continue with other videos even if one fails
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaign.campaignName.replace(/\s+/g, '_')}_videos.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("All videos have been downloaded successfully.");
    } catch (error) {
      console.error("Error downloading all videos:", error);
      toast.error("Error downloading videos. Please try again later.");
    } finally {
      setDownloadingAll(false);
      setProgress(0);
    }
  };

  return {
    downloadingVideos,
    downloadingAll,
    progress,
    handleDownloadVideo,
    handleDownloadAll,
  };
}