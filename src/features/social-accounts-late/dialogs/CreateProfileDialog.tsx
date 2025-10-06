"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"
import { InlineLoader } from "@/components/loaders"

interface CreateProfileDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (profileName: string) => Promise<void>
}

export function CreateProfileDialog({ isOpen, onOpenChange, onCreate }: CreateProfileDialogProps) {
  const [profileName, setProfileName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!profileName.trim()) {
      toast.error("Please enter a profile name")
      return
    }

    setIsCreating(true)
    try {
      await onCreate(profileName.trim())
      toast.success("Profile created successfully")
      setProfileName("")
      onOpenChange(false)
    } catch (error) {
      toast.error(`Failed to create profile: ${(error as Error).message}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <UserPlus className="h-4 w-4" />
          New Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new user profile</DialogTitle>
          <DialogDescription>
            Create a profile to organize your Late social accounts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Profile Name</Label>
            <Input
              id="name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Enter profile name..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isCreating) {
                  void handleCreate()
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={!profileName.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <InlineLoader size="sm" className="mr-2 [&>div>div]:bg-current" />
                Creating...
              </>
            ) : (
              "Create Profile"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
