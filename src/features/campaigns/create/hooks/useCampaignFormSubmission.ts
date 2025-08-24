"use client"

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { type LyricsLine } from "@/utils/srt-converter.utils";

export interface CreateCampaignData {
  campaignName: string;
  songName: string;
  artistName: string;
  campaignCoverImageUrl?: string;
  videoCount: number;
  genre: string;
  themes: string[];
  songAudioUrl?: string;
  musicVideoUrl?: string;
  lyrics?: LyricsLine[];
}

interface SubmissionProps {
  setIsPending: (value: boolean) => void;
}

export function useCampaignFormSubmission({ setIsPending }: SubmissionProps) {
  const router = useRouter();
  const createCampaignMutation = useMutation(api.app.campaigns.create);

  const createCampaign = async (data: CreateCampaignData) => {
    setIsPending(true);
    try {
      // Prepare the data with lyrics if available
      const campaignData = {
        ...data,
        lyrics: data.lyrics && data.lyrics.length > 0 ? data.lyrics : undefined,
      };
      
      const campaignId = await createCampaignMutation(campaignData);
      router.push(`/campaign/${campaignId}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    } finally {
      setIsPending(false);
    }
  };

  return {
    createCampaign,
  };
}