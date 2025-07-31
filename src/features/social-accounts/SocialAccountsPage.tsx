"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Users, Loader2 } from "lucide-react"
import { useProfiles } from './hooks/useProfiles'
import { useProfileSync } from './hooks/useProfileSync'
import { useProfileActions } from './hooks/useProfileActions'
import { ProfileList } from './components/ProfileList'
import { CreateProfileDialog } from './dialogs/CreateProfileDialog'
import { DeleteProfileDialog } from './dialogs/DeleteProfileDialog'
import { SyncDialog } from './dialogs/SyncDialog'
import type { ProfileWithAccounts } from './types/social-accounts.types'

export function SocialAccountsPage() {
  const { profiles, isLoading } = useProfiles()
  const { createProfile, deleteProfile, openProfileManager } = useProfileActions()
  const {
    syncProfiles,
    profileCheckResults,
    currentCheckIndex,
    completedChecksCount,
    isSyncingInProgress,
    setProfileCheckResults,
  } = useProfileSync()

  const [expandedProfiles, setExpandedProfiles] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deletingProfile, setDeletingProfile] = useState<ProfileWithAccounts | null>(null)
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)

  const totalProfilesToSync = useMemo(() => {
    return profiles.filter(p => !!p.profileName).length
  }, [profiles])

  // Set initially expanded profiles when data loads
  useEffect(() => {
    if (profiles.length > 0) {
      setExpandedProfiles(profiles.map(profile => profile.profileName))
    }
  }, [profiles])

  const toggleProfileExpansion = (profileName: string) => {
    setExpandedProfiles(prev =>
      prev.includes(profileName)
        ? prev.filter(n => n !== profileName)
        : [...prev, profileName]
    )
  }

  const handleStartSync = async () => {
    setIsSyncDialogOpen(true)
    await syncProfiles(profiles)
  }

  const handleDeleteClick = (profileName: string) => {
    const profile = profiles.find(p => p.profileName === profileName)
    if (profile) {
      setDeletingProfile(profile)
    }
  }

  const handleSyncDialogChange = (open: boolean) => {
    setIsSyncDialogOpen(open)
    if (!open && !isSyncingInProgress) {
      // Reset state when dialog closes after sync is complete
      setProfileCheckResults([])
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Social Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect and manage your social media accounts by user profiles
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1" 
            onClick={handleStartSync} 
            disabled={isSyncingInProgress || isLoading}
          >
            {isSyncingInProgress ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Syncing...
              </>
            ) : (
              "Sync Profiles"
            )}
          </Button>
          <CreateProfileDialog
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onCreate={createProfile}
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Summary Stats */}
      <div className="mb-6 rounded-lg bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{profiles.length}</p>
            <p className="text-sm text-muted-foreground">Total Profiles</p>
          </div>
        </div>
      </div>

      {/* Profile List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ProfileList
          profiles={profiles}
          expandedProfiles={expandedProfiles}
          onToggleExpand={toggleProfileExpansion}
          onDelete={handleDeleteClick}
          onOpenManager={openProfileManager}
        />
      )}

      {/* Dialogs */}
      <DeleteProfileDialog
        profile={deletingProfile}
        isOpen={!!deletingProfile}
        onOpenChange={(open) => !open && setDeletingProfile(null)}
        onDelete={deleteProfile}
        onOpenManager={openProfileManager}
      />

      <SyncDialog
        isOpen={isSyncDialogOpen}
        onOpenChange={handleSyncDialogChange}
        profileCheckResults={profileCheckResults}
        currentCheckIndex={currentCheckIndex}
        completedChecksCount={completedChecksCount}
        totalProfilesToSync={totalProfilesToSync}
        isSyncingInProgress={isSyncingInProgress}
      />
    </div>
  )
}