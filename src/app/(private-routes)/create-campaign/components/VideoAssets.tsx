"use client"

import { OurFileRouter } from "@/app/api/uploadthing/core"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { UploadDropzone } from "@uploadthing/react"
import { Video } from "lucide-react"

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
    const { toast } = useToast()

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
                        <UploadDropzone<OurFileRouter, "videoUploader">
                            endpoint="videoUploader"
                            config={{
                                mode: "auto"
                            }}
                            className="border-2 border-dashed border-gray-400/50 rounded-xl p-8 hover:border-gray-500 transition-colors cursor-pointer bg-muted/30"
                            content={{
                                label: "Music Video Clip or Performance with Song",
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
                                    setMusicVideoBase64(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                                return files;
                            }}
                            onClientUploadComplete={(res) => {
                                if (res?.[0]) {
                                    setMusicVideoUrl(res[0].ufsUrl)
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