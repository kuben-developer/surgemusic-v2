"use client";

import { cn } from "@/lib/utils";
import { VideoCountHeader } from "./VideoCountHeader";
import { VideoCountPreset } from "./VideoCountPreset";
import { VideoCountCustom } from "./VideoCountCustom";
import { useVideoCountLogic } from "../hooks/useVideoCountLogic";
import { VIDEO_OPTIONS, COMING_SOON_OPTIONS, TRIAL_VIDEO_OPTION, FIRST_TIME_USER_VIDEO_OPTION } from "../constants/video-options";
import type { VideoCountProps } from "../types/video-count.types";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VideoCount({
    selectedVideoCount,
    setSelectedVideoCount,
    videoCountError,
    totalCredits,
    isSubscribed,
    isTrial,
    qualifiesForFreeVideos = false
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
                        {/* Show trial option for trial users with exactly 6 credits */}
                        {isTrial && totalCredits === 6 && (
                            <VideoCountPreset
                                key={TRIAL_VIDEO_OPTION.count}
                                option={TRIAL_VIDEO_OPTION}
                                isSelected={selectedVideoCount === TRIAL_VIDEO_OPTION.count && !isCustomMode}
                                isLocked={false}
                                lockReason="Trial option"
                                isSubscribed={isSubscribed}
                                onSelect={() => handlePresetSelection(TRIAL_VIDEO_OPTION.count)}
                            />
                        )}

                        {/* Show 24 free videos option for first-time users */}
                        {qualifiesForFreeVideos && (
                            <div className="relative group">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePresetSelection(FIRST_TIME_USER_VIDEO_OPTION.count)}
                                    className={cn(
                                        "w-full px-6 py-6 text-base font-medium justify-between transition-all duration-200",
                                        "hover:border-primary/50 hover:shadow-md border-green-500",
                                        "bg-gradient-to-r from-green-50 to-emerald-50 border-2",
                                        selectedVideoCount === FIRST_TIME_USER_VIDEO_OPTION.count && !isCustomMode && "ring-2 ring-green-500 bg-green-100"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-green-700">24 Videos FREE</span>
                                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                                            First Campaign Bonus
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-green-600 font-medium">
                                            No credits required
                                        </span>
                                    </div>
                                </Button>
                            </div>
                        )}
                        
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