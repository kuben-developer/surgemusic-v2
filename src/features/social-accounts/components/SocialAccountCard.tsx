"use client"

import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import { PlatformIcon } from './PlatformIcon'
import { getPlatformBadgeClass, formatPlatformName } from '../utils/platform.utils'
import type { SocialAccount } from '../types/social-accounts.types'

interface SocialAccountCardProps {
  account: SocialAccount
}

export function SocialAccountCard({ account }: SocialAccountCardProps) {
  return (
    <div className="bg-muted/30 rounded-md p-3 flex items-center gap-3">
      {account.userImage ? (
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
          <p className="font-medium text-sm truncate">{account.username}</p>
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
          Connected {new Date(account._creationTime).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <Badge className={`${getPlatformBadgeClass(account.platform)} text-xs px-2 py-0.5`}>
        {formatPlatformName(account.platform)}
      </Badge>
    </div>
  )
}