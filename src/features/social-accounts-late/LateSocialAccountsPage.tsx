"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageLoader } from "@/components/loaders"
import { useProfiles } from './hooks/useProfiles'
import { useProfileActions } from './hooks/useProfileActions'
import { useExpandedProfiles } from './hooks/useExpandedProfiles'
import { usePagination } from './hooks/usePagination'
import { ProfileList } from './components/ProfileList'
import { ProfilePagination } from './components/ProfilePagination'
import { CreateProfileDialog } from './dialogs/CreateProfileDialog'
import { DeleteProfileDialog } from './dialogs/DeleteProfileDialog'
import { ConnectPlatformDialog } from './dialogs/ConnectPlatformDialog'
import { DisconnectAccountDialog } from './dialogs/DisconnectAccountDialog'
import type { LateProfileWithAccounts, LateSocialAccount } from './types/social-accounts.types'
import type { Id } from "../../../convex/_generated/dataModel"

export function LateSocialAccountsPage() {
  const { profiles, isLoading } = useProfiles()
  const { createProfile, deleteProfile, openConnectUrl, disconnectAccount } = useProfileActions()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deletingProfile, setDeletingProfile] = useState<LateProfileWithAccounts | null>(null)
  const [connectingProfileId, setConnectingProfileId] = useState<Id<"lateProfiles"> | null>(null)
  const [disconnectingAccount, setDisconnectingAccount] = useState<LateSocialAccount | null>(null)

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

  const handleDeleteClick = (profileId: Id<"lateProfiles">) => {
    const profile = profiles.find(p => p._id === profileId)
    if (profile) {
      setDeletingProfile(profile)
    }
  }

  const handleConnectClick = (profileId: Id<"lateProfiles">) => {
    setConnectingProfileId(profileId)
  }

  const handlePlatformSelect = (profileId: Id<"lateProfiles">, platform: "tiktok" | "instagram" | "youtube") => {
    void openConnectUrl(profileId, platform)
  }

  const handleDisconnectClick = (accountId: Id<"lateSocialAccounts">) => {
    // Find the account in all profiles
    for (const profile of profiles) {
      const account = profile.socialAccounts.find(acc => acc._id === accountId)
      if (account) {
        setDisconnectingAccount(account)
        break
      }
    }
  }

  const handleDisconnectConfirm = async (accountId: Id<"lateSocialAccounts">) => {
    await disconnectAccount(accountId)
  }

  return (
    <div className="container mx-auto py-4 max-w-5xl">
      <div className="flex justify-between items-center mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Late Social Accounts</h1>
            {!isLoading && profiles.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect and manage your social media accounts via Late API
          </p>
        </div>
        <div className="flex gap-2">
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
        <PageLoader text="Loading Late profiles..." minHeight="40vh" />
      ) : (
        <>
          <ProfileList
            profiles={paginatedProfiles}
            expandedProfiles={expandedProfiles}
            onToggleExpand={toggleProfileExpansion}
            onDelete={handleDeleteClick}
            onConnect={handleConnectClick}
            onDisconnect={handleDisconnectClick}
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
      />

      <ConnectPlatformDialog
        isOpen={!!connectingProfileId}
        onOpenChange={(open) => !open && setConnectingProfileId(null)}
        onPlatformSelect={handlePlatformSelect}
        profileId={connectingProfileId}
        connectedAccounts={
          connectingProfileId
            ? profiles.find(p => p._id === connectingProfileId)?.socialAccounts || []
            : []
        }
      />

      <DisconnectAccountDialog
        isOpen={!!disconnectingAccount}
        onOpenChange={(open) => !open && setDisconnectingAccount(null)}
        onDisconnect={handleDisconnectConfirm}
        account={disconnectingAccount}
      />
    </div>
  )
}
