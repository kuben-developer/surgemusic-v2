import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"
import type { ProfileCheckResult, ProfileWithAccounts } from '../types/social-accounts.types'

export function useProfileSync() {
  const checkProfilesMutation = useMutation(api.ayrshare.checkProfiles)
  
  const [profileCheckResults, setProfileCheckResults] = useState<ProfileCheckResult[]>([])
  const [currentCheckIndex, setCurrentCheckIndex] = useState(-1)
  const [completedChecksCount, setCompletedChecksCount] = useState(0)
  const [isSyncingInProgress, setIsSyncingInProgress] = useState(false)

  const syncProfiles = async (profiles: ProfileWithAccounts[]) => {
    const validProfiles = profiles.filter(profile => !!profile.profileName && profile.profileName)
    
    if (validProfiles.length === 0) {
      toast.info("No valid profiles to sync.")
      return
    }

    setIsSyncingInProgress(true)
    setCompletedChecksCount(0)
    setCurrentCheckIndex(-1)
    
    const initialResults: ProfileCheckResult[] = validProfiles.map(profile => ({
      profileName: profile.profileName!.split("|")[0] || "Unknown Profile",
      message: "Queued",
      status: 'pending'
    }))
    
    setProfileCheckResults(initialResults)

    const batchSize = 10
    for (let i = 0; i < validProfiles.length; i += batchSize) {
      const batch = validProfiles.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (profile, batchIndex) => {
        const overallIndex = i + batchIndex
        
        setCurrentCheckIndex(overallIndex)
        setProfileCheckResults(prev => 
          prev.map((r, idx) => 
            idx === overallIndex 
              ? { ...r, status: 'pending' as const, message: "Checking..." }
              : r
          )
        )

        try {
          const result = await checkProfilesMutation({ profileName: profile.profileName })
          
          setProfileCheckResults(prev => 
            prev.map((r, idx) => 
              idx === overallIndex 
                ? { 
                    ...r, 
                    status: 'success' as const, 
                    message: result?.profiles === 0 ? "Deleted" : "All Good"
                  }
                : r
            )
          )
        } catch (error) {
          setProfileCheckResults(prev => 
            prev.map((r, idx) => 
              idx === overallIndex 
                ? { ...r, status: 'error' as const, message: "Error checking" }
                : r
            )
          )
        }

        setCompletedChecksCount(prev => prev + 1)
      })

      await Promise.all(batchPromises)
    }
    
    toast.success("Profile sync complete!", {
      description: `${completedChecksCount} of ${validProfiles.length} profiles checked.`
    })
    
    setIsSyncingInProgress(false)
  }

  return {
    syncProfiles,
    profileCheckResults,
    currentCheckIndex,
    completedChecksCount,
    isSyncingInProgress,
    setProfileCheckResults,
    setCurrentCheckIndex,
    setCompletedChecksCount,
    setIsSyncingInProgress
  }
}