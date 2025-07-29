"use client"

import { Button } from "@/components/ui/button"
import { Check, Plus, Zap } from "lucide-react"

interface ContentThemesProps {
    selectedGenre: "rap" | "electronic" | "pop" | "other" | null
    selectedThemes: string[]
    setSelectedThemes: React.Dispatch<React.SetStateAction<string[]>>
    themesError: boolean
}

export function ContentThemes({
    selectedGenre,
    selectedThemes,
    setSelectedThemes,
    themesError
}: ContentThemesProps) {
    return (
        <section className={`bg-card rounded-xl p-8 shadow-sm border ${themesError ? 'ring-2 ring-red-500' : ''}`}>
            <div className="space-y-10">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b">
                        <Zap className="w-7 h-7" />
                        <h2 className="text-2xl font-semibold">Choose Your Content Themes</h2>
                    </div>
                    <p className="text-muted-foreground text-lg">We recommend choosing a variety of content themes that you think could work for your target audience.</p>
                    {selectedGenre && (
                        <div className="space-y-8">
                            {/* {['reactions', 'recommendation', 'lyric', 'lifestyle', 'girls'].map((theme) => ( */}
                            {['reactions', 'recommendation', 'nature_lifestyle', 'luxury_lifestyle', 'girls', 'enterprise'].map((theme) => (
                                <div key={theme} className="space-y-4">
                                    <h3 className="text-xl font-medium capitalize">{theme.replace('_', ' ')} Content</h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map((num) => (
                                            <div key={num} className="aspect-[9/16] rounded-lg overflow-hidden border shadow-sm">
                                                <img
                                                    src={`/content_themes/${selectedGenre}/${theme}/${num}.gif`}
                                                    alt={`${theme} preview ${num}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        variant={selectedThemes.includes(theme) ? "default" : "outline"}
                                        size="lg"
                                        className="w-full"
                                        disabled={theme === 'lyric'}
                                        onClick={() => {
                                            if (theme === 'lyric') return;
                                            setSelectedThemes((prev: string[]) =>
                                                prev.includes(theme)
                                                    ? prev.filter((t: string) => t !== theme)
                                                    : [...prev, theme]
                                            );
                                        }}
                                    >
                                        {theme === 'lyric' ? (
                                            <>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Coming Soon...
                                            </>
                                        ) : selectedThemes.includes(theme) ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Theme Added
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Content Theme
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!selectedGenre && (
                        <div className="flex items-center justify-center h-40 border rounded-xl bg-muted/30">
                            <p className="text-muted-foreground">Please select a genre to view content themes</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
} 