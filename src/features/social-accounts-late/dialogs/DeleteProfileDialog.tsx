"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { InlineLoader } from "@/components/loaders"
import type { LateProfileWithAccounts } from '../types/social-accounts.types'
import type { Id } from "../../../../convex/_generated/dataModel"

interface DeleteProfileDialogProps {
  profile: LateProfileWithAccounts | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (profileId: Id<"lateProfiles">) => Promise<void>
}

export function DeleteProfileDialog({
  profile,
  isOpen,
  onOpenChange,
  onDelete
}: DeleteProfileDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!profile) return null

  const hasConnectedAccounts = profile.socialAccounts.length > 0

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(profile._id)
      toast.success("Profile deleted successfully")
      onOpenChange(false)
    } catch (error) {
      toast.error(`Failed to delete profile: ${(error as Error).message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Profile</DialogTitle>
          <DialogDescription className="pt-1.5">
            Are you sure you want to delete the profile &ldquo;{profile.profileName}&rdquo;?
          </DialogDescription>
          {hasConnectedAccounts && (
            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded border border-amber-200 dark:border-amber-800/50 text-xs">
              <span className="font-medium">Warning:</span> This profile has {profile.socialAccounts.length} connected social account{profile.socialAccounts.length > 1 ? 's' : ''}.
              Deleting this profile will remove all connected accounts.
            </div>
          )}
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. It will permanently delete the profile and all of its data.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <InlineLoader size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Profile"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
