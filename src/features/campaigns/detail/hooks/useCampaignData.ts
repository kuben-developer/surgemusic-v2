"use client"

import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import type { Id, Doc } from "../../../../../convex/_generated/dataModel"

export function useCampaignDetail(campaignId: string | undefined) {
  const campaign = useQuery(
    api.app.campaigns.get, 
    campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip"
  )
  
  const generatedVideos = useQuery(
    api.app.campaigns.getGeneratedVideos, 
    campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip"
  )
  
  const postedVideos = useQuery(
    api.app.campaigns.getPostedVideos,
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