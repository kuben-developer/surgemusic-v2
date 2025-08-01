"use client"

import { Button } from "@/components/ui/button"
import { SocialAccountCard } from './SocialAccountCard'
import type { ProfileWithAccounts } from '../types/social-accounts.types'

interface ProfileContentProps {
  profile: ProfileWithAccounts
  onOpenManager: (profileKey: string) => void
}

export function ProfileContent({ profile, onOpenManager }: ProfileContentProps) {
  if (profile.socialAccounts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No social accounts connected yet.</p>
        <Button
          variant="link"
          className="p-0 h-auto text-sm"
          onClick={() => onOpenManager(profile.profileKey ?? '')}
        >
          Connect an account
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {profile.socialAccounts.map((account) => (
        <SocialAccountCard key={account._id} account={account} />
      ))}
    </div>
  )
}