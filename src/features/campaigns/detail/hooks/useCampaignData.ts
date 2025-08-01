import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import type { Id, Doc } from "../../../../../convex/_generated/dataModel"

export function useCampaignData(campaignId: string | undefined) {
  const campaign = useQuery(
    api.campaigns.get, 
    campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip"
  )
  
  const generatedVideos = useQuery(
    api.campaigns.getGeneratedVideos, 
    campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip"
  )
  
  const postedVideos = useQuery(
    api.campaigns.getPostedVideos,
    campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip"
  )
  
  return {
    campaign,
    generatedVideos,
    postedVideos,
    isCampaignLoading: campaign === undefined,
    isVideosLoading: generatedVideos === undefined,
    isPostedVideosLoading: postedVideos === undefined,
  }
}