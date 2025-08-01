"use client";

import { cn } from "@/lib/utils";
import { VideoCountHeader } from "./VideoCountHeader";
import { VideoCountPreset } from "./VideoCountPreset";
import { VideoCountCustom } from "./VideoCountCustom";
import { useVideoCountLogic } from "../hooks/useVideoCountLogic";
import { VIDEO_OPTIONS, COMING_SOON_OPTIONS } from "../constants/video-options";
import type { VideoCountProps } from "../types/video-count.types";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VideoCount({
    selectedVideoCount,
    setSelectedVideoCount,
    videoCountError,
    totalCredits,
    isSubscribed
}: VideoCountProps) {
    const {
        isCustomMode,
        customVideoCount,
        handleCustomSliderChange,
        handlePresetSelection,
        handleCustomModeToggle,
        isOptionLocked,
        getLockReason,
    } = useVideoCountLogic({ selectedVideoCount, setSelectedVideoCount });

    return (
        <section className={cn(
            "bg-card rounded-xl p-8 shadow-sm border transition-all duration-200",
            videoCountError && "ring-2 ring-red-500"
        )}>
            <div className="max-w-2xl mx-auto space-y-8">
                <VideoCountHeader isSubscribed={isSubscribed} />

                <div className="space-y-6">
                    <div className="grid gap-4">
                        {VIDEO_OPTIONS.map((option) => {
                            const isLocked = isOptionLocked(option.required, isSubscribed, totalCredits);
                            const lockReason = getLockReason(option.required, isSubscribed);
                            const isSelected = selectedVideoCount === option.count && !isCustomMode;
                            
                            return (
                                <VideoCountPreset
                                    key={option.count}
                                    option={option}
                                    isSelected={isSelected}
                                    isLocked={isLocked}
                                    lockReason={lockReason}
                                    isSubscribed={isSubscribed}
                                    onSelect={() => handlePresetSelection(option.count)}
                                />
                            );
                        })}

                        <VideoCountCustom
                            isCustomMode={isCustomMode}
                            customVideoCount={customVideoCount}
                            isSubscribed={isSubscribed}
                            totalCredits={totalCredits}
                            onCustomModeToggle={handleCustomModeToggle}
                            onSliderChange={handleCustomSliderChange}
                        />

                        {COMING_SOON_OPTIONS.map(count => (
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