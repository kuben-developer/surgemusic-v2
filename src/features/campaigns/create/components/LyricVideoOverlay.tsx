"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Video, Upload } from "lucide-react"
import { useConvexUpload } from "@/hooks/useConvexUpload"
import { useRef, useState } from "react"

interface LyricVideoOverlayProps {
    lyricVideoUrl: string | null
    setLyricVideoUrl: (url: string | null) => void
    lyricVideoBase64: string | null
    setLyricVideoBase64: (base64: string | null) => void
}

export function LyricVideoOverlay({
    lyricVideoUrl,
    setLyricVideoUrl,
    lyricVideoBase64,
    setLyricVideoBase64
}: LyricVideoOverlayProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    
    const { uploadFile, fileToBase64, isUploading, uploadProgress } = useConvexUpload({
        fileType: "video",
        trackUpload: true, // Track upload in files table for future reference
        onSuccess: (result) => {
            setLyricVideoUrl(result.publicUrl)
            toast.success("Lyric Video Uploaded", {
                description: "Your lyric video has been uploaded successfully."
            })
        },
        onError: (error) => {
            toast.error("Failed to upload lyric video", {
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
        setLyricVideoBase64(base64)

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
        <section className="bg-card rounded-xl p-8 shadow-sm border">
            <div className="space-y-10">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b">
                        <Video className="w-7 h-7" />
                        <h2 className="text-2xl font-semibold">Upload Lyric Video Overlay (Optional)</h2>
                    </div>
                    <p className="text-muted-foreground text-lg">Upload a 30 second video with lyrics to overlay onto your videos. Background color must be #65ff00</p>
                </div>

                {/* Lyric Video Upload */}
                <div className="max-w-2xl mx-auto space-y-4">
                    {lyricVideoUrl ? (
                        <div className="border rounded-xl p-4 space-y-4">
                            <video controls className="w-full max-h-[250px] object-contain rounded-lg">
                                <source src={lyricVideoBase64 || lyricVideoUrl} type='video/mp4' />
                            </video>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setLyricVideoUrl(null)
                                    setLyricVideoBase64(null)
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
                                        Lyric Video Overlay
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