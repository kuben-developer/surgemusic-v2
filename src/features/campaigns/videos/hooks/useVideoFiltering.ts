import { useMemo, useState } from "react"
import type { Doc } from "../../../../convex/_generated/dataModel"

export type StatusFilter = "all" | "posted" | "failed" | "scheduled" | "unscheduled"

export function useVideoFiltering(videos: Doc<"generatedVideos">[] | undefined) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  
  const filteredVideos = useMemo(() => {
    if (!videos) return []
    if (statusFilter === "all") return videos
    
    return videos.filter(video => {
      if (statusFilter === "posted") {
        return video.tiktokUpload?.status?.isPosted || 
               video.instagramUpload?.status?.isPosted || 
               video.youtubeUpload?.status?.isPosted
      }
      
      if (statusFilter === "failed") {
        return video.tiktokUpload?.status?.isFailed || 
               video.instagramUpload?.status?.isFailed || 
               video.youtubeUpload?.status?.isFailed
      }
      
      if (statusFilter === "scheduled") {
        const isScheduled = 
          (video.tiktokUpload?.scheduledAt !== null && video.tiktokUpload?.scheduledAt !== undefined) ||
          (video.instagramUpload?.scheduledAt !== null && video.instagramUpload?.scheduledAt !== undefined) ||
          (video.youtubeUpload?.scheduledAt !== null && video.youtubeUpload?.scheduledAt !== undefined)
          
        const isPosted = 
          video.tiktokUpload?.status?.isPosted || 
          video.instagramUpload?.status?.isPosted || 
          video.youtubeUpload?.status?.isPosted
          
        const isFailed = 
          video.tiktokUpload?.status?.isFailed || 
          video.instagramUpload?.status?.isFailed || 
          video.youtubeUpload?.status?.isFailed
          
        return isScheduled && !isPosted && !isFailed
      }
      
      if (statusFilter === "unscheduled") {
        const isScheduled = 
          (video.tiktokUpload?.scheduledAt !== null && video.tiktokUpload?.scheduledAt !== undefined) ||
          (video.instagramUpload?.scheduledAt !== null && video.instagramUpload?.scheduledAt !== undefined) ||
          (video.youtubeUpload?.scheduledAt !== null && video.youtubeUpload?.scheduledAt !== undefined)
          
        const isPosted = 
          video.tiktokUpload?.status?.isPosted || 
          video.instagramUpload?.status?.isPosted || 
          video.youtubeUpload?.status?.isPosted
          
        const isFailed = 
          video.tiktokUpload?.status?.isFailed || 
          video.instagramUpload?.status?.isFailed || 
          video.youtubeUpload?.status?.isFailed
          
        return !isScheduled && !isPosted && !isFailed
      }
      
      return true
    })
  }, [videos, statusFilter])
  
  const totalScheduledCount = useMemo(() => {
    if (!videos) return 0
    
    return videos.filter(video => 
      (video.tiktokUpload?.scheduledAt !== null && video.tiktokUpload?.scheduledAt !== undefined) ||
      (video.instagramUpload?.scheduledAt !== null && video.instagramUpload?.scheduledAt !== undefined) ||
      (video.youtubeUpload?.scheduledAt !== null && video.youtubeUpload?.scheduledAt !== undefined)
    ).length
  }, [videos])
  
  return {
    statusFilter,
    setStatusFilter,
    filteredVideos,
    totalScheduledCount,
  }
}