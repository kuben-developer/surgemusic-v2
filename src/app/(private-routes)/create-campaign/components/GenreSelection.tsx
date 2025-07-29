"use client"

import { Globe, Headphones, Music, Star, Zap } from "lucide-react"

interface GenreSelectionProps {
    selectedGenre: "rap" | "electronic" | "pop" | "other" | null
    setSelectedGenre: (genre: "rap" | "electronic" | "pop" | "other" | null) => void
    genreError: boolean
}

export function GenreSelection({
    selectedGenre,
    setSelectedGenre,
    genreError
}: GenreSelectionProps) {
    return (
        <section className={`bg-card rounded-xl p-8 shadow-sm border ${genreError ? 'ring-2 ring-red-500' : ''}`}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b">
                    <Zap className="w-7 h-7" />
                    <h2 className="text-2xl font-semibold">Select Genre</h2>
                </div>
                <p className="text-muted-foreground text-lg">Choose the genre category that your music falls into.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Rap/Hip-Hop */}
                    <button
                        onClick={() => setSelectedGenre(selectedGenre === "rap" ? null : "rap")}
                        className={`w-full flex items-center gap-4 p-6 rounded-lg border bg-card hover:bg-accent transition-colors ${selectedGenre === "rap" ? "ring-2 ring-primary" : ""}`}
                    >
                        <div className="p-3 rounded-lg bg-background">
                            <Headphones className="w-8 h-8" />
                        </div>
                        <span className="text-xl font-medium">Rap / Hip-Hop</span>
                    </button>

                    {/* Electronic */}
                    <button
                        onClick={() => setSelectedGenre(selectedGenre === "electronic" ? null : "electronic")}
                        className={`w-full flex items-center gap-4 p-6 rounded-lg border bg-card hover:bg-accent transition-colors ${selectedGenre === "electronic" ? "ring-2 ring-primary" : ""}`}
                    >
                        <div className="p-3 rounded-lg bg-background">
                            <Globe className="w-8 h-8" />
                        </div>
                        <span className="text-xl font-medium">Electronic</span>
                    </button>

                    {/* Pop/Indie */}
                    <button
                        onClick={() => setSelectedGenre(selectedGenre === "pop" ? null : "pop")}
                        className={`w-full flex items-center gap-4 p-6 rounded-lg border bg-card hover:bg-accent transition-colors ${selectedGenre === "pop" ? "ring-2 ring-primary" : ""}`}
                    >
                        <div className="p-3 rounded-lg bg-background">
                            <Star className="w-8 h-8" />
                        </div>
                        <span className="text-xl font-medium">Pop / Indie</span>
                    </button>

                    {/* Other Genres */}
                    <button
                        onClick={() => setSelectedGenre(selectedGenre === "other" ? null : "other")}
                        className={`w-full flex items-center gap-4 p-6 rounded-lg border bg-card hover:bg-accent transition-colors ${selectedGenre === "other" ? "ring-2 ring-primary" : ""}`}
                    >
                        <div className="p-3 rounded-lg bg-background">
                            <Music className="w-8 h-8" />
                        </div>
                        <span className="text-xl font-medium">Other Genres</span>
                    </button>
                </div>
            </div>
        </section>
    )
} 