"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle } from "lucide-react"
import { SyncProgressBar } from '../components/SyncProgressBar'
import { ProfileListColumn } from '../components/ProfileListColumn'
import { useSyncDialog } from '../hooks/useSyncDialog'
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
  const { handleClose, getProfileGroups, setActiveRef, setDeletedRef } = useSyncDialog({
    isOpen,
    currentCheckIndex,
    profileCheckResults,
    isSyncingInProgress
  });

  const { activeProfiles, deletedProfiles } = getProfileGroups();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => handleClose(open, onOpenChange)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="pb-1">
          <DialogTitle>Syncing Profiles</DialogTitle>
          <DialogDescription>
            Checking status of your social profiles
          </DialogDescription>
        </DialogHeader>

        {isOpen && (
          <SyncProgressBar 
            completedChecksCount={completedChecksCount}
            totalProfilesToSync={totalProfilesToSync}
          />
        )}

        {/* Results in two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1">
          <ProfileListColumn
            title="Active Profiles"
            icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
            profiles={activeProfiles}
            emptyMessage="No active profiles found"
            onRefCallback={setActiveRef}
            showEmptyForZeroLength={!isSyncingInProgress}
          />

          <ProfileListColumn
            title="Deleted Profiles"
            icon={<XCircle className="h-4 w-4 text-red-500" />}
            profiles={deletedProfiles}
            emptyMessage="No deleted profiles found"
            onRefCallback={setDeletedRef}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}