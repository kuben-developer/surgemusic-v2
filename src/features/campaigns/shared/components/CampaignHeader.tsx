import { motion } from "framer-motion"
import { Calendar, Music, Tag, User, Zap, BarChart2, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Doc } from "../../../../../convex/_generated/dataModel"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

interface CampaignHeaderProps {
  campaign: Doc<"campaigns">
  campaignId: string
}

export function CampaignHeader({ campaign, campaignId }: CampaignHeaderProps) {
  return (
    <motion.section
      variants={fadeInUp}
      className="relative overflow-hidden rounded-2xl p-10 shadow-xl border border-primary/10"
    >
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
      <div className="relative space-y-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-2xl border border-primary/20 backdrop-blur-sm">
                <Zap className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">
                {campaign.campaignName}
              </h1>
              <p className="text-muted-foreground">Campaign Details</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href={`/campaign/analytics/${campaignId}`}>
            <Button variant="outline" className="gap-2 bg-background/50 hover:bg-background border-primary/20 hover:border-primary/40">
              <span className="relative flex items-center gap-2">
                <BarChart2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span className="font-medium">View Analytics</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            </Button>
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
          variants={staggerContainer}
        >
          <MetricCard
            icon={<Music className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />}
            label="Song"
            value={campaign.songName}
          />
          <MetricCard
            icon={<User className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />}
            label="Artist"
            value={campaign.artistName}
          />
          <MetricCard
            icon={<Tag className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />}
            label="Genre"
            value={campaign.genre}
          />
          <MetricCard
            icon={<Calendar className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />}
            label="Created"
            value={new Date(campaign._creationTime).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          />
        </motion.div>
      </div>
    </motion.section>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
}

function MetricCard({ icon, label, value }: MetricCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/95 border border-primary/10 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative space-y-4">
        <div className="flex items-center gap-3">
          {icon}
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
        <p className="text-lg font-medium truncate capitalize">{value}</p>
      </div>
    </motion.div>
  )
}