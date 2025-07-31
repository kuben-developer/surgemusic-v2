import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"

export function useProfileActions() {
  const createProfileMutation = useMutation(api.ayrshare.createProfile)
  const deleteProfileMutation = useMutation(api.ayrshare.deleteProfileMutation)
  const generateUrlMutation = useMutation(api.ayrshare.generateProfileManagerUrl)

  const createProfile = async (profileName: string) => {
    try {
      await createProfileMutation({ profileName })
    } catch (error) {
      throw error
    }
  }

  const deleteProfile = async (profileName: string) => {
    try {
      await deleteProfileMutation({ profileName })
    } catch (error) {
      throw error
    }
  }

  const openProfileManager = async (profileKey: string) => {
    try {
      const data = await generateUrlMutation({ profileKey })
      if (data && 'url' in data && data.url) {
        window.open(data.url as string, '_blank')
      }
    } catch (error) {
      toast.error(`Failed to generate manager URL: ${(error as Error).message}`)
    }
  }

  return {
    createProfile,
    deleteProfile,
    openProfileManager
  }
}