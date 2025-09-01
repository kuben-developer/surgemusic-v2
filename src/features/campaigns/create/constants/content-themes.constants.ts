// Centralized configuration for Content Themes used in Campaign creation
// This is designed to be easy to update when adding per-theme image folders.

export const THEME_IMAGE_BASE_PATH = "/content_themes" as const;
export const THEME_DEFAULT_FOLDER = "placeholder" as const;
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
  { key: "luxury_lifestyle", label: "Luxury Lifestyle", imageFolder: THEME_DEFAULT_FOLDER },
  { key: "reactions", label: "Reactions", imageFolder: THEME_DEFAULT_FOLDER },
  {
    key: "girls",
    label: "Girls",
    imageFolder: THEME_DEFAULT_FOLDER,
    subThemes: [
      { key: "girls_chic", label: "Chic", imageFolder: THEME_DEFAULT_FOLDER },
      { key: "girls_city", label: "City", imageFolder: THEME_DEFAULT_FOLDER },
      { key: "girls_party", label: "Party", imageFolder: THEME_DEFAULT_FOLDER },
      { key: "girls_alternative", label: "Alternative", imageFolder: THEME_DEFAULT_FOLDER },
    ],
  },
  { key: "music_discovery", label: "Music Discovery", imageFolder: THEME_DEFAULT_FOLDER },
  { key: "feminine_energy", label: "Feminine Energy", imageFolder: THEME_DEFAULT_FOLDER },
  { key: "nature", label: "Nature", imageFolder: THEME_DEFAULT_FOLDER },
  { key: "visualiser", label: "Visualiser", imageFolder: THEME_DEFAULT_FOLDER },
  { key: "dance", label: "Dance", imageFolder: THEME_DEFAULT_FOLDER },
  { key: "gym_workout", label: "Gym / Workout", imageFolder: THEME_DEFAULT_FOLDER },
  { key: "stage_avatars", label: "Stage Avatars", imageFolder: THEME_DEFAULT_FOLDER },
  { key: "rock_aesthetic", label: "Rock Aesthetic", imageFolder: THEME_DEFAULT_FOLDER },
  { key: "live_shows", label: "Live Shows", imageFolder: THEME_DEFAULT_FOLDER },
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

