"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { PageLoader, InlineLoader } from "@/components/loaders"
import { useProfiles } from './hooks/useProfiles'
import { useProfileSync } from './hooks/useProfileSync'
import { useProfileActions } from './hooks/useProfileActions'
import { useExpandedProfiles } from './hooks/useExpandedProfiles'
import { usePagination } from './hooks/usePagination'
import { ProfileList } from './components/ProfileList'
import { ProfilePagination } from './components/ProfilePagination'
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

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deletingProfile, setDeletingProfile] = useState<ProfileWithAccounts | null>(null)
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)

  const { expandedProfiles, toggleProfileExpansion } = useExpandedProfiles(profiles)

  // Pagination
  const ITEMS_PER_PAGE = 6
  const { currentPage, totalPages, paginatedRange, handlePageChange } = usePagination({
    totalItems: profiles.length,
    itemsPerPage: ITEMS_PER_PAGE,
  })

  const paginatedProfiles = useMemo(() => {
    return profiles.slice(paginatedRange.startIndex, paginatedRange.endIndex)
  }, [profiles, paginatedRange])

  const totalProfilesToSync = useMemo(() => {
    return profiles.filter(p => !!p.profileName).length
  }, [profiles])

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
    <div className="container mx-auto py-4 max-w-5xl">
      <div className="flex justify-between items-center mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Social Accounts</h1>
            {!isLoading && profiles.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
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
                <InlineLoader size="sm" />
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

      <Separator className="my-3" />

      {/* Profile List */}
      {isLoading ? (
        <PageLoader text="Loading social accounts..." minHeight="40vh" />
      ) : (
        <>
          <ProfileList
            profiles={paginatedProfiles}
            expandedProfiles={expandedProfiles}
            onToggleExpand={toggleProfileExpansion}
            onDelete={handleDeleteClick}
            onOpenManager={openProfileManager}
          />

          {/* Pagination */}
          <ProfilePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
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