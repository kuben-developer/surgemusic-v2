"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Video, Upload } from "lucide-react"
import { useConvexUpload } from "@/hooks/useConvexUpload"
import { useRef, useState } from "react"

interface VideoAssetsProps {
    musicVideoUrl: string | null
    setMusicVideoUrl: (url: string | null) => void
    musicVideoBase64: string | null
    setMusicVideoBase64: (base64: string | null) => void
    musicVideoError: boolean
}

export function VideoAssets({
    musicVideoUrl,
    setMusicVideoUrl,
    musicVideoBase64,
    setMusicVideoBase64,
    musicVideoError
}: VideoAssetsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    
    const { uploadFile, fileToBase64, isUploading, uploadProgress } = useConvexUpload({
        fileType: "video",
        trackUpload: true, // Track upload in files table for future reference
        onSuccess: (result) => {
            setMusicVideoUrl(result.publicUrl)
            toast.success("Video uploaded successfully")
        },
        onError: (error) => {
            toast.error("Failed to upload video", {
                description: error.message
            })
        }
    })

    const handleFileSelect = async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('video/')) {
            toast.error("Invalid file type", {
                description: "Please upload a video file"
            })
            return
        }

        // Validate file size (128MB limit)
        const maxSize = 128 * 1024 * 1024 // 128MB
        if (file.size > maxSize) {
            toast.error("File size too large", {
                description: "Please upload a video smaller than 128MB"
            })
            return
        }

        // Convert to base64 for preview
        const base64 = await fileToBase64(file)
        setMusicVideoBase64(base64)

        // Upload to Convex
        await uploadFile(file)
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    return (
        <section className={`bg-card rounded-xl p-8 shadow-sm border ${musicVideoError ? 'ring-2 ring-red-500' : ''}`}>
            <div className="space-y-10">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b">
                        <Video className="w-7 h-7" />
                        <h2 className="text-2xl font-semibold">Add Your Video Assets</h2>
                    </div>
                    <p className="text-muted-foreground text-lg">Add your music video clip to use for our AI content generation.</p>
                </div>

                {/* Music Video Clip */}
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-xl font-medium">Music Video Clip</h3>
                        <p className="text-muted-foreground">Upload a 30s clip from your music video - choose a catchy part of the song and trim the length on you're photos app. If you don't have a music video, upload a video of you performing the song (e.g. rapping along to the song in the studio etc.</p>
                    </div>

                    {musicVideoUrl ? (
                        <div className="border rounded-xl p-4 space-y-4">
                            <video controls className="w-full max-h-[250px] object-contain rounded-lg">
                                <source src={musicVideoBase64 || musicVideoUrl} type='video/mp4' />
                            </video>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setMusicVideoUrl(null)
                                    setMusicVideoBase64(null)
                                }}
                                className="w-full"
                            >
                                Remove Video
                            </Button>
                        </div>
                    ) : (
                        <div
                            className={`border-2 border-dashed ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-400/50'} rounded-xl p-8 hover:border-gray-500 transition-colors cursor-pointer bg-muted/30 relative`}
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleFileInput}
                                disabled={isUploading}
                            />
                            
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Upload className="w-12 h-12 text-gray-400" />
                                <div className="text-center">
                                    <p className="text-base font-medium text-muted-foreground">
                                        Music Video Clip or Performance with Song
                                    </p>
                                    <p className="text-md text-muted-foreground/70 mt-1">
                                        Click to upload or drag and drop
                                    </p>
                                </div>
                                
                                {isUploading && (
                                    <div className="w-full max-w-xs">
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2 text-center">
                                            Uploading... {uploadProgress}%
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}