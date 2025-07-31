import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Download, Film, Loader2 } from "lucide-react"
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

interface VideoGridProps {
  videos: Doc<"generatedVideos">[]
  downloadingVideos: { [key: string]: boolean }
  handleDownloadVideo: (videoUrl: string, videoName: string, videoId: string) => void
}

export function VideoGrid({ videos, downloadingVideos, handleDownloadVideo }: VideoGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      variants={staggerContainer}
    >
      {videos.map((video, index) => (
        <motion.div
          key={video._id}
          variants={fadeInUp}
          className="group relative bg-gradient-to-br from-card/50 to-card/30 rounded-xl border border-primary/10 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="aspect-[9/16] bg-muted/30 relative overflow-hidden">
            <video
              src={video.video.url}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] relative z-10"
              controls
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <Badge
              variant="secondary"
              className="absolute top-3 right-3 gap-2 px-3 py-1.5 bg-background/50 backdrop-blur-md border-primary/20 z-20"
            >
              <Film className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium">{video.video.type}</span>
            </Badge>
          </div>
          <div className="p-4 space-y-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-medium truncate cursor-help">
                    {video.video.name}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{video.video.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="secondary"
              size="sm"
              className="w-full gap-2 bg-primary/5 hover:bg-primary/10 text-foreground border-primary/10 hover:border-primary/30 transition-colors"
              onClick={() => handleDownloadVideo(video.video.url, video.video.name, String(video._id))}
              disabled={downloadingVideos[String(video._id)]}
            >
              {downloadingVideos[String(video._id)] ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}