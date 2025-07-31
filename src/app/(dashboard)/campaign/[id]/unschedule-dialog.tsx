"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import type { Id } from "../../../../../convex/_generated/dataModel"
import { CalendarX, Loader2, AlertCircle, CheckCircle2, Instagram, Youtube, Music2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ScheduledVideo {
  id: string
  videoName: string
  videoUrl: string
  postId: string
  scheduledAt: Date
  postCaption: string
  scheduledSocialAccounts: {
    platform: string
    username: string
  }[]
}

interface UnscheduleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  onUnscheduleComplete?: () => void
}

export function UnscheduleDialog({ isOpen, onOpenChange, campaignId, onUnscheduleComplete }: UnscheduleDialogProps) {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [unschedulingProgress, setUnschedulingProgress] = useState(0)
  const [isUnscheduling, setIsUnscheduling] = useState(false)
  const [unscheduleResults, setUnscheduleResults] = useState<{ postId: string; success: boolean; error?: string }[]>([])
  // Convex doesn't need utils for refetching

  // Fetch scheduled videos
  const scheduledVideos = useQuery(api.campaigns.getScheduledVideos, isOpen ? { campaignId: campaignId as Id<"campaigns"> } : "skip")
  const isLoading = scheduledVideos === undefined

  // Unschedule mutation (now handles bulk operations)
  const unschedulePost = useMutation(api.ayrshare.unschedulePost)

  // Toggle select all
  const toggleSelectAll = () => {
    if (!scheduledVideos) return
    
    if (selectedVideos.length === scheduledVideos.length) {
      setSelectedVideos([])
    } else {
      setSelectedVideos(scheduledVideos.map(v => v.postId))
    }
  }

  // Toggle individual video selection
  const toggleVideoSelection = (postId: string) => {
    setSelectedVideos(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  // Handle bulk unschedule
  const handleBulkUnschedule = async () => {
    if (selectedVideos.length === 0) {
      toast.error("Please select at least one video to unschedule")
      return
    }

    setIsUnscheduling(true)
    setUnschedulingProgress(50) // Show 50% progress while processing
    setUnscheduleResults([])

    try {
      const result = await unschedulePost({ postIds: selectedVideos })
      
      // Update progress to 100%
      setUnschedulingProgress(100)
      
      // Update results for UI feedback
      if ('results' in result && Array.isArray((result as any).results)) {
        setUnscheduleResults((result as any).results)
      }

      // Show toast
      toast.success(result.message || "Unscheduling complete")
      
      // Convex automatically syncs data, no need to invalidate
      
      if (onUnscheduleComplete) {
        onUnscheduleComplete()
      }

      // Close dialog if all successful
      const failureCount = 'results' in result && Array.isArray((result as any).results) ? (result as any).results.filter((r: any) => !r.success).length : 0
      if (failureCount === 0) {
        setTimeout(() => {
          onOpenChange(false)
        }, 1000) // Small delay to show success state
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unschedule selected posts")
    } finally {
      setIsUnscheduling(false)
      setSelectedVideos([])
    }
  }

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />
      case 'youtube':
        return <Youtube className="h-4 w-4" />
      case 'tiktok':
        return <Music2 className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarX className="h-5 w-5" />
            Unschedule Posts
          </DialogTitle>
          <DialogDescription>
            Select the scheduled posts you want to unschedule. This will remove them from the posting queue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : scheduledVideos && scheduledVideos.length > 0 ? (
            <>
              {/* Select all checkbox */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedVideos.length === scheduledVideos.length && scheduledVideos.length > 0}
                    onCheckedChange={toggleSelectAll}
                    disabled={isUnscheduling}
                  />
                  <label className="text-sm font-medium">
                    Select all ({scheduledVideos.length} posts)
                  </label>
                </div>
                {selectedVideos.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {selectedVideos.length} selected
                  </span>
                )}
              </div>

              {/* Video list */}
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-3">
                  {scheduledVideos.map((video) => {
                    const result = unscheduleResults.find(r => r.postId === video.postId)
                    
                    return (
                      <div
                        key={video.postId}
                        className={cn(
                          "flex items-start space-x-3 rounded-lg border p-3 transition-colors",
                          selectedVideos.includes(video.postId) && "bg-muted/50",
                          result?.success && "border-green-500/50 bg-green-500/10",
                          result?.success === false && "border-red-500/50 bg-red-500/10"
                        )}
                      >
                        <Checkbox
                          checked={selectedVideos.includes(video.postId)}
                          onCheckedChange={() => toggleVideoSelection(video.postId)}
                          disabled={isUnscheduling || result !== undefined}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{video.videoName}</h4>
                            {result?.success && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {result?.success === false && <AlertCircle className="h-4 w-4 text-red-500" />}
                          </div>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {video.postCaption}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarX className="h-3 w-3" />
                              {format(new Date(video.scheduledAt), "MMM d, yyyy h:mm a")}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              {video.scheduledSocialAccounts.map((account, idx) => (
                                <span key={idx} className="flex items-center gap-1">
                                  {getPlatformIcon(account.platform)}
                                  {account.username}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {result?.error && (
                            <p className="text-xs text-red-500">{result.error}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>

              {/* Progress bar */}
              {isUnscheduling && (
                <div className="space-y-2">
                  <Progress value={unschedulingProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Unscheduling {selectedVideos.length} posts...
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarX className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No scheduled posts found</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUnscheduling}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleBulkUnschedule}
            disabled={selectedVideos.length === 0 || isUnscheduling}
          >
            {isUnscheduling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Unscheduling...
              </>
            ) : (
              <>
                <CalendarX className="h-4 w-4 mr-2" />
                Unschedule Selected
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}