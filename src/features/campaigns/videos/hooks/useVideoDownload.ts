"use client"

import { useState } from "react"
import { toast } from "sonner"
import JSZip from "jszip"
import type { Doc } from "../../../../../convex/_generated/dataModel"

export function useVideoDownload() {
  const [downloadingVideos, setDownloadingVideos] = useState<{ [key: string]: boolean }>({})
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const handleDownloadVideo = async (
    videoUrl: string, 
    videoName: string, 
    videoId: string
  ) => {
    try {
      setDownloadingVideos(prev => ({ ...prev, [videoId]: true }))
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Extract file extension from URL or default to .mp4
      const urlParts = videoUrl.split('/')
      const fileName = urlParts[urlParts.length - 1] || ''
      const extension = fileName.includes('.') 
        ? fileName.substring(fileName.lastIndexOf('.')) 
        : '.mp4'
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${videoName}_${videoId}${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast.error("Error downloading video. Please try again later.")
    } finally {
      setDownloadingVideos(prev => ({ ...prev, [videoId]: false }))
    }
  }

  const handleDownloadAll = async (
    videos: Doc<"generatedVideos">[], 
    campaignName: string
  ) => {
    if (!videos?.length) return

    try {
      setDownloadingAll(true)
      toast.info("Creating zip file of all videos...")

      const zip = new JSZip()
      const videoFolder = zip.folder("videos")

      // Process videos in batches of 5
      const BATCH_SIZE = 5
      const totalVideos = videos.length

      // Split videos into batches
      for (let i = 0; i < totalVideos; i += BATCH_SIZE) {
        const batch = videos.slice(i, i + BATCH_SIZE)

        // Download batch in parallel
        const batchPromises = batch.map(async (video) => {
          try {
            setDownloadingVideos(prev => ({ ...prev, [String(video._id)]: true }))

            const response = await fetch(video.video.url)
            const blob = await response.blob()
            
            // Extract file extension from URL or default to .mp4
            const urlParts = video.video.url.split('/')
            const fileName = urlParts[urlParts.length - 1] || ''
            const extension = fileName.includes('.') 
              ? fileName.substring(fileName.lastIndexOf('.')) 
              : '.mp4'
            
            // Create filename with proper extension
            const safeFileName = `${video.video.name}_${video._id}${extension}`
            videoFolder?.file(safeFileName, blob)

            setDownloadingVideos(prev => ({ ...prev, [String(video._id)]: false }))
            return blob
          } catch (error) {
            console.error(`Error downloading video ${video.video.name}:`, error)
            return null
          }
        })

        // Wait for current batch to complete before starting next batch
        await Promise.all(batchPromises)

        // Update progress
        const progress = Math.min(100, Math.round(((i + batch.length) / totalVideos) * 100))
        setDownloadProgress(progress)
      }

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" })
      const url = window.URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `${campaignName.replace(/\s+/g, '_')}_videos.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("All videos have been downloaded successfully.")
    } catch (error) {
      console.error("Error downloading all videos:", error)
      toast.error("Error downloading videos. Please try again later.")
    } finally {
      setDownloadingAll(false)
      setDownloadProgress(0)
    }
  }

  return {
    downloadingVideos,
    downloadingAll,
    downloadProgress,
    handleDownloadVideo,
    handleDownloadAll,
  }
}