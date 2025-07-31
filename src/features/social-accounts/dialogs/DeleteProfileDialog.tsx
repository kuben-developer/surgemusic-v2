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
import { ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ProfileWithAccounts } from '../types/social-accounts.types'

interface DeleteProfileDialogProps {
  profile: ProfileWithAccounts | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (profileName: string) => Promise<void>
  onOpenManager: (profileKey: string) => void
}

export function DeleteProfileDialog({ 
  profile, 
  isOpen, 
  onOpenChange, 
  onDelete,
  onOpenManager 
}: DeleteProfileDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!profile) return null

  const profileDisplayName = profile.profileName.split("|")[0]
  const hasConnectedAccounts = profile.socialAccounts.length > 0

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(profile.profileName)
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
            Are you sure you want to delete the profile &ldquo;{profileDisplayName}&rdquo;?
          </DialogDescription>
          {hasConnectedAccounts && (
            <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded border border-amber-200 dark:border-amber-800/50 text-xs">
              <span className="font-medium">Warning:</span> This profile has connected social accounts.
              You must first unlink all accounts before deleting the profile.
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-7"
                  onClick={() => {
                    onOpenManager(profile.profileKey ?? '')
                    onOpenChange(false)
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Unlink Accounts
                </Button>
              </div>
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
            variant="destructive"
            onClick={handleDelete}
            disabled={hasConnectedAccounts || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : hasConnectedAccounts ? (
              "Unlink Accounts First"
            ) : (
              "Delete Profile"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}