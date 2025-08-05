"use client"

import { Users } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No user profiles</h3>
        <p className="text-muted-foreground mt-1 mb-4 max-w-md text-sm">
          Create a user profile to organize your social accounts
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile._id}
          profile={profile}
          isExpanded={expandedProfiles.includes(profile.profileName)}
          onToggleExpand={onToggleExpand}
          onDelete={onDelete}
          onOpenManager={onOpenManager}
          isGeneratingUrl={generatingUrls.has(profile.profileKey ?? '')}
        />
      ))}
    </div>
  )
}