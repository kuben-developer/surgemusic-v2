"use client"

import { useAction, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"

export function useProfileActions() {
  const createProfileMutation = useMutation(api.app.ayrshare.createProfile)
  const deleteProfileMutation = useMutation(api.app.ayrshare.deleteProfileMutation)
  const generateProfileManagerUrlAction = useAction(api.app.ayrshare.generateProfileManagerUrl)

  const createProfile = async (profileName: string) => {
    try {
      await createProfileMutation({ profileName })
      toast.success(`Profile "${profileName}" created successfully!`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile'
      toast.error(`Failed to create profile: ${errorMessage}`)
      throw error
    }
  }

  const deleteProfile = async (profileName: string) => {
    try {
      await deleteProfileMutation({ profileName })
      toast.success(`Profile "${profileName}" deleted successfully!`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete profile'
      toast.error(`Failed to delete profile: ${errorMessage}`)
      throw error
    }
  }

  const openProfileManager = async (profileKey: string) => {
    try {
      const data = await generateProfileManagerUrlAction({ profileKey })
      console.log('generateProfileManagerUrl action response', data)
      if (data && 'url' in data && data.url) {
        window.open(data.url as string, '_blank')
      } else {
        toast.error('No manager URL received from server')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to generate manager URL: ${errorMessage}`)
    }
  }

  return {
    createProfile,
    deleteProfile,
    openProfileManager
  }
}
