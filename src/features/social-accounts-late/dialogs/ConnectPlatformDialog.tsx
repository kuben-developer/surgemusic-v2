"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Music, Instagram, Youtube, Check } from "lucide-react"
import type { Id } from "../../../../convex/_generated/dataModel"
import type { LateSocialAccount } from "../types/social-accounts.types"

interface ConnectPlatformDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onPlatformSelect: (profileId: Id<"lateProfiles">, platform: "tiktok" | "instagram" | "youtube") => void
  profileId: Id<"lateProfiles"> | null
  connectedAccounts: LateSocialAccount[]
}

export function ConnectPlatformDialog({
  isOpen,
  onOpenChange,
  onPlatformSelect,
  profileId,
  connectedAccounts
}: ConnectPlatformDialogProps) {
  const handlePlatformClick = (platform: "tiktok" | "instagram" | "youtube") => {
    if (profileId) {
      onPlatformSelect(profileId, platform)
      onOpenChange(false)
    }
  }

  const isPlatformConnected = (platform: "tiktok" | "instagram" | "youtube") => {
    return connectedAccounts.some(account => account.platform === platform)
  }

  const platforms = [
    {
      id: "tiktok" as const,
      name: "TikTok",
      icon: Music,
      connected: isPlatformConnected("tiktok")
    },
    {
      id: "instagram" as const,
      name: "Instagram",
      icon: Instagram,
      connected: isPlatformConnected("instagram")
    },
    {
      id: "youtube" as const,
      name: "YouTube",
      icon: Youtube,
      connected: isPlatformConnected("youtube")
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Connect Platform</DialogTitle>
          <DialogDescription>
            Select a platform to connect
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-3">
          {platforms.map((platform) => (
            <Button
              key={platform.id}
              variant="outline"
              className="justify-start gap-2.5 h-11"
              onClick={() => handlePlatformClick(platform.id)}
              disabled={platform.connected}
            >
              <platform.icon className="h-4 w-4" />
              <span className="flex-1 text-left font-normal">{platform.name}</span>
              {platform.connected && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Check className="h-3 w-3" />
                  Connected
                </span>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
