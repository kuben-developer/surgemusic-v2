import { motion } from "framer-motion"
import { AlertCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { Doc } from "../../../../../convex/_generated/dataModel"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

interface CampaignProgressProps {
  campaign: Doc<"campaigns">
  progress: number
}

export function CampaignProgress({ campaign, progress }: CampaignProgressProps) {
  if (campaign.status === 'completed') return null

  return (
    <motion.section
      variants={fadeInUp}
      className="bg-gradient-to-br from-card to-card/95 rounded-xl p-6 shadow-lg border backdrop-blur-sm"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary animate-pulse" />
            <h2 className="text-lg font-medium">Generation Status</h2>
          </div>
          <Badge
            variant={campaign.status === 'failed' ? "destructive" : "secondary"}
            className={cn(
              "px-3 py-1",
              campaign.status === 'failed' ? "bg-destructive/10 text-destructive" : "animate-pulse"
            )}
          >
            {campaign.status === 'failed' ? "Failed" : "Processing"}
          </Badge>
        </div>

        <div className="relative pt-2">
          <div className="flex justify-between items-center mb-1">
            <div className="flex-1"></div>
            <p className="text-sm font-medium text-primary">
              {progress}%
            </p>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-muted/30"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          Generating {campaign.videoCount} videos. This process typically takes 5-10 minutes.
        </div>
      </div>
    </motion.section>
  )
}