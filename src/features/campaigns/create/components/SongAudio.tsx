"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Music, Upload, Scissors } from "lucide-react"
import { useConvexUpload } from "@/hooks/useConvexUpload"
import { useRef, useState } from "react"
import { AudioTrimmer } from "./AudioTrimmer"
import { convertVideoToAudio } from "@/utils/media-converter.utils"

interface SongAudioProps {
    songAudioUrl: string | null
    setSongAudioUrl: (url: string | null) => void
    songAudioBase64: string | null
    setSongAudioBase64: (base64: string | null) => void
    songAudioError: boolean
}

export function SongAudio({
    songAudioUrl,
    setSongAudioUrl,
    songAudioBase64,
    setSongAudioBase64,
    songAudioError
}: SongAudioProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [processedAudioFile, setProcessedAudioFile] = useState<File | null>(null)
    const [isProcessingVideo, setIsProcessingVideo] = useState(false)
    const [showTrimmer, setShowTrimmer] = useState(false)
    const [isTrimming, setIsTrimming] = useState(false)
    
    const { uploadFile, fileToBase64, isUploading, uploadProgress } = useConvexUpload({
        fileType: "audio",
        trackUpload: true, // Track upload in files table for future reference
        onSuccess: (result) => {
            setSongAudioUrl(result.publicUrl)
            toast.success("15-second audio clip uploaded successfully")
            // Reset states after successful upload
            setSelectedFile(null)
            setProcessedAudioFile(null)
            setShowTrimmer(false)
        },
        onError: (error) => {
            toast.error("Failed to upload audio", {
                description: error.message
            })
        }
    })

    const handleFileSelect = async (file: File) => {
        // Validate file type (audio or video)
        const isAudio = file.type.startsWith('audio/')
        const isVideo = file.type.startsWith('video/')
        
        if (!isAudio && !isVideo) {
            toast.error("Invalid file type", {
                description: "Please upload an audio file (MP3, WAV) or video file"
            })
            return
        }

        // Validate file size (32MB for audio, 128MB for video)
        const maxSize = isVideo ? 128 * 1024 * 1024 : 32 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error("File size too large", {
                description: `Please upload a file smaller than ${isVideo ? '128MB' : '32MB'}`
            })
            return
        }

        setSelectedFile(file)

        // If it's a video file, convert to audio first
        if (isVideo) {
            setIsProcessingVideo(true)
            toast.info("Converting video to audio...")
            
            try {
                const audioFile = await convertVideoToAudio(file)
                setProcessedAudioFile(audioFile)
                
                // Generate base64 for preview
                const base64 = await fileToBase64(audioFile)
                setSongAudioBase64(base64)
                
                toast.success("Video converted to audio successfully")
                setShowTrimmer(true)
            } catch (error) {
                console.error("Video conversion failed:", error)
                toast.error("Failed to convert video to audio")
                setSelectedFile(null)
            } finally {
                setIsProcessingVideo(false)
            }
        } else {
            // For audio files, set directly
            setProcessedAudioFile(file)
            
            // Generate base64 for preview
            const base64 = await fileToBase64(file)
            setSongAudioBase64(base64)
            
            setShowTrimmer(true)
        }
    }

    const handleTrimConfirm = async (trimmedFile: File) => {
        setIsTrimming(true)
        
        try {
            // Generate base64 for the trimmed audio
            const base64 = await fileToBase64(trimmedFile)
            setSongAudioBase64(base64)
            
            // Upload the trimmed 15-second audio
            await uploadFile(trimmedFile)
        } finally {
            setIsTrimming(false)
        }
    }

    const handleCancelTrim = () => {
        setShowTrimmer(false)
        setSelectedFile(null)
        setProcessedAudioFile(null)
        setSongAudioBase64(null)
    }

    const handleRemoveAudio = () => {
        setSongAudioUrl(null)
        setSongAudioBase64(null)
        setSelectedFile(null)
        setProcessedAudioFile(null)
        setShowTrimmer(false)
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
        <section className={`bg-card rounded-xl p-8 shadow-sm border ${songAudioError ? 'ring-2 ring-red-500' : ''}`}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b">
                    <Music className="w-7 h-7" />
                    <h2 className="text-2xl font-semibold">Song Audio</h2>
                </div>
                <p className="text-muted-foreground text-lg">Add a 15 second snippet from your song. We recommend using the chorus/hook or a catchy part of the song.</p>
                <div className="space-y-4">
                    {songAudioUrl ? (
                        <div className="border rounded-xl p-4 space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Scissors className="w-4 h-4" />
                                <span>15-second audio clip ready</span>
                            </div>
                            <audio controls className="w-full">
                                <source src={songAudioBase64 || songAudioUrl} />
                            </audio>
                            <Button
                                variant="outline"
                                onClick={handleRemoveAudio}
                                className="w-full"
                            >
                                Remove Audio
                            </Button>
                        </div>
                    ) : showTrimmer && processedAudioFile ? (
                        isTrimming || isUploading ? (
                            <div className="border rounded-xl p-8 flex flex-col items-center justify-center space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                <p className="text-muted-foreground font-medium">
                                    {isTrimming ? "Trimming audio to 15 seconds..." : `Uploading... ${uploadProgress}%`}
                                </p>
                                {isUploading && (
                                    <div className="w-full max-w-xs">
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <AudioTrimmer
                                audioFile={processedAudioFile}
                                onConfirm={handleTrimConfirm}
                                onCancel={handleCancelTrim}
                            />
                        )
                    ) : isProcessingVideo ? (
                        <div className="border rounded-xl p-8 flex flex-col items-center justify-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="text-muted-foreground">Converting video to audio...</p>
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
                                accept="audio/*,video/*"
                                className="hidden"
                                onChange={handleFileInput}
                                disabled={isUploading || isProcessingVideo}
                            />
                            
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Upload className="w-12 h-12 text-gray-400" />
                                <div className="text-center">
                                    <p className="text-base font-medium text-muted-foreground">
                                        15 Second Song Audio: MP3, WAV or Video
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