"use client"

import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { UploadDropzone } from "@uploadthing/react"
import { Image as ImageIcon } from "lucide-react"

interface ImageAssetsProps {
    albumArtUrl: string | null
    setAlbumArtUrl: (url: string | null) => void
    albumArtBase64: string | null
    setAlbumArtBase64: (base64: string | null) => void
    albumArtError: boolean
}

export function ImageAssets({
    albumArtUrl,
    setAlbumArtUrl,
    albumArtBase64,
    setAlbumArtBase64,
    albumArtError
}: ImageAssetsProps) {
    // Using sonner toast directly

    return (
        <section className={`bg-card rounded-xl p-8 shadow-sm border ${albumArtError ? 'ring-2 ring-red-500' : ''}`}>
            <div className="space-y-10">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b">
                        <ImageIcon className="w-7 h-7" />
                        <h2 className="text-2xl font-semibold">Add Your Image Assets</h2>
                    </div>
                    <p className="text-muted-foreground text-lg">Add your album/single artwork to use for our AI content generation.</p>
                </div>

                {/* Album/Single Artwork */}
                <div className="max-w-2xl mx-auto space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-xl font-medium">Album/Single Artwork</h3>
                        <p className="text-muted-foreground">If you don't have artwork for the song yet you can upload a different image instead.</p>
                    </div>
                    {albumArtUrl ? (
                        <div className="border rounded-xl p-4 space-y-4">
                            <img
                                src={albumArtBase64 || albumArtUrl}
                                alt="Album Art"
                                className="w-full max-h-[250px] object-contain rounded-lg"
                            />
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setAlbumArtUrl(null)
                                    setAlbumArtBase64(null)
                                }}
                                className="w-full"
                            >
                                Remove Image
                            </Button>
                        </div>
                    ) : (
                        <UploadDropzone<OurFileRouter, "imageUploader">
                            endpoint="imageUploader"
                            config={{
                                mode: "auto"
                            }}
                            className="border-2 border-dashed border-gray-400/50 rounded-xl p-8 hover:border-gray-500 transition-colors cursor-pointer bg-muted/30"
                            content={{
                                label: "Album Art: JPEG or PNG",
                                allowedContent: "Click to upload or drag and drop",
                            }}
                            appearance={{
                                uploadIcon: "w-12 h-12 text-gray-400",
                                label: "text-base font-medium mt-4 text-muted-foreground",
                                allowedContent: "text-md text-muted-foreground/70 mt-1 w-full text-center",
                                button: "bg-gray-600"
                            }}
                            onBeforeUploadBegin={(files) => {
                                // Convert the first file to base64
                                const file = files[0];
                                if (!file) return files;

                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setAlbumArtBase64(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                                return files;
                            }}
                            onClientUploadComplete={(res) => {
                                if (res?.[0]) {
                                    setAlbumArtUrl(res[0].ufsUrl)
                                }
                            }}
                            onUploadError={(error: Error) => {
                                if (error.message.includes("FileSizeMismatch")) {
                                    toast.error("File Size Too Large", {
                                        description: "Please upload a smaller file."
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