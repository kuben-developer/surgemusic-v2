"use client"

import { OurFileRouter } from "@/app/api/uploadthing/core"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { UploadDropzone } from "@uploadthing/react"
import { Video } from "lucide-react"

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
    const { toast } = useToast()

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
                        <UploadDropzone<OurFileRouter, "videoUploader">
                            endpoint="videoUploader"
                            config={{
                                mode: "auto"
                            }}
                            className="border-2 border-dashed border-gray-400/50 rounded-xl p-8 hover:border-gray-500 transition-colors cursor-pointer bg-muted/30"
                            content={{
                                label: "Lyric Video Overlay",
                                allowedContent: "Click to upload or drag and drop"
                            }}
                            appearance={{
                                uploadIcon: "w-12 h-12 text-gray-400",
                                label: "text-base font-medium mt-4 w-full text-muted-foreground",
                                allowedContent: "text-md text-muted-foreground/70 mt-1 w-full text-center",
                                button: "bg-gray-600"
                            }}
                            onBeforeUploadBegin={(files) => {
                                // Convert the first file to base64
                                const file = files[0];
                                if (!file) return files;

                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setLyricVideoBase64(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                                return files;
                            }}
                            onClientUploadComplete={(res) => {
                                if (res?.[0]) {
                                    setLyricVideoUrl(res[0].ufsUrl)
                                    toast({
                                        title: "Lyric Video Uploaded",
                                        description: "Your lyric video has been uploaded successfully.",
                                    });
                                }
                            }}
                            onUploadError={(error: Error) => {
                                if (error.message.includes("FileSizeMismatch")) {
                                    toast({
                                        title: "File Size Too Large",
                                        description: "Please upload a smaller file.",
                                        variant: "destructive",
                                    });
                                }
                            }}
                        />
                    )}
                </div>
            </div>
        </section>
    )
} 