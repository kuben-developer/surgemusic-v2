"use client"

import { CreditsDialog } from "@/features/credits"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Lock, Zap, Settings } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type VideoCountOption = 30 | 90 | 180 | 360 | 900 | 1200

interface VideoCountProps {
    selectedVideoCount: number | null
    setSelectedVideoCount: (count: number | null) => void
    videoCountError: boolean
    totalCredits: number
    isSubscribed: boolean
}

export function VideoCount({
    selectedVideoCount,
    setSelectedVideoCount,
    videoCountError,
    totalCredits,
    isSubscribed
}: VideoCountProps) {
    const [isCustomMode, setIsCustomMode] = useState(false)
    const [customVideoCount, setCustomVideoCount] = useState(30)

    const videoOptions: Array<{ count: VideoCountOption, required: number }> = [
        { count: 30, required: 30 },
        { count: 90, required: 90 },
        { count: 180, required: 180 },
        { count: 360, required: 360 },
        { count: 900, required: 900 },
        { count: 1200, required: 1200 }
    ]

    const comingSoonOptions: number[] = []

    const handleCustomSliderChange = (value: number[]) => {
        const firstValue = value[0]
        if (firstValue !== undefined) {
            const roundedValue = Math.round(firstValue / 30) * 30
            setCustomVideoCount(roundedValue)
            setSelectedVideoCount(roundedValue)
        }
    }

    const handlePresetSelection = (count: VideoCountOption) => {
        setIsCustomMode(false)
        setSelectedVideoCount(count)
    }

    const handleCustomModeToggle = () => {
        setIsCustomMode(true)
        setSelectedVideoCount(customVideoCount)
    }

    return (
        <section className={cn(
            "bg-card rounded-xl p-8 shadow-sm border transition-all duration-200",
            videoCountError && "ring-2 ring-red-500"
        )}>
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-2 border-b">
                    <Zap className="w-7 h-7" />
                    <h2 className="text-2xl font-semibold">Number Of Videos To Generate</h2>
                </div>
                {!isSubscribed ? (
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <p className="text-lg font-medium text-primary">Subscription Required</p>
                        <p className="text-muted-foreground mt-1">
                            You need an active subscription to generate videos. Subscribe now to unlock video generation capabilities.
                        </p>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium mt-4"
                        >
                            View Subscription Plans
                        </Link>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-lg">Choose your campaign deliverables based on your available credits. Each video requires 1 credit to generate.</p>
                )}

                <div className="space-y-6">
                    <div className="grid gap-4">
                        {videoOptions.map((option) => {
                            const isLocked = !isSubscribed || totalCredits < option.required;
                            const lockReason = !isSubscribed ? "Subscription required" : `Requires ${option.required} credits`;
                            return (
                                <div key={option.count} className="relative group">
                                    <Button
                                        variant="outline"
                                        onClick={() => !isLocked && handlePresetSelection(option.count)}
                                        disabled={isLocked}
                                        className={cn(
                                            "w-full px-6 py-6 text-base font-medium justify-between transition-all duration-200",
                                            "hover:border-primary/50 hover:shadow-md",
                                            selectedVideoCount === option.count && !isCustomMode && "ring-2 ring-primary bg-primary/5",
                                            isLocked && "opacity-75"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{option.count} Videos</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-muted-foreground">
                                                {lockReason}
                                            </span>
                                            {isLocked && (
                                                <div className="p-2 rounded-full bg-muted">
                                                    <Lock className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </Button>
                                    {isLocked && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="flex flex-col items-center gap-3 p-4">
                                                {!isSubscribed ? (
                                                    <Link
                                                        href="/pricing"
                                                        className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                                                    >
                                                        Subscribe to Generate Videos
                                                    </Link>
                                                ) : (
                                                    <CreditsDialog
                                                        onSelectCredits={() => { }}
                                                        hasSubscription={isSubscribed}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {/* Custom Video Count Option */}
                        <div className="relative group">
                            <Button
                                variant="outline"
                                onClick={() => !(!isSubscribed || totalCredits < customVideoCount) && handleCustomModeToggle()}
                                disabled={!isSubscribed || totalCredits < customVideoCount}
                                className={cn(
                                    "w-full px-6 py-6 text-base font-medium justify-between transition-all duration-200",
                                    "hover:border-primary/50 hover:shadow-md",
                                    isCustomMode && "ring-2 ring-primary bg-primary/5",
                                    (!isSubscribed || totalCredits < customVideoCount) && "opacity-75"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Settings className="w-5 h-5" />
                                    <span className="text-lg">Custom Amount</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">
                                        {!isSubscribed ? "Subscription required" : `Requires ${customVideoCount} credits`}
                                    </span>
                                    {(!isSubscribed || totalCredits < customVideoCount) && (
                                        <div className="p-2 rounded-full bg-muted">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </Button>
                            {(!isSubscribed || totalCredits < customVideoCount) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="flex flex-col items-center gap-3 p-4">
                                        {!isSubscribed ? (
                                            <Link
                                                href="/pricing"
                                                className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                                            >
                                                Subscribe to Generate Videos
                                            </Link>
                                        ) : (
                                            <CreditsDialog
                                                onSelectCredits={() => { }}
                                                hasSubscription={isSubscribed}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Custom Slider - Show when custom mode is selected */}
                        {isCustomMode && (
                            <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Custom Video Count</label>
                                    <span className="text-lg font-semibold text-primary">{customVideoCount} Videos</span>
                                </div>
                                <div className="space-y-2">
                                    <Slider
                                        value={[customVideoCount]}
                                        onValueChange={handleCustomSliderChange}
                                        max={Math.min(totalCredits, 3000)} // Cap at 3000 or available credits
                                        min={30}
                                        step={30}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>30</span>
                                        <span>{Math.min(totalCredits, 3000)} (Max)</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Adjust the slider to select your desired number of videos. Each video requires 1 credit.
                                </p>
                            </div>
                        )}

                        {comingSoonOptions.map(count => (
                            <div key={count} className="relative group">
                                <Button
                                    variant="outline"
                                    disabled={true}
                                    className={cn(
                                        "w-full px-6 py-6 text-base font-medium justify-between transition-all duration-200",
                                        "opacity-75"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{count} Videos</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground">Coming Soon</span>
                                        <div className="p-2 rounded-full bg-muted">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
} 