"use client"

import { OurFileRouter } from "@/app/api/uploadthing/core"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { UploadDropzone } from "@uploadthing/react"
import { ExternalLink, Music } from "lucide-react"

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
    const { toast } = useToast()

    return (
        <section className={`bg-card rounded-xl p-8 shadow-sm border ${songAudioError ? 'ring-2 ring-red-500' : ''}`}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b">
                    <Music className="w-7 h-7" />
                    <h2 className="text-2xl font-semibold">Song Audio</h2>
                </div>
                <p className="text-muted-foreground text-lg">Add a 30 second snippet from your song. We recommend using the chorus/hook or a catchy part of the song.</p>
                <div className="space-y-4">
                    {songAudioUrl ? (
                        <div className="border rounded-xl p-4 space-y-4">
                            <audio controls className="w-full">
                                <source src={songAudioUrl} />
                            </audio>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSongAudioUrl(null)
                                    setSongAudioBase64(null)
                                }}
                                className="w-full"
                            >
                                Remove Audio
                            </Button>
                        </div>
                    ) : (
                        <UploadDropzone<OurFileRouter, "audioUploader">
                            endpoint="audioUploader"
                            config={{
                                mode: "auto"
                            }}
                            className="border-2 border-dashed border-gray-400/50 rounded-xl p-8 hover:border-gray-500 transition-colors cursor-pointer bg-muted/30"
                            content={{
                                label: "30 Second Song Audio: MP3, WAV or Video",
                                allowedContent: "Click to upload or drag and drop"
                            }}
                            appearance={{
                                uploadIcon: "w-12 h-12 text-gray-400",
                                label: "text-base font-medium mt-4 text-muted-foreground",
                                allowedContent: "text-md text-muted-foreground/70 mt-1 w-full text-center",
                                button: "bg-gray-600"
                            }}
                            onBeforeUploadBegin={(files) => {
                                const file = files[0];
                                if (!file) return files;

                                // If file is video, extract audio first
                                if (file.type.startsWith('video/')) {
                                    const audioContext = new AudioContext();
                                    const reader = new FileReader();

                                    reader.onload = async function (e) {
                                        try {
                                            const arrayBuffer = e.target?.result as ArrayBuffer;
                                            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                                            // Convert AudioBuffer to WAV blob
                                            const offlineContext = new OfflineAudioContext(
                                                audioBuffer.numberOfChannels,
                                                audioBuffer.length,
                                                audioBuffer.sampleRate
                                            );

                                            const source = offlineContext.createBufferSource();
                                            source.buffer = audioBuffer;
                                            source.connect(offlineContext.destination);
                                            source.start();
                                            const renderedBuffer = await offlineContext.startRendering();

                                            // Convert AudioBuffer to Float32Array
                                            const channelData = renderedBuffer.getChannelData(0);
                                            const wavBlob = new Blob([channelData.buffer], { type: 'audio/wav' });

                                            // Convert WAV blob to base64
                                            const audioReader = new FileReader();
                                            audioReader.onloadend = () => {
                                                setSongAudioBase64(audioReader.result as string);
                                            };
                                            audioReader.readAsDataURL(wavBlob);
                                        } catch (error) {
                                            toast({
                                                title: "No Audio Found in Video",
                                                description: "Please upload a video file with sound.",
                                                variant: "destructive",
                                            });
                                        }
                                    };

                                    reader.readAsArrayBuffer(file);
                                } else {
                                    // For audio files, convert directly to base64
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setSongAudioBase64(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }

                                return files;
                            }}
                            onClientUploadComplete={(res) => {
                                if (res?.[0]) {
                                    setSongAudioUrl(res[0].ufsUrl)
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
                <div className="flex justify-center">
                    <Button size="lg" className="w-96" onClick={() => window.open('https://www.audio-trimmer.com/', '_blank')}>
                        Free Audio Trimming Tool (External Website)
                        <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </section>
    )
} 