// Centralized configuration for Content Themes used in Campaign creation
// This is designed to be easy to update when adding per-theme image folders.

export const THEME_IMAGE_BASE_PATH = "/content_themes" as const;
export const THEME_DEFAULT_FOLDER = "default" as const;
export const THEME_GIF_COUNT = 4 as const;

export interface SubThemeDef {
  key: string;
  label: string;
  imageFolder?: string; // Folder under public/content_themes
}

export interface ThemeDef {
  key: string;
  label: string;
  imageFolder?: string; // Folder under public/content_themes
  subThemes?: SubThemeDef[];
}

// Update imageFolder for each theme/subtheme when you add real folders
// under `public/content_themes/<folder-name>`.
export const CONTENT_THEMES: ThemeDef[] = [
  { key: "luxury_lifestyle", label: "Luxury Lifestyle", imageFolder: "luxury_lifestyle" },
  { key: "reactions", label: "Reactions", imageFolder: "reactions" },
  {
    key: "girls",
    label: "Girls",
    imageFolder: THEME_DEFAULT_FOLDER,
    subThemes: [
      { key: "girls_chic", label: "Chic", imageFolder: "girls_chic" },
      { key: "girls_city", label: "City", imageFolder: "girls_city" },
      { key: "girls_party", label: "Party", imageFolder: "girls_party" },
      { key: "girls_alternative", label: "Alternative", imageFolder: "girls_alternative" },
    ],
  },
  { key: "music_discovery", label: "Music Discovery", imageFolder: "music_discovery" },
  { key: "feminine_energy", label: "Feminine Energy", imageFolder: "feminine_energy" },
  { key: "nature", label: "Nature", imageFolder: "nature" },
  { key: "visualiser", label: "Visualiser", imageFolder: "visualiser" },
  { key: "dance", label: "Dance", imageFolder: "dance" },
  { key: "gym_workout", label: "Gym / Workout", imageFolder: "gym_workout" },
  { key: "rock_aesthetic", label: "Rock Aesthetic", imageFolder: "rock_aesthetic" },
  {
    key: "live_shows",
    label: "Live Shows",
    imageFolder: THEME_DEFAULT_FOLDER,
    subThemes: [
      { key: "gigs", label: "Gigs", imageFolder: "gigs" },
      { key: "stage_avatars", label: "Stage Avatars", imageFolder: "stage_avatars" },

    ]
  },
];

// Optional helper to get folder for a theme/subtheme key
export function getImageFolderForKey(key: string): string {
  // Look for a subtheme first
  for (const t of CONTENT_THEMES) {
    if (t.subThemes) {
      const found = t.subThemes.find((s) => s.key === key);
      if (found) return found.imageFolder ?? THEME_DEFAULT_FOLDER;
    }
  }
  // Then a top-level theme
  const top = CONTENT_THEMES.find((t) => t.key === key);
  return top?.imageFolder ?? THEME_DEFAULT_FOLDER;
}

export function getImageSrcsForFolder(folder: string): string[] {
  return Array.from({ length: THEME_GIF_COUNT }, (_, i) => `${THEME_IMAGE_BASE_PATH}/${folder}/${i + 1}.gif`);
}

function toTitleCase(input: string): string {
  return input
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => (w.length ? w[0]?.toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function getLabelForKey(key: string): string {
  // First pass: search all sub-themes across all themes to avoid collisions
  for (const t of CONTENT_THEMES) {
    if (t.subThemes) {
      const found = t.subThemes.find((s) => s.key === key);
      if (found) return `${found.label} ${t.label}`;
    }
  }
  // Second pass: top-level themes
  for (const t of CONTENT_THEMES) {
    if (t.key === key) return t.label;
  }
  return toTitleCase(key);
}
