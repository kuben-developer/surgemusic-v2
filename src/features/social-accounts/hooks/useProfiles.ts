import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"

export function useProfiles() {
  const profiles = useQuery(api.ayrshare.getProfiles)
  const isLoading = profiles === undefined
  
  return {
    profiles: profiles || [],
    isLoading,
    profileCount: profiles?.length || 0
  }
}