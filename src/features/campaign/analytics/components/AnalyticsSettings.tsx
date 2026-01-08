"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings } from "lucide-react";
import { toast } from "sonner";

export type CurrencySymbol = "USD" | "GBP";

export interface AnalyticsSettingsValues {
  minViewsFilter: number;
  currencySymbol: CurrencySymbol;
  manualCpmMultiplier: number;
  apiCpmMultiplier: number;
}

interface AnalyticsSettingsProps {
  campaignId: string;
  minViewsFilter: number;
  currencySymbol: CurrencySymbol;
  manualCpmMultiplier: number;
  apiCpmMultiplier: number;
  onSettingsChange?: (settings: AnalyticsSettingsValues) => void;
}

const QUICK_MIN_VIEWS_OPTIONS = [
  { label: "Show all", value: 0 },
  { label: "1+ views", value: 1 },
  { label: "100+ views", value: 100 },
  { label: "1K+ views", value: 1000 },
  { label: "10K+ views", value: 10000 },
];

export function AnalyticsSettings({
  campaignId,
  minViewsFilter,
  currencySymbol,
  manualCpmMultiplier,
  apiCpmMultiplier,
  onSettingsChange,
}: AnalyticsSettingsProps) {
  const [open, setOpen] = useState(false);
  const [localMinViews, setLocalMinViews] = useState(minViewsFilter.toString());
  const [localCurrency, setLocalCurrency] = useState<CurrencySymbol>(currencySymbol);
  const [localManualCpm, setLocalManualCpm] = useState(manualCpmMultiplier.toString());
  const [localApiCpm, setLocalApiCpm] = useState(apiCpmMultiplier.toString());
  const [isSaving, setIsSaving] = useState(false);

  const updateSettings = useMutation(api.app.analytics.updateCampaignAnalyticsSettings);

  const handleSave = useCallback(async () => {
    const minViews = parseInt(localMinViews, 10) || 0;
    const manualCpm = parseFloat(localManualCpm) || 1;
    const apiCpm = parseFloat(localApiCpm) || 0.5;

    setIsSaving(true);
    try {
      await updateSettings({
        campaignId,
        minViewsFilter: minViews,
        currencySymbol: localCurrency,
        manualCpmMultiplier: manualCpm,
        apiCpmMultiplier: apiCpm,
      });

      onSettingsChange?.({
        minViewsFilter: minViews,
        currencySymbol: localCurrency,
        manualCpmMultiplier: manualCpm,
        apiCpmMultiplier: apiCpm,
      });
      toast.success("Settings saved");
      setOpen(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, [campaignId, localMinViews, localCurrency, localManualCpm, localApiCpm, updateSettings, onSettingsChange]);

  const handleQuickSelect = useCallback((value: number) => {
    setLocalMinViews(value.toString());
  }, []);

  const hasChanges =
    parseInt(localMinViews, 10) !== minViewsFilter ||
    localCurrency !== currencySymbol ||
    parseFloat(localManualCpm) !== manualCpmMultiplier ||
    parseFloat(localApiCpm) !== apiCpmMultiplier;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          title="Analytics Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-1">Analytics Settings</h4>
            <p className="text-xs text-muted-foreground">
              These settings affect how analytics are displayed (including public reports).
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="minViews" className="text-sm">
                Minimum Views Filter
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Hide posts with fewer than this many views
              </p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_MIN_VIEWS_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={parseInt(localMinViews, 10) === option.value ? "secondary" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleQuickSelect(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <Input
                id="minViews"
                type="number"
                placeholder="Custom minimum"
                value={localMinViews}
                onChange={(e) => setLocalMinViews(e.target.value)}
                className="h-8 text-sm"
                min={0}
              />
            </div>

            <div>
              <Label className="text-sm">Currency Symbol</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Currency for CPM display
              </p>
              <div className="flex gap-2">
                <Button
                  variant={localCurrency === "USD" ? "secondary" : "outline"}
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => setLocalCurrency("USD")}
                >
                  $ USD
                </Button>
                <Button
                  variant={localCurrency === "GBP" ? "secondary" : "outline"}
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => setLocalCurrency("GBP")}
                >
                  £ GBP
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm">CPM Rates</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Cost per video for CPM calculation
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="manualCpm" className="text-xs w-16 flex-shrink-0">
                    Manual
                  </Label>
                  <Input
                    id="manualCpm"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.50"
                    value={localManualCpm}
                    onChange={(e) => setLocalManualCpm(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="apiCpm" className="text-xs w-16 flex-shrink-0">
                    API
                  </Label>
                  <Input
                    id="apiCpm"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.50"
                    value={localApiCpm}
                    onChange={(e) => setLocalApiCpm(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="w-full h-8"
            size="sm"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
