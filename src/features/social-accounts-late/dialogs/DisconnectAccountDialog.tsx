"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { InlineLoader } from "@/components/loaders"
import { formatPlatformName } from '../utils/platform.utils'
import type { LateSocialAccount } from '../types/social-accounts.types'

interface DisconnectAccountDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDisconnect: (accountId: string) => Promise<void>
  account: LateSocialAccount | null
}

export function DisconnectAccountDialog({
  isOpen,
  onOpenChange,
  onDisconnect,
  account
}: DisconnectAccountDialogProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleDisconnect = async () => {
    if (!account) return

    setIsDisconnecting(true)
    try {
      await onDisconnect(account._id)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to disconnect:', error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  if (!account) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Disconnect Account
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to disconnect this account?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-md p-3 space-y-1">
          <p className="text-sm font-medium">
            {account.displayName || account.username}
          </p>
          <p className="text-xs text-muted-foreground">
            @{account.username} · {formatPlatformName(account.platform)}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          This will remove the account from your profile. You can reconnect it later if needed.
        </p>

        <DialogFooter className="gap-4 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDisconnecting}
            className="mr-4"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? (
              <>
                <InlineLoader size="sm" className="mr-2 [&>div>div]:bg-current" />
                Disconnecting...
              </>
            ) : (
              "Disconnect"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
