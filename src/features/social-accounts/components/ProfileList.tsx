"use client"

import { ProfileCard } from './ProfileCard'
import type { ProfileWithAccounts } from '../types/social-accounts.types'

interface ProfileListProps {
  profiles: ProfileWithAccounts[]
  expandedProfiles: string[]
  onToggleExpand: (profileName: string) => void
  onDelete: (profileName: string) => void
  onOpenManager: (profileKey: string) => void
  generatingUrls?: Set<string>
}

export function ProfileList({ 
  profiles, 
  expandedProfiles,
  onToggleExpand,
  onDelete,
  onOpenManager,
  generatingUrls = new Set()
}: ProfileListProps) {
  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No social account profiles found.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create a profile to start connecting your social accounts.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile._id}
          profile={profile}
          isExpanded={expandedProfiles.includes(profile.profileName)}
          onToggleExpand={onToggleExpand}
          onDelete={onDelete}
          onOpenManager={onOpenManager}
          isGeneratingUrl={generatingUrls.has(profile.profileKey || '')}
        />
      ))}
    </div>
  )
}