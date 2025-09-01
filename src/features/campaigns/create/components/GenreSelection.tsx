"use client"

import { Zap } from "lucide-react"

type GenreKey =
  | "rap"
  | "pop"
  | "indie"
  | "country"
  | "rnb"
  | "afrobeats"
  | "rock"
  | "metal"
  | "reggaeton"
  | "house"
  | "techno"
  | "edm"
  | "other_electronic"
  | "other";

interface GenreSelectionProps {
    selectedGenre: GenreKey | null
    setSelectedGenre: (genre: GenreKey | null) => void
    genreError: boolean
}

const MAIN_GENRES: { key: GenreKey; label: string }[] = [
  { key: "rap", label: "Rap" },
  { key: "pop", label: "Pop" },
  { key: "indie", label: "Indie" },
  { key: "country", label: "Country" },
  { key: "rnb", label: "R&B" },
  { key: "afrobeats", label: "Afrobeats" },
  { key: "rock", label: "Rock" },
  { key: "metal", label: "Metal" },
  { key: "reggaeton", label: "Reggaeton" },
  { key: "other", label: "Other Genres" },
];

const ELECTRONIC_SUB: { key: GenreKey; label: string }[] = [
  { key: "house", label: "House" },
  { key: "techno", label: "Techno" },
  { key: "edm", label: "EDM" },
  { key: "other_electronic", label: "Other Electronic" },
];

export function GenreSelection({ selectedGenre, setSelectedGenre, genreError }: GenreSelectionProps) {
  const chip = (g: { key: GenreKey; label: string }) => (
    <button
      key={g.key}
      onClick={() => setSelectedGenre(selectedGenre === g.key ? null : g.key)}
      className={`w-full px-4 cursor-pointer py-2 rounded-md border text-sm transition-colors
        ${selectedGenre === g.key ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`}
    >
      {g.label}
    </button>
  );

  return (
    <section className={`bg-card rounded-xl p-8 shadow-sm border ${genreError ? 'ring-2 ring-red-500' : ''}`}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b">
          <Zap className="w-7 h-7" />
          <h2 className="text-2xl font-semibold">Select Genre</h2>
        </div>
        <p className="text-muted-foreground text-lg">Choose the genre that best describes your music.</p>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Main Genres</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {MAIN_GENRES.map(chip)}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Electronic</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ELECTRONIC_SUB.map(chip)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
