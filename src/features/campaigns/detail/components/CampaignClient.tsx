"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Zap, Video, Music, ImageIcon, Globe, Download, FileVideo, Film, Loader2, Clock, User, Tag, Calendar, ChevronRight, AlertCircle, List, Grid, BarChart2, ChevronLeft } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import type { Id, Doc } from "../../../../../convex/_generated/dataModel"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import JSZip from 'jszip'
import { cn } from "@/lib/utils"
import { VideoTableView, ViewToggle, type ViewMode } from "@/features/campaigns/videos"
import Link from "next/link"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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

export default function CampaignClient() {
    const params = useParams()
    const campaignId = params.id as string
    const [progress, setProgress] = useState(0)
    const [downloadingVideos, setDownloadingVideos] = useState<{ [key: string]: boolean }>({})
    const [downloadingAll, setDownloadingAll] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>("table")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState(1)
    const videosPerPage = 8

    const campaign = useQuery(api.campaigns.get, campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip")
    const isCampaignLoading = campaign === undefined

    const generatedVideos = useQuery(api.campaigns.getGeneratedVideos, campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip")
    const isVideosLoading = generatedVideos === undefined

    useEffect(() => {
        if (!campaign) return;

        const updateProgress = () => {
            if (campaign.status === 'completed') {
                setProgress(100);
                return;
            }

            const now = new Date();
            const createdAt = new Date(campaign._creationTime);
            const elapsedMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

            // Calculate progress: 0-5 minutes maps to 0-90%
            const calculatedProgress = Math.min(90, (elapsedMinutes / 5) * 90);
            const progress = Number(calculatedProgress.toFixed(1));
            setProgress(progress);
            if (progress === 89.7) {
                // Reload the page to check if the campaign is completed
                window.location.reload();
            }
        };

        // Initial update
        updateProgress();

        // Update every second
        const interval = setInterval(updateProgress, 1000);

        return () => clearInterval(interval);
    }, [campaign]);

    if (isCampaignLoading) {
        return (
            <div className="container max-w-5xl mx-auto py-12">
                <div className="space-y-8">
                    <section className="bg-card rounded-xl p-8 shadow-sm border">
                        <div className="space-y-6">
                            <Skeleton className="h-10 w-64" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-24 w-full" />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        )
    }

    if (!campaign) {
        return (
            <div className="container max-w-5xl mx-auto py-12">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">Campaign not found</h1>
                    <p className="text-muted-foreground mt-2">The campaign you're looking for doesn't exist or you don't have access to it.</p>
                </div>
            </div>
        )
    }

    const handleDownloadVideo = async (videoUrl: string, videoName: string, videoId: string) => {
        try {
            setDownloadingVideos(prev => ({ ...prev, [videoId]: true }))
            const response = await fetch(videoUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            
            // Extract file extension from URL or default to .mp4
            const urlParts = videoUrl.split('/')
            const fileName = urlParts[urlParts.length - 1] || ''
            const extension = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '.mp4'
            
            const a = document.createElement('a')
            a.href = url
            a.download = `${videoName}_${videoId}${extension}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            toast.error("Error downloading video. Please try again later.")
        } finally {
            setDownloadingVideos(prev => ({ ...prev, [videoId]: false }))
        }
    }

    const handleDownloadAll = async (videos: Doc<"generatedVideos">[]) => {
        if (!videos?.length) return

        try {
            setDownloadingAll(true)
            toast.info("Creating zip file of all videos...")

            const zip = new JSZip()
            const videoFolder = zip.folder("videos")

            // Process videos in batches of 5
            const BATCH_SIZE = 5;
            const totalVideos = videos.length;

            // Split videos into batches
            for (let i = 0; i < totalVideos; i += BATCH_SIZE) {
                const batch = videos.slice(i, i + BATCH_SIZE);

                // Download batch in parallel
                const batchPromises = batch.map(async (video) => {
                    try {
                        setDownloadingVideos(prev => ({ ...prev, [String(video._id)]: true }))

                        const response = await fetch(video.video.url)
                        const blob = await response.blob()
                        
                        // Extract file extension from URL or default to .mp4
                        const urlParts = video.video.url.split('/')
                        const fileName = urlParts[urlParts.length - 1] || ''
                        const extension = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '.mp4'
                        
                        // Create filename with proper extension
                        const safeFileName = `${video.video.name}_${video._id}${extension}`
                        videoFolder?.file(safeFileName, blob)

                        setDownloadingVideos(prev => ({ ...prev, [String(video._id)]: false }))
                        return blob
                    } catch (error) {
                        console.error(`Error downloading video ${video.video.name}:`, error)
                        return null
                    }
                });

                // Wait for current batch to complete before starting next batch
                await Promise.all(batchPromises);

                // Update progress
                const progress = Math.min(100, Math.round(((i + batch.length) / totalVideos) * 100));
                setProgress(progress);
            }

            // Generate the zip file
            const content = await zip.generateAsync({ type: "blob" })
            const url = window.URL.createObjectURL(content)
            const a = document.createElement('a')
            a.href = url
            a.download = `${campaign.campaignName.replace(/\s+/g, '_')}_videos.zip`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success("All videos have been downloaded successfully.")
        } catch (error) {
            console.error("Error downloading all videos:", error)
            toast.error("Error downloading videos. Please try again later.")
        } finally {
            setDownloadingAll(false)
            setProgress(0)
        }
    }

    // Pagination logic for videos
    const getFilteredVideos = () => {
        if (!generatedVideos) return []
        if (statusFilter === "all") return generatedVideos
        
        return generatedVideos.filter((video: Doc<"generatedVideos">) => {
            if (statusFilter === "posted") {
                return video.tiktokUpload?.status?.isPosted || video.instagramUpload?.status?.isPosted || video.youtubeUpload?.status?.isPosted;
            }
            
            if (statusFilter === "failed") {
                return video.tiktokUpload?.status?.isFailed || video.instagramUpload?.status?.isFailed || video.youtubeUpload?.status?.isFailed;
            }
            
            if (statusFilter === "scheduled") {
                const isScheduled = (video.tiktokUpload?.scheduledAt !== null && video.tiktokUpload?.scheduledAt !== undefined) ||
                                   (video.instagramUpload?.scheduledAt !== null && video.instagramUpload?.scheduledAt !== undefined) ||
                                   (video.youtubeUpload?.scheduledAt !== null && video.youtubeUpload?.scheduledAt !== undefined);
                const isPosted = video.tiktokUpload?.status?.isPosted || video.instagramUpload?.status?.isPosted || video.youtubeUpload?.status?.isPosted;
                const isFailed = video.tiktokUpload?.status?.isFailed || video.instagramUpload?.status?.isFailed || video.youtubeUpload?.status?.isFailed;
                return isScheduled && !isPosted && !isFailed;
            }
            
            if (statusFilter === "unscheduled") {
                const isScheduled = (video.tiktokUpload?.scheduledAt !== null && video.tiktokUpload?.scheduledAt !== undefined) ||
                                   (video.instagramUpload?.scheduledAt !== null && video.instagramUpload?.scheduledAt !== undefined) ||
                                   (video.youtubeUpload?.scheduledAt !== null && video.youtubeUpload?.scheduledAt !== undefined);
                const isPosted = video.tiktokUpload?.status?.isPosted || video.instagramUpload?.status?.isPosted || video.youtubeUpload?.status?.isPosted;
                const isFailed = video.tiktokUpload?.status?.isFailed || video.instagramUpload?.status?.isFailed || video.youtubeUpload?.status?.isFailed;
                return !isScheduled && !isPosted && !isFailed;
            }
            
            return true;
        })
    }

    const filteredVideos = getFilteredVideos()
    const totalPages = Math.ceil(filteredVideos.length / videosPerPage)
    const indexOfLastVideo = currentPage * videosPerPage
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage
    
    // Prepare videos for current page - only add real videoUrl to current page videos
    const currentVideos = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo).map((video: Doc<"generatedVideos">) => ({
        ...video,
        // Keep the videoUrl property as is - it will be loaded only when rendered
    }))
    
    // For table view, we'll leave the filteredVideos as is, but use lazy loading in the video elements
    
    // Calculate total scheduled videos
    const totalScheduledCount = generatedVideos?.filter((video: Doc<"generatedVideos">) => 
        (video.tiktokUpload?.scheduledAt !== null && video.tiktokUpload?.scheduledAt !== undefined) ||
        (video.instagramUpload?.scheduledAt !== null && video.instagramUpload?.scheduledAt !== undefined) ||
        (video.youtubeUpload?.scheduledAt !== null && video.youtubeUpload?.scheduledAt !== undefined)
    ).length || 0

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
        // Scroll to top of video section
        document.getElementById('videos-section')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="container max-w-7xl mx-auto py-12 px-4">
            <motion.div
                className="space-y-12"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
            >
                {/* Campaign Header */}
                <motion.section
                    variants={fadeInUp}
                    className="relative overflow-hidden rounded-2xl p-10 shadow-xl border border-primary/10"
                >
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
                    <div className="relative space-y-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <div
                                    className="relative group"
                                >
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
                            <motion.div
                                variants={fadeInUp}
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/95 border border-primary/10 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Music className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
                                        <p className="text-sm font-medium text-muted-foreground">Song</p>
                                    </div>
                                    <p className="text-lg font-medium truncate">{campaign.songName}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={fadeInUp}
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/95 border border-primary/10 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative space-y-4">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
                                        <p className="text-sm font-medium text-muted-foreground">Artist</p>
                                    </div>
                                    <p className="text-lg font-medium truncate capitalize">{campaign.artistName}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={fadeInUp}
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/95 border border-primary/10 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
                                        <p className="text-sm font-medium text-muted-foreground">Genre</p>
                                    </div>
                                    <p className="text-lg font-medium truncate capitalize">{campaign.genre}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                variants={fadeInUp}
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/95 border border-primary/10 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
                                        <p className="text-sm font-medium text-muted-foreground">Created</p>
                                    </div>
                                    <p className="text-lg font-medium truncate">
                                        {new Date(campaign._creationTime).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Progress Section */}
                {campaign && (campaign.status as string) !== 'completed' && (
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
                                    variant={campaign && (campaign.status as string) === 'completed' ? "default" : "secondary"}
                                    className={cn(
                                        "px-3 py-1",
                                        campaign && (campaign.status as string) === 'completed' ? "bg-primary/10 text-primary" : "animate-pulse"
                                    )}
                                >
                                    {campaign?.status === 'completed' ? "Completed" : "Processing"}
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
                                Generating {campaign?.videoCount} videos. This process typically takes 5-10 minutes.
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* Generated Videos */}
                <motion.section
                    id="videos-section"
                    variants={fadeInUp}
                    className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 rounded-2xl p-10 shadow-xl border border-primary/10"
                >
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
                    <div className="relative space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                                    <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-2xl border border-primary/20 backdrop-blur-sm">
                                        <Video className="w-8 h-8 text-primary animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-bold tracking-tight">Generated Videos</h2>
                                    <p className="text-muted-foreground">Your campaign's video collection</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {generatedVideos && generatedVideos.length > 0 && (
                                    <>
                                        <div className="relative group">
                                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                <SelectTrigger className="w-[180px] bg-background/50 border-primary/20 hover:border-primary/40">
                                                    <SelectValue placeholder="Filter by status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="posted">Posted</SelectItem>
                                                    <SelectItem value="failed">Failed</SelectItem>
                                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                                    <SelectItem value="unscheduled">Unscheduled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                                    </>
                                )}
                                {generatedVideos && generatedVideos.length ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDownloadAll(generatedVideos)}
                                        disabled={downloadingAll}
                                        className="relative group px-6 py-2 h-auto bg-background/50 hover:bg-background border-primary/20 hover:border-primary/40"
                                    >
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                                        <span className="relative flex items-center gap-2">
                                            {downloadingAll ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Download className="w-4 h-4 transition-transform group-hover:scale-110" />
                                            )}
                                            <span className="font-medium">
                                                {downloadingAll ? "Downloading..." : "Download All"}
                                            </span>
                                        </span>
                                    </Button>
                                ) : null}
                            </div>
                        </div>

                        {/* Pagination - Now at top, only for grid view */}
                        {totalPages > 1 && viewMode !== "table" && (
                            <div className="mb-6 mt-6 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-9 w-9 bg-background/50 border-primary/20 hover:border-primary/40"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-1">
                                    {(() => {
                                        // Logic to determine which page numbers to show
                                        const pageButtons = [];
                                        const maxButtonsToShow = 10; // Adjust as needed
                                        const ellipsis = (key: string) => (
                                            <div key={key} className="px-2 text-muted-foreground">
                                                ...
                                            </div>
                                        );
                                        
                                        // Always show first page
                                        pageButtons.push(
                                            <Button
                                                key={1}
                                                variant={currentPage === 1 ? "default" : "outline"}
                                                size="icon"
                                                onClick={() => handlePageChange(1)}
                                                className={cn(
                                                    "h-9 w-9",
                                                    currentPage === 1 
                                                        ? "bg-primary text-primary-foreground" 
                                                        : "bg-background/50 border-primary/20 hover:border-primary/40"
                                                )}
                                            >
                                                1
                                            </Button>
                                        );
                                        
                                        // Calculate the range of pages to show around current page
                                        let startPage = Math.max(2, currentPage - Math.floor(maxButtonsToShow / 2));
                                        let endPage = Math.min(totalPages - 1, startPage + maxButtonsToShow - 3);
                                        
                                        if (endPage - startPage < maxButtonsToShow - 3) {
                                            startPage = Math.max(2, endPage - (maxButtonsToShow - 3) + 1);
                                        }
                                        
                                        // Add ellipsis if there's a gap after first page
                                        if (startPage > 2) {
                                            pageButtons.push(ellipsis('start-ellipsis'));
                                        }
                                        
                                        // Add the middle pages
                                        for (let i = startPage; i <= endPage; i++) {
                                            pageButtons.push(
                                                <Button
                                                    key={i}
                                                    variant={currentPage === i ? "default" : "outline"}
                                                    size="icon"
                                                    onClick={() => handlePageChange(i)}
                                                    className={cn(
                                                        "h-9 w-9",
                                                        currentPage === i 
                                                            ? "bg-primary text-primary-foreground" 
                                                            : "bg-background/50 border-primary/20 hover:border-primary/40"
                                                    )}
                                                >
                                                    {i}
                                                </Button>
                                            );
                                        }
                                        
                                        // Add ellipsis if there's a gap before last page
                                        if (endPage < totalPages - 1) {
                                            pageButtons.push(ellipsis('end-ellipsis'));
                                        }
                                        
                                        // Always show last page if there are more than 1 page
                                        if (totalPages > 1) {
                                            pageButtons.push(
                                                <Button
                                                    key={totalPages}
                                                    variant={currentPage === totalPages ? "default" : "outline"}
                                                    size="icon"
                                                    onClick={() => handlePageChange(totalPages)}
                                                    className={cn(
                                                        "h-9 w-9",
                                                        currentPage === totalPages 
                                                            ? "bg-primary text-primary-foreground" 
                                                            : "bg-background/50 border-primary/20 hover:border-primary/40"
                                                    )}
                                                >
                                                    {totalPages}
                                                </Button>
                                            );
                                        }
                                        
                                        return pageButtons;
                                    })()}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="h-9 w-9 bg-background/50 border-primary/20 hover:border-primary/40"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {isVideosLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <div className="aspect-[9/16] rounded-xl bg-muted/20 animate-pulse" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-3/4 bg-muted/20 rounded animate-pulse" />
                                            <div className="h-8 w-full bg-muted/20 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !generatedVideos?.length ? (
                            <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-muted/5">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] to-primary/[0.02]" />
                                <div className="relative py-16 text-center">
                                    <FileVideo className="w-16 h-16 mx-auto text-primary/40" />
                                    <h3 className="mt-4 text-xl font-semibold text-foreground/80">No videos generated yet</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">Videos will appear here once generated</p>
                                </div>
                            </div>
                        ) : viewMode === "table" ? (
                            <>
                                <VideoTableView
                                    videos={filteredVideos}
                                    downloadingVideos={downloadingVideos}
                                    handleDownloadVideo={handleDownloadVideo}
                                    handleDownloadAll={handleDownloadAll}
                                    songName={campaign.songName}
                                    artistName={campaign.artistName}
                                    genre={campaign.genre}
                                    statusFilter={statusFilter}
                                    totalVideosCount={filteredVideos.length}
                                    totalScheduledCount={totalScheduledCount}
                                    campaignId={campaignId}
                                />
                            </>
                        ) : (
                            <>
                                <motion.div
                                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                                    variants={staggerContainer}
                                >
                                    {currentVideos.map((video: Doc<"generatedVideos">, index: number) => (
                                        <motion.div
                                            key={index}
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
                            </>
                        )}
                    </div>
                </motion.section>
            </motion.div>
        </div>
    )
} 