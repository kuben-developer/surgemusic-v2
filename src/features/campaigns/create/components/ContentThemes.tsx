"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Plus, Zap, Info, X } from "lucide-react";
import { toast } from "sonner";
import {
  CONTENT_THEMES,
  THEME_DEFAULT_FOLDER,
  getImageFolderForKey,
  getImageSrcsForFolder,
  getLabelForKey,
} from "../constants/content-themes.constants";

interface ContentThemesProps {
  selectedThemes: string[];
  setSelectedThemes: React.Dispatch<React.SetStateAction<string[]>>;
  themesError: boolean;
}

export function ContentThemes({
  selectedThemes,
  setSelectedThemes,
  themesError,
}: ContentThemesProps) {
  const girlsTheme = useMemo(() => CONTENT_THEMES.find((t) => t.key === "girls"), []);
  const defaultGirls = girlsTheme?.subThemes?.[0]?.key ?? "girls_chic";
  const [activeGirlsSub, setActiveGirlsSub] = useState<string>(defaultGirls);

  const handleAddTheme = (key: string) => {
    const isAlreadySelected = selectedThemes.includes(key);
    if (!isAlreadySelected && selectedThemes.length >= 3) {
      toast.error("Maximum 3 Themes", {
        description:
          "Please unselect one theme before adding another. You can only select up to 3 content themes.",
      });
      return;
    }

    setSelectedThemes((prev) =>
      isAlreadySelected ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const handleRemoveTheme = (key: string) => {
    setSelectedThemes((prev) => prev.filter((t) => t !== key));
  };

  const handleAddGirlsTheme = () => {
    const hasAnyGirls = selectedThemes.find((t) => t.startsWith("girls_"));
    const isCurrentSelected = selectedThemes.includes(activeGirlsSub);

    if (isCurrentSelected) {
      setSelectedThemes((prev) => prev.filter((t) => t !== activeGirlsSub));
      return;
    }

    // If another Girls sub-theme is already selected, replace it
    if (hasAnyGirls && hasAnyGirls !== activeGirlsSub) {
      setSelectedThemes((prev) => prev.map((t) => (t === hasAnyGirls ? activeGirlsSub : t)));
      return;
    }

    // Otherwise add new, respecting max of 3
    if (selectedThemes.length >= 3) {
      toast.error("Maximum 3 Themes", {
        description:
          "Please unselect one theme before adding another. You can only select up to 3 content themes.",
      });
      return;
    }
    setSelectedThemes((prev) => [...prev, activeGirlsSub]);
  };

  return (
    <section className={`bg-card rounded-xl p-8 shadow-sm border ${themesError ? "ring-2 ring-red-500" : ""}`}>
      <div className="space-y-10">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b">
            <Zap className="w-7 h-7" />
            <h2 className="text-2xl font-semibold">Choose Your Content Themes</h2>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-lg">
              We recommend choosing a variety of content themes that you think could work for your target audience.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span> Select up to 3 content themes ({selectedThemes.length}/3 selected)</span>
            </div>
            {selectedThemes.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedThemes.map((key) => (
                  <Badge key={key} variant="secondary" className="pr-1">
                    {getLabelForKey(key)}
                    <button
                      type="button"
                      aria-label={`Remove ${getLabelForKey(key)}`}
                      className="ml-1 inline-flex items-center justify-center rounded hover:opacity-80"
                      onClick={() => handleRemoveTheme(key)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            {CONTENT_THEMES.map((theme) => {
              // Girls with sub-themes
              if (theme.key === "girls" && theme.subThemes && theme.subThemes.length > 0) {
                const isSelected = selectedThemes.includes(activeGirlsSub);

                return (
                  <div key={theme.key} className="space-y-4">
                    <h3 className="text-xl font-medium">{theme.label}</h3>
                    <Tabs value={activeGirlsSub} onValueChange={setActiveGirlsSub}>
                      <TabsList className="grid grid-cols-4 w-full">
                        {theme.subThemes.map((s) => (
                          <TabsTrigger key={s.key} value={s.key} className="capitalize">
                            {s.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {theme.subThemes.map((s) => {
                        const sImages = getImageSrcsForFolder(getImageFolderForKey(s.key));
                        return (
                          <TabsContent key={s.key} value={s.key} className="mt-4">
                            <div className="grid grid-cols-4 gap-4">
                              {sImages.map((src, idx) => (
                                <div key={idx} className="aspect-[9/16] rounded-lg overflow-hidden border shadow-sm">
                                  <img src={src} alt={`${s.label} preview ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        );
                      })}
                    </Tabs>
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="lg"
                      className="w-full"
                      onClick={handleAddGirlsTheme}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4 mr-2" /> Theme Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" /> Add Content Theme
                        </>
                      )}
                    </Button>
                  </div>
                );
              }

              // Standard theme
              const folder = theme.imageFolder ?? THEME_DEFAULT_FOLDER;
              const images = getImageSrcsForFolder(folder);
              const isSelected = selectedThemes.includes(theme.key);

              return (
                <div key={theme.key} className="space-y-4">
                  <h3 className="text-xl font-medium">{theme.label}</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((src, idx) => (
                      <div key={idx} className="aspect-[9/16] rounded-lg overflow-hidden border shadow-sm">
                        <img src={src} alt={`${theme.label} preview ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="lg"
                    className="w-full"
                    onClick={() => handleAddTheme(theme.key)}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 mr-2" /> Theme Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" /> Add Content Theme
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
