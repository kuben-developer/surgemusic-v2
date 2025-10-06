"use client"

import { Button } from "@/components/ui/button"
import { SocialAccountCard } from './SocialAccountCard'
import type { LateProfileWithAccounts } from '../types/social-accounts.types'
import type { Id } from "../../../../convex/_generated/dataModel"

interface ProfileContentProps {
  profile: LateProfileWithAccounts
  onConnect: (profileId: Id<"lateProfiles">) => void
  onDisconnect: (accountId: Id<"lateSocialAccounts">) => void
}

export function ProfileContent({ profile, onConnect, onDisconnect }: ProfileContentProps) {
  if (profile.socialAccounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-3 text-center">
        <p className="text-muted-foreground text-xs">
          No accounts connected to this profile.
        </p>
        <Button
          variant="link"
          className="p-0 h-auto text-xs"
          onClick={() => onConnect(profile._id)}
        >
          Connect an account
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {profile.socialAccounts.map((account) => (
        <SocialAccountCard
          key={account._id}
          account={account}
          onDisconnect={onDisconnect}
        />
      ))}
    </div>
  )
}
