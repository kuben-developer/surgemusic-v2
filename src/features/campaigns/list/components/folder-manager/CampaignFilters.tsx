"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Music,
  Video,
  ChevronDown,
  Save,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

export interface FilterState {
  status: "all" | "processing" | "completed";
  genre: string;
  dateRange: DateRange | undefined;
  videoCountRange: [number, number];
  artistName: string;
}

interface CampaignFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  genres: string[];
  maxVideoCount: number;
}

export function CampaignFilters({ 
  filters, 
  onFiltersChange, 
  genres,
  maxVideoCount 
}: CampaignFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedPresets, setSavedPresets] = useState<Array<{
    name: string;
    filters: FilterState;
  }>>([]);

  const activeFilterCount = [
    filters.status !== "all",
    filters.genre !== "",
    filters.dateRange !== undefined,
    filters.videoCountRange[0] > 0 || filters.videoCountRange[1] < maxVideoCount,
    filters.artistName !== ""
  ].filter(Boolean).length;

  const resetFilters = () => {
    onFiltersChange({
      status: "all",
      genre: "",
      dateRange: undefined,
      videoCountRange: [0, maxVideoCount],
      artistName: ""
    });
  };

  const savePreset = () => {
    const name = prompt("Enter preset name:");
    if (name) {
      setSavedPresets([...savedPresets, { name, filters: { ...filters } }]);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Filter Campaigns</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your campaign search
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, status: value as FilterState["status"] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Genre Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Music className="h-4 w-4" />
              Genre
            </label>
            <Select
              value={filters.genre}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, genre: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Date Range
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange && "text-muted-foreground"
                  )}
                >
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={(range) => 
                    onFiltersChange({ ...filters, dateRange: range })
                  }
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Video Count Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video Count Range
            </label>
            <div className="space-y-3">
              <Slider
                min={0}
                max={maxVideoCount}
                step={1}
                value={filters.videoCountRange}
                onValueChange={(value) => 
                  onFiltersChange({ ...filters, videoCountRange: value as [number, number] })
                }
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{filters.videoCountRange[0]} videos</span>
                <span>{filters.videoCountRange[1]} videos</span>
              </div>
            </div>
          </div>

          {/* Artist Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Artist Name</label>
            <Input
              placeholder="Filter by artist name..."
              value={filters.artistName}
              onChange={(e) => 
                onFiltersChange({ ...filters, artistName: e.target.value })
              }
            />
          </div>

          {/* Saved Presets */}
          {savedPresets.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Saved Presets</label>
              <div className="flex flex-wrap gap-2">
                {savedPresets.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onFiltersChange(preset.filters)}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={savePreset}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Preset
              </Button>
            </div>
            
            <Button onClick={() => setIsOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}