"use client"

import { CampaignInfo } from "./components/CampaignInfo"
import { ContentThemes } from "./components/ContentThemes"
import { GenreSelection } from "./components/GenreSelection"
import { ImageAssets } from "./components/ImageAssets"
import { LyricVideoOverlay } from "./components/LyricVideoOverlay"
import { SongAudio } from "./components/SongAudio"
import { SongDetails } from "./components/SongDetails"
import { VideoAssets } from "./components/VideoAssets"
import { VideoCount } from "./components/VideoCount"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

interface CreateCampaignData {
    campaignName: string;
    songName: string;
    artistName: string;
    campaignCoverImageUrl?: string;
    videoCount: number;
    genre: string;
    themes: string[];
    songAudioUrl?: string;
    musicVideoUrl?: string;
    lyricVideoUrl?: string;
}

export default function CampaignCreatePage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [currentSection, setCurrentSection] = useState(0)
    const [campaignType, setCampaignType] = useState<"custom" | "express">("custom")

    // Campaign Info state
    const [campaignName, setCampaignName] = useState("")
    const [campaignNameError, setCampaignNameError] = useState(false)

    // Lyric Video Overlay state
    const [lyricVideoUrl, setLyricVideoUrl] = useState<string | null>(null)
    const [lyricVideoBase64, setLyricVideoBase64] = useState<string | null>(null)

    // Song Details state
    const [songName, setSongName] = useState("")
    const [artistName, setArtistName] = useState("")
    const [songDetailsError, setSongDetailsError] = useState(false)

    // Song Audio state
    const [songAudioUrl, setSongAudioUrl] = useState<string | null>(null)
    const [songAudioBase64, setSongAudioBase64] = useState<string | null>(null)
    const [songAudioError, setSongAudioError] = useState(false)

    // Genre state
    const [selectedGenre, setSelectedGenre] = useState<"rap" | "electronic" | "pop" | "other" | null>(null)
    const [genreError, setGenreError] = useState(false)

    // Video Count state
    const [selectedVideoCount, setSelectedVideoCount] = useState<number | null>(null)
    const [videoCountError, setVideoCountError] = useState(false)

    // Image Assets state
    const [albumArtUrl, setAlbumArtUrl] = useState<string | null>(null)
    const [albumArtBase64, setAlbumArtBase64] = useState<string | null>(null)
    const [albumArtError, setAlbumArtError] = useState(false)

    // Video Assets state
    const [musicVideoUrl, setMusicVideoUrl] = useState<string | null>(null)
    const [musicVideoBase64, setMusicVideoBase64] = useState<string | null>(null)
    const [musicVideoError, setMusicVideoError] = useState(false)

    // Content Themes state
    const [selectedThemes, setSelectedThemes] = useState<string[]>([])
    const [themesError, setThemesError] = useState(false)

    // Fetch user data
    const userData = useQuery(api.users.getCurrentUser)
    const totalCredits = (userData?.videoGenerationCredit ?? 0) + (userData?.videoGenerationAdditionalCredit ?? 0)
    const isSubscribed = Boolean(userData?.subscriptionPriceId)

    const createCampaignMutation = useMutation(api.campaigns.create)
    const [isPending, setIsPending] = useState(false)
    
    const createCampaign = async (data: CreateCampaignData) => {
        setIsPending(true)
        try {
            const campaignId = await createCampaignMutation(data)
            router.push(`/campaign/${campaignId}`)
        } catch (error) {
            console.error("Error creating campaign:", error)
            toast.error("Failed to create campaign")
        } finally {
            setIsPending(false)
        }
    }

    // Handle songAudioUrl from URL params
    useState(() => {
        const audioUrl = searchParams.get('songAudioUrl')
        if (audioUrl) {
            setSongAudioUrl(decodeURIComponent(audioUrl))
        }
    })

    // Define sections array for navigation
    const sections = [
        { title: "Campaign Info", error: campaignNameError },
        { title: "Lyric Video Overlay", error: false },
        { title: "Genre Selection", error: genreError },
        { title: "Content Themes", error: themesError },
        { title: "Song Details", error: songDetailsError },
        { title: "Song Audio", error: songAudioError },
    ]

    // Add custom sections for campaign type
    if (campaignType === "custom") {
        sections.push(
            { title: "Video Assets", error: musicVideoError },
            { title: "Image Assets", error: albumArtError },
        )
    }

    sections.push({ title: "Video Count", error: videoCountError })

    const handleNext = () => {
        if (currentSection < sections.length - 1) {
            setCurrentSection(currentSection + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handlePrevious = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const validateForm = () => {
        // Reset all error states
        setCampaignNameError(false)
        setSongDetailsError(false)
        setSongAudioError(false)
        setGenreError(false)
        setVideoCountError(false)
        setAlbumArtError(false)
        setMusicVideoError(false)
        setThemesError(false)

        if (!campaignName.trim()) {
            setCampaignNameError(true)
            toast.error("Campaign Name Required", {
                description: "Please enter a name for your campaign",
            })
            return false
        }

        if (!songName.trim() || !artistName.trim()) {
            setSongDetailsError(true)
            toast.error("Song Details Required", {
                description: "Please enter both song name and artist name",
            })
            return false
        }

        if (!songAudioUrl) {
            setSongAudioError(true)
            toast.error("Song Audio Required", {
                description: "Please upload your song audio",
            })
            return false
        }

        if (!selectedGenre) {
            setGenreError(true)
            toast.error("Genre Required", {
                description: "Please select a genre for your music",
            })
            return false
        }

        if (!selectedVideoCount) {
            setVideoCountError(true)
            toast.error("Video Count Required", {
                description: "Please select the number of videos you want to generate",
            })
            return false
        }

        if (campaignType === "custom") {
            if (!albumArtUrl) {
                setAlbumArtError(true)
                toast.error("Album Art Required", {
                    description: "Please upload your album/single artwork",
                })
                return false
            }

            if (!musicVideoUrl) {
                setMusicVideoError(true)
                toast.error("Music Video Required", {
                    description: "Please upload a music video clip or performance video",
                })
                return false
            }

            if (selectedThemes.length === 0) {
                setThemesError(true)
                toast.error("Content Themes Required", {
                    description: "Please select at least one content theme",
                })
                return false
            }
        }

        return true
    }

    const handleGenerateVideos = () => {
        if (validateForm()) {
            if (!(selectedVideoCount && selectedGenre)) {
                return
            }
            createCampaign({
                campaignName,
                songName,
                artistName,
                campaignCoverImageUrl: albumArtUrl || undefined,
                videoCount: selectedVideoCount,
                genre: selectedGenre,
                themes: selectedThemes,
                songAudioUrl: songAudioUrl || undefined,
                musicVideoUrl: musicVideoUrl || undefined,
                lyricVideoUrl: lyricVideoUrl || undefined,
            })
        }
    }

    return (
        <div className="container max-w-5xl mx-auto py-12">
            {/* Progress indicator */}
            <div className="mb-12">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold mb-2">{sections[currentSection]?.title || 'Create Campaign'}</h2>
                    <p className="text-muted-foreground">Step {currentSection + 1} of {sections.length}</p>
                </div>

                {/* Progress bar */}
                <div className="max-w-2xl mx-auto">
                    <div className="flex mt-2">
                        {sections.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-colors duration-300 flex-1
                                    ${index <= currentSection ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                style={{
                                    marginLeft: index === 0 ? '0' : '4px',
                                    marginRight: index === sections.length - 1 ? '0' : '4px'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="fixed bottom-0 left-0 md:left-[13rem] right-0 bg-background/80 backdrop-blur-sm border-t z-50">
                <div className="container max-w-5xl mx-auto py-4 px-4">
                    <div className="flex justify-between items-center gap-4">
                        <Button
                            size="lg"
                            variant="outline"
                            className="min-w-[140px] gap-2 transition-all duration-200 hover:bg-muted"
                            onClick={handlePrevious}
                            disabled={currentSection === 0}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>

                        {/* Center section indicator */}
                        <div className="hidden md:flex items-center gap-2">
                            {sections.map((section, index) => (
                                <div
                                    key={index}
                                    className={`w-8 h-1 rounded-full transition-all duration-300
                                        ${index === currentSection ? 'bg-primary w-12' :
                                            index < currentSection ? 'bg-primary/50' : 'bg-muted'}`}
                                />
                            ))}
                        </div>

                        {currentSection === sections.length - 1 ? (
                            <Button
                                size="lg"
                                className="min-w-[140px] gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                                onClick={handleGenerateVideos}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        Generate Videos
                                        <Sparkles className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                className="min-w-[140px] gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                                onClick={handleNext}
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Render current section */}
            <div className="space-y-16 mb-10">
                {currentSection === 0 && (
                    <CampaignInfo
                        campaignName={campaignName}
                        setCampaignName={setCampaignName}
                        campaignType={campaignType}
                        setCampaignType={setCampaignType}
                        campaignNameError={campaignNameError}
                    />
                )}

                {currentSection === 1 && (
                    <LyricVideoOverlay
                        lyricVideoUrl={lyricVideoUrl}
                        setLyricVideoUrl={setLyricVideoUrl}
                        lyricVideoBase64={lyricVideoBase64}
                        setLyricVideoBase64={setLyricVideoBase64}
                    />
                )}

                {currentSection === 2 && (
                    <GenreSelection
                        selectedGenre={selectedGenre}
                        setSelectedGenre={setSelectedGenre}
                        genreError={genreError}
                    />
                )}

                {currentSection === 3 && (
                    <ContentThemes
                        selectedGenre={selectedGenre}
                        selectedThemes={selectedThemes}
                        setSelectedThemes={setSelectedThemes}
                        themesError={themesError}
                    />
                )}

                {currentSection === 4 && (
                    <SongDetails
                        songName={songName}
                        setSongName={setSongName}
                        artistName={artistName}
                        setArtistName={setArtistName}
                        songDetailsError={songDetailsError}
                    />
                )}

                {currentSection === 5 && (
                    <SongAudio
                        songAudioUrl={songAudioUrl}
                        setSongAudioUrl={setSongAudioUrl}
                        songAudioBase64={songAudioBase64}
                        setSongAudioBase64={setSongAudioBase64}
                        songAudioError={songAudioError}
                    />
                )}

                {campaignType === "custom" && (
                    <>
                        {currentSection === 6 && (
                            <VideoAssets
                                musicVideoUrl={musicVideoUrl}
                                setMusicVideoUrl={setMusicVideoUrl}
                                musicVideoBase64={musicVideoBase64}
                                setMusicVideoBase64={setMusicVideoBase64}
                                musicVideoError={musicVideoError}
                            />
                        )}

                        {currentSection === 7 && (
                            <ImageAssets
                                albumArtUrl={albumArtUrl}
                                setAlbumArtUrl={setAlbumArtUrl}
                                albumArtBase64={albumArtBase64}
                                setAlbumArtBase64={setAlbumArtBase64}
                                albumArtError={albumArtError}
                            />
                        )}


                    </>
                )}


                {currentSection === sections.length - 1 && (
                    <VideoCount
                        selectedVideoCount={selectedVideoCount}
                        setSelectedVideoCount={setSelectedVideoCount}
                        videoCountError={videoCountError}
                        totalCredits={totalCredits}
                        isSubscribed={isSubscribed}
                    />
                )}
            </div>
        </div>
    )
}