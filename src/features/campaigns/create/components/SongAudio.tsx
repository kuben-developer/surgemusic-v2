"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Music, Upload, Scissors, Loader2 } from "lucide-react"
import { useConvexUpload } from "@/hooks/useConvexUpload"
import { useRef, useState } from "react"
import { AudioTrimmer } from "./AudioTrimmer"
import { LyricsEditor } from "./LyricsEditor"
import { LyricsFeatureDialog } from "./LyricsFeatureDialog"
import { convertVideoToAudio } from "@/utils/media-converter.utils"
import { getAudioDuration } from "@/utils/audio-trimmer.utils"
import { type LyricsLine, initializeEmptyLyrics } from "@/utils/srt-converter.utils"
import { useAction } from "convex/react"
import { api } from "../../../../../convex/_generated/api"

interface SongAudioProps {
    songAudioUrl: string | null
    setSongAudioUrl: (url: string | null) => void
    songAudioBase64: string | null
    setSongAudioBase64: (base64: string | null) => void
    songAudioError: boolean
    lyrics: LyricsLine[]
    setLyrics: (lyrics: LyricsLine[]) => void
    selectedLyricsOption?: "lyrics" | "lyrics-hooks" | "hooks" | "video-only" | null
    hasProFeatures?: boolean
    isFirstTimeUser?: boolean
    wordsData?: Array<{
        text: string;
        start: number;
        end: number;
        type: string;
        logprob?: number;
    }>
    setWordsData: (data: Array<{
        text: string;
        start: number;
        end: number;
        type: string;
        logprob?: number;
    }> | undefined) => void
    lyricsWithWords?: Array<{
        timestamp: number;
        text: string;
        wordIndices: number[];
    }>
    setLyricsWithWords: (data: Array<{
        timestamp: number;
        text: string;
        wordIndices: number[];
    }> | undefined) => void
}

export function SongAudio({
    songAudioUrl,
    setSongAudioUrl,
    songAudioBase64,
    setSongAudioBase64,
    songAudioError,
    lyrics,
    setLyrics,
    selectedLyricsOption = null,
    hasProFeatures = false,
    isFirstTimeUser = true,
    wordsData,
    setWordsData,
    lyricsWithWords,
    setLyricsWithWords
}: SongAudioProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [processedAudioFile, setProcessedAudioFile] = useState<File | null>(null)
    const [isProcessingVideo, setIsProcessingVideo] = useState(false)
    const [showTrimmer, setShowTrimmer] = useState(false)
    const [isTrimming, setIsTrimming] = useState(false)
    const [showLyricsEditor, setShowLyricsEditor] = useState(false)
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
    
    const transcribeAudio = useAction(api.app.transcription.transcribeAudio)

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
            // Don't initialize lyrics here - let user transcribe or manually add them
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

                // Check duration of converted audio
                const duration = await getAudioDuration(audioFile)

                if (duration < 15) {
                    toast.error("Audio too short", {
                        description: `The audio is only ${Math.floor(duration)} seconds long. Please upload audio that's at least 15 seconds.`
                    })
                    setSelectedFile(null)
                    setProcessedAudioFile(null)
                    setIsProcessingVideo(false)
                    return
                }

                // Generate base64 for preview
                const base64 = await fileToBase64(audioFile)
                setSongAudioBase64(base64)

                toast.success("Video converted to audio successfully")

                // If audio is exactly 15 seconds (with small tolerance), skip trimmer
                if (duration >= 15 && duration < 16) {
                    toast.info("Audio is already 15 seconds, uploading directly...")
                    const uploadRes = await uploadFile(audioFile)
                    const shouldTranscribe = selectedLyricsOption === "lyrics" || selectedLyricsOption === "lyrics-hooks";
                    if (uploadRes && shouldTranscribe) {
                        await handleTranscribe(uploadRes.publicUrl)
                    }
                } else {
                    setShowTrimmer(true)
                }
            } catch (error) {
                console.error("Video conversion failed:", error)
                toast.error("Failed to convert video to audio")
                setSelectedFile(null)
            } finally {
                setIsProcessingVideo(false)
            }
        } else {
            // For audio files, check duration first
            const duration = await getAudioDuration(file)

            if (duration < 15) {
                toast.error("Audio too short", {
                    description: `The audio is only ${Math.floor(duration)} seconds long. Please upload audio that's at least 15 seconds.`
                })
                setSelectedFile(null)
                return
            }

            setProcessedAudioFile(file)

            // Generate base64 for preview
            const base64 = await fileToBase64(file)
            setSongAudioBase64(base64)

            // If audio is exactly 15 seconds (with small tolerance), skip trimmer
            if (duration >= 15 && duration < 16) {
                toast.info("Audio is already 15 seconds, uploading directly...")
                const uploadRes = await uploadFile(file)
                const shouldTranscribe = selectedLyricsOption === "lyrics" || selectedLyricsOption === "lyrics-hooks";
                if (uploadRes && shouldTranscribe) {
                    await handleTranscribe(uploadRes.publicUrl)
                }
            } else {
                setShowTrimmer(true)
            }
        }
    }

    const handleTrimConfirm = async (trimmedFile: File) => {
        setIsTrimming(true)

        try {
            // Generate base64 for the trimmed audio
            const base64 = await fileToBase64(trimmedFile)
            setSongAudioBase64(base64)

            // Upload the trimmed 15-second audio
            const uploadRes = await uploadFile(trimmedFile)
            // Auto-transcribe after trimming if Lyrics or Lyrics+Hooks selected
            const shouldTranscribe = selectedLyricsOption === "lyrics" || selectedLyricsOption === "lyrics-hooks";
            if (uploadRes && shouldTranscribe) {
                await handleTranscribe(uploadRes.publicUrl)
            }
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
        setShowLyricsEditor(false)
        setLyrics([])
        setWordsData(undefined)
        setLyricsWithWords(undefined)
    }
    
    const handleTranscribe = async (urlOverride?: string) => {
        const urlToUse = urlOverride ?? songAudioUrl;
        if (!urlToUse) {
            toast.error("No audio to transcribe")
            return
        }
        
        setIsTranscribing(true)
        try {
            console.log("Starting transcription for URL:", urlToUse)
            const result = await transcribeAudio({ audioUrl: urlToUse })
            console.log("Transcription result:", result)
            
            if (result.success && result.lyrics && result.lyrics.length > 0) {
                setLyrics(result.lyrics)
                // Save word-level data if available
                if (result.wordsData) {
                    setWordsData(result.wordsData)
                }
                if (result.lyricsWithWords) {
                    setLyricsWithWords(result.lyricsWithWords)
                }
                setShowLyricsEditor(true)
                toast.success("Audio transcribed successfully")
            } else {
                console.error("Transcription failed:", result.error)
                toast.error(result.error || "Transcription failed - opening manual editor")
                // Initialize empty lyrics and open editor for manual entry
                setLyrics(initializeEmptyLyrics(15))
                setShowLyricsEditor(true)
            }
        } catch (error) {
            console.error("Transcription error:", error)
            toast.error("Failed to transcribe audio - opening manual editor")
            // Initialize empty lyrics and open editor for manual entry
            setLyrics(initializeEmptyLyrics(15))
            setShowLyricsEditor(true)
        } finally {
            setIsTranscribing(false)
        }
    }
    
    const handleLyricsSave = (updatedLyrics: LyricsLine[]) => {
        setLyrics(updatedLyrics)
        
        // If we have word data, update the synchronization
        if (wordsData && lyricsWithWords) {
            // Create updated lyricsWithWords that maintains word indices
            // For now, we'll keep the existing word mapping if the text hasn't changed too much
            const updatedLyricsWithWords = lyricsWithWords.map((original, index) => {
                const updatedLine = updatedLyrics[index];
                if (!updatedLine) return original;
                
                return {
                    ...original,
                    text: updatedLine.text,
                    timestamp: updatedLine.timestamp
                };
            });
            
            setLyricsWithWords(updatedLyricsWithWords);
        }
        
        setShowLyricsEditor(false)
        toast.success("Lyrics saved successfully")
    }
    
    const handleLyricsCancel = () => {
        setShowLyricsEditor(false)
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
        <>
            <section className={`bg-card rounded-xl p-8 shadow-sm border ${songAudioError ? 'ring-2 ring-red-500' : ''}`}>
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b">
                        <Music className="w-7 h-7" />
                        <h2 className="text-2xl font-semibold">Song Audio</h2>
                </div>
                <p className="text-muted-foreground text-lg">Add a 15 second snippet from your song. We recommend using the chorus/hook or a catchy part of the song.</p>
                <div className="space-y-4">
                    {showLyricsEditor ? (
                        <LyricsEditor
                            initialLyrics={lyrics}
                            onSave={handleLyricsSave}
                            onCancel={handleLyricsCancel}
                            audioBase64={songAudioBase64}
                        />
                    ) : songAudioUrl ? (
                        <>
                            {((selectedLyricsOption === "lyrics" || selectedLyricsOption === "lyrics-hooks") && isTranscribing) ? (
                                // Block playback until transcription completes; show same style as trimming/uploading
                                <div className="border rounded-xl p-8 flex flex-col items-center justify-center space-y-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                    <p className="text-muted-foreground font-medium">Transcribing...</p>
                                </div>
                            ) : (
                                <div className="border rounded-xl p-4 space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                        <Scissors className="w-4 h-4" />
                                        <span>15-second audio clip ready</span>
                                    </div>
                                    <audio controls className="w-full">
                                        <source src={songAudioBase64 || songAudioUrl} />
                                    </audio>
                                    {((selectedLyricsOption === "lyrics" || selectedLyricsOption === "lyrics-hooks") && lyrics && lyrics.length > 0 && !showLyricsEditor) ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <Button
                                                variant="default"
                                                onClick={() => setShowLyricsEditor(true)}
                                                className="w-full"
                                            >
                                                Edit Lyrics
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleRemoveAudio}
                                                className="w-full"
                                            >
                                                Remove Audio
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={handleRemoveAudio}
                                            className="w-full"
                                        >
                                            Remove Audio
                                        </Button>
                                    )}
                                </div>
                            )}
                            {/* Auto-transcription runs after upload/trim when applicable; no manual transcribe card */}
                        </>
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
        
        <LyricsFeatureDialog
            open={showSubscriptionDialog}
            onOpenChange={setShowSubscriptionDialog}
            featureDescription="Automatically transcribe your audio and edit lyrics with AI-powered tools. Create perfectly synchronized captions for your videos."
        />
    </>
    )
}
