"use client"

import { useEffect, useState } from "react"
import type { Doc } from "../../../../../convex/_generated/dataModel"

export function useCampaignProgress(campaign: Doc<"campaigns"> | null | undefined) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!campaign) return

    const updateProgress = () => {
      if (campaign.status === 'completed') {
        setProgress(100)
        return
      }

      const now = new Date()
      const createdAt = new Date(campaign._creationTime)
      const elapsedMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)

      // Calculate progress: 0-5 minutes maps to 0-90%
      const calculatedProgress = Math.min(90, (elapsedMinutes / 5) * 90)
      const progress = Number(calculatedProgress.toFixed(1))
      setProgress(progress)
      
      if (progress === 89.7) {
        // Reload the page to check if the campaign is completed
        window.location.reload()
      }
    }

    // Initial update
    updateProgress()

    // Update every second
    const interval = setInterval(updateProgress, 1000)

    return () => clearInterval(interval)
  }, [campaign])

  return progress
}