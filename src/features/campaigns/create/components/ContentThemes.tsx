"use client";

import { useState } from "react";
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
  // Track active sub-tab per theme that has sub-themes
  const [activeSubTabs, setActiveSubTabs] = useState<Record<string, string>>({});

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

  const handleAddSubTheme = (themeKey: string, activeKey: string, subKeys: string[]) => {
    const existing = selectedThemes.find((k) => subKeys.includes(k));
    const isCurrentSelected = selectedThemes.includes(activeKey);

    if (isCurrentSelected) {
      setSelectedThemes((prev) => prev.filter((t) => t !== activeKey));
      return;
    }

    if (existing && existing !== activeKey) {
      setSelectedThemes((prev) => prev.map((t) => (t === existing ? activeKey : t)));
      return;
    }

    if (selectedThemes.length >= 3) {
      toast.error("Maximum 3 Themes", {
        description:
          "Please unselect one theme before adding another. You can only select up to 3 content themes.",
      });
      return;
    }
    setSelectedThemes((prev) => [...prev, activeKey]);
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
              // Any theme with sub-themes: render tabs and single-select within group
              if (theme.subThemes && theme.subThemes.length > 0) {
                const subKeys = theme.subThemes.map((s) => s.key);
                const activeKey = activeSubTabs[theme.key] ?? subKeys[0];
                const isSelected = selectedThemes.includes(activeKey);

                const colsClass = theme.subThemes.length === 2
                  ? "grid-cols-2"
                  : theme.subThemes.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-4";

                return (
                  <div key={theme.key} className="space-y-4">
                    <h3 className="text-xl font-medium">{theme.label}</h3>
                    <Tabs
                      value={activeKey}
                      onValueChange={(v) => setActiveSubTabs((prev) => ({ ...prev, [theme.key]: v }))}
                    >
                      <TabsList className={`grid ${colsClass} w-full`}>
                        {theme.subThemes.map((s) => (
                          <TabsTrigger key={s.key} value={s.key} className="capitalize w-full justify-center">
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
                      onClick={() => handleAddSubTheme(theme.key, activeKey, subKeys)}
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
