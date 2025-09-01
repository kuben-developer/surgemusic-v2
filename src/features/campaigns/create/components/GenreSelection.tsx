"use client"

import { type LucideIcon, Activity, Disc, Flame, Guitar, Heart, Home, Mic2, Music, Radio, Skull, SlidersHorizontal, Sparkles, Star, Sun, Zap } from "lucide-react"

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
  const ICONS: Record<GenreKey, LucideIcon> = {
    rap: Mic2,
    pop: Star,
    indie: Sparkles,
    country: Guitar,
    rnb: Heart,
    afrobeats: Sun,
    rock: Flame,
    metal: Skull,
    reggaeton: Radio,
    house: Home,
    techno: Activity,
    edm: Disc,
    other_electronic: SlidersHorizontal,
    other: Music,
  };

  const chip = (g: { key: GenreKey; label: string }) => {
    const Icon = ICONS[g.key];
    return (
      <button
        key={g.key}
        onClick={() => setSelectedGenre(selectedGenre === g.key ? null : g.key)}
        className={`w-full px-4 cursor-pointer py-3 rounded-lg border text-base transition-colors flex items-center justify-center gap-3
          ${selectedGenre === g.key ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`}
      >
        <Icon className="w-5 h-5" />
        <span>{g.label}</span>
      </button>
    );
  };

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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MAIN_GENRES.map(chip)}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Electronic</h3>
            <div className="grid grid-cols-2 gap-2">
              {ELECTRONIC_SUB.map(chip)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
