"use client"

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";

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
  lyricVideoUrl?: string;
}

interface SubmissionProps {
  setIsPending: (value: boolean) => void;
}

export function useCampaignFormSubmission({ setIsPending }: SubmissionProps) {
  const router = useRouter();
  const createCampaignMutation = useMutation(api.campaigns.create);

  const createCampaign = async (data: CreateCampaignData) => {
    setIsPending(true);
    try {
      const campaignId = await createCampaignMutation(data);
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