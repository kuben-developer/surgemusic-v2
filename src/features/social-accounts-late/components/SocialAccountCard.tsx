"use client"

import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, X } from "lucide-react"
import { PlatformIcon } from './PlatformIcon'
import { getPlatformBadgeClass, formatPlatformName } from '../utils/platform.utils'
import type { LateSocialAccount } from '../types/social-accounts.types'
import type { Id } from "../../../../convex/_generated/dataModel"

interface SocialAccountCardProps {
  account: LateSocialAccount
  onDisconnect: (accountId: Id<"lateSocialAccounts">) => void
}

export function SocialAccountCard({ account, onDisconnect }: SocialAccountCardProps) {
  return (
    <div className="group relative bg-muted/30 rounded-md p-3 flex items-center gap-3">
      {false ? (
        <Image
          src={account.userImage}
          alt={`${account.username} avatar`}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <PlatformIcon platform={account.platform} />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="font-medium text-sm truncate">
            {account.displayName || account.username}
          </p>
          {account.profileUrl && (
            <a
              href={account.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          @{account.username}
        </p>
      </div>
      <Badge className={`${getPlatformBadgeClass(account.platform)} text-xs px-2 py-0.5`}>
        {formatPlatformName(account.platform)}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onDisconnect(account._id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
