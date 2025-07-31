"use client"

import { useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { ProfileCheckResult } from '../types/social-accounts.types'

interface SyncDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  profileCheckResults: ProfileCheckResult[]
  currentCheckIndex: number
  completedChecksCount: number
  totalProfilesToSync: number
  isSyncingInProgress: boolean
}

export function SyncDialog({ 
  isOpen, 
  onOpenChange,
  profileCheckResults,
  currentCheckIndex,
  completedChecksCount,
  totalProfilesToSync,
  isSyncingInProgress
}: SyncDialogProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const deletedItemRefs = useRef<(HTMLDivElement | null)[]>([])

  // Auto-scrolling effect
  useEffect(() => {
    if (!isOpen || currentCheckIndex < 0) return
    
    const currentProfile = profileCheckResults[currentCheckIndex]
    if (!currentProfile) return
    
    if (currentProfile.message === "Deleted") {
      const deletedIndex = profileCheckResults
        .filter(r => r.message === "Deleted")
        .findIndex(r => r.profileName === currentProfile.profileName)
      
      if (deletedIndex >= 0 && deletedItemRefs.current[deletedIndex]) {
        deletedItemRefs.current[deletedIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    } else {
      const activeIndex = profileCheckResults
        .filter(r => r.message !== "Deleted")
        .findIndex(r => r.profileName === currentProfile.profileName)
      
      if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
        itemRefs.current[activeIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    }
  }, [currentCheckIndex, isOpen, profileCheckResults])

  // Initialize ref arrays when results change
  useEffect(() => {
    itemRefs.current = new Array(profileCheckResults.filter(r => r.message !== "Deleted").length).fill(null)
    deletedItemRefs.current = new Array(profileCheckResults.filter(r => r.message === "Deleted").length).fill(null)
  }, [profileCheckResults])

  const handleClose = (open: boolean) => {
    if (!open && isSyncingInProgress) {
      toast.info("Sync Canceled", {
        description: "Profile sync was closed before completion."
      })
    }
    onOpenChange(open)
  }

  const activeProfiles = isSyncingInProgress 
    ? profileCheckResults.filter(result => result.message !== "Deleted")
    : profileCheckResults.filter(result => result.message === "All Good")

  const deletedProfiles = profileCheckResults.filter(result => result.message === "Deleted")

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="pb-1">
          <DialogTitle>Syncing Profiles</DialogTitle>
          <DialogDescription>
            Checking status of your social profiles
          </DialogDescription>
        </DialogHeader>

        {isOpen && totalProfilesToSync > 0 && (
          <div className="my-3">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Progress</span>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {completedChecksCount} / {totalProfilesToSync}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-200 ease-linear"
                style={{ width: `${totalProfilesToSync > 0 ? (completedChecksCount / totalProfilesToSync) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Results in two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1">
          {/* Active Profiles Column */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Active Profiles
            </h3>
            <div className="border rounded-md">
              <div className="space-y-0.5 p-1 max-h-[30vh] overflow-y-auto">
                {activeProfiles.map((result, index) => (
                  <div 
                    key={`active-${index}`} 
                    ref={el => { itemRefs.current[index] = el }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-1.5">
                      {result.status === 'pending' ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      ) : result.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium text-sm">{result.profileName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">{result.message}</span>
                  </div>
                ))}
                {!isSyncingInProgress && activeProfiles.length === 0 && (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    No active profiles found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Deleted Profiles Column */}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-red-500" />
              Deleted Profiles
            </h3>
            <div className="border rounded-md">
              <div className="space-y-0.5 p-1 max-h-[30vh] overflow-y-auto">
                {deletedProfiles.map((result, index) => (
                  <div 
                    key={`deleted-${index}`}
                    ref={el => { deletedItemRefs.current[index] = el }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-sm">{result.profileName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">{result.message}</span>
                  </div>
                ))}
                {deletedProfiles.length === 0 && (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    No deleted profiles found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}